/**
 * RituSmriti Global Types
 */

export type AppLanguage = 'en' | 'hi' | 'bn';
export type AppTheme = 'light' | 'dark' | 'system';

export interface UserProfile {
  name: string;
  dob: string; // YYYY-MM-DD
  language: AppLanguage;
  averageCycleLength: number; // default 28
  averagePeriodDuration: number; // default 5
  lastPeriodStartDate: string; // YYYY-MM-DD
  weight?: number; // kg
  height?: number; // cm
  healthConditions: string[]; // PCOS, Endometriosis, Thyroid, Other
  privacyAccepted: boolean;
  isOnboarded: boolean;
}

export type FlowIntensity = 'spotting' | 'light' | 'medium' | 'heavy' | 'very_heavy';
export type BloodColor = 'light_pink' | 'pink' | 'bright_red' | 'dark_red' | 'brown';
export type SleepQuality = 'poor' | 'average' | 'good' | 'excellent';

export interface IntimacyLog {
  protected: boolean;
  unprotected: boolean;
  libido: number; // 1-10
  notes: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD (Key)
  
  // Period Tracking
  hasPeriod: boolean;
  flowIntensity?: FlowIntensity;
  bloodColor?: BloodColor;
  painLevel?: number; // 0-10
  notes?: string;

  // Wellness Tracking
  moods: string[]; // Happy, Calm, Neutral, etc.
  symptoms: string[]; // Cramps, Headache, Bloating, etc.
  energyLevel?: number; // 1-10
  sleepHours?: number;
  sleepQuality?: SleepQuality;
  waterIntakeGlasses?: number; // number of glasses (e.g. 250ml each)
  exercise: string[]; // Walking, Yoga, Gym, etc.
  customExercise?: string;

  // Sexual Health Log
  intimacy?: IntimacyLog;
}

export interface CyclePrediction {
  cycleDay: number;
  phase: 'menstruation' | 'follicular' | 'ovulation' | 'luteal';
}

export interface PredictionResult {
  nextPeriodDate: Date;
  predictedFuturePeriods: Date[]; // next 3-6 period dates
  predictedOvulationDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  pmsWindowStart: Date;
  pmsWindowEnd: Date;
}

export interface SmartInsight {
  id: string;
  type: 'info' | 'success' | 'warning';
  title: string;
  message: string;
}

export interface NotificationLog {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}
