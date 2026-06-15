import React, { useState, useMemo } from 'react';
import * as d3 from 'd3';
import { DailyLog } from '../../types';
import { Calendar, Sparkles, Activity, Droplet, Clock, Flame } from 'lucide-react';

interface YearlyHeatmapProps {
  logs: DailyLog[];
  language: 'en' | 'hi' | 'bn';
}

export default function YearlyHeatmap({ logs, language }: YearlyHeatmapProps) {
  const currentYear = 2026; // Set to the current local year context in the application
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [hoveredDay, setHoveredDay] = useState<{
    dateStr: string;
    log?: DailyLog;
    dateObj: Date;
    dayOfWeek: string;
  } | null>(null);

  // Dynamic list of years available in user logs, plus current context
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>([currentYear]);
    logs.forEach((log) => {
      const match = log.date.match(/^(\d{4})/);
      if (match) {
        yearsSet.add(parseInt(match[1], 10));
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [logs]);

  // Translation table for heatmap-specific elements
  const localT = useMemo(() => {
    const table: Record<string, any> = {
      en: {
        title: 'Long-Term Cycle & Sadhana Heatmap',
        sub: 'Spot annual cycle frequencies, wellness discipline, and metabolic regularity trends at a glance.',
        yearLabel: 'Year:',
        su: 'Su',
        mo: 'Mo',
        tu: 'Tu',
        we: 'We',
        th: 'Th',
        fr: 'Fr',
        sa: 'Sa',
        flowIntensity: 'Flow Intensity',
        painLevel: 'Cramp Pain',
        energyLevel: 'Energy Level',
        movement: 'Yoga/Sadhana',
        water: 'Water Intake',
        sleep: 'Sleep Duration',
        notLogged: 'No journal record',
        futureDay: 'Future day',
        glasses: 'glasses',
        hours: 'hours',
        untracked: 'Blank day',
        legendWaterOnly: 'Sadhana log',
        legendPeriod: 'Menstrual blood flow level',
        legendHolistic: 'Wellness activity intensity',
        hoverGuide: 'Hover or tap on any day square to reveal state logs',
        symptoms: 'Symptoms',
        moods: 'Moods',
      },
      hi: {
        title: 'दीर्घकालिक चक्र और साधना हीटमैप',
        sub: 'वार्षिक चक्र आवृत्तियों, कल्याण अनुशासन और चयापचय नियमितता प्रवृत्तियों को एक नज़र में देखें।',
        yearLabel: 'वर्ष:',
        su: 'रवि',
        mo: 'सोम',
        tu: 'मंगल',
        we: 'बुध',
        th: 'गुरु',
        fr: 'शुक्र',
        sa: 'शनि',
        flowIntensity: 'बहाव की तीव्रता',
        painLevel: 'दर्द का स्तर',
        energyLevel: 'ऊर्जा स्तर',
        movement: 'योग और साधना',
        water: 'पानी का सेवन',
        sleep: 'नींद की अवधि',
        notLogged: 'कोई रिकॉर्ड दर्ज नहीं',
        futureDay: 'आने वाला दिन',
        glasses: 'ग्लास',
        hours: 'घंटे',
        untracked: 'खाली दिन',
        legendWaterOnly: 'साधना लॉग',
        legendPeriod: 'मासिक धर्म प्रवाह स्तर',
        legendHolistic: 'कल्याण गतिविधि तीव्रता',
        hoverGuide: 'दैनिक रिकॉर्ड देखने के लिए किसी भी चौकोर दिन पर माउस ले जाएं या टैप करें',
        symptoms: 'लक्षण',
        moods: 'भाव',
      },
      bn: {
        title: 'দীর্ঘমেয়াদী ঋতুচক্র ও সাধনা হিটম্যাপ',
        sub: 'এক নজরে সারা বছরের রক্তপ্রবাহের ঘনত্ব, সুস্থতার অভ্যাস এবং মেটাবলিক নিয়মিততা পর্যালোচনা করুন।',
        yearLabel: 'বছর:',
        su: 'রবি',
        mo: 'সোম',
        tu: 'মঙ্গল',
        we: 'বুধ',
        th: 'বৃহ',
        fr: 'শুক্র',
        sa: 'শনি',
        flowIntensity: 'রক্তপ্রবাহের তীব্রতা',
        painLevel: 'ব্যথার মাত্রা',
        energyLevel: 'এনার্জি লেভেল',
        movement: 'যোগব্যায়াম ও সাধনা',
        water: 'জলপান',
        sleep: 'ঘুমের সময়',
        notLogged: 'কোনো বিশদ বিবরণ নেই',
        futureDay: 'ভবিষ্যতের দিন',
        glasses: 'গ্লাস',
        hours: 'ঘণ্টা',
        untracked: 'খালি দিন',
        legendWaterOnly: 'সাধনা লগ',
        legendPeriod: 'মাসিক রক্তপ্রবাহের মাত্রা',
        legendHolistic: 'সুস্থতার অভ্যাসের গভীরতা',
        hoverGuide: 'দৈনিক রেকর্ড দেখতে যেকোনো বক্সের ওপর মাউস নিন বা স্পর্শ করুন',
        symptoms: 'লক্ষণসমূহ',
        moods: 'মানসিক ভাব',
      }
    };
    return table[language] || table['en'];
  }, [language]);

  // Index logs by date for instant O(1) lookup during high-scale render loops
  const logsMap = useMemo(() => {
    const map = new Map<string, DailyLog>();
    logs.forEach((log) => {
      map.set(log.date, log);
    });
    return map;
  }, [logs]);

  // Compute dataset of days for the selected year
  const yearDays = useMemo(() => {
    const start = new Date(selectedYear, 0, 1);
    const end = new Date(selectedYear, 11, 31);
    const days: Array<{
      date: Date;
      dateStr: string;
      log?: DailyLog;
      isFuture: boolean;
    }> = [];

    const todayStr = new Date().toISOString().split('T')[0];

    let current = new Date(start);
    while (current <= end) {
      // Create local ISO string representation safely without timezone drift
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      days.push({
        date: new Date(current),
        dateStr,
        log: logsMap.get(dateStr),
        isFuture: dateStr > todayStr,
      });

      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [selectedYear, logsMap]);

  // Determine beautiful colors for cells
  const getCellColor = (day: typeof yearDays[0]) => {
    if (day.isFuture) {
      return 'transparent'; // will be styled with thin dashed border
    }

    const { log } = day;
    if (!log) {
      return '#FAF9F5'; // Very light pristine neutral ivory
    }

    // If there is active menstruation flow or period flag
    if (log.hasPeriod) {
      const flow = log.flowIntensity?.toLowerCase() || 'medium';
      if (flow === 'light') return '#F3C5D3';    // Soft petal pink
      if (flow === 'medium') return '#D68BA6';   // Classic moon rose
      if (flow === 'heavy') return '#E36A6A';    // Vibrant blood red
      if (flow === 'very_heavy') return '#BE3C3C'; // Deep sacred crimson
      return '#D68BA6'; // Default period color
    }

    // Non-menstruating days are calculated based on sadhana/holistic logs to motivate consistency
    let score = 0;
    if (log.waterIntakeGlasses && log.waterIntakeGlasses >= 6) score += 1;
    if (log.sleepHours && log.sleepHours >= 7 && log.sleepHours <= 9) score += 1;
    if (log.exercise && log.exercise.length > 0) score += 1;
    if (log.energyLevel && log.energyLevel >= 6) score += 1;

    // Golden-sage transitions denoting active high-vibrational living
    if (score === 0) return '#F3EFE6'; // Minimum logging
    if (score === 1) return '#E8E1D3'; // Logged but basic stats
    if (score === 2) return '#DAE5D5'; // Light green harmony
    if (score === 3) return '#B9D5B3'; // Medium green prana consistency
    return '#82B678'; // Complete high-vibrational 4/4 score
  };

  // Dimensions of grid cells
  const cellSize = 11;
  const cellPadding = 2;
  const leftPadding = 34; // room for weekdays
  const topPadding = 20;  // room for month names

  // Weekdays labels
  const weekdays = [
    localT.su, // Sunday (Row 0)
    '',        // Monday (Row 1)
    localT.tu, // Tuesday (Row 2)
    '',        // Wednesday (Row 3)
    localT.th, // Thursday (Row 4)
    '',        // Friday (Row 5)
    localT.sa, // Saturday (Row 6)
  ];

  // Helper to place month label coordinates dynamically using D3
  const monthLabels = useMemo(() => {
    const labels: Array<{ name: string; x: number }> = [];
    const months = d3.timeMonths(new Date(selectedYear, 0, 1), new Date(selectedYear, 11, 31));
    const formatter = d3.timeFormat('%b');

    months.forEach((m) => {
      const firstDay = d3.timeMonth(m);
      // count weeks since the very start of selected year
      const weekIndex = d3.timeWeek.count(new Date(selectedYear, 0, 1), firstDay);
      labels.push({
        name: formatter(m),
        x: leftPadding + weekIndex * (cellSize + cellPadding),
      });
    });

    return labels;
  }, [selectedYear]);

  // Svg dynamic calculations
  const totalWeeks = 53;
  const svgWidth = leftPadding + totalWeeks * (cellSize + cellPadding) + 10;
  const svgHeight = topPadding + 7 * (cellSize + cellPadding) + 5;

  return (
    <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-xs flex flex-col gap-5" id="yearly-heatmap-bento">
      
      {/* HEATMAP HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-stone-800 flex items-center gap-1.5">
            <Calendar className="w-5 h-5 text-moon-rose" />
            <span>{localT.title}</span>
          </h3>
          <p className="text-stone-400 text-xs mt-1">
            {localT.sub}
          </p>
        </div>

        {/* Year pickers */}
        <div className="flex items-center gap-2">
          <span className="text-stone-500 font-semibold text-xs">{localT.yearLabel}</span>
          <div className="flex bg-stone-100 p-0.5 rounded-lg gap-0.5">
            {availableYears.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-white text-stone-850 shadow-xs'
                    : 'text-stone-450 hover:text-stone-750'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RENDER GRID WITH HORIZONTAL SCROLL ON MOBILE */}
      <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
        <div style={{ minWidth: `${svgWidth}px` }} className="relative mx-auto">
          <svg width={svgWidth} height={svgHeight} className="overflow-visible select-none">
            {/* 1. Month Labels */}
            {monthLabels.map((lbl, idx) => (
              <text
                key={idx}
                x={lbl.x}
                y={13}
                className="font-sans text-[10px] font-bold fill-stone-400 text-anchor-start"
              >
                {lbl.name}
              </text>
            ))}

            {/* 2. Weekdays Sidebar labels */}
            {weekdays.map((day, rowIdx) => {
              if (!day) return null;
              const y = topPadding + rowIdx * (cellSize + cellPadding) + 9;
              return (
                <text
                  key={rowIdx}
                  x={15}
                  y={y}
                  className="font-sans text-[9px] font-extrabold fill-stone-400/80 text-anchor-middle"
                >
                  {day}
                </text>
              );
            })}

            {/* 3. Daily Squares */}
            {yearDays.map((day, idx) => {
              const dayOfWeek = day.date.getDay(); // 0 to 6
              const weekIndex = d3.timeWeek.count(new Date(selectedYear, 0, 1), day.date);

              const x = leftPadding + weekIndex * (cellSize + cellPadding);
              const y = topPadding + dayOfWeek * (cellSize + cellPadding);

              const cellColor = getCellColor(day);
              const isFuture = day.isFuture;

              return (
                <rect
                  key={idx}
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  rx={2.5}
                  fill={isFuture ? 'transparent' : cellColor}
                  stroke={isFuture ? '#E8E4D9' : day.log ? 'rgba(0,0,0,0.03)' : '#EFECE2'}
                  strokeDasharray={isFuture ? '2 2' : undefined}
                  strokeWidth={isFuture ? 1 : 0.8}
                  className="transition-all duration-150 hover:stroke-stone-450 cursor-pointer"
                  onMouseEnter={() => {
                    const formatDetails = day.date.toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN', {
                      weekday: 'short',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    });
                    setHoveredDay({
                      dateStr: day.dateStr,
                      log: day.log,
                      dateObj: day.date,
                      dayOfWeek: formatDetails
                    });
                  }}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* HEATMAP LEGENDS PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 border-t border-stone-50 pt-4 text-[11px] font-medium text-stone-500">
        {/* Cycle intensities */}
        <div className="md:col-span-5 flex flex-col gap-1.5">
          <span className="font-semibold text-stone-400 text-[10px] uppercase tracking-wider">{localT.legendPeriod}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px]">{localT.untracked}</span>
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#FAF9F5', border: '1px solid #EFECE2' }} />
              <div className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#F3C5D3' }} />
              <div className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#D68BA6' }} />
              <div className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#E36A6A' }} />
              <div className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#BE3C3C' }} />
            </div>
            <span className="text-[10px] font-semibold text-stone-700">Flux Peak</span>
          </div>
        </div>

        {/* Holistic intensities */}
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <span className="font-semibold text-stone-400 text-[10px] uppercase tracking-wider">{localT.legendHolistic}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px]">Basic</span>
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#F3EFE6' }} />
              <div className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#E8E1D3' }} />
              <div className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#DAE5D5' }} />
              <div className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#B9D5B3' }} />
              <div className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#82B678' }} />
            </div>
            <span className="text-[10px] font-semibold text-stone-700">Perfect 4/4</span>
          </div>
        </div>

        {/* Guide helper */}
        <div className="md:col-span-3 flex items-center justify-start md:justify-end text-[10px] text-stone-400 italic">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-lotus-gold animate-bounce" />
            {localT.hoverGuide}
          </span>
        </div>
      </div>

      {/* DYNAMIC METRIC TOOLTIP DRAWER */}
      <div className="bg-[#FFFDF9] border border-stone-100 rounded-2xl p-4 transition-all" id="yearly-heatmap-details">
        {hoveredDay ? (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-stone-100/60 pb-2">
              <span className="font-serif font-bold text-stone-800 text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-stone-400" />
                {hoveredDay.dayOfWeek}
              </span>
              <span className="font-mono text-[10px] font-bold text-stone-400">{hoveredDay.dateStr}</span>
            </div>

            {hoveredDay.log ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Cycle state */}
                <div className="bg-white p-2.5 rounded-xl border border-stone-100 flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                    <Droplet className="w-3 h-3 text-moon-rose shrink-0" />
                    {localT.flowIntensity}
                  </span>
                  {hoveredDay.log.hasPeriod ? (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-moon-rose capitalize">
                        🩸 {hoveredDay.log.flowIntensity?.replace('_', ' ') || 'Flow active'}
                      </span>
                      {hoveredDay.log.painLevel !== undefined && (
                        <span className="text-[10px] text-stone-500 font-medium mt-1">
                          {localT.painLevel}: <span className="font-bold text-stone-700">{hoveredDay.log.painLevel}/10</span>
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-stone-450 italic">No Flow Logged</span>
                  )}
                </div>

                {/* 2. Prana and Sadhana consistency */}
                <div className="bg-white p-2.5 rounded-xl border border-stone-100 flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-lotus-gold shrink-0" />
                    {localT.energyLevel} / Sadhana
                  </span>
                  <div className="flex flex-col gap-0.5 text-xs text-stone-700">
                    {hoveredDay.log.energyLevel !== undefined && (
                      <span className="font-semibold">
                        ⚡ {localT.energyLevel}: <span className="font-bold">{hoveredDay.log.energyLevel}/10</span>
                      </span>
                    )}
                    {hoveredDay.log.waterIntakeGlasses !== undefined && (
                      <span className="text-[10px] text-stone-500 font-medium">
                        💧 {localT.water}: <span className="font-bold">{hoveredDay.log.waterIntakeGlasses} {localT.glasses}</span>
                      </span>
                    )}
                    {hoveredDay.log.sleepHours !== undefined && (
                      <span className="text-[10px] text-stone-500 font-medium">
                        🌙 {localT.sleep}: <span className="font-bold">{hoveredDay.log.sleepHours} {localT.hours}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Moods & Symptoms */}
                <div className="bg-white p-2.5 rounded-xl border border-stone-100 flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                    <Activity className="w-3 h-3 text-[#5BA97F] shrink-0" />
                    {localT.moods} & {localT.symptoms}
                  </span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {hoveredDay.log.moods && hoveredDay.log.moods.map((m, i) => (
                      <span key={`m-${i}`} className="text-[9px] font-bold bg-lavender-mist/10 text-stone-650 px-1.5 py-0.5 rounded-full border border-lavender-mist/10">
                        {m}
                      </span>
                    ))}
                    {hoveredDay.log.symptoms && hoveredDay.log.symptoms.map((s, i) => (
                      <span key={`s-${i}`} className="text-[9px] font-bold bg-moon-rose/10 text-stone-650 px-1.5 py-0.5 rounded-full border border-moon-rose/10">
                        {s}
                      </span>
                    ))}
                    {(!hoveredDay.log.moods?.length && !hoveredDay.log.symptoms?.length) && (
                      <span className="text-xs text-stone-450 italic">None logged</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-2 text-center text-xs text-stone-400 italic">
                {localT.notLogged}. Click inside the Calendar to log detailed ayurvedic elements for this day!
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-xs text-stone-400 italic py-3 flex items-center justify-center gap-1.5">
            <Activity className="w-4 h-4 text-stone-300 animate-pulse" />
            <span>{localT.hoverGuide}</span>
          </div>
        )}
      </div>

    </div>
  );
}
