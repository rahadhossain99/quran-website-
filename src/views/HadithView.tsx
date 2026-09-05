import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Search, Copy, Check, Share2, Bookmark, Sparkles, 
  ChevronRight, Filter, RefreshCw, CheckCircle2, ArrowRight, BookMarked,
  Layers, Info, ShieldCheck, Heart
} from 'lucide-react';
import { useAppStore } from '../Store';

interface HadithItem {
  hadithnumber: number;
  arabicnumber?: number;
  text: string;
  reference?: {
    book: number;
    hadith: number;
  };
}

interface HadithBook {
  id: string;
  name: string;
  arabicName: string;
  englishName: string;
  totalHadith: string;
  desc: string;
  defaultSection: number;
  sections: { id: number; name: string; english: string }[];
}

const HADITH_BOOKS: HadithBook[] = [
  {
    id: 'bukhari',
    name: 'সহীহুল বুখারী',
    arabicName: 'صحيح البخاري',
    englishName: 'Sahih al-Bukhari',
    totalHadith: '৭,৫৬৩',
    desc: 'সর্বাধিক বিশুদ্ধ ও প্রামাণ্য হাদিস সংকলন',
    defaultSection: 1,
    sections: [
      { id: 1, name: '১. ওহীর সূচনা', english: 'Revelation' },
      { id: 2, name: '২. ঈমান', english: 'Belief' },
      { id: 3, name: '৩. ইলম বা জ্ঞান', english: 'Knowledge' },
      { id: 4, name: '৪. ওযু', english: 'Ablution' },
      { id: 5, name: '৫. গোসল', english: 'Ghusl' },
      { id: 8, name: '৮. সালাত (নামাজ)', english: 'Prayers' },
      { id: 9, name: '৯. সালাতের ওয়াক্তসমূহ', english: 'Times of Prayers' },
      { id: 10, name: '১০. আযান', english: 'Adhan' },
      { id: 11, name: '১১. জুমু\'আ', english: 'Friday Prayer' },
      { id: 24, name: '২৪. যাকাত', english: 'Zakat' },
      { id: 25, name: '২৫. হজ', english: 'Hajj' },
      { id: 30, name: '৩০. সিয়াম (রোজা)', english: 'Fasting' },
      { id: 34, name: '৩৪. ক্রয়-বিক্রয় ও ব্যবসা', english: 'Sales & Trade' },
      { id: 73, name: '৭৩. উত্তম চরিত্র ও শিষ্টাচার', english: 'Good Manners' },
      { id: 78, name: '৭৮. দু\'আ ও যিকির', english: 'Invocations' }
    ]
  },
  {
    id: 'muslim',
    name: 'সহীহ মুসলিম',
    arabicName: 'صحيح مسلم',
    englishName: 'Sahih Muslim',
    totalHadith: '৭,৫০০',
    desc: 'সহীহ বুখারীর পরই সবচেয়ে মর্যাদাপূর্ণ হাদিস গ্রন্থ',
    defaultSection: 1,
    sections: [
      { id: 1, name: '১. ঈমান ও ইসলাম (হাদিসে জিবরীল)', english: 'The Book of Faith' },
      { id: 2, name: '২. পবিত্রতা (তাহারাত)', english: 'Purification' },
      { id: 4, name: '৪. সালাত (নামাজ)', english: 'Prayers' },
      { id: 12, name: '১২. যাকাত', english: 'Zakat' },
      { id: 13, name: '১৩. সিয়াম (রোজা)', english: 'Fasting' },
      { id: 15, name: '১৫. হজ', english: 'Hajj' },
      { id: 35, name: '৩৫. যিকির, দু\'আ ও তাওবা', english: 'Remembrance & Supplication' }
    ]
  },
  {
    id: 'tirmidhi',
    name: 'জামে আত-তিরমিযী',
    arabicName: 'جامع الترمذي',
    englishName: 'Jami` at-Tirmidhi',
    totalHadith: '৩,৯৫৬',
    desc: 'ফিকহ ও হাদিসের মানের বিস্তারিত আলোচনাসমৃদ্ধ গ্রন্থ',
    defaultSection: 1,
    sections: [
      { id: 1, name: '১. পবিত্রতা', english: 'Purification' },
      { id: 2, name: '২. সালাত', english: 'Prayer' },
      { id: 3, name: '৩. যাকাত', english: 'Zakat' },
      { id: 4, name: '৪. সিয়াম', english: 'Fasting' },
      { id: 25, name: '২৫. পিতা-মাতার সদাচার ও আত্মীয়তা', english: 'Righteousness & Ties' }
    ]
  },
  {
    id: 'abudawud',
    name: 'সুনানে আবু দাউদ',
    arabicName: 'سنن أبي داود',
    englishName: 'Sunan Abi Dawud',
    totalHadith: '৫,২৭৪',
    desc: 'দৈনন্দিন আহকাম ও ফিকহি বিষয়ের অমূল্য হাদিস ভান্ডার',
    defaultSection: 1,
    sections: [
      { id: 1, name: '১. তাহারাত ও পবিত্রতা', english: 'Purification' },
      { id: 2, name: '২. সালাত', english: 'Prayer' },
      { id: 9, name: '৯. যাকাত', english: 'Zakat' },
      { id: 14, name: '১৪. সিয়াম', english: 'Fasting' }
    ]
  }
];

// Offline & Instant curated authentic Hadith fallback
const ESSENTIAL_HADITHS: Record<string, HadithItem[]> = {
  bukhari_1: [
    {
      hadithnumber: 1,
      text: "‘উমার ইবনুল খাত্তাব (রাঃ) হতে বর্ণিত। রাসূলুল্লাহ সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম বলেছেনঃ সকল কাজের ফলাফল নিয়তের উপর নির্ভরশীল। আর প্রত্যেক ব্যক্তি তাই পাবে যার সে নিয়ত করবে। অতএব যার হিজরত আল্লাহর ও তাঁর রাসূলের জন্য হবে, তার হিজরত আল্লাহ ও তাঁর রাসূলের জন্যই গণ্য হবে। আর যার হিজরত পার্থিব কোনো লাভ অর্জনের জন্য কিংবা কোনো নারীকে বিবাহ করার উদ্দেশ্যে হবে, তার হিজরত সেই উদ্দেশ্যেই গণ্য হবে যার জন্য সে হিজরত করেছে। [সহীহ বুখারী ১, মুসলিম ১৯০৭]"
    },
    {
      hadithnumber: 2,
      text: "উম্মুল মু’মিনীন ‘আয়িশাহ (রাঃ) হতে বর্ণিত। হারিস ইবনু হিশাম (রাঃ) আল্লাহর রাসূল সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম-কে জিজ্ঞেস করলেন, ‘হে আল্লাহর রাসূল! আপনার নিকট ওহী কীভাবে আসে?’ আল্লাহর রাসূল সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম বললেনঃ কোনো কোনো সময় তা ঘণ্টা বাজার মতো আমার নিকট আসে। আর এটি-ই আমার উপর সবচেয়ে বেদনাদায়ক হয় এবং তা শেষ হতেই ফেরেশতা যা বলেন আমি তা মুখস্থ করে ফেলি। আবার কখনো ফেরেশতা মানুষের রূপ ধারণ করে আমার সাথে কথা বলেন। তিনি যা বলেন আমি তা মুখস্থ করে নিই। [সহীহ বুখারী ২]"
    },
    {
      hadithnumber: 3,
      text: "উম্মুল মু’মিনীন ‘আয়িশাহ (রাঃ) বলেন, রাসূলুল্লাহ সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম-এর নিকট সর্বপ্রথম যে ওহী এসেছিল, তা ছিল নিদ্রাবস্থায় সত্য স্বপ্ন রূপে। তিনি যে স্বপ্নই দেখতেন, তা প্রত্যুষের আলোর মতো সত্য হয়ে প্রকাশ পেত। এরপর তাঁর নিকট নির্জনতা প্রিয় হয়ে ওঠে। তিনি হেরা গুহায় নির্জনে কাটাতে লাগলেন এবং সেখানে একাধারে কয়েক রাত ইবাদাত করতেন। অবশেষে সত্য সমাগত হলো। ফেরেশতা এসে বললেন, ‘পড়ুন’। তিনি বললেন, ‘আমি পড়তে জানি না।’ ফেরেশতা তাঁকে বুকে জড়িয়ে ধরে চাপ দিলেন এবং ছেড়ে দিয়ে বললেন, ‘পড়ুন আপনার প্রতিপালকের নামে যিনি সৃষ্টি করেছেন...’। [সহীহ বুখারী ৩]"
    }
  ],
  bukhari_2: [
    {
      hadithnumber: 8,
      text: "ইবনু ‘উমার (রাঃ) হতে বর্ণিত। রাসূলুল্লাহ সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম ইরশাদ করেনঃ ইসলামের ভিত্তি পাঁচটি স্তম্ভের উপর স্থাপিত। ১. এ কথার সাক্ষ্য দেওয়া যে, আল্লাহ ব্যতীত কোনো সত্য উপাস্য নেই এবং নিশ্চয়ই মুহাম্মাদ সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম আল্লাহর বান্দা ও রাসূল; ২. সালাত কায়েম করা; ৩. যাকাত আদায় করা; ৪. হজ্ব সম্পাদন করা এবং ৫. রমাযানের সিয়াম পালন করা। [সহীহ বুখারী ৮, মুসলিম ১৬]"
    },
    {
      hadithnumber: 13,
      text: "আনাস (রাঃ) হতে বর্ণিত। নবী সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম বলেছেনঃ তোমাদের কেউ ততক্ষণ পর্যন্ত প্রকৃত মুমিন হতে পারবে না, যতক্ষণ না সে তার ভাইয়ের জন্য তাই পছন্দ করে, যা সে নিজের জন্য পছন্দ করে। [সহীহ বুখারী ১৩, মুসলিম ৪৫]"
    },
    {
      hadithnumber: 15,
      text: "আবু হুরায়রা (রাঃ) হতে বর্ণিত। রাসূলুল্লাহ সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম বলেছেনঃ ঈমানের সত্তরেরও অধিক শাখা রয়েছে। তার মধ্যে সর্বোত্তম শাখা হলো ‘লা ইলাহা ইল্লাল্লাহ’ বলা এবং সর্বনিম্ন শাখা হলো রাস্তা থেকে কষ্টদায়ক বস্তু সরিয়ে ফেলা। আর লজ্জা হলো ঈমানের একটি বিশেষ শাখা। [সহীহ বুখারী ৯, মুসলিম ৩৫]"
    }
  ],
  muslim_1: [
    {
      hadithnumber: 1,
      text: "উমার ইবনুল খাত্তাব (রাঃ) হতে বর্ণিত। তিনি বলেন, একদিন আমরা রাসূলুল্লাহ সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম-এর দরবারে উপস্থিত ছিলাম। হঠাৎ ধবধবে সাদা পোশাক ও কুচকুচে কালো চুলের এক ব্যক্তি এসে নবীর সামনে বসলেন। তাঁর উভয় হাঁটু নবীর হাঁটুর সাথে মিলিয়ে দিলেন এবং উরুর উপর হাত রেখে বললেনঃ হে মুহাম্মাদ! আমাকে ইসলাম সম্পর্কে বলুন। রাসূলুল্লাহ বললেনঃ ইসলাম হলো তুমি সাক্ষ্য দেবে আল্লাহ ছাড়া কোনো সত্য উপাস্য নেই এবং মুহাম্মাদ আল্লাহর রাসূল, সালাত কায়েম করবে, যাকাত দেবে, রমযানের রোজা রাখবে এবং সামর্থ্য থাকলে বায়তুল্লাহর হজ্ব করবে। লোকটি বললেন, সত্য বলেছেন। অতঃপর বললেন, আমাকে ঈমান সম্পর্কে বলুন। রাসূল বললেনঃ ঈমান হলো তুমি বিশ্বাস স্থাপন করবে আল্লাহর প্রতি, তাঁর ফেরেশতাগণের প্রতি, তাঁর কিতাবসমূহের প্রতি, তাঁর রাসূলগণের প্রতি, পরকালের প্রতি এবং তাকদীরের ভালো-মন্দের প্রতি। লোকটি বললেন, আপনি সত্য বলেছেন। অতঃপর লোকটি চলে গেলে রাসূলুল্লাহ বললেনঃ ইনি ছিলেন জিবরীল (আঃ), তিনি তোমাদেরকে তোমাদের দ্বীন শিক্ষা দিতে এসেছিলেন। [সহীহ মুসলিম ১]"
    }
  ]
};

// Daily Hadith of the day inspirations
const DAILY_HADITHS = [
  {
    book: 'সহীহ বুখারী',
    number: '১৩',
    text: 'তোমাদের কেউ ততক্ষণ পর্যন্ত প্রকৃত মুমিন হতে পারবে না, যতক্ষণ না সে তার অপর ভাইয়ের জন্য তাই পছন্দ করবে, যা সে নিজের জন্য পছন্দ করে।',
    narrator: 'হযরত আনাস (রাঃ)',
    theme: 'ভ্রাতৃত্ব ও সহমর্মিতা'
  },
  {
    book: 'সহীহ বুখারী',
    number: '১',
    text: 'নিশ্চয়ই প্রতিটি কাজের ফলাফল নিয়তের উপর নির্ভরশীল। আর প্রত্যেক ব্যক্তি তার নিয়ত অনুযায়ীই প্রতিফল পাবে।',
    narrator: 'হযরত উমর ইবনুল খাত্তাব (রাঃ)',
    theme: 'বিশুদ্ধ নিয়ত ও ইখলাস'
  },
  {
    book: 'সহীহ মুসলিম',
    number: '২২৩',
    text: 'পবিত্রতা ও পরিচ্ছন্নতা ঈমানের অর্ধেক। আলহামদুলিল্লাহ মিজান বা আমলের পাল্লাকে পূর্ণ করে দেয়।',
    narrator: 'হযরত আবু মালিক আল-আশ’আরী (রাঃ)',
    theme: 'পবিত্রতা ও যিকির'
  },
  {
    book: 'জামে আত-তিরমিযী',
    number: '১৯৫৬',
    text: 'তোমার ভাইয়ের মুখের সামনে একটু মুচকি হাসি উপহার দেওয়াও তোমার জন্য একটি সদকা স্বরূপ।',
    narrator: 'হযরত আবু যার (রাঃ)',
    theme: 'উত্তম চরিত্র ও সদকা'
  }
];

// In-memory cache for full hadith books so downloads only happen once
const fullBookCache = new Map<string, HadithItem[]>();
const sectionCache = new Map<string, HadithItem[]>();

export const HadithView: React.FC = () => {
  const { theme } = useAppStore();
  const [selectedBook, setSelectedBook] = useState<string>('bukhari');
  const [viewMode, setViewMode] = useState<'all' | 'section'>('all'); // Default to All Hadiths Together as requested
  const [selectedSection, setSelectedSection] = useState<number>(1);
  const [hadiths, setHadiths] = useState<HadithItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [jumpNumber, setJumpNumber] = useState<string>('');
  const [displayCount, setDisplayCount] = useState<number>(30);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [savedHadiths, setSavedHadiths] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('quran_saved_hadiths') || '[]');
    } catch {
      return [];
    }
  });

  const currentBookObj = useMemo(() => {
    return HADITH_BOOKS.find(b => b.id === selectedBook) || HADITH_BOOKS[0];
  }, [selectedBook]);

  // Reset display count when book or mode changes
  useEffect(() => {
    setDisplayCount(30);
    setJumpNumber('');
  }, [selectedBook, viewMode, selectedSection]);

  // Today's Hadith rotation based on day of month
  const todayHadith = useMemo(() => {
    const day = new Date().getDate();
    return DAILY_HADITHS[day % DAILY_HADITHS.length];
  }, []);

  // Fetch Hadiths: Supports BOTH All-Hadiths-Together and Chapter-Wise
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    if (viewMode === 'all') {
      // Check full book cache
      if (fullBookCache.has(selectedBook)) {
        setHadiths(fullBookCache.get(selectedBook)!);
        setLoading(false);
        return;
      }

      // Fetch the full book (e.g. ben-bukhari.min.json)
      fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ben-${selectedBook}.min.json`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to load full book');
          return res.json();
        })
        .then(data => {
          if (isMounted && data && Array.isArray(data.hadiths) && data.hadiths.length > 0) {
            fullBookCache.set(selectedBook, data.hadiths);
            setHadiths(data.hadiths);
          } else if (isMounted) {
            const fallbackList = ESSENTIAL_HADITHS[`${selectedBook}_1`] || ESSENTIAL_HADITHS['bukhari_1'];
            setHadiths(fallbackList);
          }
        })
        .catch(err => {
          console.warn('Hadith API full book notice:', err);
          if (isMounted) {
            const fallbackList = ESSENTIAL_HADITHS[`${selectedBook}_1`] || ESSENTIAL_HADITHS['bukhari_1'];
            setHadiths(fallbackList);
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      // Fetch specific section
      const cacheKey = `${selectedBook}_${selectedSection}`;
      if (sectionCache.has(cacheKey)) {
        setHadiths(sectionCache.get(cacheKey)!);
        setLoading(false);
        return;
      }

      const fallbackList = ESSENTIAL_HADITHS[cacheKey] || ESSENTIAL_HADITHS[`${selectedBook}_1`] || ESSENTIAL_HADITHS['bukhari_1'];

      fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ben-${selectedBook}/sections/${selectedSection}.json`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to load online hadith section');
          return res.json();
        })
        .then(data => {
          if (isMounted && data && Array.isArray(data.hadiths) && data.hadiths.length > 0) {
            sectionCache.set(cacheKey, data.hadiths);
            setHadiths(data.hadiths);
          } else if (isMounted) {
            setHadiths(fallbackList);
          }
        })
        .catch(err => {
          console.warn('Hadith section notice:', err);
          if (isMounted) {
            setHadiths(fallbackList);
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [selectedBook, viewMode, selectedSection]);

  const handleCopyHadith = async (item: HadithItem) => {
    const textToCopy = `[${currentBookObj.name} - হাদিস নং ${item.hadithnumber}]\n\n${item.text}\n\nউৎস: আল-কুরআনুল কারীম অ্যাপ`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(item.hadithnumber);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShareHadith = async (item: HadithItem) => {
    const textToShare = `[${currentBookObj.name} - হাদিস নং ${item.hadithnumber}]\n\n${item.text}\n\n— আল-কুরআনুল কারীম`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${currentBookObj.name} হাদিস নং ${item.hadithnumber}`,
          text: textToShare
        });
      } catch (err) {
        handleCopyHadith(item);
      }
    } else {
      handleCopyHadith(item);
    }
  };

  const toggleSaveHadith = (id: number) => {
    setSavedHadiths(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('quran_saved_hadiths', JSON.stringify(next));
      return next;
    });
  };

  // Jump to specific hadith number
  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseInt(jumpNumber.trim(), 10);
    if (isNaN(targetNum)) return;

    // Find index of this hadith
    const index = hadiths.findIndex(h => h.hadithnumber === targetNum);
    if (index !== -1) {
      if (index >= displayCount) {
        setDisplayCount(index + 10);
      }
      setTimeout(() => {
        const el = document.getElementById(`hadith-${targetNum}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-[var(--primary)]');
          setTimeout(() => el.classList.remove('ring-2', 'ring-[var(--primary)]'), 2500);
        }
      }, 100);
    }
  };

  const filteredHadiths = useMemo(() => {
    if (!searchQuery.trim()) return hadiths;
    const q = searchQuery.toLowerCase();
    return hadiths.filter(h => 
      h.text.toLowerCase().includes(q) ||
      h.hadithnumber.toString().includes(q)
    );
  }, [hadiths, searchQuery]);

  const displayedHadiths = useMemo(() => {
    if (searchQuery.trim()) {
      return filteredHadiths.slice(0, 100); // show up to 100 search matches
    }
    return filteredHadiths.slice(0, displayCount);
  }, [filteredHadiths, displayCount, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-bengali space-y-6 pb-28">
      {/* Page Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600/15 via-[var(--primary)]/10 to-transparent border border-[var(--border)] p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-bold font-sans">
            <BookMarked className="w-3.5 h-3.5" />
            <span>AUTHENTIC HADITH COLLECTION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] tracking-tight font-sans">
            হাদিস শরিফ সংকলন
          </h1>
          <p className="text-sm text-[var(--text-muted)] max-w-xl leading-relaxed">
            রাসূলুল্লাহ সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম-এর বিশুদ্ধ বাণী, আমল ও সুন্নাহর প্রামাণ্য বাংলা অনুবাদ। সরাসরি সিহাহ সিত্তাহ ও গ্রহণযোগ্য কিতাবসমূহ থেকে সংকলিত।
          </p>
        </div>
      </div>

      {/* Hadith of the Day Card */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-amber-500/30 p-5 sm:p-6 relative overflow-hidden shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                আজকের নির্বাচিত হাদিস
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">{todayHadith.theme}</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border)]">
            {todayHadith.book} : {todayHadith.number}
          </span>
        </div>
        <p className="text-base sm:text-lg font-semibold text-[var(--text-main)] leading-relaxed italic my-3">
          “{todayHadith.text}”
        </p>
        <div className="text-right text-xs text-[var(--primary)] font-bold">
          — {todayHadith.narrator}
        </div>
      </div>

      {/* Book Tabs Selector */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">
          হাদিস গ্রন্থ নির্বাচন করুন
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {HADITH_BOOKS.map(book => {
            const isSelected = selectedBook === book.id;
            return (
              <button
                key={book.id}
                onClick={() => {
                  setSelectedBook(book.id);
                  setSelectedSection(book.defaultSection);
                }}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden active:scale-98 ${
                  isSelected
                    ? 'bg-[var(--primary-soft)] border-[var(--primary)] text-[var(--text-main)] shadow-sm'
                    : 'bg-[var(--bg-surface)] border-[var(--border)] hover:bg-[var(--bg-main)] text-[var(--text-muted)]'
                }`}
              >
                <div className="font-bold text-sm text-[var(--text-main)] truncate">
                  {book.name}
                </div>
                <div className="text-[11px] opacity-70 font-sans truncate mt-0.5">
                  {book.englishName}
                </div>
                <div className="text-[10px] text-[var(--primary)] font-semibold mt-2">
                  মোট {book.totalHadith} হাদিস
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--primary)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* View Mode Toggle: All Hadiths vs Chapter-wise */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)]">
        <button
          type="button"
          onClick={() => setViewMode('all')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            viewMode === 'all'
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>সবগুলো হাদিস একসাথে ({currentBookObj.totalHadith})</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('section')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            viewMode === 'section'
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)]'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>অধ্যায় বা বিষয়ভিত্তিক</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="space-y-3 bg-[var(--bg-surface)] p-4 sm:p-5 rounded-3xl border border-[var(--border)]">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* If Chapter Mode, Show Chapter Dropdown */}
          {viewMode === 'section' && (
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
                অধ্যায় বা কিতাব নির্বাচন
              </label>
              <select
                value={selectedSection}
                onChange={e => setSelectedSection(Number(e.target.value))}
                className="w-full bg-[var(--bg-main)] text-[var(--text-main)] font-semibold text-sm rounded-xl px-3.5 py-2.5 border border-[var(--border)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]/30 cursor-pointer"
              >
                {currentBookObj.sections.map(sec => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} ({sec.english})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Keyword Search Field */}
          <div className={viewMode === 'section' ? 'sm:col-span-6' : 'sm:col-span-8'}>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
              হাদিসের বিষয় বা শব্দ দিয়ে খুঁজুন
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="যেমন: নিয়ত, ওযু, নামাজ, পিতা-মাতা, রোজা..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm rounded-xl pl-9 pr-4 py-2.5 border border-[var(--border)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]/30 placeholder-[var(--text-muted)]"
              />
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3" />
            </div>
          </div>

          {/* Jump directly to Hadith # in All Mode */}
          {viewMode === 'all' && (
            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
                হাদিস নম্বরে সরাসরি যান
              </label>
              <form onSubmit={handleJump} className="flex gap-2">
                <input
                  type="number"
                  placeholder="যেমন: ১, ৫০, ১২০..."
                  value={jumpNumber}
                  onChange={e => setJumpNumber(e.target.value)}
                  min="1"
                  className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm rounded-xl px-3 py-2.5 border border-[var(--border)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]/30"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-bold whitespace-nowrap hover:opacity-90 active:scale-95 transition-all"
                >
                  যান
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Hadith List Header Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--text-main)]">
            {currentBookObj.name}
          </span>
          <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
          <span className="text-xs text-[var(--text-muted)] font-semibold">
            {viewMode === 'all'
              ? `মোট ${hadiths.length}টি হাদিস লোড রয়েছে`
              : `${filteredHadiths.length}টি হাদিস রয়েছে`}
          </span>
        </div>
        {loading ? (
          <span className="text-xs text-[var(--primary)] font-bold flex items-center gap-1.5 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> অনলাইন থেকে সকল হাদিস লোড হচ্ছে...
          </span>
        ) : (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> অফলাইন ক্যাশ সচল
          </span>
        )}
      </div>

      {/* Hadiths Cards */}
      <div className="space-y-4">
        {loading && hadiths.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-[var(--bg-surface)] rounded-3xl border border-[var(--border)]">
            <RefreshCw className="w-8 h-8 text-[var(--primary)] animate-spin mx-auto opacity-70" />
            <p className="text-sm font-bold text-[var(--text-main)]">
              {currentBookObj.name}-এর সকল হাদিস অনলাইন থেকে লোড করা হচ্ছে...
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              একবার লোড হয়ে গেলে ব্রাউজার ক্যাশে সংরক্ষিত থাকবে
            </p>
          </div>
        ) : displayedHadiths.length === 0 ? (
          <div className="py-12 text-center bg-[var(--bg-surface)] rounded-3xl border border-[var(--border)] p-6">
            <Info className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-[var(--text-muted)]">
              "{searchQuery}" দিয়ে কোনো হাদিস খুঁজে পাওয়া যায়নি।
            </p>
          </div>
        ) : (
          <>
            {displayedHadiths.map(item => {
              const isSaved = savedHadiths.includes(item.hadithnumber);
              const isCopied = copiedId === item.hadithnumber;

              return (
                <motion.div
                  key={item.hadithnumber}
                  id={`hadith-${item.hadithnumber}`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-xs space-y-4 hover:border-[var(--primary)]/40 transition-all group"
                >
                  {/* Hadith Top meta bar */}
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] font-bold text-xs font-sans">
                        হাদিস #{item.hadithnumber}
                      </span>
                      <span className="text-xs font-semibold text-[var(--text-muted)]">
                        {currentBookObj.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => toggleSaveHadith(item.hadithnumber)}
                        className={`p-2 rounded-full transition-colors ${
                          isSaved 
                            ? 'text-rose-500 bg-rose-500/10' 
                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)]'
                        }`}
                        title="সংরক্ষণ করুন"
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleCopyHadith(item)}
                        className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)] transition-colors"
                        title="হাদিস কপি করুন"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleShareHadith(item)}
                        className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)] transition-colors"
                        title="হাদিস শেয়ার করুন"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Hadith Bengali Content */}
                  <div className="text-[var(--text-main)] leading-relaxed text-base sm:text-lg font-medium whitespace-pre-line selection:bg-amber-500/20">
                    {item.text}
                  </div>

                  {/* Card footer */}
                  <div className="flex items-center justify-between pt-2 text-xs text-[var(--text-muted)]">
                    <div className="flex items-center gap-1.5 font-sans text-[11px] text-[var(--primary)] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>সহীহ হাদিস সূত্র</span>
                    </div>
                    {isCopied && (
                      <span className="text-emerald-500 font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> কপি হয়েছে!
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Load More Trigger Button for Progressive Display */}
            {!searchQuery.trim() && displayedHadiths.length < filteredHadiths.length && (
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDisplayCount(prev => prev + 50)}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-bold shadow-sm hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <span>আরও ৫০টি হাদিস দেখুন (বাকি {filteredHadiths.length - displayedHadiths.length}টি)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayCount(filteredHadiths.length)}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[var(--bg-surface)] text-[var(--text-main)] text-sm font-semibold border border-[var(--border)] hover:bg-[var(--bg-main)] transition-all"
                >
                  <span>সকল {filteredHadiths.length}টি একসাথে লোড করুন</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
