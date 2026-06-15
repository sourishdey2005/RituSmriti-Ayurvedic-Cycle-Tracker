import { UserProfile, DailyLog } from '../types';

const DB_NAME = 'RituSmritiDb';
const DB_VERSION = 2;
const LOGS_STORE = 'daily_logs';
const PROFILE_STORE = 'user_profile';
const SETTINGS_STORE = 'settings';

interface DBState {
  isIndexedDBSafe: boolean;
}

const state: DBState = {
  isIndexedDBSafe: true,
};

// Check if IndexedDB is available
function checkIndexedDBSupport(): boolean {
  try {
    return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
  } catch {
    return false;
  }
}

// Initial support check
state.isIndexedDBSafe = checkIndexedDBSupport();

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!state.isIndexedDBSafe) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      state.isIndexedDBSafe = false; // Fallback to localStorage on open error
      reject(new Error(`IndexedDB failed to open: ${request.error?.message}`));
    };

    request.onsuccess = (event) => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      const tx = request.transaction;
      let logsStore: IDBObjectStore;

      if (!db.objectStoreNames.contains(LOGS_STORE)) {
        logsStore = db.createObjectStore(LOGS_STORE, { keyPath: 'date' });
      } else if (tx) {
        logsStore = tx.objectStore(LOGS_STORE);
      } else {
        return;
      }

      // Create an index for date to guarantee fast query scans and range bounds
      if (!logsStore.indexNames.contains('date')) {
        logsStore.createIndex('date', 'date', { unique: true });
      }

      // Create an index for hasPeriod to allow quick cycle analytic lookups
      if (!logsStore.indexNames.contains('hasPeriod')) {
        logsStore.createIndex('hasPeriod', 'hasPeriod', { unique: false });
      }

      if (!db.objectStoreNames.contains(PROFILE_STORE)) {
        db.createObjectStore(PROFILE_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    };
  });
}

// LOCALSTORAGE FALLBACK BACKUP
const LOCALSTORE_PREFIX = 'ritusmriti_fallback_';

function getFallback<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(LOCALSTORE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setFallback<T>(key: string, value: T): void {
  try {
    localStorage.setItem(LOCALSTORE_PREFIX + key, JSON.stringify(value));
  } catch {
    // Ignore storage quota issues in iframe
  }
}

function removeFallback(key: string): void {
  try {
    localStorage.removeItem(LOCALSTORE_PREFIX + key);
  } catch {}
}

export const RituDb = {
  /**
   * --- USER PROFILE ---
   */
  async getUserProfile(): Promise<UserProfile | null> {
    if (!state.isIndexedDBSafe) {
      return getFallback<UserProfile>('profile');
    }

    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(PROFILE_STORE, 'readonly');
        const store = tx.objectStore(PROFILE_STORE);
        const req = store.get('current_user');

        req.onsuccess = () => {
          resolve(req.result ? (req.result.data as UserProfile) : null);
        };

        req.onerror = () => {
          resolve(getFallback<UserProfile>('profile'));
        };
      });
    } catch {
      return getFallback<UserProfile>('profile');
    }
  },

  async setUserProfile(profile: UserProfile): Promise<void> {
    // Sync fallback always
    setFallback('profile', profile);

    if (!state.isIndexedDBSafe) return;

    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(PROFILE_STORE, 'readwrite');
        const store = tx.objectStore(PROFILE_STORE);
        const req = store.put({ id: 'current_user', data: profile });

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('IndexedDB failed, profile saved in fallback:', err);
    }
  },

  /**
   * --- DAILY JOURNAL LOGS ---
   */
  async getDailyLog(date: string): Promise<DailyLog | null> {
    if (!state.isIndexedDBSafe) {
      const logs = getFallback<Record<string, DailyLog>>('logs') || {};
      return logs[date] || null;
    }

    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(LOGS_STORE, 'readonly');
        const store = tx.objectStore(LOGS_STORE);
        const req = store.get(date);

        req.onsuccess = () => {
          resolve(req.result as DailyLog || null);
        };

        req.onerror = () => {
          const logs = getFallback<Record<string, DailyLog>>('logs') || {};
          resolve(logs[date] || null);
        };
      });
    } catch {
      const logs = getFallback<Record<string, DailyLog>>('logs') || {};
      return logs[date] || null;
    }
  },

  async setDailyLog(log: DailyLog): Promise<void> {
    // Always sync local storage fallback
    const logs = getFallback<Record<string, DailyLog>>('logs') || {};
    logs[log.date] = log;
    setFallback('logs', logs);

    if (!state.isIndexedDBSafe) return;

    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(LOGS_STORE, 'readwrite');
        const store = tx.objectStore(LOGS_STORE);
        const req = store.put(log);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('IndexedDB write failed, saved to fallback storage:', err);
    }
  },

  async deleteDailyLog(date: string): Promise<void> {
    // Fallback sync
    const logs = getFallback<Record<string, DailyLog>>('logs') || {};
    delete logs[date];
    setFallback('logs', logs);

    if (!state.isIndexedDBSafe) return;

    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(LOGS_STORE, 'readwrite');
        const store = tx.objectStore(LOGS_STORE);
        const req = store.delete(date);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('IndexedDB delete failed, deleted from fallback:', err);
    }
  },

  async getAllDailyLogs(): Promise<DailyLog[]> {
    if (!state.isIndexedDBSafe) {
      const logsMap = getFallback<Record<string, DailyLog>>('logs') || {};
      return Object.values(logsMap).sort((a, b) => a.date.localeCompare(b.date));
    }

    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(LOGS_STORE, 'readonly');
        const store = tx.objectStore(LOGS_STORE);
        const req = store.getAll();

        req.onsuccess = () => {
          const results = req.result as DailyLog[];
          resolve(results.sort((a, b) => a.date.localeCompare(b.date)));
        };

        req.onerror = () => {
          const logsMap = getFallback<Record<string, DailyLog>>('logs') || {};
          resolve(Object.values(logsMap).sort((a, b) => a.date.localeCompare(b.date)));
        };
      });
    } catch {
      const logsMap = getFallback<Record<string, DailyLog>>('logs') || {};
      return Object.values(logsMap).sort((a, b) => a.date.localeCompare(b.date));
    }
  },

  async getDailyLogsInRange(startDate: string, endDate: string): Promise<DailyLog[]> {
    if (!state.isIndexedDBSafe) {
      const logsMap = getFallback<Record<string, DailyLog>>('logs') || {};
      return Object.values(logsMap)
        .filter((l) => l.date >= startDate && l.date <= endDate)
        .sort((a, b) => a.date.localeCompare(b.date));
    }

    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(LOGS_STORE, 'readonly');
        const store = tx.objectStore(LOGS_STORE);
        const index = store.index('date');
        const range = IDBKeyRange.bound(startDate, endDate);
        const req = index.getAll(range);

        req.onsuccess = () => {
          resolve(req.result as DailyLog[] || []);
        };

        req.onerror = () => {
          const logsMap = getFallback<Record<string, DailyLog>>('logs') || {};
          const filtered = Object.values(logsMap)
            .filter((l) => l.date >= startDate && l.date <= endDate)
            .sort((a, b) => a.date.localeCompare(b.date));
          resolve(filtered);
        };
      });
    } catch {
      const logsMap = getFallback<Record<string, DailyLog>>('logs') || {};
      return Object.values(logsMap)
        .filter((l) => l.date >= startDate && l.date <= endDate)
        .sort((a, b) => a.date.localeCompare(b.date));
    }
  },

  async setAllDailyLogs(logs: DailyLog[]): Promise<void> {
    // Fallback sync
    const logsMap: Record<string, DailyLog> = {};
    logs.forEach(l => {
      logsMap[l.date] = l;
    });
    setFallback('logs', logsMap);

    if (!state.isIndexedDBSafe) return;

    try {
      const db = await openDB();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(LOGS_STORE, 'readwrite');
        const store = tx.objectStore(LOGS_STORE);

        // Clear existing logs first
        const clearReq = store.clear();
        clearReq.onerror = () => reject(clearReq.error);
        clearReq.onsuccess = () => {
          let errorOccurred = false;
          let pendingCount = logs.length;

          if (pendingCount === 0) {
            resolve();
            return;
          }

          logs.forEach((log) => {
            const addReq = store.put(log);
            addReq.onerror = () => {
              errorOccurred = true;
            };
            addReq.onsuccess = () => {
              pendingCount--;
              if (pendingCount === 0) {
                if (errorOccurred) {
                  reject(new Error('Some logs failed to import'));
                } else {
                  resolve();
                }
              }
            };
          });
        };
      });
    } catch (err) {
      console.warn('IndexedDB bulk write failed, saved to fallback:', err);
    }
  },

  async deleteLogsInRange(startDate: string, endDate: string): Promise<void> {
    // Fallback sync
    const logs = getFallback<Record<string, DailyLog>>('logs') || {};
    Object.keys(logs).forEach((date) => {
      if (date >= startDate && date <= endDate) {
        delete logs[date];
      }
    });
    setFallback('logs', logs);

    if (!state.isIndexedDBSafe) return;

    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(LOGS_STORE, 'readwrite');
        const store = tx.objectStore(LOGS_STORE);
        
        // Retrieve and delete within keys range
        const range = IDBKeyRange.bound(startDate, endDate);
        const req = store.openCursor(range);

        req.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };

        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('IndexedDB range delete failed, performed on fallback:', err);
    }
  },

  /**
   * --- SETTINGS KEY-VALUE STORE ---
   */
  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    if (!state.isIndexedDBSafe) {
      const val = getFallback<T>(`setting_${key}`);
      return val !== null ? val : defaultValue;
    }

    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(SETTINGS_STORE, 'readonly');
        const store = tx.objectStore(SETTINGS_STORE);
        const req = store.get(key);

        req.onsuccess = () => {
          resolve(req.result ? (req.result.value as T) : defaultValue);
        };

        req.onerror = () => {
          const val = getFallback<T>(`setting_${key}`);
          resolve(val !== null ? val : defaultValue);
        };
      });
    } catch {
      const val = getFallback<T>(`setting_${key}`);
      return val !== null ? val : defaultValue;
    }
  },

  async setSetting<T>(key: string, value: T): Promise<void> {
    setFallback(`setting_${key}`, value);

    if (!state.isIndexedDBSafe) return;

    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(SETTINGS_STORE, 'readwrite');
        const store = tx.objectStore(SETTINGS_STORE);
        const req = store.put({ key, value });

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('IndexedDB set setting failed, saved to fallback:', err);
    }
  },

  /**
   * --- CLEAR EVERYTHING ---
   */
  async clearAllData(): Promise<void> {
    // Clear fallback storage completely
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((k) => {
        if (k.startsWith(LOCALSTORE_PREFIX)) {
          localStorage.removeItem(k);
        }
      });
    } catch (e) {}

    if (!state.isIndexedDBSafe) return;

    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([LOGS_STORE, PROFILE_STORE, SETTINGS_STORE], 'readwrite');
        const req1 = tx.objectStore(LOGS_STORE).clear();
        const req2 = tx.objectStore(PROFILE_STORE).clear();
        const req3 = tx.objectStore(SETTINGS_STORE).clear();

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('IndexedDB clear failed:', err);
    }
  },
};
