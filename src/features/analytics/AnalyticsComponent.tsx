import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  CartesianGrid, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  AlertCircle, 
  Droplet, 
  Sparkles, 
  Moon, 
  Flame, 
  Smile, 
  Search,
  BookOpen,
  Activity
} from 'lucide-react';
import { DailyLog, UserProfile } from '../../types';
import { getPeriodIntervals, calculateCycleMetrics } from '../../utils/cycleEngine';
import { translations } from '../../locales/translations';

interface AnalyticsComponentProps {
  logs: DailyLog[];
  profile: UserProfile;
  language: 'en' | 'hi' | 'bn';
}

type DateRangeFilter = '30d' | '90d' | '6m' | '1y' | 'all';

export default function AnalyticsComponent({
  logs,
  profile,
  language
}: AnalyticsComponentProps) {
  const [activeFilter, setActiveFilter] = useState<DateRangeFilter>('90d');
  const t = translations[language];

  // Map Filter value to actual days difference
  const filterCutoffDateString = useMemo(() => {
    const now = new Date();
    if (activeFilter === '30d') now.setDate(now.getDate() - 30);
    else if (activeFilter === '90d') now.setDate(now.getDate() - 90);
    else if (activeFilter === '6m') now.setMonth(now.getMonth() - 6);
    else if (activeFilter === '1y') now.setFullYear(now.getFullYear() - 1);
    else return null; // 'all'
    
    return now.toISOString().split('T')[0];
  }, [activeFilter]);

  // Filter logs based on date range
  const filteredDailyLogs = useMemo(() => {
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    const cutoff = filterCutoffDateString;
    if (!cutoff) return sorted;
    return sorted.filter(log => log.date >= cutoff);
  }, [logs, filterCutoffDateString]);

  // Calculations
  const metrics = calculateCycleMetrics(logs, profile);
  const intervals = getPeriodIntervals(logs);

  const hasEnoughData = logs.length >= 2;

  // 1. CYCLE LENGTHS DATA (For Bar chart)
  const cycleData = useMemo(() => {
    if (intervals.length < 2) return [];
    
    const results = [];
    for (let i = 0; i < intervals.length - 1; i++) {
      const first = new Date(intervals[i].startDate);
      const second = new Date(intervals[i+1].startDate);
      const length = Math.round((second.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
      
      // Filter outliers
      if (length >= 15 && length <= 50) {
        results.push({
          cycleNumber: `Cycle ${i+1}`,
          length: length,
          periodDays: intervals[i].duration
        });
      }
    }
    return results;
  }, [intervals]);

  // 2. DAILY TRENDS DATA (Pain, Mood, Sleep, Water, Energy)
  const trendsData = useMemo(() => {
    return filteredDailyLogs.map(log => {
      const dateObj = new Date(log.date);
      const formattedDate = dateObj.toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN', {
        month: 'short',
        day: 'numeric'
      });

      return {
        name: formattedDate,
        date: log.date,
        pain: log.painLevel || 0,
        energy: log.energyLevel || 0,
        sleep: log.sleepHours || 0,
        water: log.waterIntakeGlasses || 0,
        moodCount: log.moods?.length || 0,
      };
    });
  }, [filteredDailyLogs, language]);

  // 3. COMMON SYMPTOMS Pie/Bar data
  const symptomsFrequencyData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredDailyLogs.forEach(log => {
      log.symptoms?.forEach(s => {
        counts[s] = (counts[s] || 0) + 1;
      });
    });

    const entries = Object.entries(counts).map(([name, count]) => ({
      name,
      value: count
    }));

    return entries.sort((a, b) => b.value - a.value).slice(0, 6);
  }, [filteredDailyLogs]);

  // Pie Colors
  const COLORS = ['#D68BA6', '#B8A2D9', '#D4B06A', '#5BA97F', '#F3B562', '#E36A6A'];

  return (
    <div className="flex flex-col gap-6" id="analytics-view">
      
      {/* HEADER SECTION WITH FILTER PILLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-stone-100 shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-moon-rose" />
            <span>Cycle & Wellness Analytics</span>
          </h1>
          <p className="text-stone-400 text-xs mt-1">
            Dynamic periodic analytics derived purely from local journal files.
          </p>
        </div>

        {/* Filters */}
        <div className="flex bg-stone-100 p-1 rounded-full gap-0.5 w-full sm:w-auto" id="analytics-filters">
          {(['30d', '90d', '6m', '1y', 'all'] as DateRangeFilter[]).map((filter) => {
            const label = filter === '30d' ? '30 Days' : filter === '90d' ? '90 Days' : filter === '6m' ? '6 Months' : filter === '1y' ? '1 Year' : 'All time';
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer flex-1 sm:flex-none ${
                  activeFilter === filter 
                    ? 'bg-white text-stone-800 shadow-xs' 
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {logs.length < 3 ? (
        /* PREMIUM COMPLIANT EMPTY STATE - NO BACKEND */
        <div className="bg-white p-12 rounded-3xl border border-stone-100 shadow-xs text-center flex flex-col items-center max-w-xl mx-auto w-full my-8">
          <div className="w-16 h-16 rounded-full bg-lavender-mist/15 flex items-center justify-center text-lavender-mist mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-xl font-bold text-stone-800">{t.noDataYet}</h2>
          <p className="text-stone-500 text-xs leading-relaxed max-w-sm mt-2 mb-6">
            RituSmriti builds statistical dashboards locally after you record daily elements (moods, energy, sleep) across multiple days. Your health metrics never touch external clouds.
          </p>
          <div className="text-[11px] font-bold text-moon-rose bg-moon-rose/5 px-4 py-2 border border-moon-rose/15 rounded-full inline-block">
            📈 Start adding journal records inside the Calendar to unlock graphs!
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* MAIN COLUMN 1: CYCLE TRENDS CHRONICLE (Line or Bar chart) */}
          {cycleData.length > 0 && (
            <div className="lg:col-span-12 bg-white p-6 rounded-3xl border border-stone-100 shadow-xs">
              <h3 className="font-serif text-lg font-bold text-stone-800 mb-4 flex items-center gap-1.5">
                <Droplet className="w-4.5 h-4.5 text-moon-rose" />
                <span>Menstrual Cycle Length Tendencies</span>
              </h3>
              <div className="h-64 md:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cycleData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1EBE3" />
                    <XAxis dataKey="cycleNumber" stroke="#A8A29E" fontSize={11} fontWeight={600} />
                    <YAxis stroke="#A8A29E" fontSize={11} fontWeight={600} />
                    <Tooltip cursor={{ fill: 'rgba(214, 139, 166, 0.05)' }} />
                    <Bar dataKey="length" name="Cycle length (days)" fill="#B8A2D9" radius={[10, 10, 0, 0]} />
                    <Bar dataKey="periodDays" name="Period flow days" fill="#D68BA6" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* PHYSICAL PAIN VS ENERGY LEVELS OVER TIME (8cols) */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-stone-100 shadow-xs">
            <h3 className="font-serif text-lg font-bold text-stone-800 mb-4 flex items-center gap-1.5">
              <Flame className="w-4.5 h-4.5 text-ritu-warning" />
              <span>Pain scale and Pranic Energy correlations</span>
            </h3>
            {trendsData.length === 0 ? (
              <div className="py-20 text-center text-xs text-stone-400 italic">No daily trends to map in this filter range.</div>
            ) : (
              <div className="h-64 md:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1EBE3" />
                    <XAxis dataKey="name" stroke="#A8A29E" fontSize={11} fontWeight={600} />
                    <YAxis domain={[0, 10]} stroke="#A8A29E" fontSize={11} fontWeight={600} />
                    <Tooltip />
                    <Line type="monotone" dataKey="pain" name="Cramp pain severity" stroke="#D68BA6" strokeWidth={3} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="energy" name="Prana / Energy scale" stroke="#D4B06A" strokeWidth={2.5} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* SYMPTOM POPULARITY PIE COMPACT (4cols) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-stone-100 shadow-xs flex flex-col justify-between">
            <h3 className="font-serif text-lg font-bold text-stone-800 mb-4 flex items-center gap-1.5">
              <Activity className="w-4.5 h-4.5 text-lotus-gold" />
              <span>Symptom Frequency</span>
            </h3>

            {symptomsFrequencyData.length === 0 ? (
              <div className="py-24 text-center text-xs text-stone-400 italic">No symptoms recorded in this range. Keep logging daily to track occurrences.</div>
            ) : (
              <>
                <div className="h-44 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={symptomsFrequencyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {symptomsFrequencyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Labels legend */}
                <div className="flex flex-col gap-1.5 mt-4 text-[11px] font-semibold text-stone-500">
                  {symptomsFrequencyData.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-stone-50 border border-stone-100 p-1.5 rounded-lg">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span>{s.name}</span>
                      </div>
                      <span className="font-mono text-stone-800">{s.value} times</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* WATER & SLEEP FLOW ANALYSIS (12col grid) */}
          <div className="lg:col-span-12 bg-white p-6 rounded-3xl border border-stone-100 shadow-xs">
            <h3 className="font-serif text-lg font-bold text-stone-800 mb-4 flex items-center gap-1.5">
              <Moon className="w-4.5 h-4.5 text-indigo-400" />
              <span>Hydration intake and Sleep Duration stats</span>
            </h3>
            {trendsData.length === 0 ? (
              <div className="py-16 text-center text-xs text-stone-400 italic">No logs mapped.</div>
            ) : (
              <div className="h-64 w-full animate-fade-in">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendsData}>
                    <defs>
                      <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818CF8" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#818CF8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1EBE3" />
                    <XAxis dataKey="name" stroke="#A8A29E" fontSize={11} fontWeight={600} />
                    <YAxis stroke="#A8A29E" fontSize={11} fontWeight={600} />
                    <Tooltip />
                    <Area type="monotone" dataKey="water" name="Fluid glasses (Count)" stroke="#3B82F6" fillOpacity={1} fill="url(#colorWater)" strokeWidth={2} />
                    <Area type="monotone" dataKey="sleep" name="Sleep length (Hours)" stroke="#818CF8" fillOpacity={1} fill="url(#colorSleep)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
