import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Sparkles, 
  Compass, 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  Settings, 
  Lock,
  Plus,
  Loader2
} from 'lucide-react';
import { UserProfile, DailyLog, AppLanguage, AppTheme } from './types';
import { RituDb } from './storage/db';
import Onboarding from './features/onboarding/Onboarding';
import Dashboard from './features/dashboard/Dashboard';
import CalendarComponent from './features/calendar/CalendarComponent';
import AnalyticsComponent from './features/analytics/AnalyticsComponent';
import WellnessLibrary from './features/wellness/WellnessLibrary';
import SettingsComponent from './features/settings/SettingsComponent';
import DetailedLogger from './components/DetailedLogger';
import { translations } from './locales/translations';

type AppTab = 'dashboard' | 'calendar' | 'analytics' | 'wellness' | 'settings';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Navigation
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  
  // Preferences
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [theme, setTheme] = useState<AppTheme>('light');
  const [showSexualHealth, setShowSexualHealth] = useState<boolean>(true);

  // Modular detailed logger overlay configuration
  const [activeLogDate, setActiveLogDate] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        const savedProfile = await RituDb.getUserProfile();
        const savedLogs = await RituDb.getAllDailyLogs();
        const savedLang = await RituDb.getSetting<AppLanguage>('language', 'en');
        const savedSexLog = await RituDb.getSetting<boolean>('show_sexual_health', true);

        if (savedProfile) {
          setProfile(savedProfile);
          setLanguage(savedProfile.language || savedLang);
        }
        setLogs(savedLogs);
        setLanguage(savedLang);
        setTheme('light');
        setShowSexualHealth(savedSexLog);
      } catch (err) {
        console.error('Failed to load local RituSmriti DB sandbox:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Update theme visually on host root element
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
  }, []);

  const handleOnboardingComplete = async (newProfile: UserProfile) => {
    setIsLoading(true);
    try {
      await RituDb.setUserProfile(newProfile);
      await RituDb.setSetting('language', newProfile.language);
      setProfile(newProfile);
      setLanguage(newProfile.language);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    await RituDb.setUserProfile(newProfile);
  };

  const handleUpdateLanguage = async (lang: AppLanguage) => {
    setLanguage(lang);
    await RituDb.setSetting('language', lang);
    if (profile) {
      const updated = { ...profile, language: lang };
      setProfile(updated);
      await RituDb.setUserProfile(updated);
    }
  };

  const handleUpdateTheme = async (newTheme: AppTheme) => {
    setTheme('light');
    await RituDb.setSetting('theme', 'light');
  };

  const handleToggleSexualHealth = async (show: boolean) => {
    setShowSexualHealth(show);
    await RituDb.setSetting('show_sexual_health', show);
  };

  // Safe daily diary saving + state reload
  const handleSaveDailyLog = async (updatedLog: DailyLog) => {
    const freshLogs = logs.filter((l) => l.date !== updatedLog.date);
    const compiled = [...freshLogs, updatedLog].sort((a, b) => a.date.localeCompare(b.date));
    
    setLogs(compiled);
    await RituDb.setDailyLog(updatedLog);
  };

  const handleDeleteDailyLog = async (dateStr: string) => {
    const filtered = logs.filter((l) => l.date !== dateStr);
    setLogs(filtered);
    await RituDb.deleteDailyLog(dateStr);
  };

  // PORTABILITY IMPORTS SCHEMA-VALIDATED
  const handleImportBackup = async (imported: DailyLog[]): Promise<boolean> => {
    try {
      await RituDb.setAllDailyLogs(imported);
      const reloadedLogs = await RituDb.getAllDailyLogs();
      setLogs(reloadedLogs);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // DOWNLOAD BACKUP JSON FILE
  const handleExportBackupJson = () => {
    try {
      const serialized = JSON.stringify(logs, null, 2);
      const blob = new Blob([serialized], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ritusmriti_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to generate export package.');
    }
  };

  // DOWNLOAD SPREADSHEET CSV
  const handleExportBackupCsv = () => {
    try {
      if (logs.length === 0) {
        alert('No metrics to compile into spreadsheet log yet!');
        return;
      }

      // Headers Conforming to cycle structures
      let csvContent = '\uFEFF'; // UTF-8 BOM
      csvContent += 'Date,Period Active,Flow Intensity,Blood Color,Pain Cramps Level,Moods Logged,Symptoms,SleepHours,SleepQuality,WaterIntakeGlasses,Exercises,Notes\n';

      logs.forEach((log) => {
        const date = log.date;
        const period = log.hasPeriod ? 'YES' : 'NO';
        const flow = log.flowIntensity || '—';
        const color = log.bloodColor || '—';
        const pain = log.painLevel ?? '—';
        
        // Escape commas for safe CSV rows parsing
        const moods = `"${(log.moods || []).join(', ')}"`;
        const symptoms = `"${(log.symptoms || []).join(', ')}"`;
        const sleepH = log.sleepHours ?? '—';
        const sleepQ = log.sleepQuality || '—';
        const waterVal = log.waterIntakeGlasses ?? '—';
        const exercises = `"${(log.exercise || []).join(', ')}"`;
        const notes = `"${(log.notes || '').replace(/"/g, '""')}"`;

        csvContent += `${date},${period},${flow},${color},${pain},${moods},${symptoms},${sleepH},${sleepQ},${waterVal},${exercises},${notes}\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ritusmriti_trends_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to construct CSV trends sheet.');
    }
  };

  // CLEAR EVERYTHING RESET CORES
  const handleClearDatabase = async () => {
    await RituDb.clearAllData();
    setProfile(null);
    setLogs([]);
    setActiveTab('dashboard');
    setActiveLogDate(null);
  };

  const t = translations[language];

  // Loader screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory-white flex items-center justify-center p-6 flex-col gap-3">
        <Loader2 className="w-8 h-8 text-moon-rose animate-spin shrink-0" />
        <span className="text-xs text-stone-500 font-semibold tracking-wide font-sans">Connecting local secure sandbox...</span>
      </div>
    );
  }

  // Not onboarded yet
  if (!profile || !profile.isOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Active Logger date log object mapping
  const selectedLogInstance = activeLogDate ? logs.find(l => l.date === activeLogDate) || null : null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FFFDF9] text-[#3A3530] font-sans antialiased" id="primary-app-container">
      
      {/* 1. DESKTOP SIDE BAR RAIL NAVIGATION */}
      <aside className="hidden md:flex flex-col justify-between items-start w-64 bg-[#F9F5EE] border-r border-[#EFE9DD] shrink-0 h-screen sticky top-0 p-6">
        <div className="flex flex-col gap-8 w-full">
          {/* Branded Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-moon-rose flex items-center justify-center text-white font-serif font-extrabold shadow-sm text-sm">
              ऋ
            </div>
            <div>
              <span className="font-serif font-extrabold text-xl text-stone-800 tracking-tight block leading-none">RituSmriti</span>
              <span className="text-[10px] font-bold text-stone-400 block tracking-widest mt-1">ऋतुस्मृति</span>
            </div>
          </div>

          {/* Navigation link keys */}
          <nav className="flex flex-col gap-1.5 w-full" id="desktop-sidebar-nav">
            {[
              { id: 'dashboard', label: t.dashboard, icon: Compass },
              { id: 'calendar', label: t.calendar, icon: Calendar },
              { id: 'analytics', label: t.analytics, icon: TrendingUp },
              { id: 'wellness', label: t.wellness, icon: BookOpen },
              { id: 'settings', label: t.settings, icon: Settings }
            ].map((tabItem) => {
              const TabIcon = tabItem.icon;
              const isActive = activeTab === tabItem.id;
              return (
                <button
                  key={tabItem.id}
                  onClick={() => setActiveTab(tabItem.id as AppTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-moon-rose text-white shadow-sm' 
                      : 'text-stone-600 hover:bg-stone-200/50 hover:text-stone-800'
                  }`}
                >
                  <TabIcon className="w-4.5 h-4.5 shrink-0" />
                  <span>{tabItem.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Confidential indicator on lower rail */}
        <div className="flex items-center gap-2 bg-[#FFFDF9]/80 border border-[#EFE9DD] p-3 rounded-xl w-full">
          <Lock className="w-4 h-4 text-[#5BA97F] shrink-0" />
          <span className="text-[10px] text-stone-500 font-semibold leading-normal">
            Your data never leaves your device.
          </span>
        </div>
      </aside>

      {/* MOBILE HEADER ACCENT */}
      <header className="md:hidden flex justify-between items-center bg-[#F9F5EE] border-b border-[#EFE9DD] px-5 py-4 shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-moon-rose flex items-center justify-center text-white font-serif font-extrabold shadow-xs text-xs">
            ऋ
          </div>
          <span className="font-serif font-bold text-base text-stone-800">RituSmriti</span>
        </div>
        
        {/* Floating Quick Entry button on mobile upper right */}
        <button
          onClick={() => setActiveLogDate(new Date().toISOString().split('T')[0])}
          className="p-1.5 bg-moon-rose text-white rounded-full transition shadow-xs cursor-pointer hover:scale-95"
          title="Quick log today"
        >
          <Plus className="w-4.5 h-4.5" />
        </button>
      </header>

      {/* 2. CHOSEN ROUTE VIEW FRAME */}
      <main className="flex-1 p-5 md:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-x-hidden pb-24 md:pb-10">
        {activeTab === 'dashboard' && (
          <Dashboard
            logs={logs}
            profile={profile}
            language={language}
            onLogQuickEntry={handleSaveDailyLog}
            onOpenDetailedLogger={setActiveLogDate}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarComponent
            logs={logs}
            profile={profile}
            language={language}
            onOpenDetailedLogger={setActiveLogDate}
            onDeleteLog={handleDeleteDailyLog}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsComponent
            logs={logs}
            profile={profile}
            language={language}
          />
        )}

        {activeTab === 'wellness' && (
          <WellnessLibrary
            language={language}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsComponent
            profile={profile}
            language={language}
            theme={theme}
            showSexualHealth={showSexualHealth}
            onUpdateProfile={handleUpdateProfile}
            onUpdateLanguage={handleUpdateLanguage}
            onUpdateTheme={handleUpdateTheme}
            onToggleSexualHealth={handleToggleSexualHealth}
            onImportBackup={handleImportBackup}
            onExportBackupJson={handleExportBackupJson}
            onExportBackupCsv={handleExportBackupCsv}
            onClearDatabase={handleClearDatabase}
          />
        )}
      </main>

      {/* 3. MOBILE STICKY BOTTOM NAVIGATION BAR TIMINGS (WCAG AA Targets >=44px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#F9F5EE]/95 backdrop-blur-md border-t border-[#EFE9DD] flex justify-around items-center z-40 px-2" id="mobile-bottom-tabs">
        {[
          { id: 'dashboard', label: t.dashboard, icon: Compass },
          { id: 'calendar', label: t.calendar, icon: Calendar },
          { id: 'analytics', label: t.analytics, icon: TrendingUp },
          { id: 'wellness', label: t.wellness, icon: BookOpen },
          { id: 'settings', label: t.settings, icon: Settings }
        ].map((tabItem) => {
          const TabIcon = tabItem.icon;
          const isActive = activeTab === tabItem.id;
          return (
            <button
              key={tabItem.id}
              onClick={() => setActiveTab(tabItem.id as AppTab)}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center cursor-pointer transition select-none active:scale-95"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <TabIcon className={`w-5 h-5 transition ${isActive ? 'text-moon-rose stroke-2 scale-105' : 'text-stone-500'}`} />
              <span className={`text-[9px] font-bold mt-1 transition tracking-tight truncate max-w-[56px] leading-none ${isActive ? 'text-moon-rose font-extrabold' : 'text-stone-500'}`}>
                {tabItem.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* 4. MODULAR LOGGING SHEETS ENTRY (TODAY OR CALENDAR CHOSEN DATE) */}
      {activeLogDate && (
        <DetailedLogger
          dateStr={activeLogDate}
          initialLog={selectedLogInstance}
          showSexualHealth={showSexualHealth}
          language={language}
          onSave={handleSaveDailyLog}
          onClose={() => setActiveLogDate(null)}
          onDelete={handleDeleteDailyLog}
        />
      )}

    </div>
  );
}
