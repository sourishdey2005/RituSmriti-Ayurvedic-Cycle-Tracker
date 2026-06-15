import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Edit, 
  Droplet, 
  Smile, 
  Activity, 
  Sparkles,
  Heart,
  Moon,
  Coffee,
  CalendarDays
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  parseISO,
  getDay,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { DailyLog, UserProfile } from '../../types';
import { getCycleStatusForDate, predictCycle } from '../../utils/cycleEngine';
import { translations } from '../../locales/translations';

interface CalendarComponentProps {
  logs: DailyLog[];
  profile: UserProfile;
  language: 'en' | 'hi' | 'bn';
  onOpenDetailedLogger: (dateStr: string) => void;
  onDeleteLog: (dateStr: string) => void;
}

export default function CalendarComponent({
  logs,
  profile,
  language,
  onOpenDetailedLogger,
  onDeleteLog
}: CalendarComponentProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const t = translations[language];
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedLog = logs.find(log => log.date === selectedDateStr) || null;

  // Compute status metrics
  const prediction = predictCycle(logs, profile);

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  
  // Grid start and end padding to complete 7-columns
  const startOfGrid = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endOfGrid = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({ start: startOfGrid, end: endOfGrid });

  const weekDays = language === 'hi' 
    ? ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि']
    : language === 'bn'
      ? ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Identify special categories for a date. 
  // We prefer real logged period history, otherwise we render predictions.
  const getDayStatus = (date: Date) => {
    const dStr = format(date, 'yyyy-MM-dd');
    const log = logs.find(l => l.date === dStr);
    
    // Check real logs
    if (log && log.hasPeriod) {
      return { isPeriod: true, isPredicted: false, isOvulation: false, isFertile: false };
    }

    // Check prediction status
    const cycleStatus = getCycleStatusForDate(date, logs, profile);
    
    // If it falls within the predicted next periods
    const isPredictedPeriod = prediction.predictedFuturePeriods.some(pDate => {
      // Find within average period duration start window
      const daysDiff = Math.round((date.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff < profile.averagePeriodDuration;
    }) || (
      // Also match immediate predicted period start
      Math.round((date.getTime() - prediction.nextPeriodDate.getTime()) / (1000 * 60 * 60 * 24)) >= 0 &&
      Math.round((date.getTime() - prediction.nextPeriodDate.getTime()) / (1000 * 60 * 60 * 24)) < profile.averagePeriodDuration
    );

    // Is ovulation day
    const isOvulation = isSameDay(date, prediction.predictedOvulationDate);

    // Is fertile days
    const isFertile = date >= prediction.fertileWindowStart && date <= prediction.fertileWindowEnd;

    return {
      isPeriod: false,
      isPredicted: isPredictedPeriod,
      isOvulation,
      isFertile
    };
  };

  const currentMonthLabel = currentMonth.toLocaleDateString(language === 'en' ? 'en-US' : language === 'hi' ? 'hi-IN' : 'bn-BD', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="calendar-view">
      
      {/* LEFT COLUMN: THE GORGEOUS INTERACTIVE MONTH GRID (8cols) */}
      <div className="md:col-span-8 bg-white p-6 rounded-3xl border border-stone-100 shadow-xs">
        
        {/* CALENDAR MONTH HEADER BAR */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-xl font-bold text-stone-800 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-moon-rose" />
            <span>{currentMonthLabel}</span>
          </h2>
          <div className="flex gap-1">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-stone-50 rounded-full border border-stone-100 text-stone-600 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-stone-50 rounded-full border border-stone-100 text-stone-600 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* WEEKDAYS HEADER ROW */}
        <div className="grid grid-cols-7 text-center mb-4 text-xs font-bold text-stone-400 uppercase tracking-widest">
          {weekDays.map((day, idx) => (
            <div key={idx} className="py-2">{day}</div>
          ))}
        </div>

        {/* DAY CELLS GRID */}
        <div className="grid grid-cols-7 gap-1 md:gap-2" id="calendar-grid">
          {calendarDays.map((day, dIdx) => {
            const isSelected = isSameDay(day, selectedDate);
            const isCurrMonth = day.getMonth() === currentMonth.getMonth();
            const dStatus = getDayStatus(day);
            const dStr = format(day, 'yyyy-MM-dd');
            const dayLogInstance = logs.find(l => l.date === dStr);

            // Determine custom styles for background selection/prediction
            let cellStyle = 'bg-transparent text-stone-700';
            let overlayStyle = '';

            if (!isCurrMonth) {
              cellStyle = 'bg-transparent text-stone-300';
            }

            if (dStatus.isPeriod) {
              // Logged period has a gorgeous soft fill
              cellStyle = 'bg-moon-rose/15 border-moon-rose/30 text-stone-800 font-semibold';
              overlayStyle = 'bg-moon-rose';
            } else if (dStatus.isPredicted) {
              // Predicted period has dashed or faint outline
              cellStyle = 'bg-dashed border border-moon-rose/35 text-stone-700/80';
              overlayStyle = 'bg-moon-rose opacity-65';
            } else if (dStatus.isOvulation) {
              cellStyle = 'bg-lotus-gold/20 text-stone-800 font-bold border border-lotus-gold/40';
              overlayStyle = 'bg-lotus-gold';
            } else if (dStatus.isFertile) {
              cellStyle = 'bg-lotus-gold/5 text-stone-700';
              overlayStyle = 'bg-lotus-gold opacity-50';
            }

            return (
              <button
                key={dIdx}
                onClick={() => setSelectedDate(day)}
                className={`relative h-14 md:h-16 aspect-square rounded-2xl flex flex-col items-center justify-between p-1.5 transition text-xs font-semibold cursor-pointer border ${
                  isSelected 
                    ? 'ring-2 ring-stone-800 ring-offset-2 border-stone-800' 
                    : 'border-transparent hover:bg-stone-50'
                } ${cellStyle}`}
              >
                {/* Visual Circle highlight for period dates */}
                <div className="flex justify-between items-center w-full">
                  <span className={`${isToday(day) ? 'bg-stone-800 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold' : ''}`}>
                    {day.getDate()}
                  </span>
                  
                  {/* Small icon representing logged factors */}
                  {dayLogInstance && dayLogInstance.hasPeriod && (
                    <Droplet className="w-3 h-3 text-moon-rose fill-moon-rose shrink-0" />
                  )}
                </div>

                {/* Badges / indicators for logged details inside date block */}
                <div className="flex gap-0.5 justify-center mt-0.5 w-full">
                  {dayLogInstance && (
                    <>
                      {dayLogInstance.moods?.length > 0 && (
                        <div className="w-1 h-1 rounded-full bg-violet-400" title="Moods logged" />
                      )}
                      {dayLogInstance.symptoms?.length > 0 && (
                        <div className="w-1 h-1 rounded-full bg-amber-400" title="Symptoms logged" />
                      )}
                      {(dayLogInstance.waterIntakeGlasses || 0) > 4 && (
                        <div className="w-1 h-1 rounded-full bg-blue-400" title="Hydrated" />
                      )}
                    </>
                  )}
                  {dStatus.isOvulation && !dayLogInstance && (
                    <div className="w-1.5 h-1.5 rounded-full bg-lotus-gold" title="Predicted Ovulation" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* DOTS DICTIONARY COLOR GUIDE */}
        <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t border-stone-100 text-xs text-stone-500">
          <div className="flex items-center gap-1.5 font-semibold">
            <div className="w-3.5 h-3.5 rounded-md bg-moon-rose/15 border border-moon-rose/30" />
            <span>Logged Period</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold">
            <div className="w-3.5 h-3.5 rounded-md border border-dashed border-moon-rose/60" />
            <span>Predicted Period</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold">
            <div className="w-3.5 h-3.5 rounded-md bg-lotus-gold/25 border border-lotus-gold/40" />
            <span>Ovulation Day</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold">
            <div className="w-3.5 h-3.5 rounded-md bg-lotus-gold/5" />
            <span>Fertile Window</span>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: DETAILS FOR THE CHOSEN CALENDAR DATE (4cols) */}
      <div className="md:col-span-4 flex flex-col gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-xs flex-1 flex flex-col justify-between">
          
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">Chosen Date</span>
            <h3 className="font-serif text-lg font-bold text-stone-800">
              {selectedDate.toLocaleDateString(language === 'en' ? 'en-US' : language === 'hi' ? 'hi-IN' : 'bn-BD', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </h3>
            
            <div className="w-full h-px bg-stone-100 my-4" />
            
            {/* Show Log contents if they exist */}
            {selectedLog ? (
              <div className="flex flex-col gap-4" id="calendar-day-summary">
                
                {/* Period Active flow status */}
                {selectedLog.hasPeriod && (
                  <div className="flex items-center gap-2 bg-red-50 p-3 rounded-2xl border border-red-100">
                    <Droplet className="w-5 h-5 text-moon-rose fill-moon-rose animate-bounce shrink-0" />
                    <div>
                      <span className="text-xs font-extrabold text-moon-rose block uppercase tracking-wider">FLOW {selectedLog.flowIntensity?.replace('_', ' ')}</span>
                      {selectedLog.bloodColor && (
                        <span className="text-[10px] font-semibold text-stone-500">Color: {selectedLog.bloodColor.replace('_', ' ')}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Pain tracker */}
                {selectedLog.painLevel !== undefined && selectedLog.painLevel > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-500 font-semibold">Cramps / Pain scale</span>
                    <span className="font-mono font-bold text-stone-800 bg-stone-100 px-2.5 py-0.5 rounded-md border border-stone-200">{selectedLog.painLevel}/10</span>
                  </div>
                )}

                {/* Moods */}
                {selectedLog.moods && selectedLog.moods.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Moods Logged</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedLog.moods.map((m, mIdx) => (
                        <span key={mIdx} className="text-xs font-semibold px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg text-stone-700">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Symptoms */}
                {selectedLog.symptoms && selectedLog.symptoms.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Symptoms</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedLog.symptoms.map((s, sIdx) => (
                        <span key={sIdx} className="text-[11px] font-semibold px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sleep, energy & Hydration */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {selectedLog.sleepHours !== undefined && (
                    <div className="p-2 border border-stone-150 rounded-xl bg-stone-50 text-center">
                      <span className="text-[9px] font-extrabold text-stone-400 uppercase block">Sleep</span>
                      <span className="text-sm font-extrabold text-stone-800 font-mono leading-none mt-1 inline-block">{selectedLog.sleepHours} hrs</span>
                    </div>
                  )}
                  {selectedLog.waterIntakeGlasses !== undefined && (
                    <div className="p-2 border border-stone-150 rounded-xl bg-stone-50 text-center">
                      <span className="text-[9px] font-extrabold text-stone-400 uppercase block">Water</span>
                      <span className="text-sm font-extrabold text-stone-800 font-mono leading-none mt-1 inline-block">{selectedLog.waterIntakeGlasses} glasses</span>
                    </div>
                  )}
                </div>

                {/* Personal Notes */}
                {selectedLog.notes && (
                  <div className="bg-warm-cream p-3.5 rounded-2xl border border-stone-100 text-xs text-stone-600 leading-relaxed italic">
                    "{selectedLog.notes}"
                  </div>
                )}

              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-stone-400 text-xs italic">{t.noDataYet}</p>
                <p className="text-stone-400 text-[10px] mt-1 pr-2">{t.wellnessEmpty}</p>
              </div>
            )}
          </div>

          <div className="pt-4 flex flex-col gap-2">
            <button
              onClick={() => onOpenDetailedLogger(selectedDateStr)}
              className="w-full py-3 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              id="calendar-log-action-btn"
            >
              {selectedLog ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{selectedLog ? 'Edit Daily Record' : 'Record New Entry'}</span>
            </button>
            
            {/* Delete button option */}
            {selectedLog && (
              <button
                onClick={() => {
                  if (confirm(t.deleteEntryConfirm)) {
                    onDeleteLog(selectedDateStr);
                  }
                }}
                className="w-full py-2 hover:bg-red-50 text-ritu-error border border-red-200 hover:border-transparent rounded-xl text-xs font-semibold transition cursor-pointer"
                id="calendar-delete-action-btn"
              >
                Delete Logged Day
              </button>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
