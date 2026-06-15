import React, { useState } from 'react';
import { 
  User, 
  Settings2, 
  Download, 
  Upload, 
  Trash2, 
  Database,
  Moon, 
  Bell, 
  Languages, 
  ShieldAlert, 
  Heart,
  CheckCircle,
  Clock,
  AlertTriangle,
  X
} from 'lucide-react';
import { UserProfile, AppLanguage, AppTheme, DailyLog } from '../../types';
import { translations } from '../../locales/translations';

interface SettingsComponentProps {
  profile: UserProfile;
  language: AppLanguage;
  theme: AppTheme;
  showSexualHealth: boolean;
  onUpdateProfile: (newProfile: UserProfile) => void;
  onUpdateLanguage: (lang: AppLanguage) => void;
  onUpdateTheme: (theme: AppTheme) => void;
  onToggleSexualHealth: (show: boolean) => void;
  onImportBackup: (importedLogs: DailyLog[]) => Promise<boolean>;
  onExportBackupJson: () => void;
  onExportBackupCsv: () => void;
  onClearDatabase: () => void;
}

export default function SettingsComponent({
  profile,
  language,
  theme,
  showSexualHealth,
  onUpdateProfile,
  onUpdateLanguage,
  onUpdateTheme,
  onToggleSexualHealth,
  onImportBackup,
  onExportBackupJson,
  onExportBackupCsv,
  onClearDatabase
}: SettingsComponentProps) {
  const t = translations[language];

  // Local inputs
  const [profileName, setProfileName] = useState<string>(profile.name);
  const [profileDob, setProfileDob] = useState<string>(profile.dob);
  const [cycleLen, setCycleLen] = useState<number>(profile.averageCycleLength);
  const [periodDur, setPeriodDur] = useState<number>(profile.averagePeriodDuration);
  const [weight, setWeight] = useState<string>(profile.weight?.toString() || '');
  const [height, setHeight] = useState<string>(profile.height?.toString() || '');

  // Custom alert notifications switches state
  const [notifPeriod, setNotifPeriod] = useState<boolean>(true);
  const [notifOvulation, setNotifOvulation] = useState<boolean>(true);
  const [notifDaily, setNotifDaily] = useState<boolean>(false);
  const [notifWater, setNotifWater] = useState<boolean>(false);
  const [notifSleep, setNotifSleep] = useState<boolean>(false);

  // Modals state
  const [showClearModal, setShowClearModal] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Save biology updates
  const handleSaveBiology = () => {
    if (!profileName.trim()) {
      alert('Name cannot be empty.');
      return;
    }
    const updated: UserProfile = {
      ...profile,
      name: profileName.trim(),
      dob: profileDob,
      averageCycleLength: cycleLen,
      averagePeriodDuration: periodDur,
      weight: weight ? parseFloat(weight) : undefined,
      height: height ? parseFloat(height) : undefined,
    };
    onUpdateProfile(updated);
    alert('Biology settings saved locally!');
  };

  // Browser reminders trigger
  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        alert(`Notification permission status: ${perm}`);
      });
    } else {
      alert('Browser notifications not supported in this client environment.');
    }
  };

  // Import local json
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const rawText = e.target?.result as string;
        const parsed = JSON.parse(rawText);

        // Simple validation checks to verify valid backup schema before importing
        if (!Array.isArray(parsed)) {
          throw new Error('Backup must be an array of daily logs.');
        }

        const isValidSchema = parsed.every(item => {
          return (
            typeof item === 'object' &&
            item !== null &&
            typeof item.date === 'string' &&
            /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
            typeof item.hasPeriod === 'boolean'
          );
        });

        if (!isValidSchema) {
          throw new Error('Invalid elements inside log backup properties schema.');
        }

        const success = await onImportBackup(parsed);
        if (success) {
          setImportStatus({ type: 'success', msg: t.importSuccess });
        } else {
          setImportStatus({ type: 'error', msg: t.importError });
        }
      } catch (err: any) {
        setImportStatus({ type: 'error', msg: `${t.importError} (${err.message || 'Corrupt JSON'})` });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-6" id="settings-view">
      
      {/* HEADER BAR */}
      <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-xs">
        <h1 className="font-serif text-2xl font-bold text-stone-800 flex items-center gap-2">
          <Settings2 className="w-6 h-6 text-moon-rose" />
          <span>{t.settingsTitle}</span>
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          Complete self-contained offline control center containing privacy rules & data export modules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: PARAMETER FORMS (7cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* 1. BIOLOGY SECTION */}
          <div className="bg-white p-6 rounded-3xl border border-stone-100 flex flex-col gap-5 shadow-xs">
            <h2 className="font-serif text-lg font-bold text-stone-800 flex items-center gap-1.5 border-b border-stone-100 pb-3">
              <User className="w-5 h-5 text-moon-rose" />
              <span>{t.profileSection}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-700">{t.fullName}</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs bg-stone-50 outline-hidden focus:ring-2 focus:ring-moon-rose bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-700">{t.dob}</label>
                <input
                  type="date"
                  value={profileDob}
                  onChange={(e) => setProfileDob(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs bg-stone-50 outline-hidden focus:ring-2 focus:ring-moon-rose bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-700">{t.weight}</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs bg-stone-50 outline-hidden focus:ring-2 focus:ring-moon-rose bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-700">{t.height}</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs bg-stone-50 outline-hidden focus:ring-2 focus:ring-moon-rose bg-white"
                />
              </div>
            </div>

            <div className="w-full h-px bg-stone-100 my-1" />

            {/* Cycle settings defaults editing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-stone-700">{t.avgCycleLength}</label>
                  <span className="font-bold text-moon-rose">{cycleLen} days</span>
                </div>
                <input
                  type="range"
                  min="21"
                  max="45"
                  value={cycleLen}
                  onChange={(e) => setCycleLen(parseInt(e.target.value))}
                  className="w-full accent-moon-rose"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-stone-700">{t.avgPeriodDuration}</label>
                  <span className="font-bold text-moon-rose">{periodDur} days</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={periodDur}
                  onChange={(e) => setPeriodDur(parseInt(e.target.value))}
                  className="w-full accent-moon-rose"
                />
              </div>
            </div>

            <button
              onClick={handleSaveBiology}
              className="mt-2 py-2.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold transition cursor-pointer self-end w-full sm:w-auto px-6 shadow-xs"
              id="settings-save-biology-btn"
            >
              Save Biology Custom Settings
            </button>
          </div>

          {/* 2. THEME AND LANGUAGE */}
          <div className="bg-white p-6 rounded-3xl border border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-6 shadow-xs">
            {/* Theme options */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-lavender-mist" />
                <span>{t.themeSelection}</span>
              </h3>
              <div id="settings-theme-selector">
                <div className="w-full py-2.5 px-3 rounded-xl text-xs font-extrabold border bg-lavender-mist/15 border-lavender-mist text-stone-800 text-center uppercase tracking-wider">
                  Sattvik Ivory (Light Only)
                </div>
              </div>
            </div>

            {/* Language Selection */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-lotus-gold" />
                <span>{t.languageSelection}</span>
              </h3>
              <div className="grid grid-cols-3 gap-2" id="settings-lang-selector">
                {(['en', 'hi', 'bn'] as AppLanguage[]).map((lang) => {
                  const label = lang === 'en' ? 'English' : lang === 'hi' ? 'हिन्दी' : 'বাংলা';
                  return (
                    <button
                      key={lang}
                      onClick={() => onUpdateLanguage(lang)}
                      className={`py-2 px-1 rounded-xl text-[10px] md:text-xs font-bold border transition cursor-pointer ${
                        language === lang 
                          ? 'bg-lotus-gold/15 border-lotus-gold text-stone-800 font-extrabold' 
                          : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. ALERT REMINDERS CONFIGURE */}
          <div className="bg-white p-6 rounded-3xl border border-stone-100 flex flex-col gap-4 shadow-xs">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-moon-rose" />
                <span>{t.notificationHeading}</span>
              </h3>
              <button
                onClick={requestNotificationPermission}
                className="text-[10px] font-bold text-moon-rose border border-moon-rose/25 px-2.5 py-1 rounded-full hover:bg-moon-rose/5 cursor-pointer transition"
              >
                Enable Browser Reminders
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center py-1">
                <span className="text-xs font-medium text-stone-700">Period Starting Soon Reminder</span>
                <input
                  type="checkbox"
                  checked={notifPeriod}
                  onChange={(e) => setNotifPeriod(e.target.checked)}
                  className="w-4 h-4 accent-moon-rose cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center py-1 border-t border-stone-50">
                <span className="text-xs font-medium text-stone-700">Ovulation Approaching Alert</span>
                <input
                  type="checkbox"
                  checked={notifOvulation}
                  onChange={(e) => setNotifOvulation(e.target.checked)}
                  className="w-4 h-4 accent-moon-rose cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center py-1 border-t border-stone-50">
                <span className="text-xs font-medium text-stone-700">Daily Health Logging Prompt</span>
                <input
                  type="checkbox"
                  checked={notifDaily}
                  onChange={(e) => setNotifDaily(e.target.checked)}
                  className="w-4 h-4 accent-moon-rose cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center py-1 border-t border-stone-50">
                <span className="text-xs font-medium text-stone-700">Water Hydration Intake Reminder</span>
                <input
                  type="checkbox"
                  checked={notifWater}
                  onChange={(e) => setNotifWater(e.target.checked)}
                  className="w-4 h-4 accent-moon-rose cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 4. SEXUAL HEALTH FEATURE TOGGLE */}
          <div className="bg-white p-6 rounded-3xl border border-stone-100 flex items-center justify-between shadow-xs">
            <div className="flex gap-2.5 items-start">
              <Heart className="w-5 h-5 text-ritu-error shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-stone-700">Sexual Health Journal Module</span>
                <p className="text-[10px] text-stone-400 mt-0.5">Toggle to private logging metrics (protected intimacy, libido scales, logs notes).</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={showSexualHealth}
              onChange={(e) => onToggleSexualHealth(e.target.checked)}
              className="w-5 h-5 accent-ritu-error cursor-pointer shrink-0"
              id="sexual-health-toggle-input"
            />
          </div>

        </div>

        {/* RIGHT COLUMN: DATA PORTABILITY & CLEAN CORES (5cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* PRIVACY SANCTUARY BANNER */}
          <div className="bg-gradient-to-tr from-stone-50 to-warm-cream p-5 rounded-3xl border border-stone-150 flex flex-col gap-2 shadow-2xs">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">🔐 Confidential Shield</span>
            <span className="text-sm font-bold text-stone-800 leading-snug">"Your health data never leaves your device."</span>
            <p className="text-[11px] text-stone-500 leading-normal font-medium">
              We operate strictly client-side. All daily metrics are sequestered safely inside local database folders, invisible to outside cloud monitoring indices. Your records are entirely your property.
            </p>
          </div>

          {/* BACKUP EXPORT CENTER */}
          <div className="bg-white p-6 rounded-3xl border border-stone-100 flex flex-col gap-4 shadow-xs">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-100 pb-3">
              <Database className="w-4.5 h-4.5 text-moon-rose" />
              <span>{t.dataPortability}</span>
            </h3>

            <p className="text-[11px] text-stone-500 leading-normal">
              {t.exportDesc}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onExportBackupJson}
                className="py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                id="export-json-btn"
              >
                <Download className="w-3.5 h-3.5 text-moon-rose" />
                <span>JSON File</span>
              </button>

              <button
                onClick={onExportBackupCsv}
                className="py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                id="export-csv-btn"
              >
                <Download className="w-3.5 h-3.5 text-lotus-gold" />
                <span>Spreadsheet (CSV)</span>
              </button>
            </div>

            <div className="w-full h-px bg-stone-100 my-1" />

            {/* IMPORT/RESTORE */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-stone-600 block">Restore Database logs</span>
              <p className="text-[10px] text-stone-400 font-sans leading-normal">{t.importDesc}</p>
              
              <label 
                htmlFor="import-file-picker"
                className="py-2.5 border-2 border-dashed border-stone-200 hover:border-moon-rose bg-stone-50 hover:bg-stone-100/50 rounded-xl text-center text-xs font-semibold text-stone-500 hover:text-moon-rose transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Upload className="w-4 h-4 shrink-0" />
                <span>Choose backup JSON</span>
              </label>
              
              <input
                type="file"
                id="import-file-picker"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />

              {importStatus && (
                <div className={`mt-2 p-2.5 rounded-xl text-xs flex justify-between items-center ${
                  importStatus.type === 'success' 
                    ? 'bg-ritu-success/10 text-ritu-success font-medium border border-ritu-success/20' 
                    : 'bg-ritu-error/10 text-ritu-error border border-ritu-error/20'
                }`}>
                  <span className="truncate leading-none pr-1">{importStatus.msg}</span>
                  <button onClick={() => setImportStatus(null)} className="p-0.5 hover:bg-stone-100 rounded-full shrink-0">
                    <X className="w-4 h-4 text-stone-500" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* HAZARDOUS DATA CLEANING */}
          <div className="bg-red-50/20 border border-red-100 p-6 rounded-3xl flex flex-col gap-4 shadow-2xs">
            <h3 className="text-xs font-bold text-ritu-error uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4.5 h-4.5" />
              <span>{t.dangerZone}</span>
            </h3>

            <p className="text-[11px] text-stone-500 leading-normal">
              Permanently wipe your complete physical activity, period flow data, and bio parameters profile stored in the browser. This process is absolutely irreversible.
            </p>

            <button
              onClick={() => setShowClearModal(true)}
              className="w-full py-2.5 bg-ritu-error/10 hover:bg-ritu-error text-ritu-error hover:text-white border border-ritu-error/25 hover:border-transparent rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
              id="trigger-clear-all-db-btn"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Local Database logs</span>
            </button>
          </div>

        </div>
      </div>

      {/* CONFIRMATION CLEAR EVERYTHING DIALOG */}
      {showClearModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 border border-stone-100 shadow-xl flex flex-col gap-4" id="delete-confirm-popup">
            
            <div className="flex gap-2.5 items-start">
              <div className="w-10 h-10 rounded-full bg-ritu-error/15 text-ritu-error flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-800">{t.deleteModalTitle}</h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  {t.deleteModalBody}
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 justify-end mt-2">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-500 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  onClearDatabase();
                  setShowClearModal(false);
                }}
                className="px-5 py-2 bg-ritu-error hover:bg-ritu-error/90 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-sm"
                id="confirm-delete-all-db-btn"
              >
                {t.confirmDelete}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
