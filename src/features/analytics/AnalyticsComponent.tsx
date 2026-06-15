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

  // Localized string support for advanced elements
  const localT = useMemo(() => {
    const table: Record<string, any> = {
      en: {
        doshaTitle: 'Ayurvedic Tridosha Balance Index',
        doshaSub: 'Hormonal & physical bio-energies compiled from your daily logs.',
        phaseTitle: 'Predicted Cycle Phase Partition',
        phaseSub: 'Average dynamic duration partition of your metabolic phases.',
        sadhanaTitle: 'Sadhana & Wellness Practice Consistency',
        sadhanaSub: 'Success rates of logging high-vibrational hydration, restorative rest, and body movement.',
        hydrationRating: 'Hydration Target',
        sleepRating: 'Restful Sleep',
        exerciseRating: 'Sadhana Movement',
        daysText: 'days',
      },
      hi: {
        doshaTitle: 'आयुर्वेदिक त्रिदोष संतुलन सूचकांक',
        doshaSub: 'आपके दैनिक लॉग से संकलित हार्मोनल और शारीरिक जैव-ऊर्जा।',
        phaseTitle: 'अनुमानित चक्र चरण विभाजन',
        phaseSub: 'आपके चयापचय चरणों का औसत गतिशील विभाजन।',
        sadhanaTitle: 'साधना और कल्याण अभ्यास स्थिरता',
        sadhanaSub: 'सकारात्मक जलयोजन, सुधारात्मक आराम और शारीरिक गतिशीलता की स्थिरता।',
        hydrationRating: 'जलयोजन लक्ष्य',
        sleepRating: 'सुखद नींद',
        exerciseRating: 'साधना और योग',
        daysText: 'दिन',
      },
      bn: {
        doshaTitle: 'আয়ুর্বেদিক ত্রিদোষ ভারসাম্য সূচক',
        doshaSub: 'আপনার দৈনিক ডায়েরি ও লক্ষণ থেকে প্রাপ্ত শারীরিক ও জৈবিক প্রভাবের সমতা।',
        phaseTitle: 'চক্রের প্রতিটি ধাপের অনুমিত অনুপাত',
        phaseSub: 'আপনার মাসিক চক্রের বিভিন্ন পর্যায়ের গড় স্থায়ীত্বের দৃশ্যমান সময়রেখা।',
        sadhanaTitle: 'সাধনা ও দৈনন্দিন সুস্থতার অভ্যাস পর্যালোচনা',
        sadhanaSub: 'পর্যাপ্ত জল পান, শান্ত ঘুম এবং নিয়মিত যোগব্যায়াম অভ্যাসের চমৎকার সফলতা সূচক।',
        hydrationRating: 'পর্যাপ্ত জল পান',
        sleepRating: 'সুস্থির নিদ্রা',
        exerciseRating: 'সাধনা ও ব্যায়াম',
        daysText: 'দিন',
      }
    };
    return table[language] || table['en'];
  }, [language]);

  // Tridosha distribution mapping from symptoms & moods
  const doshaScores = useMemo(() => {
    let vata = 0;
    let pitta = 0;
    let kapha = 0;

    filteredDailyLogs.forEach((log) => {
      // Mood scores
      if (log.moods) {
        log.moods.forEach((m) => {
          const lTarget = m.toLowerCase();
          if (lTarget.includes('anxious')) vata += 2;
          if (lTarget.includes('sad')) vata += 1.5;
          if (lTarget.includes('emotional')) vata += 1;
          if (lTarget.includes('irritated') || lTarget.includes('angry')) pitta += 2.5;
          if (lTarget.includes('calm') || lTarget.includes('happy')) kapha += 1;
        });
      }

      // Symptoms scores
      if (log.symptoms) {
        log.symptoms.forEach((s) => {
          const sLower = s.toLowerCase();
          if (sLower.includes('bloating') || sLower.includes('gas') || sLower.includes('constipation')) vata += 2;
          if (sLower.includes('migraine') || sLower.includes('headache')) vata += 1.5;
          if (sLower.includes('insomnia') || sLower.includes('disturb')) vata += 2.5;
          
          if (sLower.includes('acne') || sLower.includes('skin')) pitta += 2;
          if (sLower.includes('nausea') || sLower.includes('indigestion')) pitta += 1.5;
          if (sLower.includes('cravings') || sLower.includes('sugar')) pitta += 1.5;
          if (sLower.includes('flashes') || sLower.includes('hot')) pitta += 2.5;
          
          if (sLower.includes('fatigue') || sLower.includes('lethargy')) kapha += 2;
          if (sLower.includes('heavy') || sLower.includes('weight')) kapha += 1.5;
          if (sLower.includes('swelling')) kapha += 1.5;
        });
      }

      // Sleep correlation
      if (log.sleepHours) {
        if (log.sleepHours < 6) vata += 1.5;
        if (log.sleepHours > 9) kapha += 1.5;
      }

      // Cramp severity influence
      if (log.painLevel && log.painLevel > 5) {
        pitta += 1;
        vata += 1; // vata triggers neuro-spasms
      }

      // Flow volume influence
      if (log.flowIntensity) {
        const flowLower = log.flowIntensity.toLowerCase();
        if (flowLower === 'heavy' || flowLower === 'very_heavy') pitta += 2;
        if (flowLower === 'light') vata += 1;
      }
    });

    // If zero logged factors, initialize balanced ratio
    if (vata === 0 && pitta === 0 && kapha === 0) {
      vata = 33;
      pitta = 33;
      kapha = 34;
    }

    const total = vata + pitta + kapha;
    const vataPct = Math.round((vata / total) * 100);
    const pittaPct = Math.round((pitta / total) * 100);
    const kaphaPct = 100 - vataPct - pittaPct;

    return [
      {
        name: 'Vata (Wind & Space)',
        value: vataPct,
        color: '#A8A29E',
        desc: {
          en: 'Nervous impulse & circulation. Excess triggers bloating, migraines, anxiety, or light sleep.',
          hi: 'तंत्रिका और संचलन। अधिकता से पेट फूलना, माइग्रेन, चिंता या हल्की नींद आती है।',
          bn: 'স্নায়ুবিক উদ্দীপনা ও গতিশীলতা। বৃদ্ধি পেলে পেট ফাঁপা, মাথাব্যথা, উদ্বেগ বা অনিদ্রা দেখা দেয়।',
        }
      },
      {
        name: 'Pitta (Fire & Water)',
        value: pittaPct,
        color: '#E36A6A',
        desc: {
          en: 'Heat, hormones, and metabolism. Excess triggers acne breakouts, hot flashes, or emotional irritation.',
          hi: 'गर्मी और चयापचय। अधिकता से मुंहासे, गर्मी का अहसास या चिड़चिड़ापन होता है।',
          bn: 'হজমশক্তি, হরমোন ও উষ্ণতা। বৃদ্ধি পেলে ব্রণ, তলপেটে বা পিঠে তীব্র ক্র্যাম্প বা খিটখিটে মেজাজ হয়।',
        }
      },
      {
        name: 'Kapha (Earth & Water)',
        value: kaphaPct,
        color: '#5BA97F',
        desc: {
          en: 'Structural density and fluid balance. Excess triggers water retention, heavy fatigue, or lethargy.',
          hi: 'शारीरिक पानी का संतुलन और संरचना। अधिकता से शरीर में भारीपन, सुस्ती या अत्यधिक थकान होती है।',
          bn: 'ভারসাম্য ও শারীরিক গঠন। বৃদ্ধি পেলে শরীরে জল জমা ফোলাভাব, অলসতা বা ভীষণ ক্লান্তি দেখা দেয়।',
        }
      }
    ];
  }, [filteredDailyLogs]);

  // Phase distribution durations
  const phaseDistribution = useMemo(() => {
    const total = metrics.averageCycleLength;
    const menstruation = metrics.averagePeriodLength;
    const ovulation = 3;
    const follicular = Math.max(2, Math.round(total / 2) - menstruation - 1);
    const luteal = Math.max(5, total - menstruation - follicular - ovulation);

    return [
      {
        name: t.menstrualPhase || 'Menstruation',
        days: menstruation,
        color: '#D68BA6',
        desc: {
          en: 'Prioritize comforting warming teas, heavy restoration, and lower spinal release postures.',
          hi: 'गर्म चाय, पूर्ण विश्राम और निचले हिस्से को आराम देने वाले आसनों को प्राथमिकता दें।',
          bn: 'সহজপাচ্য ওষধি আদা চা পান করুন, পূর্ণ বিশ্রাম ও পিঠ শিথিল করার আরামদায়ক আসন করতে পারেন।',
        }
      },
      {
        name: t.follicularPhase || 'Follicular',
        days: follicular,
        color: '#B8A2D9',
        desc: {
          en: 'Estrogen ascends. Excellent time to scale metabolic challenges and begin dynamic wellness goals.',
          hi: 'एस्ट्रोजन बढ़ता है। गतिशील योग आसनों और चुनौतीपूर्ण कार्यों के लिए आदर्श समय।',
          bn: 'এস্ট্রোজেন হরমোন বাড়তে থাকে। নতুন পরিকল্পনা ও চটপটে শারীরিক কসরত শুরু করার সেরা সময়।',
        }
      },
      {
        name: t.ovulationPhase || 'Ovulation',
        days: ovulation,
        color: '#D4B06A',
        desc: {
          en: 'Peak stamina, high confidence, skin luminescence, and elevated conversational warmth.',
          hi: 'उच्च सहनशक्ति, प्राकृतिक चमक और बढ़े हुए आत्मविश्वास का अनुभव होता है।',
          bn: 'সর্বোচ্চ এনার্জি, উজ্জ্বল ত্বক এবং চমৎকার আত্মবিশ্বাস ও মনের প্রফুল্লতা বজায় থাকে।',
        }
      },
      {
        name: t.lutealPhase || 'Luteal',
        days: luteal,
        color: '#5BA97F',
        desc: {
          en: 'Transition into grounding nutrition, warm herbal tea elements, and silent meditation.',
          hi: 'जड़युक्त शीतल खाद्य पदार्थों, हर्बल चाय और मौन ध्यान की ओर संक्रमण करें।',
          bn: 'শরীর শান্ত রাখার সময়। ফলমূল, উষ্ণ ডেককশন গ্রহণ এবং মৌন প্রার্থনা ও ধ্যান করা বুদ্ধিমানের কাজ।',
        }
      }
    ];
  }, [metrics, t]);

  // Sadhana consistency counts
  const sadhanaMetrics = useMemo(() => {
    if (filteredDailyLogs.length === 0) return { hydration: 0, sleep: 0, movement: 0 };
    let hydCount = 0;
    let sleepCount = 0;
    let moveCount = 0;

    filteredDailyLogs.forEach((l) => {
      if (l.waterIntakeGlasses && l.waterIntakeGlasses >= 6) hydCount += 1;
      if (l.sleepHours && l.sleepHours >= 7 && l.sleepHours <= 9) sleepCount += 1;
      if (l.exercise && l.exercise.length > 0) moveCount += 1;
    });

    const total = filteredDailyLogs.length;
    return {
      hydration: Math.round((hydCount / total) * 100),
      sleep: Math.round((sleepCount / total) * 100),
      movement: Math.round((moveCount / total) * 100)
    };
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
          
          {/* 1. AYURVEDIC DOSHA DISTRIBUTIONS & DESCRIPTIONS (6col grid) */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-stone-100 shadow-xs flex flex-col justify-between" id="ayurvedic-dosha-bento">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-800 flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-lotus-gold animate-pulse" />
                <span>{localT.doshaTitle}</span>
              </h3>
              <p className="text-stone-400 text-xs mt-1 mb-4">
                {localT.doshaSub}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Donut Chart */}
                <div className="h-44 w-44 shrink-0 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={doshaScores}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {doshaScores.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`]} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Central Text */}
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] font-bold text-stone-450 tracking-wider uppercase">Element</span>
                    <span className="font-serif font-extrabold text-xs text-stone-800">
                      {Math.max(...doshaScores.map(d => d.value)) > 45 ? 'Governed' : 'Prakriti'}
                    </span>
                  </div>
                </div>

                {/* Info List */}
                <div className="flex flex-col gap-2.5 w-full">
                  {doshaScores.map((d, idx) => (
                    <div key={idx} className="flex flex-col p-2.5 rounded-xl border border-stone-100 bg-stone-50/50">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="text-xs font-bold text-stone-700">{d.name.split(' (')[0]}</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-stone-800">{d.value}%</span>
                      </div>
                      <p className="text-[10px] leading-relaxed text-stone-400 mt-1">
                        {d.desc[language] || d.desc['en']}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. CYCLE PHASE DURATION DISTRIBUTIONS (6col grid) */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-stone-100 shadow-xs flex flex-col justify-between" id="cycle-phase-partition-bento">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-800 flex items-center gap-1.5">
                <Calendar className="w-4.5 h-4.5 text-moon-rose" />
                <span>{localT.phaseTitle}</span>
              </h3>
              <p className="text-stone-400 text-xs mt-1 mb-4">
                {localT.phaseSub}
              </p>

              {/* Progress bars Stacked Visual */}
              <div className="flex h-3.5 w-full rounded-full overflow-hidden bg-stone-100 mb-6 border border-stone-200/50">
                {phaseDistribution.map((item, idx) => {
                  const pct = Math.round((item.days / metrics.averageCycleLength) * 100);
                  return (
                    <div 
                      key={idx} 
                      className="h-full first:rounded-l-full last:rounded-r-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                      title={`${item.name}: ${item.days} ${localT.daysText}`}
                    />
                  );
                })}
              </div>

              {/* Detail List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {phaseDistribution.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl border border-stone-100 bg-[#FFFDF9] flex flex-col gap-1.5">
                    <div className="flex justify-between items-center border-b border-stone-100/60 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-bold text-stone-800">{item.name}</span>
                      </div>
                      <span className="text-[10px] font-extrabold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full font-mono">
                        {item.days} {localT.daysText}
                      </span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-stone-400">
                      {item.desc[language] || item.desc['en']}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. SADHANA HABITS WEEKLY/MONTHLY GAUGE (12col grid) */}
          <div className="lg:col-span-12 bg-white p-6 rounded-3xl border border-stone-100 shadow-xs animate-fade-in" id="wellness-sadhana-consistency-bento">
            <h3 className="font-serif text-lg font-bold text-stone-800 flex items-center gap-1.5">
              <Activity className="w-4.5 h-4.5 text-[#5BA97F]" />
              <span>{localT.sadhanaTitle}</span>
            </h3>
            <p className="text-stone-400 text-xs mt-1 mb-6">
              {localT.sadhanaSub}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  name: localT.hydrationRating, 
                  pct: sadhanaMetrics.hydration, 
                  color: 'text-blue-500', 
                  bgColor: 'bg-blue-50', 
                  strokeColor: '#3B82F6',
                  detail: 'Target: 6+ glasses daily' 
                },
                { 
                  name: localT.sleepRating, 
                  pct: sadhanaMetrics.sleep, 
                  color: 'text-indigo-400', 
                  bgColor: 'bg-indigo-50/50', 
                  strokeColor: '#818CF8',
                  detail: 'Target: 7 to 9 hours of sleep' 
                },
                { 
                  name: localT.exerciseRating, 
                  pct: sadhanaMetrics.movement, 
                  color: 'text-[#5BA97F]', 
                  bgColor: 'bg-[#5BA97F]/10', 
                  strokeColor: '#5BA97F',
                  detail: 'Target: Regular yoga or exercise' 
                },
              ].map((habit, idx) => {
                const radius = 35;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - (habit.pct / 100) * circumference;

                return (
                  <div key={idx} className="flex items-center gap-5 p-4 rounded-2xl border border-stone-100 bg-stone-50/20 shadow-xs">
                    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        {/* Background track */}
                        <circle
                          cx="40"
                          cy="40"
                          r={radius}
                          className="text-stone-100"
                          strokeWidth="6"
                          stroke="currentColor"
                          fill="transparent"
                        />
                        {/* Progress */}
                        <circle
                          cx="40"
                          cy="40"
                          r={radius}
                          strokeWidth="6"
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                          stroke={habit.strokeColor}
                          fill="transparent"
                          className="transition-all duration-700 ease-out"
                        />
                      </svg>
                      {/* Percent text */}
                      <span className="absolute text-xs font-extrabold text-stone-800 font-mono">
                        {habit.pct}%
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <h4 className="text-xs font-extrabold text-stone-800">{habit.name}</h4>
                      <p className="text-[10px] text-stone-400 font-medium">{habit.detail}</p>
                      
                      {/* Completion status text */}
                      <span className={`text-[10px] font-bold mt-1.5 inline-block ${habit.color}`}>
                        {habit.pct >= 70 ? '🟢 Excellence' : habit.pct >= 40 ? '🟡 Progressing' : '🔴 Focus Area'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
