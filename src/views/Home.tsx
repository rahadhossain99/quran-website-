import React, { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '../Store';
import { SurahInfo } from '../types';
import { fetchAllSurahs } from '../api';
import { SurahCard } from '../components/SurahCard';
import { getBanglaSurahData } from '../utils/banglaSurahNames';
import { Search, Sparkles, BookOpen, PlayCircle, MapPin, Clock, Volume2, VolumeX, TrendingUp, RefreshCw, Award, Heart, Filter, Flame, Calendar, CheckSquare, RefreshCcw, Smile, Headphones, Bell, BellOff, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PrayerTimesModal } from '../components/PrayerTimesModal';
import { ProgressModal } from '../components/ProgressModal';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DAILY_SMART_SUGGESTIONS: Record<number, { dayName: string; title: string; description: string; actionText: string; iconType: string; targetSurah: number | null }> = {
  0: {
    dayName: 'রবিবার',
    title: 'তাওবা, ইস্তিগফার ও আত্মশুদ্ধির উত্তম সময়',
    description: 'আজ বেশি বেশি ‘আস্তাগফিরুল্লাহ’ পাঠ করুন। রাসূলুল্লাহ (সা.) প্রতিদিন ১০০ বারের চেয়েও বেশি তাওবা করতেন। আত্মশুদ্ধি এবং আল্লাহর রহমত কামনার দিন আজ।',
    actionText: 'সূরা আশ-শারহ তিলাওয়াত করুন',
    iconType: 'dhikr',
    targetSurah: 94
  },
  1: {
    dayName: 'সোমবার',
    title: 'দরূদ শরীফ পাঠ ও সুন্নাহ অনুসৃতি',
    description: 'রাসূলুল্লাহ (সা.)-এর সুন্নাহ অনুসরণে আজ অধিক দরূদ শরীফ পাঠ করুন এবং পারলে জুমুআহ ছাড়া সপ্তাহের এই বরকতময় দিনে রোযা রাখুন।',
    actionText: 'সূরা আল-ইনসান শুনুন',
    iconType: 'hadith',
    targetSurah: 76
  },
  2: {
    dayName: 'মঙ্গলবার',
    title: 'বিপদ ও দুশ্চিন্তা মুক্তির বিশেষ আমল',
    description: 'দোয়া ইউনুস ‘লা ইলাহা ইল্লা আন্তা সুবহানাকা ইন্নি কুন্তু মিনায যলিমীন’ জপ করুন। এটি কঠিন বিপদ ও অশান্তি থেকে মহান রবের অশেষ অনুগ্রহে সাহায্য এনে দেয়।',
    actionText: 'সূরা আম্বিয়া পড়ুন',
    iconType: 'dua',
    targetSurah: 21
  },
  3: {
    dayName: 'বুধবার',
    title: 'সূরা আর-রাহমান ও অফুরন্ত নেয়ামতের শুকরিয়া',
    description: 'আজ অবসরে সূরা আর-রাহমান তিলাওয়াত শুনুন বা পড়ুন। আল্লাহর অফুরন্ত নেয়ামতের প্রতি অন্তর দিয়ে শুকরিয়া আদায় করুন এবং আলহামদুলিল্লাহ বলুন।',
    actionText: 'সূরা আর-রাহমান শুনুন →',
    iconType: 'surah',
    targetSurah: 55
  },
  4: {
    dayName: 'বৃহস্পতিবার',
    title: 'সূরা আল-মূলক ও কবরের নিরাপত্তা',
    description: 'আজ ঘুমানোর আগে অবশ্যই সূরা মূলক তিলাওয়াত করুন। এটি কবরের আযাব থেকে পাঠকারীকে রক্ষা করবে ও রাতে ইবাদতের অসীম দরজা খুলে দেবে।',
    actionText: 'সূরা মূলক তেলাওয়াত করুন →',
    iconType: 'surah',
    targetSurah: 67
  },
  5: {
    dayName: 'জুমুআর দিন',
    title: 'সূরা আল-কাহাফ ও বিশেষ ৪ সুন্নাহ',
    description: 'জুমুআর দিনে সূরা আল-কাহাফ তিলাওয়াত করলে পরবর্তী জুমুআহ পর্যন্ত এটি নূর ছড়ায়। আজ গোসল করা, সুগন্ধি লাগানো এবং সুন্নাহ মেনে মসজিদে আগে যাওয়া অত্যন্ত সওয়াবের কাজ।',
    actionText: 'সূরা কাহাফ পড়ুন →',
    iconType: 'friday',
    targetSurah: 18
  },
  6: {
    dayName: 'শনিবার',
    title: 'দৃঢ় ইমান ও দ্বীনি জ্ঞানার্জন',
    description: 'আজ কুরআনের অন্তত ২টি আয়াতের তফসির সহ পাঠ করুন। দ্বীনি সুন্নাত ও জ্ঞান অর্জন করা প্রতিটি মুসলিমের ওপর বিশেষ দায়িত্ব ও ইবাদত তুল্য।',
    actionText: 'সূরা আল-বাকারাহ তিলাওয়াত করুন',
    iconType: 'knowledge',
    targetSurah: 2
  }
};

const getPrayerSuggestion = (prayerName: string) => {
  switch (prayerName) {
    case 'ফজর':
      return {
        tip: 'ফজরের নামাজের পর সূরা ইয়াসীন তিলাওয়াত করা এবং সকালের যিকর আদায় করার উপযুক্ত ও বরকতময় সময়। এই আমল সারাদিনের কাজের দায়িত্ব আল্লাহ নিজে তুলে নেন।',
        amal: 'সূরা ইয়াসীন তেলাওয়াত',
        surah: 36
      };
    case 'যোহর':
      return {
        tip: 'যোহরের ফরজ নামাজের পর আয়াতুল কুরসি পাঠ করতে কখনো ভুলবেন না। এটি পাঠকারী ও জান্নাতের মাঝে কেবল মৃত্যুটুকুই বাধা হয়ে দাঁড়িয়ে থাকে।',
        amal: 'আয়াতুল কুরসি জিকির',
        surah: 2,
        ayahIndex: 254
      };
    case 'আসর':
      return {
        tip: 'আসরের পবিত্র ওয়াক্তে নামাজ আদায়ের পর ৩য় ও ৪র্থ কালিমাহ জপ করুন এবং বেশি বেশি তাওবার তাসবিহ আদায় করুন। বিকেল বেলার দোয়া অত্যন্ত গ্রহণযোগ্য।',
        amal: 'সন্ধ্যা কালীন জিকির',
        surah: null
      };
    case 'ماشاء الله':
    case 'মাগরিব':
      return {
        tip: 'মাগরিবের নামাজের পরে সূরা আল-ওয়াকিয়াহ তিলাওয়াত করার অভ্যাস গড়ে তুলুন। এটি তিলাওয়াতকারীকে কখনো চরম অভাব-অনটনে স্পর্শ করতে পারেনা ইনশাআল্লাহ।',
        amal: 'সূরা ওয়াকিয়াহ পড়ুন',
        surah: 56
      };
    case 'এশা':
      return {
        tip: 'এশার নামাজের পর ঘুমানোর পূর্বে সূরা মুলক ও সূরা সাজদাহ তিলাওয়াত করা এবং ৩টি কুল পড়ে ফুঁ দেওয়ার বিশেষ সুন্নাত রয়েছে। আল্লাহর নিরাপত্তায় শান্তিতে ঘুমান।',
        amal: 'ঘুমানোর সুন্নাত দোয়া',
        surah: 67
      };
    default:
      return {
        tip: 'প্রতিটি সালাতের পর মহান রবের দরবারে হাত উঠিয়ে কান্নাকাটি নিয়ে বেশি বেশি দোয়া চাইতে পারেন, আল্লাহ বান্দাকে খালি হাতে ফেরাতে লজ্জাবোধ করেন।',
        amal: 'স্মার্ট ইবাদত গাইড',
        surah: null
      };
  }
};

const INSPIRATIONAL_AYAHS = [
  {
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا ۝",
    bengali: "নিশ্চয়ই কষ্টের সাথেই স্বস্তি রয়েছে। অবশ্যই কষ্টের সাথেই স্বস্তি রয়েছে।",
    source: "সূরা আশ-শারহ (৯৪: ৫-৬)",
    surahNumber: 94,
    ayahIndex: 4
  },
  {
    arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۝",
    bengali: "হে আমাদের পালনকর্তা! সরল পথ প্রদর্শনের পর তুমি আমাদের অন্তরসমূহকে সত্যচ্যূত করো না এবং তোমার নিকট থেকে আমাদেরকে অনুগ্রহ দান করো।",
    source: "সূরা আল ইমরান (৩: ৮)",
    surahNumber: 3,
    ayahIndex: 7
  },
  {
    arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ ۝",
    bengali: "নিশ্চয়ই আল্লাহ ধৈর্যশীলদের সাথে আছেন।",
    source: "সূরা আল-বাকারাহ (২: ১৫৩)",
    surahNumber: 2,
    ayahIndex: 152
  },
  {
    arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا ۝",
    bengali: "এবং বলুন, হে আমার পালনকর্তা! আমার জ্ঞান বৃদ্ধি করুন।",
    source: "সূরা ত্বো-হা (২০: ১১৪)",
    surahNumber: 20,
    ayahIndex: 113
  },
  {
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ۝",
    bengali: "জেনে রাখুন, আল্লাহর স্মরণেই কেবল হৃদয় শান্তি পায়।",
    source: "সূরা আর-রাদ (১৩: ২৮)",
    surahNumber: 13,
    ayahIndex: 27
  },
  {
    arabic: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ ডَعْوَةَ الدَّاعِ إِذَا دَعَانِ ۝",
    bengali: "আর আমার বান্দারা যখন আপনার কাছে আমার ব্যাপারে জিজ্ঞেস করে, আমি তো অবশ্যই নিকটবর্তী। আহ্বানকারী যখনই আমাকে ডাকে, আমি তার ডাকে সাড়া দিই।",
    source: "সূরা আল-বাকারাহ (২: ১৮৬)",
    surahNumber: 2,
    ayahIndex: 185
  }
];

const toBengaliNumber = (num: number) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(d => bnDigits[Number(d)] || d).join('');
};

export const HomeView = () => {
  const { 
    favorites, lastRead, setCurrentViewSurah, setInitialTargetAyahIndex,
    location, nextPrayer, playAzan, isAzanPlaying, prayerTimes,
    weeklyProgress, setIsCleanMode, notificationsEnabled, setNotificationsEnabled,
    playingSurah, isPlaying, playingAyahIndex
  } = useAppStore();
  const [surahs, setSurahs] = useState<SurahInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [revelationFilter, setRevelationFilter] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  const [activeAyahIndex, setActiveAyahIndex] = useState(0);
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
  const [isMounted, setIsMounted] = useState(false);

  const todayDayIndex = useMemo(() => new Date().getDay(), []);

  // Friday special checklist states
  const [fridayDeeds, setFridayDeeds] = useState(() => {
    try {
      const saved = localStorage.getItem('friday_deeds_state');
      return saved ? JSON.parse(saved) : { gusl: false, kahf: false, dorood: false, dua: false, masjid: false };
    } catch {
      return { gusl: false, kahf: false, dorood: false, dua: false, masjid: false };
    }
  });

  const [duroodCount, setDuroodCount] = useState(() => {
    return Number(localStorage.getItem('friday_durood_counter_val') || '0');
  });

  const toggleFridayDeed = (key: string) => {
    const updated = { ...fridayDeeds, [key]: !fridayDeeds[key] };
    setFridayDeeds(updated);
    localStorage.setItem('friday_deeds_state', JSON.stringify(updated));
  };

  const incrementDurood = () => {
    const nextVal = Math.min(100, duroodCount + 1);
    setDuroodCount(nextVal);
    localStorage.setItem('friday_durood_counter_val', nextVal.toString());
    if (nextVal === 100 && !fridayDeeds.dorood) {
      toggleFridayDeed('dorood');
    }
  };

  const resetDurood = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDuroodCount(0);
    localStorage.setItem('friday_durood_counter_val', '0');
    if (fridayDeeds.dorood) {
      toggleFridayDeed('dorood');
    }
  };

  // Premium Dashboard Interactive Card States
  const [completedStreak, setCompletedStreak] = useState(() => {
    return Number(localStorage.getItem('completed_streak') || '5');
  });
  const [challengeDone, setChallengeDone] = useState(() => {
    return localStorage.getItem('challenge_done_today') === 'true';
  });
  const [dhikrCount, setDhikrCount] = useState(() => {
    return Number(localStorage.getItem('dashboard_dhikr_count') || '0');
  });

  // Expanding toggles for top dashboard cards
  const [challengeExpanded, setChallengeExpanded] = useState(false);
  const [calendarExpanded, setCalendarExpanded] = useState(false);

  const toggleChallenge = () => {
    const newVal = !challengeDone;
    setChallengeDone(newVal);
    localStorage.setItem('challenge_done_today', newVal ? 'true' : 'false');
    const newStreak = newVal ? completedStreak + 1 : Math.max(0, completedStreak - 1);
    setCompletedStreak(newStreak);
    localStorage.setItem('completed_streak', newStreak.toString());
  };

  const incrementDhikr = () => {
    const nextVal = (dhikrCount + 1) % 100;
    setDhikrCount(nextVal);
    localStorage.setItem('dashboard_dhikr_count', nextVal.toString());
  };

  const resetDhikr = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDhikrCount(0);
    localStorage.setItem('dashboard_dhikr_count', '0');
  };

  // Sunday: Istighfar counter state
  const [sundayIstighfarCount, setSundayIstighfarCount] = useState<number>(() => {
    return Number(localStorage.getItem('sunday_istighfar_count') || '0');
  });
  const incrementSundayIstighfar = () => {
    const nextVal = Math.min(100, sundayIstighfarCount + 1);
    setSundayIstighfarCount(nextVal);
    localStorage.setItem('sunday_istighfar_count', nextVal.toString());
  };
  const resetSundayIstighfar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSundayIstighfarCount(0);
    localStorage.removeItem('sunday_istighfar_count');
  };

  // Monday: Sunnah list state
  const [mondayDeeds, setMondayDeeds] = useState<{ fasting: boolean; smile: boolean; miswak: boolean }>(() => {
    try {
      const saved = localStorage.getItem('monday_deeds');
      return saved ? JSON.parse(saved) : { fasting: false, smile: false, miswak: false };
    } catch {
      return { fasting: false, smile: false, miswak: false };
    }
  });
  const toggleMondayDeed = (key: keyof typeof mondayDeeds) => {
    const nextVal = { ...mondayDeeds, [key]: !mondayDeeds[key] };
    setMondayDeeds(nextVal);
    localStorage.setItem('monday_deeds', JSON.stringify(nextVal));
  };

  // Tuesday: Breathe cycle state
  const [tuesdayBreatheCycles, setTuesdayBreatheCycles] = useState<number>(() => {
    return Number(localStorage.getItem('tuesday_breathe_cycles') || '0');
  });
  const incrementTuesdayBreathe = () => {
    const nextVal = tuesdayBreatheCycles + 1;
    setTuesdayBreatheCycles(nextVal);
    localStorage.setItem('tuesday_breathe_cycles', nextVal.toString());
  };
  const resetTuesdayBreathe = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTuesdayBreatheCycles(0);
    localStorage.removeItem('tuesday_breathe_cycles');
  };

  // Wednesday: Shukr Tags and Count
  const [wednesdayShukrTags, setWednesdayShukrTags] = useState<{ health: boolean; family: boolean; faith: boolean; rizk: boolean }>(() => {
    try {
      const saved = localStorage.getItem('wednesday_shukr_tags');
      return saved ? JSON.parse(saved) : { health: false, family: false, faith: false, rizk: false };
    } catch {
      return { health: false, family: false, faith: false, rizk: false };
    }
  });
  const [wednesdayAlhamCount, setWednesdayAlhamCount] = useState<number>(() => {
    return Number(localStorage.getItem('wednesday_alham_count') || '0');
  });
  const toggleWednesdayTag = (key: keyof typeof wednesdayShukrTags) => {
    const nextVal = { ...wednesdayShukrTags, [key]: !wednesdayShukrTags[key] };
    setWednesdayShukrTags(nextVal);
    localStorage.setItem('wednesday_shukr_tags', JSON.stringify(nextVal));
    // Auto-increase Alhamdulillah counter when checking a brand new blessing!
    if (!wednesdayShukrTags[key]) {
      const nextCount = wednesdayAlhamCount + 15;
      setWednesdayAlhamCount(nextCount);
      localStorage.setItem('wednesday_alham_count', nextCount.toString());
    }
  };
  const incrementWednesdayAlham = () => {
    const nextVal = wednesdayAlhamCount + 1;
    setWednesdayAlhamCount(nextVal);
    localStorage.setItem('wednesday_alham_count', nextVal.toString());
  };
  const resetWednesdayShukr = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWednesdayAlhamCount(0);
    setWednesdayShukrTags({ health: false, family: false, faith: false, rizk: false });
    localStorage.removeItem('wednesday_alham_count');
    localStorage.removeItem('wednesday_shukr_tags');
  };

  // Thursday: Sleep Sunnah deeds
  const [thursdaySleepDeeds, setThursdaySleepDeeds] = useState<{ wudu: boolean; cleanBed: boolean; surahMulk: boolean; threeKuls: boolean }>(() => {
    try {
      const saved = localStorage.getItem('thursday_sleep_deeds');
      return saved ? JSON.parse(saved) : { wudu: false, cleanBed: false, surahMulk: false, threeKuls: false };
    } catch {
      return { wudu: false, cleanBed: false, surahMulk: false, threeKuls: false };
    }
  });
  const toggleThursdayDeed = (key: keyof typeof thursdaySleepDeeds) => {
    const nextVal = { ...thursdaySleepDeeds, [key]: !thursdaySleepDeeds[key] };
    setThursdaySleepDeeds(nextVal);
    localStorage.setItem('thursday_sleep_deeds', JSON.stringify(nextVal));
  };

  // Saturday: Quran study card read
  const [saturdayLearned, setSaturdayLearned] = useState<boolean>(() => {
    return localStorage.getItem('saturday_learned') === 'true';
  });
  const toggleSaturdayLearned = () => {
    const nextVal = !saturdayLearned;
    setSaturdayLearned(nextVal);
    localStorage.setItem('saturday_learned', nextVal ? 'true' : 'false');
  };

  const BENGALI_DAYS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
  
  const dynamicProgressData = weeklyProgress.map(p => ({
    name: BENGALI_DAYS[new Date(p.date).getDay()],
    ayahs: p.ayahs
  }));

  const totalAyahs = weeklyProgress.reduce((acc, curr) => acc + curr.ayahs, 0);

  useEffect(() => {
    setIsMounted(true);
    // Select a random ayah from our collection initially
    setActiveAyahIndex(Math.floor(Math.random() * INSPIRATIONAL_AYAHS.length));
  }, []);

  const convertTo12Hour = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 5) return { text: 'শুভ শেষরাত', subtext: 'তাহাজ্জুদ ও দোয়ার বরকতময় সময়।' };
    if (hours < 12) return { text: 'শুভ সকাল', subtext: 'আজকের দিনটি যিকির ও সুন্নাহর আলোয় উজ্জ্বল হোক।' };
    if (hours < 16) return { text: 'শুভ দুপুর', subtext: 'সালাত আদায় করুন এবং অবিরাম শান্তি লাভ করুন।' };
    if (hours < 18) return { text: 'শুভ বিকেল', subtext: 'দিনের শ্রেষ্ঠ সময়ের দোয়া ও তাসবিহ করার সুযোগ।' };
    if (hours < 20) return { text: 'শুভ সন্ধ্যা', subtext: 'সন্ধ্যাবেলার বিশেষ আমল ও শান্তিময় কুরআন তিলাওয়াত।' };
    return { text: 'শুভ রাত্রি', subtext: 'ঘুমের আগের তিলাওয়াত ও ইস্তিগফারের প্রশান্তি।' };
  };

  const cycleAyah = () => {
    setActiveAyahIndex((prev) => (prev + 1) % INSPIRATIONAL_AYAHS.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAllSurahs().then(data => {
      setSurahs(data);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  const filteredSurahs = surahs.filter(s => {
    if (!s) return false;
    const name = s.englishName || '';
    const nameTrans = s.englishNameTranslation || '';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || 
                          nameTrans.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = revelationFilter === 'all' || s.revelationType === revelationFilter;
    return matchesSearch && matchesFilter;
  });

  const greeting = getGreeting();

  return (
    <div className="pb-32 px-4 pt-6 max-w-3xl mx-auto font-bengali">
      
      {/* Dynamic Greetings & Location Accent Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-[var(--primary-soft)] via-[var(--bg-surface)] to-[var(--bg-surface)] border border-[var(--border)] rounded-[2.2rem] p-6 mb-8 overflow-hidden shadow-sm"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] opacity-[0.03] rounded-full blur-[40px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[var(--primary)] mb-1">
              <Sparkles className="w-4 h-4 text-[var(--primary)] animate-pulse" />
              <span className="text-[10px] font-bold font-sans uppercase tracking-[0.15em]">{greeting.text} • আসসালামু আলাইকুম</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[var(--text-main)] font-sans tracking-tight">
              আল-কুরআনুল কারিম <span className="text-xl md:text-2xl text-[var(--primary)] font-arabic ml-1">القرآن الكريم</span>
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1.5 font-sans leading-relaxed">
              {greeting.subtext}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3.5 shrink-0">
            {/* Clean Mode Button */}
            <button 
              onClick={() => setIsCleanMode(true)}
              className="flex items-center justify-center space-x-2 px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/25 active:scale-98 transition-all font-bengali"
              title="ক্লিন মুড চালু করুন শুধুমাত্র কুরআন তিলাওয়াত শোনার জন্য"
            >
              <Headphones className="w-4.5 h-4.5 animate-bounce" />
              <span>ক্লিন মুড চালু করুন</span>
            </button>

            <div className="flex flex-col items-start md:items-end justify-center bg-[var(--bg-main)] px-4 py-3 rounded-2xl border border-[var(--border)] border-opacity-65">
              {location ? (
                <div className="flex items-center text-[var(--primary)] text-xs font-bold font-sans">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-[var(--primary)]" />
                  <span>{location.city}, {location.country}</span>
                </div>
              ) : (
                <span className="text-[10px] font-bold text-[var(--text-muted)] font-sans">অবস্থান লোড হচ্ছে...</span>
              )}
              <span className="text-lg font-black font-sans text-[var(--text-main)] mt-1 select-none leading-none tracking-tight">
                {currentTime}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Ayah of the Day Premium Interaction Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-[var(--primary-soft)] via-[var(--bg-surface)] to-[var(--bg-surface)] border border-[var(--border)] rounded-[2.5rem] p-6 md:p-8 mb-6 relative overflow-hidden shadow-sm group premium-shimmer"
      >
            <div className="absolute right-0 bottom-0 top-0 w-48 bg-[var(--primary)] opacity-[0.03] rounded-l-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shadow-md">
                      <Sparkles className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black tracking-widest uppercase text-[var(--primary)] font-sans block leading-none">আজকের অনুপ্রেরণা</span>
                      <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider font-sans mt-1 block">Daily Faith Reminders</span>
                    </div>
                  </div>

                  {/* Cycle/Reload active state */}
                  <button 
                    onClick={cycleAyah}
                    className="p-2 bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] rounded-xl hover:bg-[var(--primary-soft)] active:scale-90 transition-all shadow-inner"
                    title="আরেকটি আয়াত দেখুন"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                
                <blockquote className="space-y-4">
                  <p className="font-arabic text-right text-xl md:text-3xl text-[var(--text-main)] leading-relaxed font-semibold pr-2 drop-shadow-sm" dir="rtl">
                    {INSPIRATIONAL_AYAHS[activeAyahIndex].arabic}
                  </p>
                  <p className="text-sm md:text-base font-bold text-[var(--text-main)] leading-relaxed font-bengali">
                    "{INSPIRATIONAL_AYAHS[activeAyahIndex].bengali}"
                  </p>
                  <footer className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase font-sans flex items-center">
                    <Award className="w-3.5 h-3.5 text-[var(--primary)] mr-1.5 opacity-70" />
                    — {INSPIRATIONAL_AYAHS[activeAyahIndex].source}
                  </footer>
                </blockquote>
              </div>
              
              <div className="bg-[var(--bg-main)] p-4 rounded-[1.75rem] border border-[var(--border)] border-opacity-70 flex md:flex-col items-center justify-between md:justify-center gap-3 shrink-0">
                <div className="text-left md:text-center">
                  <p className="text-[9px] font-black text-[var(--text-muted)] tracking-wider uppercase font-sans">দ্রুত আমল</p>
                  <p className="text-xs font-bold text-[var(--primary)] font-bengali mt-0.5">সূরা তেলাওয়াত ও তাফসীর</p>
                </div>
                <button 
                  onClick={() => {
                    const ayah = INSPIRATIONAL_AYAHS[activeAyahIndex];
                    if (ayah.ayahIndex !== undefined) {
                      setInitialTargetAyahIndex(ayah.ayahIndex);
                    }
                    setCurrentViewSurah(ayah.surahNumber); 
                  }}
                  className="bg-[var(--primary)] hover:scale-105 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all shrink-0 font-bengali"
                >
                  তিলাওয়াত শুনুন →
                </button>
              </div>
            </div>
      </motion.div>

      {/* Dynamic Daily & Blessed Friday Smart Suggestions Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border-2 transition-all duration-300 ${
          todayDayIndex === 5 
            ? 'border-amber-500/30 bg-amber-500/[0.03] shadow-[0_16px_45px_-12px_rgba(245,158,11,0.12)] dark:bg-amber-950/[0.15]' 
            : todayDayIndex === 0
            ? 'border-indigo-500/20 bg-indigo-500/[0.015] shadow-sm'
            : todayDayIndex === 1
            ? 'border-emerald-500/20 bg-emerald-500/[0.015] shadow-sm'
            : todayDayIndex === 2
            ? 'border-sky-500/20 bg-sky-505/[0.015] shadow-sm'
            : todayDayIndex === 3
            ? 'border-teal-500/20 bg-teal-500/[0.015] shadow-sm'
            : todayDayIndex === 4
            ? 'border-violet-500/20 bg-violet-500/[0.015] shadow-sm'
            : 'border-orange-500/20 bg-orange-500/[0.015] shadow-sm'
        } rounded-[2.5rem] p-6 mb-6 relative overflow-hidden`}
      >
        {/* Glow decoration */}
        <div className={`absolute -right-16 -top-16 w-36 h-36 border border-transparent ${
          todayDayIndex === 5 
            ? 'bg-amber-500/10' 
            : todayDayIndex === 0
            ? 'bg-indigo-500/10'
            : todayDayIndex === 1
            ? 'bg-emerald-500/10'
            : todayDayIndex === 2
            ? 'bg-sky-500/10'
            : todayDayIndex === 3
            ? 'bg-teal-500/10'
            : todayDayIndex === 4
            ? 'bg-violet-500/10'
            : 'bg-orange-500/10'
        } opacity-30 rounded-full blur-2xl pointer-events-none`} />
        
        {/* Header bar of suggestions */}
        <div className="flex items-center justify-between mb-5 select-none">
          <div className="flex items-center space-x-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              todayDayIndex === 5 
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' 
                : todayDayIndex === 0
                ? 'bg-indigo-500/15 text-indigo-500'
                : todayDayIndex === 1
                ? 'bg-emerald-500/15 text-emerald-500'
                : todayDayIndex === 2
                ? 'bg-sky-500/15 text-sky-500'
                : todayDayIndex === 3
                ? 'bg-teal-500/15 text-teal-500'
                : todayDayIndex === 4
                ? 'bg-violet-500/15 text-violet-500'
                : 'bg-orange-500/15 text-orange-500'
            }`}>
              <Sparkles className="w-4.5 h-4.5 animate-[spin_10s_linear_infinite]" />
            </div>
            <div>
              <span className={`text-xs font-black uppercase font-sans tracking-wide block ${
                todayDayIndex === 5 
                  ? 'text-amber-600 dark:text-amber-400' 
                  : todayDayIndex === 0
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : todayDayIndex === 1
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : todayDayIndex === 2
                  ? 'text-sky-600 dark:text-sky-400'
                  : todayDayIndex === 3
                  ? 'text-teal-600 dark:text-teal-400'
                  : todayDayIndex === 4
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                {todayDayIndex === 5 
                  ? 'জুমুআহ মোবারক সুন্নাহ গাইড' 
                  : `আজকের বিশেষ স্মার্ট প্যানেল (${DAILY_SMART_SUGGESTIONS[todayDayIndex as keyof typeof DAILY_SMART_SUGGESTIONS].dayName})`
                }
              </span>
              <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider block mt-0.5">
                {todayDayIndex === 5 ? 'Blessed Friday Special Spiritual Routines' : 'Daily Dynamic Interactive Self-Improvement Workflow'}
              </span>
            </div>
          </div>
          
          <span className={`px-3 py-1 text-[10px] font-black tracking-wide rounded-full font-bengali shadow-sm border ${
            todayDayIndex === 5 
              ? 'bg-amber-500 border-amber-400 text-slate-950' 
              : 'bg-[var(--bg-main)] border-[var(--border)] text-[var(--text-main)]'
          }`}>
            {todayDayIndex === 5 ? 'আজ জুমুআহ বার' : `আজ ${DAILY_SMART_SUGGESTIONS[todayDayIndex as keyof typeof DAILY_SMART_SUGGESTIONS].dayName}`}
          </span>
        </div>

        {/* Dynamic content rendering based on day of the week */}
        {todayDayIndex === 0 ? (
          /* SUNDAY: ISTIGHFAR & TAWBAH DECISIVE COMPANION */
          <div className="space-y-4 font-bengali">
            <div className="bg-gradient-to-br from-indigo-500/10 to-transparent p-4.5 rounded-3xl border border-indigo-500/10">
              <h4 className="text-sm font-extrabold text-indigo-950 dark:text-indigo-200 flex items-center mb-1">
                <Smile className="w-4.5 h-4.5 text-indigo-500 mr-1.5 animate-bounce" />
                রবিবার: তাওবা, ইস্তিগফার ও আত্মশুদ্ধির আমল
              </h4>
              <p className="text-[11px] text-zinc-650 dark:text-zinc-300 leading-relaxed font-semibold">
                আজ দিনশেষে অন্তত ১০০ বার ইস্তিগফার পাঠ করার চেষ্টা করুন। আল্লাহর কাছে আপনার ভুলত্রুটির জন্য আন্তরিক ক্ষমা প্রার্থনা করার সর্বশ্রেষ্ঠ সুযোগ।
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-5 justify-between">
              <div className="flex-1 space-y-3">
                <blockquote className="border-l-2 border-indigo-500 pl-3.5 italic text-zinc-600 dark:text-zinc-400 text-xs py-1">
                  "হে ইমানদারগণ! তোমরা আল্লাহর কাছে তওবা কর—বিশুদ্ধ তওবা।" — সূরা আত-তাহরীম, আয়াত ৮
                </blockquote>
                
                <button
                  onClick={() => setCurrentViewSurah(94)} // Open Surah Ash-Sharh
                  className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-650 text-white font-extrabold text-xs rounded-xl shadow-md transition-all inline-flex items-center space-x-1.5 active:scale-97"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>সূরা আশ-শারহ তিলাওয়াত করুন →</span>
                </button>
              </div>

              {/* Sunday Interactive Click Counter */}
              <div className="w-full md:w-auto shrink-0 flex flex-col items-center bg-indigo-500/[0.04] p-4 rounded-3xl border border-indigo-500/10 select-none">
                <span className="text-[9px] font-black tracking-widest text-indigo-500 uppercase font-sans mb-2">TAP TO SAY ASTAGHFIRULLAH</span>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={resetSundayIstighfar}
                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-colors font-sans text-[10px] font-black"
                    title="রিসেট"
                  >
                    রিসেট
                  </button>

                  <div
                    onClick={incrementSundayIstighfar}
                    className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 hover:brightness-105 active:scale-95 cursor-pointer shadow-lg shadow-indigo-500/20 flex flex-col items-center justify-center text-white transition-all transform-gpu"
                  >
                    <span className="text-[10px] uppercase font-sans tracking-wider font-extrabold opacity-75">কাউন্টার</span>
                    <span className="text-xl font-black font-sans my-0.5">{sundayIstighfarCount}/১০০</span>
                    <span className="text-[8px] font-bold opacity-90">{sundayIstighfarCount >= 100 ? 'পূর্ণ হয়েছে 🎉' : 'টাচ করুন 👆'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : todayDayIndex === 1 ? (
          /* MONDAY: SUNNAH FASTING & LIFE HACKS COMPANION */
          <div className="space-y-4 font-bengali">
            <div className="bg-gradient-to-br from-emerald-500/10 to-transparent p-4.5 rounded-3xl border border-emerald-500/10">
              <h4 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100 flex items-center mb-1">
                <Award className="w-4.5 h-4.5 text-emerald-500 mr-1.5" />
                সোমবার: সুন্নাহর ছায়াতলে শান্তিময় জীবন গঠন
              </h4>
              <p className="text-[11px] text-zinc-650 dark:text-zinc-300 leading-relaxed font-semibold">
                সোমবারের রোজা রাখা আল্লাহর রাসূল (সা.)-এর সুপ্রিয় সুন্নাহ। আজ অন্তত ৩টি সুন্নাহ আমল টিক-মার্ক দিয়ে জীবনকে বরকতময় করে তুলুন।
              </p>
            </div>

            {/* Checklist of Monday Deeds */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Fasting */}
              <div 
                onClick={() => toggleMondayDeed('fasting')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 select-none ${
                  mondayDeeds.fasting 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-zinc-500/[0.02] border-[var(--border)]'
                }`}
              >
                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                  mondayDeeds.fasting ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-300 dark:border-zinc-700'
                }`}>
                  {mondayDeeds.fasting && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                </div>
                <div>
                  <p className="text-xs font-bold leading-none">সোমবারের রোজা বা নিয়ত</p>
                  <p className="text-[8px] text-zinc-500 mt-1 font-semibold">সুন্নাহ সাধ্যমত পালন করা বরকত</p>
                </div>
              </div>

              {/* Smile */}
              <div 
                onClick={() => toggleMondayDeed('smile')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 select-none ${
                  mondayDeeds.smile 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-zinc-500/[0.02] border-[var(--border)]'
                }`}
              >
                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                  mondayDeeds.smile ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-300 dark:border-zinc-700'
                }`}>
                  {mondayDeeds.smile && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                </div>
                <div>
                  <p className="text-xs font-bold leading-none">হাসিমুখে কথা বলা</p>
                  <p className="text-[8px] text-zinc-500 mt-1 font-semibold">হাসিমুখে দ্বীনি ভাইয়ের সাথে মেলা সদকা</p>
                </div>
              </div>

              {/* Miswak */}
              <div 
                onClick={() => toggleMondayDeed('miswak')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 select-none ${
                  mondayDeeds.miswak 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-zinc-500/[0.02] border-[var(--border)]'
                }`}
              >
                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                  mondayDeeds.miswak ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-300 dark:border-zinc-700'
                }`}>
                  {mondayDeeds.miswak && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                </div>
                <div>
                  <p className="text-xs font-bold leading-none">মেসওয়াক করা</p>
                  <p className="text-[8px] text-zinc-500 mt-1 font-semibold">আল্লাহর পবিত্র সন্তুষ্টির প্রধান কারণ</p>
                </div>
              </div>
            </div>

            {/* Unique dynamic progress view */}
            <div className="bg-zinc-500/[0.02] border border-[var(--border)] p-3 rounded-2xl flex items-center justify-between text-xs font-semibold text-[var(--text-muted)]">
              <span>সুন্নাহ আমল সম্পন্ন:</span>
              <span className="text-[var(--primary)] font-bold">
                {Object.values(mondayDeeds).filter(Boolean).length}/৩ টি সফল হয়েছে 🎉
              </span>
            </div>
          </div>
        ) : todayDayIndex === 2 ? (
          /* TUESDAY: DUA YUNUS PEACE CHANT & MINDFUL BREATHE RADAR */
          <div className="space-y-4 font-bengali">
            <div className="bg-gradient-to-br from-sky-500/10 to-transparent p-4.5 rounded-3xl border border-sky-500/10 flex flex-col md:flex-row items-stretch justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-sm font-extrabold text-sky-950 dark:text-sky-100 flex items-center mb-1">
                  <Flame className="w-4.5 h-4.5 text-sky-500 mr-1.5 animate-pulse" />
                  মঙ্গলবার: বিপদ ও অস্থিরতা থেকে মুক্তির বিশেষ আমল
                </h4>
                <p className="text-[11px] text-zinc-650 dark:text-zinc-300 leading-relaxed font-semibold">
                  দোয়া ইউনুস ‘লা ইলাহা ইল্লা আন্তা সুবহানাকা ইন্নি কুন্তু মিনায যলিমীন’ জপ করুন। এই দোয়া পাঠ করলে আল্লাহ কঠিনতম মুসিবত থেকে উদ্ধার করেন ইনশাআল্লাহ।
                </p>
              </div>
              <button 
                onClick={() => {
                  setInitialTargetAyahIndex(86);
                  setCurrentViewSurah(21);
                }} // Read Al-Anbya
                className="self-center bg-sky-500 hover:bg-sky-600 font-extrabold text-xs text-white px-4 py-3 rounded-xl transition-all shadow-md shrink-0 active:scale-97"
              >
                সূরা আম্বিয়া পড়ুন
              </button>
            </div>

            {/* Arabic script & Interactive breathing radar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
              <div className="md:col-span-8 bg-zinc-900/40 rounded-3xl p-5 border border-zinc-800/60 flex flex-col justify-center text-center">
                <span className="text-[9px] font-black text-sky-400 tracking-widest uppercase font-sans mb-2 block">dua yunus arabic</span>
                <p className="font-arabic text-2xl text-emerald-300 select-all leading-normal drop-shadow-sm mb-3" dir="rtl">
                  لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ
                </p>
                <p className="text-xs font-semibold text-zinc-300 leading-relaxed">
                  "আপনি ব্যতীত আর কোন সত্যিকারের উপাস্য নেই, আপনি পবিত্র মহান। নিশ্চয়ই আমি অপরাধীদের অন্তর্ভুক্ত।"
                </p>
              </div>

              {/* Breathe guidance radar */}
              <div className="md:col-span-4 bg-sky-500/[0.04] rounded-3xl border border-sky-500/10 p-4.5 flex flex-col items-center justify-center text-center select-none">
                <span className="text-[8px] font-black tracking-widest text-sky-500 uppercase font-sans mb-2">MINDFUL CALM RADAR</span>
                
                <div 
                  onClick={incrementTuesdayBreathe}
                  className="w-20 h-20 rounded-full border border-sky-500/20 bg-sky-500/10 flex flex-col items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all text-sky-600 dark:text-sky-400 shadow-inner group relative"
                >
                  <div className="absolute inset-0 rounded-full border border-sky-500 opacity-20 animate-subtle-pulse pointer-events-none" />
                  <span className="text-[9px] font-black">শান্তি বৃত্ত</span>
                  <span className="text-sm font-black font-sans my-0.5">{tuesdayBreatheCycles} বার</span>
                  <span className="text-[8px] font-bold opacity-85">ক্লিক করুন 👍</span>
                </div>

                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-[9px] text-zinc-500 font-semibold">মন শান্ত করুন ও জিকির করুন</span>
                  {tuesdayBreatheCycles > 0 && (
                    <button onClick={resetTuesdayBreathe} className="text-[9px] text-red-500 hover:underline">রিসেট</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : todayDayIndex === 3 ? (
          /* WEDNESDAY: GRATITUDE MATRIX & ALHAMDULILLAH AMPLIFIER */
          <div className="space-y-4 font-bengali">
            <div className="bg-gradient-to-br from-teal-500/10 to-transparent p-4.5 rounded-3xl border border-teal-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-extrabold text-teal-900 dark:text-teal-100 flex items-center mb-1 animate-pulse">
                  <Smile className="w-4.5 h-4.5 text-teal-500 mr-1.5" />
                  বুধবার: আল্লাহর অসংখ্য অফুরন্ত নেয়ামতের প্রতি শুকরিয়া আদায়ের বিশেষ দিন
                </h4>
                <p className="text-[11px] text-zinc-650 dark:text-zinc-300 leading-relaxed font-semibold">
                  আজ সূরা আর-রাহমান তিলাওয়াত শুনুন বা পড়ুন। আল্লাহর নেয়ামতগুলো টিক দিন এবং আলহামদুলিল্লাহ কাউন্টার বৃদ্ধি করুন।
                </p>
              </div>
              <button 
                onClick={() => setCurrentViewSurah(55)} // Al-Rahman
                className="shrink-0 bg-teal-500 hover:bg-teal-600 font-extrabold text-xs text-white px-4.5 py-2.5 rounded-xl transition-all shadow-md active:scale-97"
              >
                সূরা আর-রাহমান শুনুন →
              </button>
            </div>

            {/* Gratitude Matrix tags */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 select-none">
              <button
                onClick={() => toggleWednesdayTag('health')}
                className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all relative ${
                  wednesdayShukrTags.health 
                    ? 'border-yellow-500/40 bg-yellow-500/5 text-yellow-600 dark:text-yellow-400' 
                    : 'border-[var(--border)] hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-500/[0.01]'
                }`}
              >
                <div>সুস্বাস্থ্য ও শক্তি</div>
                <div className="text-[8px] text-zinc-500 mt-0.5 leading-none">আলহামদুলিল্লাহ (+১৫)</div>
              </button>

              <button
                onClick={() => toggleWednesdayTag('family')}
                className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all relative ${
                  wednesdayShukrTags.family 
                    ? 'border-yellow-500/40 bg-yellow-500/5 text-yellow-600 dark:text-yellow-400' 
                    : 'border-[var(--border)] hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-500/[0.01]'
                }`}
              >
                <div>পরিবার ও প্রিয়জন</div>
                <div className="text-[8px] text-zinc-500 mt-0.5 leading-none">আলহামদুলিল্লাহ (+১৫)</div>
              </button>

              <button
                onClick={() => toggleWednesdayTag('faith')}
                className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all relative ${
                  wednesdayShukrTags.faith 
                    ? 'border-yellow-500/40 bg-yellow-500/5 text-yellow-600 dark:text-yellow-400' 
                    : 'border-[var(--border)] hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-500/[0.01]'
                }`}
              >
                <div>ইসলাম ও ইমানের নেয়ামত</div>
                <div className="text-[8px] text-zinc-500 mt-0.5 leading-none">আলহামদুলিল্লাহ (+১৫)</div>
              </button>

              <button
                onClick={() => toggleWednesdayTag('rizk')}
                className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all relative ${
                  wednesdayShukrTags.rizk 
                    ? 'border-yellow-500/40 bg-yellow-500/5 text-yellow-600 dark:text-yellow-400' 
                    : 'border-[var(--border)] hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-500/[0.01]'
                }`}
              >
                <div>আজকের রিযিক ও বাসস্থান</div>
                <div className="text-[8px] text-zinc-500 mt-0.5 leading-none">আলহামদুলিল্লাহ (+১৫)</div>
              </button>
            </div>

            {/* Tap counter helper */}
            <div className="p-4 rounded-3xl bg-teal-500/[0.03] border border-teal-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
              <div>
                <p className="text-xs font-extrabold text-teal-900 dark:text-teal-200">আজকের আলহামদুলিল্লাহ্‌ তাসবিহ কাউন্টার</p>
                <p className="text-[9px] text-zinc-500 mt-0.5 font-semibold">মহাসম্ভ্রান্ত নিয়ামতের বিপরীতে কৃতজ্ঞতার অনন্য প্রকাশ জপুন</p>
              </div>

              <div className="flex items-center space-x-3.5 font-sans">
                <button
                  onClick={resetWednesdayShukr}
                  className="p-1 px-2.5 text-[10px] text-zinc-400 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-colors font-black"
                >
                  রিসেট
                </button>

                <div
                  onClick={incrementWednesdayAlham}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-zinc-950 font-black text-xs hover:scale-102 active:scale-97 cursor-pointer transition-all shadow-md shadow-teal-500/10 flex items-center space-x-2"
                >
                  <span>আলহামদুলিল্লাহ্‌: {wednesdayAlhamCount} বার</span>
                </div>
              </div>
            </div>
          </div>
        ) : todayDayIndex === 4 ? (
          /* THURSDAY: BEFORE-SLEEP REST & SECURITY ROUTINE (SURAH MULK PREP) */
          <div className="space-y-4 font-bengali">
            <div className="bg-gradient-to-br from-violet-500/10 to-transparent p-4.5 rounded-3xl border border-violet-500/10 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-extrabold text-violet-950 dark:text-violet-100 flex items-center mb-1">
                  <Clock className="w-4.5 h-4.5 text-violet-500 mr-1.5 animate-pulse" />
                  বৃহস্পতিবার রাত্রি: কবর যন্ত্রণার নিরাপত্তা ও ঘুমানোর প্রস্তুতি
                </h4>
                <p className="text-[11px] text-zinc-650 dark:text-zinc-300 leading-relaxed font-semibold">
                  ঘুমনোর পূর্বে সুন্নাহসম্মত ৪টি গুরুত্বপূর্ণ আমল সম্পন্ন করুন এবং সূরা আল-মূলক তিলাওয়াত করতে ভুলবেন না।
                </p>
              </div>
              <button 
                onClick={() => setCurrentViewSurah(67)} // Open Surah Al-Mulk
                className="shrink-0 bg-violet-500 hover:bg-violet-605 font-extrabold text-xs text-white px-4.5 py-2.5 rounded-xl shadow-md transition-all active:scale-97"
              >
                সুরা মূলক দেখুন →
              </button>
            </div>

            {/* Checklist of Thursday actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 select-none">
              {/* Deed 1 */}
              <div 
                onClick={() => toggleThursdayDeed('wudu')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 ${
                  thursdaySleepDeeds.wudu 
                    ? 'bg-emerald-550/[0.05] border-emerald-500/20 text-emerald-700 dark:text-emerald-450' 
                    : 'bg-zinc-500/[0.02] border-[var(--border)]'
                }`}
              >
                <div className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center transition-all ${
                  thursdaySleepDeeds.wudu ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-350'
                }`}>
                  {thursdaySleepDeeds.wudu && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                </div>
                <div>
                  <p className="text-xs font-bold leading-none">অযুসহ শয়ন করা</p>
                  <p className="text-[9px] text-zinc-500 mt-1 font-semibold">ফেরেশতারা সারারাত আল্লাহর কাছে রহমত প্রার্থনা করে</p>
                </div>
              </div>

              {/* Deed 2 */}
              <div 
                onClick={() => toggleThursdayDeed('cleanBed')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 ${
                  thursdaySleepDeeds.cleanBed 
                    ? 'bg-emerald-550/[0.05] border-emerald-500/20 text-emerald-700 dark:text-emerald-450' 
                    : 'bg-zinc-500/[0.02] border-[var(--border)]'
                }`}
              >
                <div className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center transition-all ${
                  thursdaySleepDeeds.cleanBed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-350'
                }`}>
                  {thursdaySleepDeeds.cleanBed && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                </div>
                <div>
                  <p className="text-xs font-bold leading-none">বিছানা ৩ বার ঝেড়ে নেওয়া</p>
                  <p className="text-[9px] text-zinc-500 mt-1 font-semibold">ক্ষতিকর পোকামাকড় ও অনিষ্টকারী জ্বীন থেকে চরম সুরক্ষাকবচ</p>
                </div>
              </div>

              {/* Deed 3 */}
              <div 
                onClick={() => toggleThursdayDeed('surahMulk')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 ${
                  thursdaySleepDeeds.surahMulk 
                    ? 'bg-emerald-550/[0.05] border-emerald-500/20 text-emerald-700 dark:text-emerald-450' 
                    : 'bg-zinc-500/[0.02] border-[var(--border)]'
                }`}
              >
                <div className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center transition-all ${
                  thursdaySleepDeeds.surahMulk ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-350'
                }`}>
                  {thursdaySleepDeeds.surahMulk && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                </div>
                <div>
                  <p className="text-xs font-bold leading-none">সূরা মূলক শ্রুতি বা পাঠ</p>
                  <p className="text-[9px] text-zinc-500 mt-1 font-semibold">কবরের মর্মন্তুদ শাস্তি থেকে আপনাকে সম্পূর্ণ মুক্তি দেবে নিশ্চিত</p>
                </div>
              </div>

              {/* Deed 4 */}
              <div 
                onClick={() => toggleThursdayDeed('threeKuls')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 ${
                  thursdaySleepDeeds.threeKuls 
                    ? 'bg-emerald-550/[0.05] border-emerald-500/20 text-emerald-700 dark:text-emerald-450' 
                    : 'bg-zinc-500/[0.02] border-[var(--border)]'
                }`}
              >
                <div className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center transition-all ${
                  thursdaySleepDeeds.threeKuls ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-350'
                }`}>
                  {thursdaySleepDeeds.threeKuls && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                </div>
                <div>
                  <p className="text-xs font-bold leading-none">৩ কুল পড়ে ফু দেওয়া</p>
                  <p className="text-[9px] text-zinc-500 mt-1 font-semibold">সূরা ইখলাস, ফালাক ও নাস ৩ বার পড়ে সারা শরীরে বুলানো সুন্নাত</p>
                </div>
              </div>
            </div>
          </div>
        ) : todayDayIndex === 5 ? (
          /* LUXURY FRIDAY CHECKLIST & SMART DHIKR WIDGET */
          <div className="space-y-4 font-bengali">
            {/* Friday Golden Banner */}
            <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/[0.03] p-4.5 rounded-3xl border border-amber-500/20 mb-4 flex items-center justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-sm font-extrabold text-amber-950 dark:text-amber-100 flex items-center mb-1">
                  <Smile className="w-4.5 h-4.5 text-amber-500 mr-2 animate-bounce" />
                  জুমুআহ মোবারক! আজকের ৫টি পুণ্যময় সুন্নাত আমল
                </h4>
                <p className="text-[11px] text-zinc-650 dark:text-zinc-350 leading-relaxed font-semibold">
                  জুমুআর দিনে রয়েছে এমন এক সময়, যখন কোনো বান্দা কোনো চাওয়া পেশ করলে আল্লাহ তা কবুল করেন। নিচে আমলগুলো পূরণ করে দরূদ শরীফ কাউন্টার বৃদ্ধি করুন:
                </p>
              </div>
              <div className="py-1 px-3 text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-sans tracking-tight rounded-xl font-bold shrink-0 text-center animate-pulse">
                BEST JUMMAH VALUE
              </div>
            </div>

            {/* Friday actions list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 select-none">
              {/* Deed 1 */}
              <div 
                onClick={() => toggleFridayDeed('gusl')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 ${
                  fridayDeeds.gusl 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-450 bg-opacity-70' 
                    : 'bg-zinc-500/[0.02] border-[var(--border)]'
                }`}
              >
                <div className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center transition-all ${
                  fridayDeeds.gusl ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-300 dark:border-zinc-700'
                }`}>
                  {fridayDeeds.gusl && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                </div>
                <div>
                  <p className={`text-xs font-bold leading-none ${fridayDeeds.gusl ? 'line-through opacity-75' : ''}`}>ঘুসূল, আতর ও উত্তম পোশাক</p>
                  <p className="text-[9px] text-zinc-500 mt-1 font-semibold">পরিচ্ছন্নতা ইমানের অঙ্গ ও জুমুআর পবিত্র সুন্নাহ</p>
                </div>
              </div>

              {/* Deed 2 */}
              <div 
                onClick={() => {
                  toggleFridayDeed('kahf');
                  setCurrentViewSurah(18); // Opens Surah Al-Kahf
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 ${
                  fridayDeeds.kahf 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-450 bg-opacity-70' 
                    : 'bg-amber-500/[0.03] border-amber-500/20 text-amber-800 dark:text-amber-300'
                }`}
              >
                <div className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center transition-all ${
                  fridayDeeds.kahf ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-amber-500/30'
                }`}>
                  {fridayDeeds.kahf && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-bold leading-none flex items-center justify-between ${fridayDeeds.kahf ? 'line-through opacity-75' : ''}`}>
                    <span>সূরা আল-কাহাফ তিলাওয়াত</span>
                    <span className="text-[8px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-sans px-1.5 py-0.5 rounded ml-1">পড়ুুন →</span>
                  </p>
                  <p className="text-[9px] text-zinc-500 mt-1 font-semibold">পাঠকারীর জন্য দুই জুমুআর মধ্যবর্তী দিনগুলো নূরানী হবে</p>
                </div>
              </div>

              {/* Deed 4 */}
              <div 
                onClick={() => toggleFridayDeed('dua')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 ${
                  fridayDeeds.dua 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-450 bg-opacity-70' 
                    : 'bg-zinc-500/[0.02] border-[var(--border)]'
                }`}
              >
                <div className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center transition-all ${
                  fridayDeeds.dua ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-300 dark:border-zinc-700'
                }`}>
                  {fridayDeeds.dua && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                </div>
                <div>
                  <p className={`text-xs font-bold leading-none ${fridayDeeds.dua ? 'line-through opacity-75' : ''}`}>আসর-মাগরিব বিশেষ দোয়া</p>
                  <p className="text-[9px] text-zinc-500 mt-1 font-semibold">এই সময়ের দোয়া কবুল হওয়ার প্রবল সম্ভাবনা রয়েছে</p>
                </div>
              </div>

              {/* Deed 5 */}
              <div 
                onClick={() => toggleFridayDeed('masjid')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 ${
                  fridayDeeds.masjid 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-450' 
                    : 'bg-zinc-500/[0.02] border-[var(--border)]'
                }`}
              >
                <div className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center transition-all ${
                  fridayDeeds.masjid ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-300 dark:border-zinc-700'
                }`}>
                  {fridayDeeds.masjid && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                </div>
                <div>
                  <p className={`text-xs font-bold leading-none ${fridayDeeds.masjid ? 'line-through opacity-75' : ''}`}>আগে আগে প্রথম কাতারে বসা</p>
                  <p className="text-[9px] text-zinc-500 mt-1 font-semibold">মসজিদে প্রথমভাগে উপস্থিত হওয়া একটি উট কুরবানির সওয়াব</p>
                </div>
              </div>
            </div>

            {/* Deed 3: Premium Interactive Dorood Counter inside Friday special section */}
            <div className="mt-4 p-4.5 rounded-3xl bg-amber-500/[0.03] dark:bg-amber-950/20 border border-amber-500/15 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3 select-none">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-amber-500/10 text-amber-500 border border-amber-500/20`}>
                  <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-amber-950 dark:text-amber-150">রাসূল (সা.)-এর প্রতি ১০০ বার দরূদ পাঠ</p>
                  <p className="text-[9px] text-zinc-500 mt-1 font-semibold">আপনার কিয়ামতের শাফাআত ও গুণাহ মাফের নিশ্চয়তা লাভ</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3.5 select-none font-sans">
                <button 
                  onClick={resetDurood}
                  className="p-1 px-2.5 text-[10px] text-zinc-400 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-colors font-sans font-black"
                  title="কাউন্টার রিসেট করুন"
                >
                  রিসেট
                </button>
                <div 
                  onClick={incrementDurood}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-103 active:scale-97 text-zinc-950 font-black text-xs shadow-md shadow-amber-500/15 flex items-center space-x-2 cursor-pointer transition-all"
                >
                  <span className="font-sans font-black"> দরূদ কাউন্টার: {duroodCount}/১০০</span>
                  {duroodCount >= 100 && <span className="text-xs bg-black text-amber-400 px-1.5 py-0.5 rounded-full font-sans">✓</span>}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* SATURDAY: KNOWLEDGE BOOST & VERSE EXPLORATION MATRIX */
          <div className="space-y-4 font-bengali">
            <div className="bg-gradient-to-br from-orange-500/10 to-transparent p-4.5 rounded-3xl border border-orange-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-extrabold text-orange-950 dark:text-orange-100 flex items-center mb-1">
                  <BookOpen className="w-4.5 h-4.5 text-orange-500 mr-2 animate-bounce" />
                  শনিবার: কুরআন গবেষকের দিন ও দ্বীনি সুজ্ঞানার্জন
                </h4>
                <p className="text-[11px] text-zinc-650 dark:text-zinc-300 leading-relaxed font-semibold">
                  আজ কুরআনের অন্তহীন রহমতের আয়াতটি গভীর হৃদয় দিয়ে অনুভব করুন ও উপলব্ধি করার চেষ্টা করুন।
                </p>
              </div>
              <button 
                onClick={() => setCurrentViewSurah(2)} // Read Surah Al-Baqarah
                className="shrink-0 bg-orange-500 hover:bg-orange-650 font-extrabold text-xs text-white px-4.5 py-2.5 rounded-xl shadow-md transition-all active:scale-97"
              >
                সূরা বাকারাহ তেলাওয়াত করুন
              </button>
            </div>
            {/* Vintage Qur'an Verse Card display layout */}
            <div className="bg-[var(--bg-main)] border border-[var(--border)] p-5 rounded-3xl relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/[0.02] rounded-bl-full pointer-events-none" />
              
              <div className="text-center font-arabic text-2xl text-orange-600 dark:text-orange-400 font-bold mb-3 tracking-wide leading-normal" dir="rtl">
                فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ
              </div>

              <div className="text-xs text-center font-bold text-[var(--text-main)] mb-1 leading-relaxed max-w-lg mx-auto">
                "অতএব তোমরা আমাকে স্মরণ কর, আমিও তোমাদের স্মরণ করব। আর তোমরা আমার প্রতি কৃতজ্ঞ হও এবং পরম অকৃতজ্ঞ হয়ো না।"
              </div>
              <p className="text-[9px] text-[var(--text-muted)] text-center font-bold font-sans uppercase tracking-wider">
                — সূরা আল-বাকারাহ, আয়াত ১৫২
              </p>
            </div>

            {/* Bookmark Completed check option */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 select-none">
              <p className="text-xs text-[var(--text-muted)] font-semibold">
                আপনি কি আজকের আয়াতটি তিলাওয়াত ও হৃদয় দিয়ে অনুধাবন করেছেন?
              </p>

              <button
                onClick={toggleSaturdayLearned}
                className={`py-2 px-5 text-xs font-bold rounded-xl transition-all border outline-none active:scale-97 flex items-center justify-center space-x-1.5 ${
                  saturdayLearned 
                    ? 'bg-orange-500 text-white border-transparent shadow-md' 
                    : 'bg-zinc-500/[0.02] border-[var(--border)] hover:border-orange-500/40 text-[var(--text-muted)]'
                }`}
              >
                {saturdayLearned ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[4]" />
                    <span>আজকের জ্ঞানার্জন সম্পন্ন হয়েছে 🎉</span>
                  </>
                ) : (
                  <span>হ্যাঁ, অনুধাবন করেছি 👍</span>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Standalone full-width Prayer Time Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setShowPrayerModal(true)}
        className="bg-[#0f172a] rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl border border-white/5 mb-6 group cursor-pointer"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--primary)] opacity-10 rounded-bl-full blur-xl group-hover:scale-110 transition-transform" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
               <Clock className="w-5 h-5 text-white/80 animate-pulse" />
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); playAzan(); }}
              className={`p-2.5 rounded-xl transition-all ${isAzanPlaying ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'}`}
            >
              {isAzanPlaying ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
          
          {nextPrayer ? (
            <>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">
                {nextPrayer.isCurrent ? 'চলমান সালাত' : 'পরবর্তী সালাত'}
              </p>
              <h3 className="text-2xl font-bold font-sans mb-3">{nextPrayer.name} • {convertTo12Hour(nextPrayer.time)}</h3>
              <div className="bg-white/5 px-4 py-3 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                 <span className="text-white/40">{nextPrayer.isCurrent ? 'সালাতের ওয়াক্ত চলছে' : 'বাকি আছে:'}</span>
                 <span className="text-[var(--primary)] font-bold">{nextPrayer.isCurrent ? 'ইনশাআল্লাহ' : nextPrayer.remaining}</span>
              </div>

              {/* Dynamic Prayer Suggestion directly integrated inside the Prayer Card */}
              <div className="mt-4 pt-4 border-t border-white/5 text-xs text-white/80 leading-relaxed font-bengali bg-white/[0.02] p-4 rounded-2xl flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1">
                  <p className="font-extrabold text-amber-300">নামাজের বিশেষ গাইড ও আমল:</p>
                  <p className="mt-1 text-white/90 text-[11px] leading-relaxed font-medium">
                    {getPrayerSuggestion(nextPrayer.name).tip}
                  </p>
                  {getPrayerSuggestion(nextPrayer.name).surah && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const suggestion = getPrayerSuggestion(nextPrayer.name);
                        const targetSurah = suggestion.surah;
                        if (targetSurah) {
                          if (suggestion.ayahIndex !== undefined) {
                            setInitialTargetAyahIndex(suggestion.ayahIndex);
                          }
                          setCurrentViewSurah(targetSurah);
                        }
                      }}
                      className="mt-2.5 inline-flex items-center space-x-1 underline text-emerald-400 hover:text-emerald-350 font-black text-[10px]"
                    >
                      <span>আমলটি শুরু করুন →</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-white/20 text-center font-bold">Prayer times loading...</div>
          )}

          {/* Integrated Browser Push Notification Activator */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white/5 mt-4 p-3.5 rounded-2xl text-xs border border-white/[0.03] gap-3">
            <div className="flex items-center space-x-2.5">
              <div className={`w-2.5 h-2.5 rounded-full ${notificationsEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
              <span className="text-[11px] text-white/80 font-bengali font-bold">
                {notificationsEnabled ? 'নামাজের সময় নোটিফিকেশন ও আমল পুশ সক্রিয় আছে' : 'নামাজের সময় নোটিফিকেশন বন্ধ আছে'}
              </span>
            </div>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (!notificationsEnabled) {
                  if ('Notification' in window) {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                      setNotificationsEnabled(true);
                      try {
                        new Notification('ইবাদত পুশ নোটিফিকেশন সক্রিয়', {
                          body: 'সালাতের ওয়াক্ত হলেই নামাজ আদায় ও পড়ার সেরা সাজেশনগুলো আপনার মোবাইলে চলে যাবে!',
                          icon: '/icon-192.png'
                        });
                      } catch {}
                    } else {
                      alert('দয়া করে আপনার ব্রাউজার নোটিফিকেশন পারমিশন অন করুন!');
                    }
                  } else {
                    alert('আপনার ব্রাউজার পুশ নোটিফিকেশন সাপোর্ট করছে না!');
                  }
                } else {
                  setNotificationsEnabled(false);
                }
              }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-wide transition-all font-bengali text-center shrink-0 ${
                notificationsEnabled 
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/10' 
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-extrabold shadow-md shadow-emerald-500/10'
              }`}
            >
              {notificationsEnabled ? 'বন্ধ করুন ⏮' : 'ওয়াক্ত নোটিফিকেশন অন করুন 🔔'}
            </button>
          </div>

        </div>
      </motion.div>

          {/* Islamic Lifestyle & Daily Deeds Grouped Container (আলাদা একটা বক্স) */}
          <div className="border-[3px] border-emerald-500/15 dark:border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-950/5 rounded-[2.5rem] p-6 mb-6 shadow-[0_12px_40px_-15px_rgba(16,185,129,0.06)] relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-36 h-36 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center space-x-2.5 mb-5 bg-emerald-500/10 dark:bg-emerald-500/20 w-max px-4 py-1.5 rounded-2xl border border-emerald-500/20 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin [animation-duration:10s]" />
              <span className="text-xs font-extrabold uppercase tracking-wide font-bengali">ইসলামিক লাইফস্টাইল ও দৈনিক আমলসমূহ</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
              
              {/* Card 1: Last Read Card - Styled with Mint theme */}
              {(() => {
                const activeSurahNum = playingSurah ? playingSurah.number : (lastRead ? lastRead.surahNumber : null);
                const activeSurahName = playingSurah ? playingSurah.englishName : (lastRead ? lastRead.surahName : '');
                const isCurrentSurahPlaying = !!playingSurah && activeSurahNum !== null;
                const currentAyahNum = playingSurah ? playingAyahIndex : (lastRead ? lastRead.ayahIndex : 0);
                const bSurah = activeSurahNum ? getBanglaSurahData(activeSurahNum) : null;
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => {
                      if (activeSurahNum !== null) {
                        setInitialTargetAyahIndex(currentAyahNum);
                        setCurrentViewSurah(activeSurahNum);
                      }
                    }}
                    className="bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 dark:border-emerald-500/30 hover:border-emerald-500/40 rounded-[2rem] p-5 shadow-sm relative overflow-hidden group cursor-pointer flex flex-col justify-between min-h-[200px] transition-all hover:scale-[1.01] active:scale-[0.98]"
                  >
                    <div className="absolute right-0 bottom-0 w-24 h-24 bg-emerald-500/5 rounded-tl-full blur-xl pointer-events-none" />
                    {isCurrentSurahPlaying && (
                      <div className="absolute -right-4 -top-4 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl animate-pulse pointer-events-none" />
                    )}
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-9 h-9 bg-emerald-500/10 dark:bg-emerald-500/25 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <BookOpen className="w-4.5 h-4.5" />
                        </div>
                        {isCurrentSurahPlaying ? (
                          <div className="flex items-center space-x-1.5 bg-emerald-500/15 dark:bg-emerald-500/35 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[9px] font-black border border-emerald-500/20 animate-pulse">
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="font-bengali">এখন চলছে</span>
                          </div>
                        ) : (
                          activeSurahNum && (
                            <span className="bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[9px] font-bold font-bengali">
                              সর্বশেষ পাঠ
                            </span>
                          )
                        )}
                      </div>
                      <p className="text-[9px] font-black tracking-wider text-emerald-600 dark:text-emerald-400 uppercase font-sans">
                        {isCurrentSurahPlaying ? 'লাইভ প্লেয়ার সিঙ্ক' : 'সর্বশেষ পাঠ'}
                      </p>
                      <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-100 mt-1 lines-clamp-1 leading-snug">
                        {activeSurahNum ? (
                          bSurah ? `সূরা ${bSurah.banglaName}` : activeSurahName
                        ) : (
                          'কুরআন তিলাওয়াত'
                        )}
                        {activeSurahNum && (
                          <span className="text-xs font-medium text-emerald-600/80 dark:text-emerald-400/70 block mt-0.5 font-sans">
                            {activeSurahName}
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-400/90 font-bold font-bengali mt-1.5 flex items-center gap-1">
                        {activeSurahNum ? (
                          <>
                            আয়াত নং: <span className="text-emerald-600 dark:text-emerald-305 font-extrabold text-xs">{toBengaliNumber(currentAyahNum + 1)}</span>
                          </>
                        ) : (
                          'এখনই পড়া শুরু করুন'
                        )}
                      </p>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center text-emerald-800 dark:text-emerald-300 text-[10px] font-black bg-emerald-500/15 dark:bg-emerald-500/25 group-hover:bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/20 font-bengali transition-all">
                        {activeSurahNum ? 'পড়া চালিয়ে যান →' : 'শুরু করুন →'}
                      </div>
                      
                      {isCurrentSurahPlaying && (
                        <div className="flex items-end gap-0.5 h-3 px-1">
                          <div className="w-[2px] bg-emerald-500 dark:bg-emerald-400 rounded-full animate-[soundwave_0.8s_ease-in-out_infinite_alternate]" />
                          <div className="w-[2px] bg-emerald-500 dark:bg-emerald-400 rounded-full animate-[soundwave_0.5s_ease-in-out_infinite_alternate_0.2s]" />
                          <div className="w-[2px] bg-emerald-500 dark:bg-emerald-400 rounded-full animate-[soundwave_0.7s_ease-in-out_infinite_alternate_0.1s]" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })()}

              {/* Card 2: Daily Quran Challenge & Streak Tracker - Collapsible Design */}
              <motion.div 
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setChallengeExpanded(!challengeExpanded)}
                className={`bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 dark:border-amber-500/30 hover:border-amber-500/40 rounded-[2rem] p-5 shadow-sm relative overflow-hidden group cursor-pointer flex flex-col justify-between transition-all duration-300 ${
                  challengeExpanded ? 'min-h-[200px]' : 'h-[105px] min-h-[105px] justify-center'
                }`}
              >
                <div className="absolute right-0 bottom-0 w-20 h-20 bg-amber-500/5 rounded-tl-full blur-lg pointer-events-none" />
                
                {/* Expand/Collapse Chevron Indicator in top right */}
                <div className="absolute top-4 right-4 text-amber-500/70 dark:text-amber-400 group-hover:scale-110 transition-transform">
                  {challengeExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>

                {!challengeExpanded ? (
                  /* COLLAPSED COMPACT LAYOUT */
                  <div className="flex items-center space-x-3 w-full pr-4 select-none">
                    <div className="w-10 h-10 bg-amber-500/10 dark:bg-amber-500/25 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                      <CheckSquare className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center space-x-1.5 mb-0.5">
                        <span className="text-[9px] font-black tracking-widest text-amber-600 dark:text-amber-400 uppercase font-bengali">কুরআন চ্যালেঞ্জ</span>
                        <div className="flex items-center space-x-0.5 bg-orange-500/10 dark:bg-orange-500/25 text-orange-600 dark:text-orange-400 px-1.5 py-0.2 rounded-full text-[8px] font-bold">
                          <Flame className="w-2.5 text-orange-500 fill-orange-500 animate-pulse" />
                          <span>{completedStreak} দিন</span>
                        </div>
                      </div>
                      <h4 className="text-[12px] font-extrabold text-amber-950 dark:text-white leading-tight font-bengali truncate">
                        {challengeDone ? 'আলহামদুলিল্লাহ! সম্পূর্ণ' : 'সূরা আশ-শারহ তিলাওয়াত'}
                      </h4>
                      <p className="text-[9px] text-amber-800/80 dark:text-amber-400/85 font-bengali font-medium mt-0.5 truncate">
                        {challengeDone ? 'জ্ঞান বৃদ্ধির আমল সম্পন্ন' : 'বিস্তারিত দেখতে ও আমলটি করতে ট্যাপ করুন'}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* FULL EXPANDED LAYOUT */
                  <>
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-9 h-9 bg-amber-500/10 dark:bg-amber-500/25 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <CheckSquare className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex items-center space-x-1 bg-orange-500/15 dark:bg-orange-500/35 text-orange-600 dark:text-orange-400 px-2.5 py-0.5 rounded-full text-[9px] font-bold mr-6">
                          <Flame className="w-3 text-orange-500 fill-orange-500 animate-pulse" />
                          <span>{completedStreak} দিন</span>
                        </div>
                      </div>
                      <p className="text-[9px] font-black tracking-widest text-amber-600 dark:text-amber-400 uppercase font-bengali">কুরআন চ্যালেঞ্জ</p>
                      <h4 className="text-[13px] font-extrabold text-amber-950 dark:text-white mt-1 leading-snug font-bengali line-clamp-2">
                        {challengeDone ? 'আলহামদুলিল্লাহ! সম্পূর্ণ' : 'সূরা আশ-শারহ এর আয়াত তিলাওয়াত'}
                      </h4>
                      <p className="text-[10px] text-amber-800/85 dark:text-amber-300/85 mt-1 line-clamp-2 font-bengali font-medium">
                        {challengeDone ? 'চমৎকার! আপনার জ্ঞান বৃদ্ধি করুন।' : 'আমল সম্পন্ন করতে নিচে বাটন ক্লিক করুন।'}
                      </p>
                    </div>
                    <div 
                      onClick={(e) => {
                        e.stopPropagation(); // Avoid triggering card toggle when clicking button
                        toggleChallenge();
                      }}
                      className={`mt-4 px-3 py-1.5 rounded-xl text-[10px] font-extrabold w-max font-bengali border transition-all active:scale-[0.97] hover:brightness-105 ${
                        challengeDone 
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                          : 'bg-amber-500/15 text-amber-600 border-amber-500/20'
                      }`}
                    >
                      {challengeDone ? 'সম্পন্ন ✓' : 'আমল চিহ্নিত করুন'}
                    </div>
                  </>
                )}
              </motion.div>

              {/* Card 3: Hijri Calendar Sync & Countdown - Collapsible Design */}
              <motion.div 
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setCalendarExpanded(!calendarExpanded)}
                className={`bg-rose-500/5 dark:bg-rose-955/20 border border-rose-500/20 dark:border-rose-500/30 hover:border-rose-500/40 rounded-[2rem] p-5 shadow-sm relative overflow-hidden group cursor-pointer flex flex-col justify-between transition-all duration-300 ${
                  calendarExpanded ? 'min-h-[200px]' : 'h-[105px] min-h-[105px] justify-center'
                }`}
              >
                <div className="absolute right-0 bottom-0 top-0 w-12 bg-rose-500/2 pointer-events-none" />
                
                {/* Expand/Collapse Chevron Indicator in top right */}
                <div className="absolute top-4 right-4 text-rose-500/70 dark:text-rose-400 group-hover:scale-110 transition-transform">
                  {calendarExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>

                {!calendarExpanded ? (
                  /* COLLAPSED COMPACT LAYOUT */
                  <div className="flex items-center space-x-3 w-full pr-4 select-none">
                    <div className="w-10 h-10 bg-rose-500/10 dark:bg-rose-500/25 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[9px] font-black tracking-widest text-rose-600 dark:text-rose-400 uppercase font-sans">হিজরি তারিখ</span>
                        <span className="text-[8px] font-bold text-rose-500/85">২৮ জিলকদ ১৪৪৭</span>
                      </div>
                      <h4 className="text-[12px] font-extrabold text-rose-950 dark:text-rose-100 leading-tight font-bengali truncate">
                        আসন্ন উৎসব: ঈদুল আযহা (৭ দিন বাকী)
                      </h4>
                      <p className="text-[9px] text-rose-800/80 dark:text-rose-400/85 font-bengali font-medium mt-0.5 truncate">
                        বিস্তারিত উৎসবের কাউন্টڈাউন দেখতে ট্যাপ করুন
                      </p>
                    </div>
                  </div>
                ) : (
                  /* FULL EXPANDED LAYOUT */
                  <>
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-9 h-9 bg-rose-500/10 dark:bg-rose-500/25 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          <Calendar className="w-4.5 h-4.5" />
                        </div>
                        <div className="text-right mr-6">
                          <p className="text-[8px] font-black text-rose-600 dark:text-rose-400 uppercase font-sans">হিজরি তারিখ</p>
                          <p className="text-[10px] font-black text-rose-950 dark:text-rose-200 font-sans">২৮ জিলকদ ১৪৪৭</p>
                        </div>
                      </div>
                      <p className="text-[9px] font-black tracking-wider text-rose-600 dark:text-rose-400 uppercase font-sans">আসন্ন উৎসব</p>
                      <h4 className="text-[13px] font-extrabold text-rose-950 dark:text-rose-100 mt-1 leading-snug font-bengali">ঈদুল আযহা ১৪৪৭</h4>
                      
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between items-center text-[9px]">
                          <span className="text-rose-700/70 dark:text-rose-400/70 font-bold">কাউন্টডাউন</span>
                          <span className="text-rose-600 dark:text-rose-400 font-black">৭ দিন বাকী</span>
                        </div>
                        <div className="w-full h-1 bg-rose-200 dark:bg-rose-800/40 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full w-[91%]" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-[10px] text-rose-700 dark:text-rose-400 font-extrabold font-sans">
                      জান্নাত কামনার চমৎকার সময়
                    </div>
                  </>
                )}
              </motion.div>

            </div>
          </div>

          {/* Premium Progress Dashboard Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setShowProgressModal(true)}
            className="bg-gradient-to-br from-[var(--bg-surface)] via-[var(--bg-surface)] to-[var(--bg-main)] rounded-[2.5rem] p-6 md:p-8 border border-[var(--border)] shadow-sm mb-10 overflow-hidden cursor-pointer hover:border-[var(--primary)] hover:shadow-md transition-all group relative"
          >
            {/* Ambient upper glow inside the premium panel */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 relative z-10">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-emerald-500/10">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-extrabold text-[var(--text-main)] text-base md:text-lg tracking-tight group-hover:text-[var(--primary)] transition-colors">
                      অগ্রগতি ও তিলাওয়াত ড্যাশবোর্ড
                    </h4>
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest font-sans mt-0.5">Premium Study Insights & Weekly Goal Status</p>
                </div>
              </div>
              
              {/* Actions & Target Indicator Header */}
              <div className="flex items-center space-x-3 shrink-0">
                <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50 px-3 py-1.5 rounded-xl font-bold font-bengali">
                  সাপ্তাহিক লক্ষ্যমাত্রা: ৮০% সম্পন্ন
                </span>
                <div className="bg-[var(--primary)] text-white px-4 py-2 rounded-xl text-xs font-bold font-bengali flex items-center shadow-lg shadow-[var(--primary-soft)] hover:scale-102 transition-transform">
                  বিস্তারিত দেখুন →
                </div>
              </div>
            </div>

            {/* Quick Analytics Bento Tiles inside Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 relative z-10">
              <div className="bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border)] border-opacity-70">
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider font-sans">মোট পড়া হয়েছে</p>
                <div className="flex items-baseline space-x-1 mt-1.5">
                  <span className="text-xl md:text-2xl font-black text-[var(--text-main)] font-sans">{totalAyahs}</span>
                  <span className="text-xs font-bold text-[var(--text-muted)] font-bengali">টি আয়াত</span>
                </div>
              </div>

              <div className="bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border)] border-opacity-70">
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider font-sans">দৈনিক গড় আয়াত</p>
                <div className="flex items-baseline space-x-1 mt-1.5">
                  <span className="text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-sans">{Math.round(totalAyahs / 7) || 0}</span>
                  <span className="text-xs font-bold text-[var(--text-muted)] font-bengali">টি/দিন</span>
                </div>
              </div>

              <div className="bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border)] border-opacity-70">
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider font-sans">তিলাওয়াত সময়</p>
                <div className="flex items-baseline space-x-1 mt-1.5">
                  <span className="text-xl md:text-2xl font-black text-amber-500 font-sans">১২</span>
                  <span className="text-xs font-bold text-[var(--text-muted)] font-bengali">মিনিট/দিন</span>
                </div>
              </div>
            </div>
            
            {/* Redesigned Highly Professional Chart with nice background padding */}
            <div className="bg-[var(--bg-main)] bg-opacity-40 p-4 font-sans rounded-3xl border border-[var(--border)] relative z-10">
              <div className="text-right text-[10px] font-bold text-[var(--text-muted)] mb-3 pb-2 border-b border-[var(--border)] border-dashed flex justify-between">
                <span>সাপ্তাহিক আয়াত তিলাওয়াত রেকর্ড</span>
                <span className="text-[var(--primary)] font-black">গত ৭ দিন</span>
              </div>
              <div className="h-[200px] w-full mt-2">
                {isMounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dynamicProgressData}>
                      <defs>
                        <linearGradient id="colorAyahsPremium" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.45}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" opacity={0.3} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }}
                        dy={8}
                      />
                      <Tooltip 
                        cursor={{ stroke: 'var(--primary)', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                        contentStyle={{ 
                          backgroundColor: 'var(--bg-surface)', 
                          borderColor: 'var(--border)', 
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
                        }}
                        itemStyle={{ color: 'var(--primary)' }}
                        formatter={(value) => [`${value} টি আয়াত`, 'পাঠ করা হয়েছে']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="ayahs" 
                        stroke="var(--primary)" 
                        strokeWidth={4.5}
                        fillOpacity={1} 
                        fill="url(#colorAyahsPremium)" 
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </motion.div>

          {/* Re-positioned Search & Filter bar right above the Surah list */}
          <div className="bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-200/50 dark:border-indigo-800/30 rounded-[2rem] p-5 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
              
              {/* Search input field */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-indigo-500/60 dark:text-indigo-400/60" />
                <input 
                  type="text"
                  placeholder="সূরা খুঁজুন (যেমন: Al-Fatihah, Fatiha)..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-indigo-200/60 dark:border-indigo-800/50 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-xs font-bold placeholder-indigo-450 font-sans tracking-wide transition-all shadow-inner outline-none dark:text-white"
                />
                {search && (
                  <button 
                    onClick={() => setSearch('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Revelation filters row */}
              <div className="flex items-center space-x-1.5 self-center scrollbar-none overflow-x-auto w-full md:w-auto">
                <button
                  onClick={() => setRevelationFilter('all')}
                  className={`px-4 py-2.5 rounded-xl text-[11px] font-black font-bengali transition-all shrink-0 border ${
                    revelationFilter === 'all'
                      ? 'bg-indigo-600 text-white border-transparent shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40 hover:border-indigo-200/60'
                  }`}
                >
                  সব সূরা
                </button>
                <button
                  onClick={() => setRevelationFilter('Meccan')}
                  className={`px-4 py-2.5 rounded-xl text-[11px] font-black font-bengali transition-all shrink-0 border ${
                    revelationFilter === 'Meccan'
                      ? 'bg-indigo-600 text-white border-transparent shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40 hover:border-indigo-200/60'
                  }`}
                >
                  মাক্কী সূরা
                </button>
                <button
                  onClick={() => setRevelationFilter('Medinan')}
                  className={`px-4 py-2.5 rounded-xl text-[11px] font-black font-bengali transition-all shrink-0 border ${
                    revelationFilter === 'Medinan'
                      ? 'bg-indigo-600 text-white border-transparent shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40 hover:border-indigo-200/60'
                  }`}
                >
                  মাদানী সূরা
                </button>
              </div>

            </div>
          </div>

          {/* Surahs List Header */}
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center">
              <ListIcon className="w-5 h-5 text-[var(--primary)] mr-2" />
              সকল সূরাসমূহ
            </h3>
            <span className="text-xs font-bold text-[var(--text-muted)] font-sans">{filteredSurahs.length} Surahs</span>
          </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-[var(--primary-soft)] border-t-[var(--primary)] rounded-full animate-spin mb-4" />
          <p className="text-[var(--primary)] font-bold text-sm">লোড হচ্ছে...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pb-8">
          {filteredSurahs.map((surah, index) => (
            <SurahCard 
              key={surah.number} 
              surah={surah} 
              isFavorite={favorites.includes(surah.number)} 
              index={index} 
            />
          ))}
          {filteredSurahs.length === 0 && (
            <div className="text-center py-20">
               <div className="bg-[var(--bg-main)] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border)]">
                 <Search className="w-8 h-8 text-[var(--text-muted)] opacity-50" />
               </div>
               <p className="text-[var(--text-muted)] font-bold">কোনো সূরা পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      )}

      <PrayerTimesModal 
        isOpen={showPrayerModal} 
        onClose={() => setShowPrayerModal(false)} 
        prayerTimes={prayerTimes} 
        location={location} 
        onPlayAzan={playAzan}
        isAzanPlaying={isAzanPlaying}
      />
      
      <ProgressModal 
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        allSurahs={surahs}
      />
    </div>
  );
};

// Simple embedded icon
const ListIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);
