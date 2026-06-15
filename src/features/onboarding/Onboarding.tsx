import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, ShieldCheck, Heart, ArrowRight, ArrowLeft } from 'lucide-react';
import { UserProfile, AppLanguage } from '../../types';
import { translations } from '../../locales/translations';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<number>(1);
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [name, setName] = useState<string>('');
  const [dob, setDob] = useState<string>('');
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [periodDuration, setPeriodDuration] = useState<number>(5);
  const [lastPeriodStart, setLastPeriodStart] = useState<string>(() => {
    // Default to last month
    const d = new Date();
    d.setDate(d.getDate() - 15);
    return d.toISOString().split('T')[0];
  });
  
  // Optional
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(false);

  const t = translations[language];

  // Language switch in welcome
  const changeLanguage = (lang: AppLanguage) => {
    setLanguage(lang);
  };

  const handleNext = () => {
    if (step === 2 && !name.trim()) {
      alert('Please enter your name');
      return;
    }
    if (step === 2 && !dob) {
      alert('Please enter your date of birth');
      return;
    }
    if (step === 3 && !lastPeriodStart) {
      alert('Please select your last period start date');
      return;
    }
    if (step === 5 && !privacyAccepted) {
      return;
    }
    
    if (step < 5) {
      setStep((p) => p + 1);
    } else {
      // Completed!
      const profile: UserProfile = {
        name: name.trim(),
        dob,
        language,
        averageCycleLength: cycleLength,
        averagePeriodDuration: periodDuration,
        lastPeriodStartDate: lastPeriodStart,
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
        healthConditions,
        privacyAccepted,
        isOnboarded: true,
      };
      onComplete(profile);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((p) => p - 1);
    }
  };

  const toggleCondition = (cond: string) => {
    setHealthConditions((prev) => 
      prev.includes(cond) ? prev.filter((item) => item !== cond) : [...prev, cond]
    );
  };

  const handleSkip = () => {
    setStep(5);
  };

  // Step render
  return (
    <div className="min-h-screen bg-ivory-white flex flex-col justify-between p-4 md:p-8" id="onboarding-container">
      {/* HEADER / LANG TRIGGER */}
      <div className="flex justify-between items-center max-w-lg mx-auto w-full py-2">
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-8 h-8 rounded-full bg-moon-rose flex items-center justify-center text-white font-serif text-sm font-bold shadow-sm">
            ऋ
          </div>
          <span className="font-serif font-semibold text-lg md:text-xl text-stone-800 tracking-tight">RituSmriti</span>
        </div>
        
        {step < 5 && (
          <div className="flex gap-1 bg-stone-100 rounded-full p-0.5" id="lang-selector">
            {(['en', 'hi', 'bn'] as AppLanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={`px-2.5 py-0.5 text-xs rounded-full font-medium transition-all ${
                  language === lang 
                    ? 'bg-moon-rose text-white shadow-xs' 
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                id={`lang-btn-${lang}`}
              >
                {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिन्दी' : 'বাংলা'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CORE SCREENS INNER */}
      <main className="flex-1 flex items-center justify-center max-w-lg mx-auto w-full py-8 md:py-12">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="text-center flex flex-col items-center"
              id="onboarding-step-1"
            >
              <div className="relative w-44 h-44 mb-8 flex items-center justify-center">
                {/* Abstract rotating lunar background & glowing gold aura */}
                <div className="absolute inset-0 bg-radial from-lavender-mist/20 to-transparent rounded-full animate-pulse" />
                <div className="absolute w-36 h-36 border border-lotus-gold/20 rounded-full cycle-ring-pulse" />
                <svg className="w-32 h-32 text-moon-rose drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Lotus petals */}
                  <path d="M50 20C55 35 65 42 50 80C35 42 45 35 50 20Z" fill="url(#lotus-grad)" opacity="0.85" />
                  <path d="M50 30C66 42 70 52 50 80C30 52 34 42 50 30Z" fill="url(#lotus-grad)" opacity="0.65" />
                  <path d="M50 40C77 50 75 60 50 80C25 60 23 50 50 40Z" fill="url(#lotus-grad)" opacity="0.45" />
                  
                  {/* Crescent moon overlay representing menstrual/lunar cycle */}
                  <path d="M54 30C62 38 62 52 54 60C45 52 45 38 54 30Z" fill="#D4B06A" />
                  
                  <defs>
                    <linearGradient id="lotus-grad" x1="50" y1="20" x2="50" y2="80" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#D68BA6" />
                      <stop offset="1" stopColor="#B8A2D9" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <h1 className="font-serif text-3xl font-bold text-stone-800 leading-tight mb-4 px-2 tracking-tight">
                {t.welcomeTitle}
              </h1>
              
              <p className="text-stone-600 text-sm leading-relaxed mb-8 max-w-sm">
                {t.welcomeDesc}
              </p>

              <button
                onClick={handleNext}
                className="w-full py-3.5 bg-moon-rose hover:bg-moon-rose/90 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
                id="btn-get-started"
              >
                <span>{t.getStarted}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full flex flex-col gap-6"
              id="onboarding-step-2"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-moon-rose">{t.basicInfo} (2/5)</span>
                <h2 className="font-serif text-2xl font-bold text-stone-800 mt-1">Tell us custom metrics</h2>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-stone-700">{t.fullName}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priyanjali Sharma"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white shadow-xs focus:ring-2 focus:ring-moon-rose focus:border-transparent outline-hidden transition"
                    id="input-name"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-stone-700">{t.dob}</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white shadow-xs focus:ring-2 focus:ring-moon-rose focus:border-transparent outline-hidden transition"
                    id="input-dob"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={handlePrev}
                  className="flex-1 py-3 border border-stone-200 text-stone-600 rounded-xl font-medium hover:bg-stone-50 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.prev}</span>
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 bg-moon-rose hover:bg-moon-rose/90 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  id="btn-step2-next"
                >
                  <span>{t.next}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full flex flex-col gap-6"
              id="onboarding-step-3"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-moon-rose">{t.cycleInfo} (3/5)</span>
                <h2 className="font-serif text-2xl font-bold text-stone-800 mt-1">Cycle Rhythm Mapping</h2>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-stone-700">{t.avgCycleLength}</label>
                    <span className="text-sm font-bold text-moon-rose">{cycleLength} {t.daysUnit}</span>
                  </div>
                  <input
                    type="range"
                    min="21"
                    max="45"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(parseInt(e.target.value))}
                    className="w-full accent-moon-rose"
                  />
                  <p className="text-[11px] text-stone-500 leading-normal">{t.avgCycleDesc}</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-stone-700">{t.avgPeriodDuration}</label>
                    <span className="text-sm font-bold text-moon-rose">{periodDuration} {t.daysUnit}</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    value={periodDuration}
                    onChange={(e) => setPeriodDuration(parseInt(e.target.value))}
                    className="w-full accent-moon-rose"
                  />
                  <p className="text-[11px] text-stone-500 leading-normal">{t.avgPeriodDesc}</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-stone-700">{t.lastPeriodStart}</label>
                  <input
                    type="date"
                    value={lastPeriodStart}
                    onChange={(e) => setLastPeriodStart(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white shadow-xs focus:ring-2 focus:ring-moon-rose focus:border-transparent outline-hidden transition"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={handlePrev}
                  className="flex-1 py-3 border border-stone-200 text-stone-600 rounded-xl font-medium hover:bg-stone-50 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.prev}</span>
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 bg-moon-rose hover:bg-moon-rose/90 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  id="btn-step3-next"
                >
                  <span>{t.next}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full flex flex-col gap-6"
              id="onboarding-step-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-moon-rose">{t.optionalInfo} (4/5)</span>
                  <h2 className="font-serif text-2xl font-bold text-stone-800 mt-1">Ayurvedic Dosha Synced</h2>
                </div>
                <button 
                  onClick={handleSkip} 
                  className="text-stone-400 hover:text-stone-600 text-xs font-semibold py-1 px-3 border border-stone-200 rounded-full cursor-pointer transition hover:bg-stone-50"
                >
                  {t.skip}
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-stone-700">{t.weight}</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g. 58"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white shadow-xs focus:ring-2 focus:ring-moon-rose focus:border-transparent outline-hidden transition"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-stone-700">{t.height}</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="e.g. 162"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white shadow-xs focus:ring-2 focus:ring-moon-rose focus:border-transparent outline-hidden transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-stone-700">{t.conditions}</label>
                  <div className="grid grid-cols-2 gap-2" id="conditions-list">
                    {['PCOS', 'Endometriosis', 'Thyroid Issues', 'Other'].map((cond) => {
                      const isSelected = healthConditions.includes(cond);
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => toggleCondition(cond)}
                          className={`p-3 rounded-xl text-left border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                            isSelected 
                              ? 'bg-lavender-mist/20 border-lavender-mist text-stone-800 font-semibold' 
                              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          <span>{cond}</span>
                          {isSelected && <Heart className="w-3.5 h-3.5 text-moon-rose fill-moon-rose" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={handlePrev}
                  className="flex-1 py-3 border border-stone-200 text-stone-600 rounded-xl font-medium hover:bg-stone-50 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.prev}</span>
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 bg-moon-rose hover:bg-moon-rose/90 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  id="btn-step4-next"
                >
                  <span>{t.next}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full flex flex-col gap-6"
              id="onboarding-step-5"
            >
              <div className="text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-ritu-success/15 flex items-center justify-center text-ritu-success mb-3">
                  <ShieldCheck className="w-6 h-6 animate-bounce" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ritu-success">{t.privacyTitle} (5/5)</span>
                <h2 className="font-serif text-2xl font-bold text-stone-800 mt-1">100% On-Device Privacy</h2>
              </div>

              <div className="p-4 bg-warm-cream rounded-2xl border border-stone-200 flex flex-col gap-3">
                <p className="text-xs text-stone-700 leading-relaxed font-sans">
                  {t.privacyBody1}
                </p>
                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  {t.privacyBody2}
                </p>
                <div className="text-xs font-semibold text-stone-800 bg-white p-2.5 rounded-lg border border-stone-200 text-center">
                  🔐 Your health data never leaves your device.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-1" id="privacy-agreement-block">
                <input
                  type="checkbox"
                  id="accept-privacy"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-1 accent-moon-rose cursor-pointer w-4 h-4"
                />
                <label htmlFor="accept-privacy" className="text-xs text-stone-600 leading-relaxed cursor-pointer select-none">
                  {t.acceptPrivacy}
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-3 border border-stone-200 text-stone-600 rounded-xl font-medium hover:bg-stone-50 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={!privacyAccepted}
                  onClick={handleNext}
                  className={`flex-1 py-3.5 rounded-xl font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    privacyAccepted 
                      ? 'bg-moon-rose hover:bg-moon-rose/95 text-white hover:shadow-lg' 
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                  }`}
                  id="btn-complete-onboarding"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t.completeOnboarding}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER METRIC DECORA */}
      <footer className="text-center py-2">
        <div className="flex justify-center gap-1.5" id="step-indicators">
          {[1,2,3,4,5].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === i 
                  ? 'bg-moon-rose w-6' 
                  : i < step 
                    ? 'bg-lavender-mist w-2' 
                    : 'bg-stone-200 w-1.5'
              }`}
            />
          ))}
        </div>
      </footer>
    </div>
  );
}
