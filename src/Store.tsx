import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { SurahData, SurahInfo, QARIS, Ayah } from './types';
import { db, auth, initFirebase, handleFirestoreError, OperationType } from './lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { getBanglaSurahData } from './utils/banglaSurahNames';
import { getDhakaStandardPrayerTimes, calculatePrayerTimes, toBengaliDigits } from './utils/prayerTimes';

export interface SalahLog {
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  tahajjud?: boolean;
  ishraq?: boolean;
}

type AppTheme = 'light' | 'dark' | 'emerald' | 'luxury' | 'ocean' | 'rose' | 'sunset' | 'midnight';
type Tab = 'home' | 'bookmarks' | 'tasbih' | 'duas' | 'settings' | 'salah-tracker' | 'salah-guide' | 'progress';

interface LastRead {
  surahNumber: number;
  ayahIndex: number;
  surahName: string;
}

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

interface DayProgress {
  date: string;
  ayahs: number;
  minutes: number;
  seconds: number;
  surahs: number[];
}

export interface SurahProgressDetail {
  surahNumber: number;
  readAyahs: number;
  listenedSeconds: number;
  lastAyahIndex: number;
  lastUpdated: string;
}

interface AppState {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  favorites: number[];
  toggleFavorite: (num: number) => void;
  qari: string;
  setQari: (q: string) => void;
  autoScrollAyah: boolean;
  setAutoScrollAyah: (v: boolean) => void;
  arabicFontSize: number;
  setArabicFontSize: (v: number) => void;
  bengaliFontSize: number;
  setBengaliFontSize: (v: number) => void;
  repeatMode: 'none' | 'ayah' | 'surah';
  setRepeatMode: (m: 'none' | 'ayah' | 'surah') => void;
  lastRead: LastRead | null;
  setLastRead: (lr: LastRead | null) => void;
  
  currentViewSurah: number | null;
  setCurrentViewSurah: (num: number | null) => void;

  initialTargetAyahIndex: number | null;
  setInitialTargetAyahIndex: (v: number | null) => void;

  isCleanMode: boolean;
  setIsCleanMode: (v: boolean) => void;

  // Notifications
  reminders: string[]; // ['08:00', '20:00']
  addReminder: (time: string) => void;
  removeReminder: (time: string) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;

  // Progress
  weeklyProgress: DayProgress[];
  recordAyahRead: (surahNumber: number) => void;
  resetProgress: (confirm: string) => boolean;

  // Surah Progress Tracking
  surahProgressMap: Record<number, SurahProgressDetail>;
  recordSurahProgress: (surahNumber: number, ayahIndex: number, listenedSecondsDelta?: number) => void;
  resetSurahProgressOnly: () => void;

  // Prayer Times
  prayerTimes: PrayerTimes | null;
  nextPrayer: { name: string; time: string; remaining: string } | null;
  location: { city: string; country: string } | null;
  playAzan: () => void;
  isAzanPlaying: boolean;

  // Audio Playback State
  playingSurah: SurahData | null;
  playingAyahIndex: number;
  isPlaying: boolean;
  audioProgress: number; // 0 to 1
  playAyah: (surah: SurahData, index: number) => void;
  togglePlay: () => void;
  stopPlayback: () => void;
  nextAyah: () => void;
  prevAyah: () => void;
  seekAyah: (index: number) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  firebaseAuthError: string | null;
  globalZoom: number;
  setGlobalZoom: (v: number) => void;
  zoomLocked: boolean;
  setZoomLocked: (v: boolean) => void;
  salahLogs: Record<string, SalahLog>;
  toggleSalahLog: (dateStr: string, prayerId: keyof SalahLog) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
}

const toBengaliNumber = (num: number) => {
  const symbols = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
  return num.toString().split('').map(c => symbols[c as keyof typeof symbols] || c).join('');
};

let lastSessionSurahNum: number | null = null;
let lastSessionQariId: string | null = null;

const updateMediaSessionMetadata = (surah: SurahData, ayahIndex: number, qariId: string) => {
  if (!('mediaSession' in navigator)) return;
  
  const bSurahData = getBanglaSurahData(surah.number);
  const banglaSurahName = bSurahData ? bSurahData.banglaName : surah.englishName;
  const currentAyahText = toBengaliNumber(ayahIndex + 1);
  const totalAyahsText = toBengaliNumber(surah.ayahs.length);

  // If same Surah and Qari, update the existing metadata's title/artwork/artist directly to avoid recreation/flicker
  if (lastSessionSurahNum === surah.number && lastSessionQariId === qariId && navigator.mediaSession.metadata) {
    navigator.mediaSession.metadata.title = `সূরা ${banglaSurahName} - আয়াত ${currentAyahText}/${totalAyahsText}`;
    return;
  }
  
  lastSessionSurahNum = surah.number;
  lastSessionQariId = qariId;

  const qObj = QARIS.find(q => q.id === qariId);
  const qName = qObj ? qObj.name.split(' (')[0] : 'ক্বারী';

  navigator.mediaSession.metadata = new MediaMetadata({
    title: `সূরা ${banglaSurahName} - আয়াত ${currentAyahText}/${totalAyahsText}`,
    artist: `${qName} • আল-কুরআনুল কারিম`,
    album: `সূরা ${surah.englishName} (${surah.name})`,
    artwork: [
      { src: `${window.location.origin}/source-icon.png`, sizes: '512x512', type: 'image/png' },
      { src: `${window.location.origin}/icon-512.png`, sizes: '512x512', type: 'image/png' },
      { src: `${window.location.origin}/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: 'https://images.unsplash.com/photo-1609599006352-bfdf1e87295a?auto=format&fit=crop&w=512&h=512&q=80', sizes: '512x512', type: 'image/jpeg' }
    ]
  });
};

export const parseRoute = (): { tab: Tab; surah: number | null } => {
  if (typeof window === 'undefined') return { tab: 'home', surah: null };

  // Support clean slash pathname first, with fallback to hash for backward compatibility
  let cleanPath = window.location.pathname.replace(/^\/+|\/+$/g, '').trim();
  
  // If hash is present (e.g. #/surah/1), prioritize and convert it
  if (window.location.hash) {
    const hashClean = window.location.hash.replace(/^#\/?/, '').trim();
    if (hashClean) cleanPath = hashClean;
  }

  if (cleanPath.startsWith('surah/')) {
    const num = parseInt(cleanPath.replace('surah/', ''), 10);
    if (!isNaN(num) && num >= 1 && num <= 114) {
      return { tab: 'home', surah: num };
    }
  }

  const validTabs: Tab[] = ['home', 'bookmarks', 'tasbih', 'duas', 'settings', 'salah-tracker', 'salah-guide', 'progress'];
  if (validTabs.includes(cleanPath as Tab)) {
    return { tab: cleanPath as Tab, surah: null };
  }

  return { tab: 'home', surah: null };
};

// Backward-compatible alias
export const parseHashRoute = parseRoute;

export const calculateUpcomingPrayer = (times: any) => {
  if (!times) return null;
  const now = new Date();
  const prayers = [
    { id: 'Fajr', name: 'ফজর' },
    { id: 'Dhuhr', name: 'যোহর' },
    { id: 'Asr', name: 'আসর' },
    { id: 'Maghrib', name: 'মাগরিব' },
    { id: 'Isha', name: 'এশা' }
  ];
  
  let current = null;
  let next = null;

  for (let i = 0; i < prayers.length; i++) {
    const p = prayers[i];
    if (!times[p.id]) continue;
    const [h, m] = times[p.id].split(':').map(Number);
    const pDate = new Date();
    pDate.setHours(h, m, 0, 0);

    const nextPrayerTime = i + 1 < prayers.length ? times[prayers[i + 1].id] : null;
    let nextPDate = null;
    if (nextPrayerTime) {
      const [nh, nm] = nextPrayerTime.split(':').map(Number);
      nextPDate = new Date();
      nextPDate.setHours(nh, nm, 0, 0);
    }

    if (now >= pDate && (!nextPDate || now < nextPDate)) {
      current = { name: p.name, time: times[p.id], isCurrent: true };
      break;
    }
  }
  
  if (!current) {
    for (const p of prayers) {
      if (!times[p.id]) continue;
      const [h, m] = times[p.id].split(':').map(Number);
      const pDate = new Date();
      pDate.setHours(h, m, 0, 0);
      if (pDate > now) {
        const diff = pDate.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const remaining = `${hours > 0 ? toBengaliDigits(hours) + ' ঘণ্টা ' : ''}${toBengaliDigits(mins)} মিনিট`;
        next = { name: p.name, time: times[p.id], remaining, isCurrent: false };
        break;
      }
    }
  }

  if (!current && !next && times.Fajr) {
    const [fh, fm] = times.Fajr.split(':').map(Number);
    const tomorrowFajr = new Date();
    tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
    tomorrowFajr.setHours(fh, fm, 0, 0);
    const diff = tomorrowFajr.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const remaining = `${hours > 0 ? toBengaliDigits(hours) + ' ঘণ্টা ' : ''}${toBengaliDigits(mins)} মিনিট`;
    next = { name: 'ফজর', time: times.Fajr, remaining, isCurrent: false };
  }
  
  return current || next || { name: 'ফজর', time: times.Fajr || '04:30', remaining: 'শীঘ্রই', isCurrent: false };
};

const AppContext = createContext<AppState | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const initialRoute = parseRoute();
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('quran_theme');
    const validThemes: AppTheme[] = ['light', 'dark', 'emerald', 'luxury', 'ocean', 'rose', 'sunset', 'midnight'];
    if (saved && validThemes.includes(saved as AppTheme) && saved !== 'emerald') return saved as AppTheme;
    // Default to the warm luxury parchment theme matching user's requested style
    localStorage.setItem('quran_theme', 'luxury');
    return 'luxury';
  });
  const [activeTab, setActiveTab] = useState<Tab>(initialRoute.tab);
  const [favorites, setFavorites] = useState<number[]>(() => JSON.parse(localStorage.getItem('quran_favs') || '[]'));
  const [qari, setQariState] = useState<string>(() => localStorage.getItem('quran_qari') || 'ar.alafasy');
  
  const [autoScrollAyah, setAutoScrollAyahState] = useState<boolean>(() => localStorage.getItem('quran_autoscroll') !== 'false');
  const [arabicFontSize, setArabicFontSizeState] = useState<number>(() => Number(localStorage.getItem('quran_arabic_size')) || 32);
  const [bengaliFontSize, setBengaliFontSizeState] = useState<number>(() => Number(localStorage.getItem('quran_bengali_size')) || 18);
  
  const [repeatMode, setRepeatModeState] = useState<'none'|'ayah'|'surah'>(() => (localStorage.getItem('quran_repeat') as 'none'|'ayah'|'surah') || 'none');
  const [lastRead, setLastReadState] = useState<LastRead | null>(() => JSON.parse(localStorage.getItem('quran_lastread') || 'null'));

  const [currentViewSurah, setCurrentViewSurah] = useState<number | null>(initialRoute.surah);
  const [initialTargetAyahIndex, setInitialTargetAyahIndex] = useState<number | null>(null);
  const [isCleanMode, setIsCleanMode] = useState<boolean>(false);

  const [reminders, setReminders] = useState<string[]>(() => {
    const saved = localStorage.getItem('quran_reminders');
    return saved ? JSON.parse(saved) : ['08:00', '18:00'];
  });
  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') return false;
    const stored = localStorage.getItem('quran_notifications_enabled');
    if (stored === 'false') return false;
    return Notification.permission === 'granted';
  });
  const [firebaseAuthError, setFirebaseAuthError] = useState<string | null>(null);
  const [globalZoom, setGlobalZoomState] = useState<number>(() => {
    const saved = localStorage.getItem('quran_global_zoom');
    return saved ? Number(saved) : 100;
  });
  const [zoomLocked, setZoomLockedState] = useState<boolean>(() => {
    const saved = localStorage.getItem('quran_zoom_locked');
    return saved !== 'false';
  });

  const [salahLogs, setSalahLogsState] = useState<Record<string, SalahLog>>(() => {
    const saved = localStorage.getItem('quran_salah_logs');
    return saved ? JSON.parse(saved) : {};
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('quran_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const handleSetIsSidebarCollapsed = (v: boolean | ((prev: boolean) => boolean)) => {
    setIsSidebarCollapsed(prev => {
      const nextVal = typeof v === 'function' ? v(prev) : v;
      localStorage.setItem('quran_sidebar_collapsed', nextVal ? 'true' : 'false');
      return nextVal;
    });
  };

  const setGlobalZoom = (zoom: number) => {
    setGlobalZoomState(zoom);
    localStorage.setItem('quran_global_zoom', zoom.toString());
  };

  const setZoomLocked = (v: boolean) => {
    setZoomLockedState(v);
    localStorage.setItem('quran_zoom_locked', v ? 'true' : 'false');
  };

  const toggleSalahLog = (dateStr: string, prayerId: keyof SalahLog) => {
    setSalahLogsState(prev => {
      const dayLog = prev[dateStr] || { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false, tahajjud: false, ishraq: false };
      const updatedDayLog = {
        ...dayLog,
        [prayerId]: !dayLog[prayerId]
      };
      const updatedLogs = {
        ...prev,
        [dateStr]: updatedDayLog
      };
      localStorage.setItem('quran_salah_logs', JSON.stringify(updatedLogs));
      syncToFirebase({ salahLogs: updatedLogs });
      return updatedLogs;
    });
  };

  const isPoppingStateRef = useRef(false);

  // Sync activeTab and currentViewSurah to browser URL using clean slashes (e.g. /home, /surah/1, /salah-tracker)
  useEffect(() => {
    if (isPoppingStateRef.current) return;
    if (typeof window === 'undefined') return;

    let targetPath = '/home';
    if (currentViewSurah !== null) {
      targetPath = `/surah/${currentViewSurah}`;
    } else if (activeTab) {
      targetPath = `/${activeTab}`;
    }

    const currentPath = window.location.pathname;
    // If the browser currently has a hash (from old cache/link), clean it up
    if (window.location.hash) {
      window.history.replaceState({ tab: activeTab, surah: currentViewSurah }, '', targetPath);
    } else if (currentPath !== targetPath && currentPath !== targetPath + '/') {
      window.history.pushState({ tab: activeTab, surah: currentViewSurah }, '', targetPath);
    }
  }, [activeTab, currentViewSurah]);

  // Listen to popstate and hashchange events (browser back/forward, manual link entry)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleRouteChange = () => {
      const route = parseRoute();
      isPoppingStateRef.current = true;
      setActiveTab(route.tab);
      setCurrentViewSurah(route.surah);
      setTimeout(() => {
        isPoppingStateRef.current = false;
      }, 70);
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);

    // Initial check: clean up any hash if present
    if (window.location.hash) {
      const route = parseRoute();
      const cleanPath = route.surah !== null ? `/surah/${route.surah}` : `/${route.tab}`;
      window.history.replaceState({ tab: route.tab, surah: route.surah }, '', cleanPath);
    }

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  // Enforce Screen Zoom Lock / Stability
  useEffect(() => {
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    if (zoomLocked) {
      document.addEventListener('touchstart', preventZoom, { passive: false });
      
      let meta = document.querySelector('meta[name="viewport"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'viewport');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    } else {
      let meta = document.querySelector('meta[name="viewport"]');
      if (meta) {
        meta.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    }

    return () => {
      document.removeEventListener('touchstart', preventZoom);
    };
  }, [zoomLocked]);

  // Firebase Auth & Sync
  useEffect(() => {
    initFirebase().then((err) => {
      if (err) setFirebaseAuthError(err);
    });
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Load settings from Firestore
        onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data.reminders) setReminders(data.reminders);
            if (data.favorites) setFavorites(data.favorites);
            if (data.theme) setThemeState(data.theme);
            if (data.qari) setQariState(data.qari);
            if (data.notificationsEnabled !== undefined) setNotificationsEnabledState(data.notificationsEnabled);
            if (data.salahLogs) setSalahLogsState(data.salahLogs);
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        });
      }
    });
    return () => unsub();
  }, []);

  const syncToFirebase = async (data: any) => {
    if (auth.currentUser) {
      const path = `users/${auth.currentUser.uid}`;
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), data, { merge: true });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, path);
      }
    }
  };

  // Automatically request permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Track notified for reminders and prayers
  const notifiedPrayersRef = useRef<Set<string>>(new Set());
  const notifiedRemindersRef = useRef<Set<string>>(new Set());

  // Progress State
  const [weeklyProgress, setWeeklyProgress] = useState<DayProgress[]>(() => {
    const saved = localStorage.getItem('quran_progress');
    const todayStr = new Date().toISOString().split('T')[0];
    let data: DayProgress[] = saved ? JSON.parse(saved) : [];
    
    const result: DayProgress[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const existing = data.find(p => p.date === dStr);
      if (existing) {
        result.push({
          date: dStr,
          ayahs: existing.ayahs || 0,
          minutes: existing.minutes || 0,
          seconds: existing.seconds || 0,
          surahs: existing.surahs || []
        });
      } else {
        result.push({ date: dStr, ayahs: 0, minutes: 0, seconds: 0, surahs: [] });
      }
    }
    return result;
  });

  const [playingSurah, setPlayingSurah] = useState<SurahData | null>(null);
  const [playingAyahIndex, setPlayingAyahIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  // Prayer Times State (Guaranteed immediate Dhaka Islamic Foundation Standard timings)
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes>(() => getDhakaStandardPrayerTimes() as unknown as PrayerTimes);
  const [nextPrayer, setNextPrayer] = useState<any>(() => calculateUpcomingPrayer(getDhakaStandardPrayerTimes()));
  const [location, setLocation] = useState<{ city: string; country: string }>({ 
    city: 'ঢাকা', 
    country: 'বাংলাদেশ' 
  });
  const [isAzanPlaying, setIsAzanPlaying] = useState(false);
  const azanAudioRef = useRef<HTMLAudioElement | null>(null);

  // We use a ref for repeatMode to access the latest value in handleEnded listener easily
  const repeatModeRef = useRef(repeatMode);

  // We use a ref to prevent browser source transition state flickering
  const isTransitioningRef = useRef(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Save progress
  useEffect(() => {
    localStorage.setItem('quran_progress', JSON.stringify(weeklyProgress));
  }, [weeklyProgress]);

  // Surah Progress Map State
  const [surahProgressMap, setSurahProgressMap] = useState<Record<number, SurahProgressDetail>>(() => {
    const saved = localStorage.getItem('quran_surah_progress_map');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  const recordSurahProgress = (surahNumber: number, ayahIndex: number, listenedSecondsDelta: number = 0) => {
    setSurahProgressMap(prev => {
      const existing = prev[surahNumber] || {
        surahNumber,
        readAyahs: 0,
        listenedSeconds: 0,
        lastAyahIndex: 0,
        lastUpdated: new Date().toISOString()
      };
      const updatedItem: SurahProgressDetail = {
        surahNumber,
        readAyahs: Math.max(existing.readAyahs, ayahIndex + 1),
        listenedSeconds: existing.listenedSeconds + listenedSecondsDelta,
        lastAyahIndex: Math.max(existing.lastAyahIndex, ayahIndex),
        lastUpdated: new Date().toISOString()
      };
      const updatedMap = { ...prev, [surahNumber]: updatedItem };
      localStorage.setItem('quran_surah_progress_map', JSON.stringify(updatedMap));
      return updatedMap;
    });
  };

  const resetSurahProgressOnly = () => {
    setSurahProgressMap({});
    localStorage.removeItem('quran_surah_progress_map');
  };

  const recordAyahRead = (surahNumber: number) => {
    const today = new Date().toISOString().split('T')[0];
    setWeeklyProgress(prev => {
      const updated = [...prev];
      const index = updated.findIndex(p => p.date === today);
      if (index !== -1) {
        const day = { ...updated[index] };
        day.ayahs += 1;
        if (!day.surahs.includes(surahNumber)) {
          day.surahs = [...day.surahs, surahNumber];
        }
        updated[index] = day;
      }
      return updated;
    });
    recordSurahProgress(surahNumber, 0, 0);
  };

  const resetProgress = (confirm: string) => {
    if (confirm === 'RESTART') {
      const initial: DayProgress[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        initial.push({
          date: d.toISOString().split('T')[0],
          ayahs: 0,
          minutes: 0,
          seconds: 0,
          surahs: []
        });
      }
      setWeeklyProgress(initial);
      resetSurahProgressOnly();
      return true;
    }
    return false;
  };

  // Tracking reading time in seconds & updating Surah progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        const today = new Date().toISOString().split('T')[0];
        setWeeklyProgress(prev => {
          const updated = [...prev];
          const index = updated.findIndex(p => p.date === today);
          if (index !== -1) {
            const day = { ...updated[index] };
            day.seconds += 1;
            // Update minutes based on total seconds
            day.minutes = Math.floor(day.seconds / 60);
            updated[index] = day;
          } else {
            // New day might have started while playing
            updated.push({
              date: today,
              ayahs: 0,
              minutes: 0,
              seconds: 1,
              surahs: []
            });
            if (updated.length > 7) updated.shift();
          }
          return updated;
        });

        // Also update surah specific listening progress dynamically!
        if (playingSurah) {
          const currentAyah = playingAyahIndex >= 0 ? playingAyahIndex : 0;
          recordSurahProgress(playingSurah.number, currentAyah, 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playingSurah, playingAyahIndex]);

  const setTheme = (t: AppTheme) => {
    setThemeState(t);
    localStorage.setItem('quran_theme', t);
    syncToFirebase({ theme: t });
  };

  const setQari = (q: string) => {
    setQariState(q);
    localStorage.setItem('quran_qari', q);
    syncToFirebase({ qari: q });
  };

  const setAutoScrollAyah = (v: boolean) => {
    setAutoScrollAyahState(v);
    localStorage.setItem('quran_autoscroll', v ? 'true' : 'false');
  };
  
  const setArabicFontSize = (v: number) => {
    setArabicFontSizeState(v);
    localStorage.setItem('quran_arabic_size', v.toString());
  };

  const setBengaliFontSize = (v: number) => {
    setBengaliFontSizeState(v);
    localStorage.setItem('quran_bengali_size', v.toString());
  };

  const setRepeatMode = (m: 'none' | 'ayah' | 'surah') => {
    setRepeatModeState(m);
    repeatModeRef.current = m;
    localStorage.setItem('quran_repeat', m);
  };

  const setLastRead = (lr: LastRead | null) => {
    setLastReadState(lr);
    if (lr) localStorage.setItem('quran_lastread', JSON.stringify(lr));
  };

  const setNotificationsEnabled = (v: boolean) => {
    setNotificationsEnabledState(v);
    localStorage.setItem('quran_notifications_enabled', v ? 'true' : 'false');
    if (v) {
      Notification.requestPermission();
    }
    syncToFirebase({ notificationsEnabled: v });
  };

  const addReminder = (time: string) => {
    if (reminders.includes(time)) return;
    const updated = [...reminders, time].sort();
    setReminders(updated);
    localStorage.setItem('quran_reminders', JSON.stringify(updated));
    syncToFirebase({ reminders: updated });
  };

  const removeReminder = (time: string) => {
    const updated = reminders.filter(r => r !== time);
    setReminders(updated);
    localStorage.setItem('quran_reminders', JSON.stringify(updated));
    syncToFirebase({ reminders: updated });
  };

  const toggleFavorite = (num: number) => {
    const updated = favorites.includes(num) ? favorites.filter(f => f !== num) : [...favorites, num];
    setFavorites(updated);
    localStorage.setItem('quran_favs', JSON.stringify(updated));
    syncToFirebase({ favorites: updated });
  };

  // Prayer Times Fetching (Dhaka & Islamic Foundation Bangladesh Standard)
  useEffect(() => {
    const fetchWithCoords = async (latitude: number, longitude: number) => {
      try {
        // Karachi / Islamic Foundation standard: method=1, Hanafi Asr: school=1
        const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=1&school=1`);
        const data = await res.json();
        if (data.status === 'OK' && data.data?.timings) {
          setPrayerTimes(data.data.timings);
          // If in Bangladesh / Dhaka coordinates, display Dhaka in Bengali
          const isBD = (latitude > 20 && latitude < 27 && longitude > 88 && longitude < 93);
          if (isBD) {
            setLocation({ city: 'ঢাকা', country: 'বাংলাদেশ' });
          } else {
            const cityName = data.data.meta?.timezone ? data.data.meta.timezone.split('/')[1]?.replace('_', ' ') : 'ঢাকা';
            setLocation({ 
              city: cityName || 'ঢাকা', 
              country: data.data.meta?.timezone ? data.data.meta.timezone.split('/')[0] : 'বাংলাদেশ' 
            });
          }
        }
      } catch(e) { 
        // Fallback to local high-precision astronomical calculation
        const localTimes = calculatePrayerTimes(latitude, longitude, 6.0);
        setPrayerTimes(localTimes as unknown as PrayerTimes);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWithCoords(pos.coords.latitude, pos.coords.longitude),
        () => fetchWithCoords(23.8103, 90.4125), // Fallback to Dhaka
        { timeout: 4000 }
      );
    } else {
      fetchWithCoords(23.8103, 90.4125); // Fallback to Dhaka
    }
  }, []);

  // Next Prayer & Live Countdown Calculation (with Bengali numerals & instant first-render)
  useEffect(() => {
    if (!prayerTimes) return;

    const updateNextPrayer = () => {
      setNextPrayer(calculateUpcomingPrayer(prayerTimes));
    };

    updateNextPrayer();
    const interval = setInterval(updateNextPrayer, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  const playAzan = () => {
    if (!azanAudioRef.current) {
        azanAudioRef.current = new Audio('https://www.islamcan.com/audio/adhan/azan12.mp3');
    }
    if (isAzanPlaying) {
        azanAudioRef.current.pause();
        setIsAzanPlaying(false);
    } else {
        if (isPlaying) togglePlay(); // Pause Quran if playing
        azanAudioRef.current.play().catch(e => {
          if (e.name !== 'AbortError') console.log('Azan play failed', e);
        });
        setIsAzanPlaying(true);
    }
  };

  // Notification helper
  const sendPushNotification = async (title: string, body: string, tag: string, silent: boolean = false, imageUrl?: string) => {
    if (typeof window === 'undefined' || typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      return;
    }
    
    const options: any = {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag,
      silent,
      vibrate: silent ? [] : [200, 100, 200],
      image: imageUrl
    };
    
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification(title, options);
        return;
      } catch (e) {
        console.warn('SW notification failed:', e);
      }
    }
    
    try {
      new Notification(title, options);
    } catch (e) {
      console.warn('Fallback notification failed:', e);
    }
  };

  useEffect(() => {
    const isDarkTheme = ['dark', 'midnight'].includes(theme);
    if (isDarkTheme) {
      document.documentElement.className = `${theme} dark`;
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.className = theme;
      document.documentElement.style.colorScheme = 'light';
    }
  }, [theme]);

  // Notification Effect
  useEffect(() => {
    if (!notificationsEnabled) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const localYear = now.getFullYear();
      const localMonth = (now.getMonth() + 1).toString().padStart(2, '0');
      const localDay = now.getDate().toString().padStart(2, '0');
      const today = `${localYear}-${localMonth}-${localDay}`;
      
      // Prayer Notifications
      if (prayerTimes) {
        const prayers = [
          { id: 'Fajr', name: 'ফজর' },
          { id: 'Dhuhr', name: 'যোহর' },
          { id: 'Asr', name: 'আসর' },
          { id: 'Maghrib', name: 'মাগরিব' },
          { id: 'Isha', name: 'এশা' }
        ];

        for (const p of prayers) {
          const time24 = prayerTimes[p.id];
          if (time24) {
            const [hours, minutes] = time24.split(':').map(Number);
            if (!isNaN(hours) && !isNaN(minutes)) {
              const pTime = new Date(now);
              pTime.setHours(hours, minutes, 0, 0);
              const diffMs = now.getTime() - pTime.getTime();
              
              // If we are within an 8-minute window after prayer starts, send the notification
              if (diffMs >= 0 && diffMs < 8 * 60 * 1000) {
                const key = `${today}-${p.id}`;
                if (!notifiedPrayersRef.current.has(key)) {
                  notifiedPrayersRef.current.add(key);
                  sendPushNotification(
                    `${p.name} এর সময় হয়েছে`, 
                    `এখন ${p.name} এর ওয়াক্ত শুরু হয়েছে। নামাজ আদায় করুন।`, 
                    'prayer-time',
                    false,
                    'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&auto=format&fit=crop&q=60'
                  );
                }
              }
            }
          }
        }
      }

      // Reminder Notifications
      for (const r of reminders) {
        const [hours, minutes] = r.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          const rTime = new Date(now);
          rTime.setHours(hours, minutes, 0, 0);
          const diffMs = now.getTime() - rTime.getTime();
          
          if (diffMs >= 0 && diffMs < 8 * 60 * 1000) {
            const key = `${today}-${r}`;
            if (!notifiedRemindersRef.current.has(key)) {
              notifiedRemindersRef.current.add(key);
              sendPushNotification(
                'কোরআন তেলাওয়াতের সময় হয়েছে', 
                'আপনি কি আজ কোরআন পড়েছেন? তেলাওয়াত করতে অ্যাপে প্রবেশ করুন।', 
                'daily-reminder',
                false,
                'https://images.unsplash.com/photo-1609599006353-e629f1d29718?w=600&auto=format&fit=crop&q=60'
              );
            }
          }
        }
      }

    }, 30000); 
    
    return () => clearInterval(interval);
  }, [prayerTimes, reminders, notificationsEnabled]);

  // Audio effects
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setAudioProgress(audio.currentTime / (audio.duration || 1));
    };

    const handleEnded = () => {
      if (!playingSurah) return;
      
      // Record completion
      recordAyahRead(playingSurah.number);

      const currentRepeatMode = repeatModeRef.current;
      
      if (currentRepeatMode === 'ayah') {
        // Force replay of the same ayah
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => console.log('Replay error', e));
        }
        return;
      }
      
      if (playingAyahIndex < playingSurah.ayahs.length - 1) {
        const nextIndex = playingAyahIndex + 1;
        isTransitioningRef.current = true;
        // Instantly assign the next source and play to bypass mobile background suspension delays
        if (audioRef.current) {
           audioRef.current.src = playingSurah.ayahs[nextIndex].audioUrl;
           audioRef.current.play().catch(e => console.log('Background transition error', e));
        }
        // Update Media Session instantly for robust background transitions
        try {
          updateMediaSessionMetadata(playingSurah, nextIndex, qari);
        } catch (e) {}
        // Update state to reflect changes
        setPlayingAyahIndex(nextIndex);
        setIsPlaying(true);
        setTimeout(() => {
          isTransitioningRef.current = false;
        }, 300);
      } else {
        if (currentRepeatMode === 'surah') {
           const nextIndex = 0;
           isTransitioningRef.current = true;
           // Instantly replay surah from start
           if (audioRef.current) {
               audioRef.current.src = playingSurah.ayahs[nextIndex].audioUrl;
               audioRef.current.play().catch(() => {});
           }
           // Update Media Session instantly for robust background transitions
           try {
             updateMediaSessionMetadata(playingSurah, nextIndex, qari);
           } catch (e) {}
           setPlayingAyahIndex(nextIndex);
           setIsPlaying(true);
           setTimeout(() => {
             isTransitioningRef.current = false;
           }, 300);
        } else {
           setIsPlaying(false);
           setPlayingAyahIndex(-1);
        }
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      if (isTransitioningRef.current) {
        return; // Ignore false pause during active transitions
      }
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [playingSurah, playingAyahIndex]);

  // Pre-fetch surrounding ayahs to browser's cache for instantaneous gapless transitions
  useEffect(() => {
    if (playingSurah && playingAyahIndex >= 0) {
      // Preload next 3 ayahs for seamless experience
      for (let i = 1; i <= 3; i++) {
        const prefetchIndex = playingAyahIndex + i;
        if (prefetchIndex < playingSurah.ayahs.length) {
          const url = playingSurah.ayahs[prefetchIndex].audioUrl;
          if (url) {
            const aud = new Audio();
            aud.src = url;
            aud.preload = 'auto';
          }
        }
      }
      // Also preload previous ayah just in case user clicks back
      if (playingAyahIndex > 0) {
        const prevUrl = playingSurah.ayahs[playingAyahIndex - 1].audioUrl;
        if (prevUrl) {
          const aud = new Audio();
          aud.src = prevUrl;
          aud.preload = 'auto';
        }
      }
    }
  }, [playingSurah, playingAyahIndex]);

  // Removed MediaSession interaction

  const clearPlayingNotification = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        const list = await reg.getNotifications({ tag: 'surah-playing' });
        list.forEach(item => item.close());
      } catch (e) {}
    }
  };

  const isSameAudioUrl = (a: string, b: string) => {
    if (!a || !b) return false;
    try {
      // Create canonical absolute URLs for bulletproof comparison
      const urlA = new URL(a, window.location.origin).href;
      const urlB = new URL(b, window.location.origin).href;
      return urlA === urlB;
    } catch (e) {
      // Fallback to simple clean string comparison if URL parsing fails
      const clean = (s: string) => s.trim().replace(/^https?:/i, '');
      return clean(a) === clean(b);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (playingSurah && playingAyahIndex >= 0 && audio) {
      const currentAyahObj = playingSurah.ayahs[playingAyahIndex];
      
      const setupAndPlay = async () => {
        // Only update src if it's actually different to prevent flickering/session reset
        if (!isSameAudioUrl(audio.src, currentAyahObj.audioUrl)) {
          try {
            isTransitioningRef.current = true;
            audio.pause();
            audio.src = currentAyahObj.audioUrl;
            audio.load(); // Explicit load to ensure state is ready
            audio.playbackRate = 1;
            setTimeout(() => {
              isTransitioningRef.current = false;
            }, 300);
          } catch (e) {}
        }
        
        if (isPlaying) {
          try {
            // Check if audio is already playing to avoid redundant play() calls
            if (audio.paused || audio.ended) {
              const playPromise = audio.play();
              if (playPromise !== undefined) {
                await playPromise;
              }
            }
          } catch (e) {
            if (e instanceof Error && e.name !== 'AbortError') {
              console.log('Audio playback failed', e);
            }
          }
        } else {
          try {
            if (!audio.paused) {
              audio.pause();
            }
          } catch (e) {}
        }
      };

      setupAndPlay();
      
      setLastRead({
        surahNumber: playingSurah.number,
        ayahIndex: playingAyahIndex,
        surahName: playingSurah.englishName,
      });

      // Automatically update Native Media Session API on ayah transition
      if ('mediaSession' in navigator && playingSurah) {
        try {
          updateMediaSessionMetadata(playingSurah, playingAyahIndex, qari);
        } catch (e) {}

        navigator.mediaSession.setActionHandler('play', () => { togglePlay(); });
        navigator.mediaSession.setActionHandler('pause', () => { togglePlay(); });
        navigator.mediaSession.setActionHandler('previoustrack', () => { prevAyah(); });
        navigator.mediaSession.setActionHandler('nexttrack', () => { nextAyah(); });
      }

      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      }
    }
  }, [playingSurah, playingAyahIndex, isPlaying, qari]);

  const playAyah = (surah: SurahData, index: number) => {
    setPlayingSurah(surah);
    setPlayingAyahIndex(index);
    setIsPlaying(true);
    recordSurahProgress(surah.number, index, 0);
    if (isAzanPlaying) playAzan(); // Stop Azan if starting Quran
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (playingSurah && playingAyahIndex === -1) {
        setPlayingAyahIndex(0);
      } else {
        audioRef.current.play();
      }
    }
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setPlayingSurah(null);
    setPlayingAyahIndex(-1);
    setAudioProgress(0);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    clearPlayingNotification().catch(() => {});
  };

  const nextAyah = () => {
    if (playingSurah && playingAyahIndex < playingSurah.ayahs.length - 1) {
      const nextIndex = playingAyahIndex + 1;
      isTransitioningRef.current = true;
      if (audioRef.current) {
        audioRef.current.src = playingSurah.ayahs[nextIndex].audioUrl;
        audioRef.current.play().catch(() => {});
      }
      try {
        updateMediaSessionMetadata(playingSurah, nextIndex, qari);
      } catch (e) {}
      setPlayingAyahIndex(nextIndex);
      setIsPlaying(true);
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 300);
    }
  };

  const prevAyah = () => {
    if (playingSurah && playingAyahIndex > 0) {
      const prevIndex = playingAyahIndex - 1;
      isTransitioningRef.current = true;
      if (audioRef.current) {
        audioRef.current.src = playingSurah.ayahs[prevIndex].audioUrl;
        audioRef.current.play().catch(() => {});
      }
      try {
        updateMediaSessionMetadata(playingSurah, prevIndex, qari);
      } catch (e) {}
      setPlayingAyahIndex(prevIndex);
      setIsPlaying(true);
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 300);
    }
  };

  const seekAyah = (index: number) => {
    if (playingSurah && index >= 0 && index < playingSurah.ayahs.length) {
      isTransitioningRef.current = true;
      if (audioRef.current) {
        audioRef.current.src = playingSurah.ayahs[index].audioUrl;
        audioRef.current.play().catch(() => {});
      }
      try {
        updateMediaSessionMetadata(playingSurah, index, qari);
      } catch (e) {}
      setPlayingAyahIndex(index);
      setIsPlaying(true);
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 300);
    }
  };

  const handleSetCurrentViewSurah = (surahNum: number | null) => {
    setCurrentViewSurah(surahNum);
    if (surahNum !== null) {
      recordSurahProgress(surahNum, 0, 0);
    }
  };

  return (
    <AppContext.Provider
      value={{
        theme, setTheme,
        activeTab, setActiveTab,
        favorites, toggleFavorite,
        qari, setQari,
        autoScrollAyah, setAutoScrollAyah,
        arabicFontSize, setArabicFontSize,
        bengaliFontSize, setBengaliFontSize,
        repeatMode, setRepeatMode,
        lastRead, setLastRead,
        currentViewSurah, setCurrentViewSurah: handleSetCurrentViewSurah,
        initialTargetAyahIndex, setInitialTargetAyahIndex,
        isCleanMode, setIsCleanMode,
        notificationsEnabled, setNotificationsEnabled,
        reminders, addReminder, removeReminder,

        weeklyProgress, recordAyahRead, resetProgress,
        surahProgressMap, recordSurahProgress, resetSurahProgressOnly,

        prayerTimes, nextPrayer, location, playAzan, isAzanPlaying,

        playingSurah, playingAyahIndex, isPlaying, audioProgress,
        playAyah, togglePlay, stopPlayback, nextAyah, prevAyah, seekAyah, audioRef,
        firebaseAuthError,
        globalZoom, setGlobalZoom,
        zoomLocked, setZoomLocked,
        salahLogs, toggleSalahLog,
        isSidebarCollapsed, setIsSidebarCollapsed: handleSetIsSidebarCollapsed,
      }}
    >
      {children}
      <audio ref={audioRef} className="hidden" preload="auto" playsInline />
    </AppContext.Provider>
  );
};

export const useAppStore = () => useContext(AppContext)!;


