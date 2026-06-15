import { 
  addDays, 
  differenceInDays, 
  parseISO, 
  format, 
  isWithinInterval, 
  subDays 
} from 'date-fns';
import { DailyLog, UserProfile, PredictionResult, SmartInsight } from '../types';

export interface ParsePeriodInterval {
  startDate: string; // YYYY-MM-DD
  duration: number;
}

/**
 * Groups consecutive days with active periods into discrete period intervals.
 */
export function getPeriodIntervals(logs: DailyLog[]): ParsePeriodInterval[] {
  const periodLogs = logs
    .filter((log) => log.hasPeriod)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (periodLogs.length === 0) return [];

  const intervals: ParsePeriodInterval[] = [];
  let currentStart: string = periodLogs[0].date;
  let currentCount = 1;
  let prevDate = parseISO(periodLogs[0].date);

  for (let i = 1; i < periodLogs.length; i++) {
    const logDate = parseISO(periodLogs[i].date);
    const diff = differenceInDays(logDate, prevDate);

    // If consecutive days (within 2 days to account for spotting/brief gap)
    if (diff <= 2) {
      currentCount += diff;
    } else {
      intervals.push({
        startDate: currentStart,
        duration: currentCount,
      });
      currentStart = periodLogs[i].date;
      currentCount = 1;
    }
    prevDate = logDate;
  }

  intervals.push({
    startDate: currentStart,
    duration: currentCount,
  });

  return intervals;
}

/**
 * Calculates menstrual statistics from logged history and user configuration.
 */
export function calculateCycleMetrics(logs: DailyLog[], profile: UserProfile) {
  const intervals = getPeriodIntervals(logs);
  
  // Base configuration defaults
  let avgCycleLength = profile.averageCycleLength || 28;
  let avgPeriodDuration = profile.averagePeriodDuration || 5;
  let cycleLengths: number[] = [];
  let periodDurations: number[] = [];

  if (intervals.length > 0) {
    periodDurations = intervals.map(i => i.duration);
    avgPeriodDuration = Math.round(
      periodDurations.reduce((acc, v) => acc + v, 0) / periodDurations.length
    );
  }

  if (intervals.length >= 2) {
    for (let i = 0; i < intervals.length - 1; i++) {
      const first = parseISO(intervals[i].startDate);
      const second = parseISO(intervals[i + 1].startDate);
      const diff = differenceInDays(second, first);
      // Valid cycle length is typically 15-50 days. Ignore outliers from tracking gaps
      if (diff >= 15 && diff <= 50) {
        cycleLengths.push(diff);
      }
    }
    if (cycleLengths.length > 0) {
      avgCycleLength = Math.round(
        cycleLengths.reduce((acc, v) => acc + v, 0) / cycleLengths.length
      );
    }
  }

  const longestCycle = cycleLengths.length > 0 ? Math.max(...cycleLengths) : avgCycleLength;
  const shortestCycle = cycleLengths.length > 0 ? Math.min(...cycleLengths) : avgCycleLength;
  const cycleVariability = cycleLengths.length > 0 ? (longestCycle - shortestCycle) : 0;

  // Consistency & score metrics
  let consistency: 'high' | 'medium' | 'low' = 'high';
  if (cycleVariability > 6) {
    consistency = 'low';
  } else if (cycleVariability > 3) {
    consistency = 'medium';
  }

  // Regularity Score (0 to 100)
  let regularityScore = 100;
  if (cycleLengths.length > 0) {
    regularityScore = Math.max(20, 100 - (cycleVariability * 8));
  }

  // Data completeness score: tracking days mapped to calendar range
  let dataCompleteness = 0;
  if (logs.length > 0) {
    const firstLog = parseISO(logs[0].date);
    const lastLog = parseISO(logs[logs.length - 1].date);
    const daySpan = Math.max(1, differenceInDays(lastLog, firstLog) + 1);
    dataCompleteness = Math.min(100, Math.round((logs.length / daySpan) * 100));
  }

  // Prediction confidence rating
  let confidence = 20; // baseline from onboarding inputs
  if (intervals.length === 1) confidence = 50;
  if (intervals.length === 2) confidence = 75;
  if (intervals.length >= 3) confidence = Math.min(98, 80 + (intervals.length * 4) - (cycleVariability * 2));

  // Advanced metrics
  const cycleStabilityIndex = Math.max(0, 10 - (cycleVariability / 1.5));
  
  // Hormonal Balance indicator qualitatively derived from logged moods and symptoms
  let symptomsIntensityCount = 0;
  let moodsDissonanceCount = 0;
  logs.forEach(log => {
    // heavy cramp / pain
    if (log.painLevel && log.painLevel > 5) symptomsIntensityCount += 2;
    if (log.symptoms?.includes('Cramps')) symptomsIntensityCount += 1;
    if (log.symptoms?.includes('Migraine')) symptomsIntensityCount += 1;
    if (log.symptoms?.includes('Acne')) symptomsIntensityCount += 1;
    if (log.symptoms?.includes('Cravings')) symptomsIntensityCount += 1;
    if (log.moods?.includes('Sad') || log.moods?.includes('Anxious') || log.moods?.includes('Irritated') || log.moods?.includes('Emotional')) {
      moodsDissonanceCount += 1;
    }
  });
  
  let hormonalBalance = 10; // optimal scale
  const totalStressLogs = (symptomsIntensityCount + moodsDissonanceCount);
  if (totalStressLogs > 0) {
    const logRatio = totalStressLogs / Math.max(1, logs.length);
    hormonalBalance = Math.max(3, 10 - Math.round(logRatio * 4.5));
  }

  return {
    averageCycleLength: avgCycleLength,
    averagePeriodLength: avgPeriodDuration,
    longestCycle,
    shortestCycle,
    cycleVariability,
    cycleConsistency: consistency,
    regularityScore,
    predictionConfidence: confidence,
    cycleStabilityIndex,
    hormonalBalance,
    dataCompleteness,
    historyLength: intervals.length,
  };
}

/**
 * Predicts the next cycle windows based on current metrics.
 */
export function predictCycle(logs: DailyLog[], profile: UserProfile): PredictionResult {
  const metrics = calculateCycleMetrics(logs, profile);
  
  // Find the start date of the absolute most recent period.
  // Look at custom logs first, fallback to profile's onboarding last start date.
  const intervals = getPeriodIntervals(logs);
  let referenceDate = parseISO(profile.lastPeriodStartDate);

  if (intervals.length > 0) {
    const lastLogStart = parseISO(intervals[intervals.length - 1].startDate);
    if (lastLogStart > referenceDate) {
      referenceDate = lastLogStart;
    }
  }

  // Next predicted period start
  const nextPeriodDate = addDays(referenceDate, metrics.averageCycleLength);

  // Future periods predictions (next 4)
  const predictedFuturePeriods: Date[] = [];
  for (let i = 1; i <= 4; i++) {
    predictedFuturePeriods.push(addDays(referenceDate, metrics.averageCycleLength * i));
  }

  // Ovulation Day is typically averageCycleLength - 14 days after start (luteal phase is ~14 days)
  const predictedOvulationDate = addDays(referenceDate, metrics.averageCycleLength - 14);

  // Fertile window: 5 days before ovulation starting and ending 1 day after ovulation (total 7 days)
  const fertileWindowStart = subDays(predictedOvulationDate, 5);
  const fertileWindowEnd = addDays(predictedOvulationDate, 1);

  // PMS window: 6 days before next period start
  const pmsWindowStart = subDays(nextPeriodDate, 6);
  const pmsWindowEnd = subDays(nextPeriodDate, 1);

  return {
    nextPeriodDate,
    predictedFuturePeriods,
    predictedOvulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    pmsWindowStart,
    pmsWindowEnd,
  };
}

/**
 * Determines current cycle day, active phase, and status for a given target date.
 */
export function getCycleStatusForDate(
  targetDate: Date, 
  logs: DailyLog[], 
  profile: UserProfile
) {
  const targetDateStr = format(targetDate, 'yyyy-MM-dd');
  const metrics = calculateCycleMetrics(logs, profile);
  const prediction = predictCycle(logs, profile);

  // Find the closest preceding period start date relative to targetDate
  const intervals = getPeriodIntervals(logs);
  let referenceDate = parseISO(profile.lastPeriodStartDate);
  
  // Gather all period start dates
  const startDates = [referenceDate];
  intervals.forEach(i => {
    const d = parseISO(i.startDate);
    if (!startDates.some(x => x.getTime() === d.getTime())) {
      startDates.push(d);
    }
  });

  // Sort starts ascending
  startDates.sort((a, b) => a.getTime() - b.getTime());

  // Pick the most recent start date that is <= targetDate
  let lastStart = startDates[0];
  for (let i = 0; i < startDates.length; i++) {
    if (startDates[i] <= targetDate) {
      lastStart = startDates[i];
    }
  }

  const cycleDay = differenceInDays(targetDate, lastStart) + 1;

  // Determine current active status or predicted status
  // 1. Check if user is currently logging active period
  const todaysLog = logs.find(log => log.date === targetDateStr);
  const isPeriodCurrent = todaysLog ? todaysLog.hasPeriod : (cycleDay <= metrics.averagePeriodLength && cycleDay > 0);

  // Define phases based on cycleDay
  let phase: 'menstruation' | 'follicular' | 'ovulation' | 'luteal' = 'follicular';

  // Calculate ovulation day for this current cycle
  const currentOvulationDay = metrics.averageCycleLength - 14;

  if (isPeriodCurrent) {
    phase = 'menstruation';
  } else if (cycleDay <= currentOvulationDay - 1) {
    phase = 'follicular';
  } else if (cycleDay <= currentOvulationDay + 1) {
    // 3 days window around ovulation centered
    phase = 'ovulation';
  } else {
    phase = 'luteal';
  }

  // Late or Missed Period check relative to NEXT predicted period
  const daysDiff = differenceInDays(targetDate, prediction.nextPeriodDate);
  let missedPeriodStatus: 'on_track' | 'late' | 'missed' = 'on_track';
  let daysOverdue = 0;

  // If targetDate is past predicted period start and targetDate doesn't have period logged
  if (targetDate > prediction.nextPeriodDate) {
    const hasActivePeriodSinceExp = logs.some(l => l.hasPeriod && parseISO(l.date) >= prediction.nextPeriodDate);
    if (!hasActivePeriodSinceExp) {
      daysOverdue = differenceInDays(targetDate, prediction.nextPeriodDate);
      if (daysOverdue > 14) {
        missedPeriodStatus = 'missed';
      } else if (daysOverdue > 3) {
        missedPeriodStatus = 'late';
      }
    }
  }

  return {
    cycleDay: cycleDay > 0 && cycleDay <= metrics.averageCycleLength ? cycleDay : ((cycleDay % metrics.averageCycleLength) || metrics.averageCycleLength),
    phase,
    isPeriodCurrent,
    missedPeriodStatus,
    daysOverdue,
    metrics,
  };
}

/**
 * Generates beautiful, custom smart insights based entirely on actual logged data.
 * Zero unverified text generation to meet safety compliance.
 */
export function generateLocalInsights(logs: DailyLog[], profile: UserProfile): SmartInsight[] {
  const insights: SmartInsight[] = [];
  const metrics = calculateCycleMetrics(logs, profile);

  if (logs.length < 5) {
    return [
      {
        id: 'initial_welcome',
        type: 'info',
        title: '🌱 Your Journey Begins',
        message: 'Keep logging your daily wellness tags (mood, physical signs, water, sleep) to unlock advanced Ayurvedic insights and statistical trend syncs.'
      }
    ];
  }

  // 1. Stability insight
  if (metrics.historyLength >= 3) {
    if (metrics.cycleVariability <= 3) {
      insights.push({
        id: 'cycle_stable',
        type: 'success',
        title: '🌟 Stable Cycle Harmony',
        message: `Your menstrual cycle holds a high stability factor with variability of only ${metrics.cycleVariability} days over your logged intervals. Great symptom rhythm!`
      });
    } else if (metrics.cycleVariability > 7) {
      insights.push({
        id: 'cycle_irregular',
        type: 'warning',
        title: '🌙 Fluid Cycle Rhythm',
        message: `Your cycle variability is ${metrics.cycleVariability} days. It is common to experience variation due to work stress, Ayurvedic Dosha changes, or thyroid updates. Log custom wellness elements to highlight triggers.`
      });
    }
  }

  // 2. Correlation of Sleep & Symptoms
  const preMenstrualLogs = logs.filter(log => {
    // Try to find if log date falls in a predicted PMS or period day
    const logDate = parseISO(log.date);
    const status = getCycleStatusForDate(logDate, logs, profile);
    return status.phase === 'menstruation' || status.cycleDay >= profile.averageCycleLength - 6;
  });

  const highPainLogs = preMenstrualLogs.filter(l => l.painLevel && l.painLevel >= 5);
  if (highPainLogs.length >= 2) {
    insights.push({
      id: 'premenstrual_discomfort',
      type: 'warning',
      title: '🌸 Pre-menstrual Support',
      message: 'You have logged higher pain levels (5+) around your Menstruation/Luteal cycles. Consider warm herbal chamomile tea or gentle Lotus Yoga postures to release regional muscle cramps.'
    });
  }

  // Sleep analysis
  const sleepHoursList = logs.map(l => l.sleepHours || 0).filter(h => h > 0);
  if (sleepHoursList.length >= 3) {
    const averageSleep = sleepHoursList.reduce((acc, h) => acc + h, 0) / sleepHoursList.length;
    const pmsWithSleep = preMenstrualLogs.map(l => l.sleepHours || 0).filter(h => h > 0);
    if (pmsWithSleep.length >= 2) {
      const averagePmsSleep = pmsWithSleep.reduce((acc, h) => acc + h, 0) / pmsWithSleep.length;
      if (averagePmsSleep < averageSleep - 0.5) {
        insights.push({
          id: 'sleep_deprivation_pms',
          type: 'info',
          title: '😴 Sleep Quality & Cycles',
          message: `Your average sleep duration decreases during your pre-menstrual stage (${averagePmsSleep.toFixed(1)} hrs vs ${averageSleep.toFixed(1)} hrs overall). Gentle meditation before sleep is highly recommended.`
        });
      }
    }
  }

  // Water balance insight
  const waterGlasses = logs.map(l => l.waterIntakeGlasses || 0).filter(w => w > 0);
  if (waterGlasses.length > 0) {
    const averageWater = waterGlasses.reduce((acc, w) => acc + w, 0) / waterGlasses.length;
    if (averageWater < 6) {
      insights.push({
        id: 'water_hydration_alert',
        type: 'info',
        title: '💧 Hydration Sync',
        message: 'Your average fluid intake is underneath 6 glasses. Hydration keeps blood viscosity and cramp triggers balanced. Try adding a glass of water upon waking.'
      });
    }
  }

  // 3. Yoga & Meditative wellness
  const yogaLogs = logs.filter(l => l.exercise?.includes('Yoga') || l.exercise?.includes('Meditation'));
  if (yogaLogs.length >= 2) {
    insights.push({
      id: 'ayurvedic_mindfulness',
      type: 'success',
      title: '🧘‍♀️ Pranic Flow Activity',
      message: 'Wonderful work practicing Yoga & Meditation. Rebalancing elements through gentle stretches keeps your Apana Vayu (downward cosmic force) in natural, painless circulation.'
    });
  }

  return insights;
}
