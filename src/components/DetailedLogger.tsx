import React, { useState, useEffect } from 'react';
import { 
  X, 
  Droplet, 
  Smile, 
  Activity, 
  Flame, 
  Moon, 
  Coffee, 
  Sparkles, 
  Heart, 
  CheckCircle, 
  EyeOff, 
  Notebook,
  AlertCircle
} from 'lucide-react';
import { DailyLog, FlowIntensity, BloodColor, SleepQuality, IntimacyLog } from '../types';
import { translations } from '../locales/translations';

interface DetailedLoggerProps {
  dateStr: string;
  initialLog: DailyLog | null;
  showSexualHealth: boolean;
  language: 'en' | 'hi' | 'bn';
  onSave: (log: DailyLog) => void;
  onClose: () => void;
  onDelete?: (dateStr: string) => void;
}

export default function DetailedLogger({
  dateStr,
  initialLog,
  showSexualHealth,
  language,
  onSave,
  onClose,
  onDelete
}: DetailedLoggerProps) {
  const t = translations[language];

  // Core properties
  const [hasPeriod, setHasPeriod] = useState<boolean>(false);
  const [flowIntensity, setFlowIntensity] = useState<FlowIntensity>('medium');
  const [bloodColor, setBloodColor] = useState<BloodColor>('bright_red');
  const [painLevel, setPainLevel] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Moods & symptoms
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  // Sliders
  const [energyLevel, setEnergyLevel] = useState<number>(5);
  const [sleepHours, setSleepHours] = useState<number>(8);
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>('good');
  const [waterGlasses, setWaterGlasses] = useState<number>(4);

  // Exercise
  const [selectedExercise, setSelectedExercise] = useState<string[]>([]);
  const [customExercise, setCustomExercise] = useState<string>('');

  // Intimacy
  const [hasIntimacy, setHasIntimacy] = useState<boolean>(false);
  const [intimacyProtected, setIntimacyProtected] = useState<boolean>(true);
  const [intimacyUnprotected, setIntimacyUnprotected] = useState<boolean>(false);
  const [libido, setLibido] = useState<number>(5);
  const [intimacyNotes, setIntimacyNotes] = useState<string>('');

  // Load initial settings
  useEffect(() => {
    if (initialLog) {
      setHasPeriod(initialLog.hasPeriod || false);
      if (initialLog.flowIntensity) setFlowIntensity(initialLog.flowIntensity);
      if (initialLog.bloodColor) setBloodColor(initialLog.bloodColor);
      setPainLevel(initialLog.painLevel || 0);
      setNotes(initialLog.notes || '');
      setSelectedMoods(initialLog.moods || []);
      setSelectedSymptoms(initialLog.symptoms || []);
      setEnergyLevel(initialLog.energyLevel || 5);
      setSleepHours(initialLog.sleepHours || 8);
      if (initialLog.sleepQuality) setSleepQuality(initialLog.sleepQuality);
      setWaterGlasses(initialLog.waterIntakeGlasses || 4);
      setSelectedExercise(initialLog.exercise || []);
      setCustomExercise(initialLog.customExercise || '');

      if (initialLog.intimacy) {
        setHasIntimacy(true);
        setIntimacyProtected(initialLog.intimacy.protected);
        setIntimacyUnprotected(initialLog.intimacy.unprotected);
        setLibido(initialLog.intimacy.libido);
        setIntimacyNotes(initialLog.intimacy.notes);
      } else {
        setHasIntimacy(false);
      }
    } else {
      // Clear out defaults
      setHasPeriod(false);
      setFlowIntensity('medium');
      setBloodColor('bright_red');
      setPainLevel(0);
      setNotes('');
      setSelectedMoods([]);
      setSelectedSymptoms([]);
      setEnergyLevel(5);
      setSleepHours(7);
      setSleepQuality('good');
      setWaterGlasses(4);
      setSelectedExercise([]);
      setCustomExercise('');
      setHasIntimacy(false);
    }
  }, [initialLog, dateStr]);

  const handleSave = () => {
    // Construct intimacy
    let intimacyData: IntimacyLog | undefined = undefined;
    if (showSexualHealth && hasIntimacy) {
      intimacyData = {
        protected: intimacyProtected,
        unprotected: intimacyUnprotected,
        libido,
        notes: intimacyNotes,
      };
    }

    const compiledLog: DailyLog = {
      date: dateStr,
      hasPeriod,
      flowIntensity: hasPeriod ? flowIntensity : undefined,
      bloodColor: hasPeriod ? bloodColor : undefined,
      painLevel,
      notes: notes.trim(),
      moods: selectedMoods,
      symptoms: selectedSymptoms,
      energyLevel,
      sleepHours,
      sleepQuality,
      waterIntakeGlasses: waterGlasses,
      exercise: selectedExercise,
      customExercise: selectedExercise.includes('Custom') ? customExercise.trim() : undefined,
      intimacy: intimacyData,
    };

    onSave(compiledLog);
    onClose();
  };

  const toggleMood = (m: string) => {
    setSelectedMoods(prev => 
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    );
  };

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const toggleExercise = (ex: string) => {
    setSelectedExercise(prev => 
      prev.includes(ex) ? prev.filter(x => x !== ex) : [...prev, ex]
    );
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" id="logger-modal-backdrop">
      <div className="bg-ivory-white w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-xl border border-stone-100" id="logger-modal-content">
        
        {/* HEADER BAR */}
        <div className="bg-white px-6 py-4 border-b border-stone-100 flex justify-between items-center shrink-0">
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-800 flex items-center gap-2">
              <Notebook className="w-5 h-5 text-moon-rose" />
              <span>{t.logTitle}</span>
            </h2>
            <p className="text-xs text-stone-500 font-mono mt-0.5">{dateStr}</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 rounded-full transition text-stone-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY (SCROLLABLE) */}
        <div className="p-6 overflow-y-auto flex flex-col gap-8 flex-1 bg-ivory-white">
          
          {/* SECTION 1: MENSTRUATION FLOW */}
          <div className="bg-white p-5 rounded-2xl border border-stone-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label htmlFor="period-active-toggle" className="text-sm font-bold text-stone-700 flex items-center gap-2 cursor-pointer">
                <Droplet className={`w-4.5 h-4.5 ${hasPeriod ? 'text-moon-rose fill-moon-rose' : 'text-stone-400'}`} />
                <span>Period active on this day?</span>
              </label>
              <input
                type="checkbox"
                id="period-active-toggle"
                checked={hasPeriod}
                onChange={(e) => setHasPeriod(e.target.checked)}
                className="w-5 h-5 accent-moon-rose cursor-pointer"
              />
            </div>

            {hasPeriod && (
              <div className="flex flex-col gap-4 pt-4 border-t border-stone-100 transition-all">
                {/* Intensity selection */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">{t.flowIntensity}</span>
                  <div className="grid grid-cols-5 gap-2">
                    {(['spotting', 'light', 'medium', 'heavy', 'very_heavy'] as FlowIntensity[]).map((intensity) => {
                      const labelText = t[intensity === 'medium' ? 'mediumFlow' : intensity === 'very_heavy' ? 'veryHeavy' : intensity];
                      return (
                        <button
                          key={intensity}
                          type="button"
                          onClick={() => setFlowIntensity(intensity)}
                          className={`py-2 px-1 text-[10px] md:text-xs font-semibold rounded-xl border text-center transition cursor-pointer ${
                            flowIntensity === intensity 
                              ? 'bg-moon-rose text-white border-moon-rose' 
                              : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          {labelText}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Blood color */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">{t.bloodColor}</span>
                  <div className="grid grid-cols-5 gap-2">
                    {(['light_pink', 'pink', 'bright_red', 'dark_red', 'brown'] as BloodColor[]).map((color) => {
                      // Map names
                      const label = color === 'light_pink' ? t.bloodLightPink : color === 'pink' ? t.bloodPink : color === 'bright_red' ? t.bloodBrightRed : color === 'dark_red' ? t.bloodDarkRed : t.bloodBrown;
                      // Represent color sphere
                      const colorHex = color === 'light_pink' ? '#F68CA2' : color === 'pink' ? '#D66B8E' : color === 'bright_red' ? '#DC2626' : color === 'dark_red' ? '#991B1B' : '#78350F';
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setBloodColor(color)}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                            bloodColor === color 
                              ? 'bg-stone-50 border-stone-400 font-bold' 
                              : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: colorHex }} />
                          <span className="text-[9px] font-semibold text-stone-600 truncate max-w-full leading-none">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: PAIN & CRITICAL SYMPTOMS */}
          <div className="bg-white p-5 rounded-2xl border border-stone-100 flex flex-col gap-4">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-4 h-4 text-lotus-gold" />
              <span>Cramps & Physical symptoms</span>
            </span>

            {/* Pain Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs text-stone-700">
                <span className="font-semibold">{t.painLevel}</span>
                <span className="font-extrabold text-moon-rose text-sm font-mono">{painLevel}/10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={painLevel}
                onChange={(e) => setPainLevel(parseInt(e.target.value))}
                className="w-full accent-moon-rose h-2 rounded-lg bg-stone-100 cursor-pointer"
              />
            </div>

            {/* Symptoms list */}
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-stone-500 text-xs font-medium">{t.symptoms}</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" id="full-symptoms-layout">
                {[
                  'Cramps', 'Headache', 'Migraine', 'Back Pain', 'Bloating', 'Acne', 
                  'Breast Tenderness', 'Nausea', 'Fatigue', 'Insomnia', 'Mood Swings', 
                  'Food Cravings', 'Constipation', 'Diarrhea', 'Dizziness', 'Hot Flashes'
                ].map((symptom) => {
                  const isSelected = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => toggleSymptom(symptom)}
                      className={`p-2 rounded-xl text-left border text-xs font-medium cursor-pointer transition ${
                        isSelected 
                          ? 'bg-lotus-gold/15 border-lotus-gold text-stone-800 font-semibold' 
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 3: MOOD TRACKER */}
          <div className="bg-white p-5 rounded-2xl border border-stone-100 flex flex-col gap-4">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
              <Smile className="w-4 h-4 text-moon-rose" />
              <span>{t.mood}</span>
            </span>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Happy', emoji: '😊' },
                { label: 'Calm', emoji: '🧘' },
                { label: 'Neutral', emoji: '😐' },
                { label: 'Emotional', emoji: '🥺' },
                { label: 'Sad', emoji: '😢' },
                { label: 'Anxious', emoji: '😖' },
                { label: 'Irritated', emoji: '😠' }, // Wait, avoid previous spaces or retain name
                { label: 'Energetic', emoji: '⚡' },
                { label: 'Motivated', emoji: '🚀' }
              ].map((moodItem) => {
                const cleanName = moodItem.label.trim();
                const isSelected = selectedMoods.includes(cleanName);
                return (
                  <button
                    key={moodItem.label}
                    type="button"
                    onClick={() => toggleMood(cleanName)}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      isSelected 
                        ? 'bg-moon-rose text-white border-moon-rose font-bold' 
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <span>{moodItem.emoji}</span>
                    <span>{cleanName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: FLUIDS, SLEEP & PRANIC ENERGY */}
          <div className="bg-white p-5 rounded-2xl border border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Energy Slider */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-4 h-4 text-ritu-warning" />
                <span>{t.energy}</span>
              </span>
              <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
                <span>Low</span>
                <span className="font-extrabold text-ritu-warning text-sm font-mono">{energyLevel}/10</span>
                <span>High Prana</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                className="w-full accent-ritu-warning h-1.5 rounded-lg bg-stone-100 cursor-pointer"
              />
            </div>

            {/* Water Glasses */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
                <Coffee className="w-4 h-4 text-blue-400" />
                <span>{t.water}</span>
              </span>
              <div className="flex justify-between items-center text-xs text-stone-600 font-medium">
                <span>Glasses logged today</span>
                <span className="font-mono font-bold text-stone-800 text-sm">{waterGlasses} glasses</span>
              </div>
              <div className="flex gap-1.5 mt-1">
                {Array.from({ length: 10 }).map((_, i) => {
                  const num = i + 1;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setWaterGlasses(num)}
                      className={`flex-1 h-7 rounded-sm border text-xs font-mono font-semibold transition cursor-pointer ${
                        waterGlasses >= num 
                          ? 'bg-blue-500 border-blue-500 text-white' 
                          : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sleep tracker */}
            <div className="flex flex-col gap-3 md:col-span-2 pt-4 border-t border-stone-100">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>{t.sleep}</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-medium text-stone-600">
                    <span>{t.sleepHours}</span>
                    <span className="font-mono font-bold text-stone-800 text-sm">{sleepHours} hours</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="14"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseInt(e.target.value))}
                    className="w-full accent-indigo-400 h-1.5 rounded-lg bg-stone-100 cursor-pointer"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-stone-600">Sleep Quality</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['poor', 'average', 'good', 'excellent'] as SleepQuality[]).map((quality) => (
                      <button
                        key={quality}
                        type="button"
                        onClick={() => setSleepQuality(quality)}
                        className={`py-2 text-[10px] sm:text-xs font-bold rounded-lg border text-center transition cursor-pointer uppercase ${
                          sleepQuality === quality 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                            : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
                        }`}
                      >
                        {quality}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: PHYSICAL MOVEMENT / EXERCISE */}
          <div className="bg-white p-5 rounded-2xl border border-stone-100 flex flex-col gap-4">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-ritu-success" />
              <span>Exercise & Pranic Movements</span>
            </span>

            <div className="flex flex-wrap gap-2">
              {['Walking', 'Yoga', 'Gym', 'Running', 'Cycling', 'Meditation', 'Custom'].map((item) => {
                const isSelected = selectedExercise.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleExercise(item)}
                    className={`px-4 py-2 text-xs font-semibold rounded-full border transition cursor-pointer ${
                      isSelected 
                        ? 'bg-ritu-success text-white border-ritu-success font-bold' 
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            {selectedExercise.includes('Custom') && (
              <div className="flex flex-col gap-1.5 mt-1 transition-all">
                <input
                  type="text"
                  value={customExercise}
                  onChange={(e) => setCustomExercise(e.target.value)}
                  placeholder={t.customExercise}
                  className="w-full px-4 py-2 border border-stone-200 rounded-xl outline-hidden focus:ring-2 focus:ring-moon-rose text-xs"
                />
              </div>
            )}
          </div>

          {/* SECTION 6: INTIMACY LOG (Feature toggled) */}
          {showSexualHealth && (
            <div className="bg-white p-5 rounded-2xl border border-stone-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label htmlFor="intimacy-logged-toggle" className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                  <Heart className="w-4.5 h-4.5 text-ritu-error shrink-0" />
                  <span>{t.sexualLog}</span>
                </label>
                <input
                  type="checkbox"
                  id="intimacy-logged-toggle"
                  checked={hasIntimacy}
                  onChange={(e) => setHasIntimacy(e.target.checked)}
                  className="w-4.5 h-4.5 accent-ritu-error cursor-pointer"
                />
              </div>

              {hasIntimacy && (
                <div className="flex flex-col gap-4 pt-4 border-t border-stone-100 transition-all">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="protected-sex-toggle"
                        checked={intimacyProtected}
                        onChange={(e) => setIntimacyProtected(e.target.checked)}
                        className="accent-ritu-error cursor-pointer"
                      />
                      <label htmlFor="protected-sex-toggle" className="text-xs font-semibold text-stone-700 cursor-pointer">{t.protectedSex}</label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="unprotected-sex-toggle"
                        checked={intimacyUnprotected}
                        onChange={(e) => setIntimacyUnprotected(e.target.checked)}
                        className="accent-ritu-error cursor-pointer"
                      />
                      <label htmlFor="unprotected-sex-toggle" className="text-xs font-semibold text-stone-700 cursor-pointer">{t.unprotectedSex}</label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs text-stone-700">
                      <span className="font-semibold">{t.libidoText}</span>
                      <span className="font-extrabold text-ritu-error font-mono">{libido}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={libido}
                      onChange={(e) => setLibido(parseInt(e.target.value))}
                      className="w-full accent-ritu-error col-span-2 h-1 rounded-sm bg-stone-100 cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-stone-600 font-semibold">Intimacy Notes</span>
                    <input
                      type="text"
                      value={intimacyNotes}
                      onChange={(e) => setIntimacyNotes(e.target.value)}
                      placeholder="Optional notes..."
                      className="w-full px-4 py-2 border border-stone-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 7: PERSONAL DIARY JOURNAL */}
          <div className="bg-white p-5 rounded-2xl border border-stone-100 flex flex-col gap-3">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">{t.cycleNotes}</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.notesPlaceholder}
              rows={4}
              className="w-full p-4 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-moon-rose outline-hidden text-xs resize-none"
            />
          </div>

        </div>

        {/* FOOTER BAR ACTIONS */}
        <div className="bg-white px-6 py-4 border-t border-stone-100 flex justify-between items-center shrink-0">
          <div>
            {onDelete && initialLog && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(t.deleteEntryConfirm)) {
                    onDelete(dateStr);
                    onClose();
                  }
                }}
                className="text-stone-400 hover:text-ritu-error text-xs font-semibold cursor-pointer transition py-2 px-3 hover:bg-stone-50 rounded-xl"
              >
                Delete Log
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-500 hover:bg-stone-100 rounded-xl cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-moon-rose hover:bg-moon-rose/95 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              id="save-detailed-log-confirm-btn"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{t.saveLog}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
