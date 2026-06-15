import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Flame, 
  Droplet, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  AlertCircle, 
  Sparkles, 
  Smile, 
  Moon, 
  Activity, 
  Coffee, 
  Heart,
  Plus,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { DailyLog, UserProfile, PredictionResult } from '../../types';
import { getCycleStatusForDate, predictCycle, calculateCycleMetrics, generateLocalInsights } from '../../utils/cycleEngine';
import { translations } from '../../locales/translations';

interface DashboardProps {
  logs: DailyLog[];
  profile: UserProfile;
  language: 'en' | 'hi' | 'bn';
  onLogQuickEntry: (newLog: DailyLog) => void;
  onOpenDetailedLogger: (dateStr: string) => void;
}

export default function Dashboard({ 
  logs, 
  profile, 
  language, 
  onLogQuickEntry,
  onOpenDetailedLogger
}: DashboardProps) {
  const [currentDate] = useState<Date>(new Date());
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);

  const t = translations[language];
  const dateStr = currentDate.toISOString().split('T')[0];

  useEffect(() => {
    const logForToday = logs.find((l) => l.date === dateStr) || null;
    setTodayLog(logForToday);
  }, [logs, dateStr]);

  // Calculations
  const metrics = calculateCycleMetrics(logs, profile);
  const prediction = predictCycle(logs, profile);
  const status = getCycleStatusForDate(currentDate, logs, profile);
  const localInsights = generateLocalInsights(logs, profile);

  // Time-gated Greeting
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return t.goodMorning;
    if (hours < 17) return t.goodAfternoon;
    return t.goodEvening;
  };

  // Determine ring graphics
  const totalDays = metrics.averageCycleLength;
  const currentDay = status.cycleDay;
  const progressPercent = Math.min(100, Math.round((currentDay / totalDays) * 100));

  // Determine circle segments for visual display
  const periodDuration = metrics.averagePeriodLength;
  const ovulationDay = totalDays - 14; 
  const fertileStart = ovulationDay - 5;
  const fertileEnd = ovulationDay + 1;

  // Render SVG Sector colors
  // A simple circular ring where we draw dots or highlights for specific phases
  const getDayIndicatorType = (day: number) => {
    if (day <= periodDuration) return 'period';
    if (day >= fertileStart && day <= fertileEnd) {
      return day === ovulationDay ? 'ovulation' : 'fertile';
    }
    if (day > periodDuration && day < fertileStart) return 'follicular';
    return 'luteal';
  };

  // Quick logging helpers
  const handleQuickMood = (moodName: string) => {
    const baseLog: DailyLog = todayLog 
      ? { ...todayLog } 
      : { date: dateStr, hasPeriod: false, moods: [], symptoms: [], exercise: [] };
    
    if (baseLog.moods.includes(moodName)) {
      baseLog.moods = baseLog.moods.filter(m => m !== moodName);
    } else {
      baseLog.moods = [...baseLog.moods, moodName];
    }
    onLogQuickEntry(baseLog);
  };

  const handleQuickWater = () => {
    const baseLog: DailyLog = todayLog 
      ? { ...todayLog } 
      : { date: dateStr, hasPeriod: false, moods: [], symptoms: [], exercise: [] };
    
    baseLog.waterIntakeGlasses = (baseLog.waterIntakeGlasses || 0) + 1;
    onLogQuickEntry(baseLog);
  };

  const handleQuickPeriod = () => {
    const baseLog: DailyLog = todayLog 
      ? { ...todayLog } 
      : { date: dateStr, hasPeriod: false, moods: [], symptoms: [], exercise: [] };
    
    baseLog.hasPeriod = !baseLog.hasPeriod;
    if (baseLog.hasPeriod && !baseLog.flowIntensity) {
      baseLog.flowIntensity = 'medium';
    }
    onLogQuickEntry(baseLog);
  };

  const handleQuickSymptom = (sym: string) => {
    const baseLog: DailyLog = todayLog 
      ? { ...todayLog } 
      : { date: dateStr, hasPeriod: false, moods: [], symptoms: [], exercise: [] };
    
    if (baseLog.symptoms.includes(sym)) {
      baseLog.symptoms = baseLog.symptoms.filter(x => x !== sym);
    } else {
      baseLog.symptoms = [...baseLog.symptoms, sym];
    }
    onLogQuickEntry(baseLog);
  };

  // Human names for cycle days & phases
  const getPhaseLocaleName = (p: string) => {
    switch (p) {
      case 'menstruation': return t.menstrualPhase;
      case 'follicular': return t.follicularPhase;
      case 'ovulation': return t.ovulationPhase;
      case 'luteal': return t.lutealPhase;
      default: return p;
    }
  };

  // Days till period or late stats
  const isPeriodNext = status.phase === 'luteal' || status.phase === 'menstruation';
  const displayDiff = Math.abs(status.daysOverdue || 0);

  return (
    <div className="flex flex-col gap-6" id="dashboard-view">
      {/* 1. HERO SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-stone-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-4 h-4 text-moon-rose animate-spin-slow" />
            <span>{currentDate.toLocaleDateString(language === 'en' ? 'en-US' : language === 'hi' ? 'hi-IN' : 'bn-BD', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-800 mt-1">
            {getGreeting()}, {profile.name}
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            {t.alternativeTagline}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-warm-cream px-5 py-3 rounded-2xl border border-stone-100 w-full md:w-auto">
          <div className="text-left">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">{t.healthScore}</span>
            <span className="text-xl font-extrabold text-stone-800 font-mono tracking-tight">{metrics.dataCompleteness}%</span>
          </div>
          <div className="w-px h-8 bg-stone-200" />
          <div className="text-left">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">{t.statPredictionConf}</span>
            <span className="text-sm font-bold text-moon-rose">{metrics.predictionConfidence}%</span>
          </div>
        </div>
      </div>

      {/* 2. RING AND QUICK ACTION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CYCLE RING CONTAINER (7cols on lg) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-stone-100 flex flex-col items-center justify-center relative overflow-hidden shadow-xs">
          {/* Subtle background glow based on phase */}
          {status.phase === 'menstruation' && <div className="absolute inset-0 bg-radial from-moon-rose/5 to-transparent pointer-events-none" />}
          {status.phase === 'ovulation' && <div className="absolute inset-0 bg-radial from-lotus-gold/5 to-transparent pointer-events-none" />}
          {status.phase === 'follicular' && <div className="absolute inset-0 bg-radial from-lavender-mist/5 to-transparent pointer-events-none" />}

          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-6 block w-full text-center">
            {getPhaseLocaleName(status.phase)}
          </h2>

          <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center" id="cycle-ring-wrapper">
            {/* SVG Track */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Outer decorative gold track */}
              <circle cx="100" cy="100" r="92" stroke="#FFFDF9" strokeWidth="2" fill="none" />
              
              {/* Main Background track */}
              <circle cx="100" cy="100" r="80" stroke="#F1EBE3" strokeWidth="8" fill="none" />
              
              {/* Segmented Phase representations */}
              {/* Period arc */}
              <circle 
                cx="100" 
                cy="100" 
                r="80" 
                stroke="#D68BA6" 
                strokeWidth="10" 
                fill="none" 
                strokeDasharray={`${(periodDuration / totalDays) * 502} 502`} 
                strokeDashoffset="0"
                opacity="0.3"
              />
              {/* Fertile window arc */}
              <circle 
                cx="100" 
                cy="100" 
                r="80" 
                stroke="#D4B06A" 
                strokeWidth="10" 
                fill="none" 
                strokeDasharray={`${((fertileEnd - fertileStart + 1) / totalDays) * 502} 502`} 
                strokeDashoffset={`-${(fertileStart / totalDays) * 502}`}
                opacity="0.3"
              />

              {/* Progress active circle */}
              <circle 
                cx="100" 
                cy="100" 
                r="80" 
                stroke={status.phase === 'menstruation' ? '#D68BA6' : status.phase === 'ovulation' ? '#D4B06A' : '#B8A2D9'} 
                strokeWidth="8" 
                fill="none" 
                strokeDasharray={`${(progressPercent / 100) * 502} 502`} 
                strokeDashoffset="0"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />

              {/* Decorative nodes on the circle represent discrete days */}
              {Array.from({ length: totalDays }).map((_, i) => {
                const dayNum = i + 1;
                const angle = (i * 360) / totalDays - 90;
                const rad = (angle * Math.PI) / 180;
                const x = 100 + 80 * Math.cos(rad);
                const y = 100 + 80 * Math.sin(rad);
                
                const dayType = getDayIndicatorType(dayNum);
                let color = '#D8CCD0';
                if (dayType === 'period') color = '#D68BA6';
                if (dayType === 'ovulation') color = '#D4B06A';
                if (dayType === 'fertile') color = '#E6CFA1';

                // Highlight current day marker
                const isCurrent = dayNum === currentDay;

                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={isCurrent ? '5' : '1.5'}
                    fill={isCurrent ? '#3A3530' : color}
                    stroke={isCurrent ? '#FFF' : 'none'}
                    strokeWidth={isCurrent ? '1.5' : '0'}
                    className="transition-all"
                  />
                );
              })}
            </svg>

            {/* Inner Ring Labels */}
            <div className="absolute text-center flex flex-col items-center">
              <span className="text-stone-400 text-xs font-semibold uppercase tracking-widest block">{t.cycleDay}</span>
              <span className="text-4xl md:text-5xl font-extrabold text-stone-800 font-sans tracking-tight my-1">
                {status.cycleDay}
              </span>
              <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                {status.isPeriodCurrent ? t.menstrualPhase : getPhaseLocaleName(status.phase)}
              </span>
            </div>
          </div>

          {/* Quick interactive buttons inside dashboard card */}
          <div className="mt-6 flex flex-wrap justify-center gap-3 w-full">
            <button
              onClick={() => onOpenDetailedLogger(dateStr)}
              className="px-6 py-2.5 bg-moon-rose hover:bg-moon-rose/90 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              id="log-detailed-today-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Log Period & Full Wellness</span>
            </button>
            <button
              onClick={handleQuickPeriod}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                todayLog?.hasPeriod
                  ? 'bg-ritu-error/10 border-ritu-error/30 text-ritu-error'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
              id="period-toggle-quick-btn"
            >
              <Droplet className={`w-3.5 h-3.5 ${todayLog?.hasPeriod ? 'fill-ritu-error' : ''}`} />
              <span>{todayLog?.hasPeriod ? 'Period Active (Logged)' : 'Mark Period Started'}</span>
            </button>
          </div>
        </div>

        {/* QUICK STATS & LIVE METRICS (5cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white p-5 rounded-3xl border border-stone-100 grid grid-cols-2 gap-3 shadow-xs">
            {/* Stat 1 */}
            <div className="bg-warm-cream p-4 rounded-2xl border border-stone-100 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider h-8">
                {status.missedPeriodStatus !== 'on_track' ? t.daysLate : t.periodCountdownNum}
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className={`text-3xl font-extrabold font-mono ${status.missedPeriodStatus !== 'on_track' ? 'text-ritu-error' : 'text-stone-800'}`}>
                  {status.missedPeriodStatus !== 'on_track' ? displayDiff : Math.max(0, prediction.nextPeriodDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24) < 1 ? 0 : Math.round(Math.max(0, prediction.nextPeriodDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))}
                </span>
                <span className="text-xs font-medium text-stone-500">{t.daysUnit}</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-warm-cream p-4 rounded-2xl border border-stone-100 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider h-8">{t.ovulationCountdownNum}</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-stone-800 font-mono">
                  {Math.round(Math.max(0, prediction.predictedOvulationDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))}
                </span>
                <span className="text-xs font-medium text-stone-500">{t.daysUnit}</span>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider h-8">{t.statCycleLen}</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-stone-800 font-mono">{metrics.averageCycleLength}</span>
                <span className="text-xs font-semibold text-stone-500">{t.daysUnit}</span>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider h-8">{t.statPeriodLen}</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-stone-800 font-mono">{metrics.averagePeriodLength}</span>
                <span className="text-xs font-semibold text-stone-500">{t.daysUnit}</span>
              </div>
            </div>
          </div>

          {/* CYCLE STABILITY AND HORMONES ACCENT */}
          <div className="bg-white p-5 rounded-3xl border border-stone-100 flex flex-col gap-4 shadow-xs">
            <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider">Advanced Metrics</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Stability progress */}
              <div className="border border-stone-150 p-3 rounded-2xl flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-stone-500 uppercase">{t.statStabilityIndex}</span>
                  <span className="text-xs font-extrabold text-stone-800 font-mono">{metrics.cycleStabilityIndex.toFixed(1)}/10</span>
                </div>
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-1">
                  <div 
                    className="bg-lavender-mist h-full rounded-full transition-all"
                    style={{ width: `${metrics.cycleStabilityIndex * 10}%` }}
                  />
                </div>
              </div>

              {/* Hormonal balance indicator */}
              <div className="border border-stone-150 p-3 rounded-2xl flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-stone-500 uppercase">{t.statHormonalBalance}</span>
                  <span className="text-xs font-extrabold text-stone-800 font-mono">{metrics.hormonalBalance}/10</span>
                </div>
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-1">
                  <div 
                    className="bg-lotus-gold h-full rounded-full transition-all"
                    style={{ width: `${metrics.hormonalBalance * 10}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-lavender-mist/10 p-3 rounded-xl border border-lavender-mist/20 text-[11px] text-stone-600 leading-normal">
              <Sparkles className="w-4 h-4 text-lavender-mist shrink-0" />
              <span>Hormonal balance evaluates cumulative physical cramps & moods log ratios to monitor wellness. Keep logging!</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TODAY'S QUICK ENTRY WELLNESS */}
      <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-xs flex flex-col gap-5">
        <div>
          <h2 className="font-serif text-xl font-bold text-stone-800">{t.todayWellnessHeader}</h2>
          <p className="text-xs text-stone-400 mt-1">{t.quickLogDesc}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* MOODS ROW (6cols) */}
          <div className="md:col-span-6 flex flex-col gap-3">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
              <Smile className="w-3.5 h-3.5 text-moon-rose" />
              <span>{t.mood}</span>
            </span>
            <div className="grid grid-cols-3 gap-2" id="quick-mood-grid">
              {[
                { icon: '😊', name: 'Happy' },
                { icon: '🧘', name: 'Calm' },
                { icon: '😐', name: 'Neutral' },
                { icon: '🥺', name: 'Emotional' },
                { icon: '😢', name: 'Sad' },
                { icon: '😖', name: 'Anxious' },
                { icon: '😠', name: 'Irritated' },
                { icon: '⚡', name: 'Energetic' },
                { icon: '🚀', name: 'Motivated' }
              ].map((mood) => {
                const cleanName = mood.name.trim();
                const isSelected = todayLog?.moods?.includes(cleanName) || false;
                return (
                  <button
                    key={mood.name}
                    onClick={() => handleQuickMood(cleanName)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 justify-center transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-moon-rose text-white border-moon-rose scale-95 shadow-sm' 
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <span>{mood.icon}</span>
                    <span className="truncate">{cleanName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SYMPTOMS & WATER (6cols) */}
          <div className="md:col-span-6 flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-lotus-gold" />
                <span>Symptoms Quick Select</span>
              </span>
              <div className="flex flex-wrap gap-1.5" id="quick-symptoms">
                {['Cramps', 'Headache', 'Bloating', 'Acne', 'Breast Tenderness', 'Fatigue', 'Insomnia', 'Food Cravings'].map((sym) => {
                  const isSelected = todayLog?.symptoms?.includes(sym) || false;
                  return (
                    <button
                      key={sym}
                      onClick={() => handleQuickSymptom(sym)}
                      className={`px-3 py-1.5 rounded-full border text-[11px] font-medium transition cursor-pointer ${
                        isSelected 
                          ? 'bg-lotus-gold text-white border-lotus-gold font-semibold shadow-xs' 
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              {/* WATER */}
              <div className="border border-stone-150 p-4 rounded-2xl flex flex-col justify-between bg-stone-50">
                <span className="text-[11px] font-bold text-stone-500 uppercase block">{t.water}</span>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-2xl font-extrabold text-stone-800 font-mono">{todayLog?.waterIntakeGlasses || 0}</span>
                    <span className="text-[10px] font-semibold text-stone-500">gl</span>
                  </div>
                  <button
                    onClick={handleQuickWater}
                    className="p-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-500 rounded-full transition cursor-pointer"
                    title="Add a glass"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* SLEEP SHORTSTAT */}
              <div className="border border-stone-150 p-4 rounded-2xl flex flex-col justify-between bg-stone-50">
                <span className="text-[11px] font-bold text-stone-500 uppercase block">Sleep log</span>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-2xl font-extrabold text-stone-800 font-mono">{todayLog?.sleepHours || '—'}</span>
                    <span className="text-[10px] font-semibold text-stone-500">hrs</span>
                  </div>
                  
                  {todayLog?.sleepQuality && (
                    <span className="text-[9px] font-bold uppercase text-ritu-success bg-ritu-success/10 px-1.5 py-0.5 rounded-sm">
                      {todayLog.sleepQuality}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SMART INSIGHTS SECTION */}
      <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-xs">
        <h2 className="font-serif text-xl font-bold text-stone-800 mb-4">💡 Smart local Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {localInsights.map((ins, index) => (
            <div 
              key={ins.id} 
              className={`p-4 rounded-2xl border flex flex-col gap-1.5 shadow-2xs transition hover:translate-y-[-1px] ${
                ins.type === 'success' 
                  ? 'bg-ritu-success/5 border-ritu-success/20' 
                  : ins.type === 'warning' 
                    ? 'bg-ritu-warning/5 border-ritu-warning/20' 
                    : 'bg-stone-50 border-stone-200'
              }`}
            >
              <h3 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <span>{ins.title}</span>
              </h3>
              <p className="text-stone-600 text-xs leading-relaxed">
                {ins.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
