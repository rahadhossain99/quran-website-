import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Check, 
  HelpCircle,
  Clock, 
  Smartphone,
  CheckCircle,
  HelpCircle as QuestionIcon,
  ChevronRight,
  ChevronDown,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GuideStep {
  title: string;
  arabic?: string;
  transliteration?: string;
  translation?: string;
  description: string;
}

const WUDU_STEPS: GuideStep[] = [
  {
    title: '১. নিয়ত ও বিসমিল্লাহ',
    description: 'মনে মনে অজু করার সংকল্প বা নিয়ত করুন এবং "বিসমিল্লাহির রাহমানির রাহিম" বলে শুরু করুন।'
  },
  {
    title: '২. দুই হাত ধোয়া',
    description: 'কবজি পর্যন্ত দুই হাত ভালো করে তিনবার ধৌত করুন। আঙুলগুলো খিলাল করুন অর্থাৎ এক হাতের আঙুল অন্য হাতের ভেতর ঢুকিয়ে পরিষ্কার করুন।'
  },
  {
    title: '৩. কুলি করা',
    description: 'ডান হাত দিয়ে মুখে পানি নিয়ে ভালো করে মুখের ভেতর জড়িয়ে তিনবার কুলি করুন। রোযা না থাকলে গলগলা করে কুলি করা ভালো।'
  },
  {
    title: '৪. নাকে পানি দেওয়া',
    description: 'ডান হাত দিয়ে নাকে পানি তিনবার প্রবেশ করান এবং বাম হাত দিয়ে নাক ঝেড়ে পরিষ্কার করুন।'
  },
  {
    title: '৫. সমস্ত মুখমন্ডল ধোয়া',
    description: 'কপালের উপরিভাগ (যেখান থেকে সাধারণত চুল গজায়) থেকে শুরু করে থুতনির নিচে এবং এক কানের লতি থেকে অন্য কানের লতি পর্যন্ত পুরো মুখমন্ডল তিনবার ধৌত করুন।'
  },
  {
    title: '৬. দুই হাত ধোয়া (কনুইসহ)',
    description: 'প্রথমে ডান হাত এবং পরে বাম হাত আঙুলের ডগা থেকে শুরু করে কনুইয়ের উপর পর্যন্ত ভালো করে তিনবার ধৌত করুন।'
  },
  {
    title: '৭. মাথা ও কান মাসেহ করা',
    description: 'পানি দিয়ে নতুন করে হাত ভেজাতে হবে এবং দুই হাত দিয়ে পুরো মাথার চুল একবার মাসেহ করতে হবে। চুলের শুরু হতে শেষ অংশ এবং কানের ভেতরের অংশ মাসেহ করুন।'
  },
  {
    title: '৮. দুই পা ধোয়া (টাখনুসহ)',
    description: 'প্রথমে ডান পা ও পরে বাম পা টাখনু বা গিরার উপর পর্যন্ত ভালো করে তিনবার ধৌত করুন। আঙুলগুলোর ফাঁকা অংশ ভালো করে পরিষ্কার করুন।'
  }
];

const SALAH_STEPS: GuideStep[] = [
  {
    title: '১. নিয়ত ও তকবিরে তাহরিমা',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'আল্লাহু আকবার',
    translation: 'আল্লাহ সবচেয়ে মহান',
    description: 'কিবলামুখী হয়ে সোজা হয়ে দাঁড়ান। মনে মনে নিয়ত করে দুই হাত কানের লতি পর্যন্ত তুলুন (নারীদের জন্য কাঁধ পর্যন্ত) এবং হাত বাঁধার আগে "আল্লাহু আকবার" বলুন।'
  },
  {
    title: '২. কিয়াম বা হাত বেঁধে দাঁড়ানো',
    description: 'ডান হাত বাম হাতের ওপর রেখে নাভির নিচে বাঁধুন (নারীদের জন্য বুকের ওপর)। এই দাঁড়িয়ে থাকাকে কিয়াম বলে। দৃষ্টি থাকবে সিজদার জায়গার দিকে। দাঁড়িয়ে ছানা পাঠ করুন।'
  },
  {
    title: '৩. সূরা ফাতিহা ও অন্য সূরা মেলানো',
    description: 'ছানা পাঠের পর আউযুবিল্লাহ... ও বিসমিল্লাহ... বলে সূরা ফাতিহা পুরোটা পড়ুন। এরপর অন্য যেকোনো একটি সূরা বা অন্তত ৩টি ছোট আয়াত পাঠ করুন।'
  },
  {
    title: '৪. রুকু বা ঝুঁকে পড়া',
    arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
    transliteration: 'সুবহানা রাব্বিয়াল আজিম (তিনবার বা ততোধিক)',
    translation: 'আমার মহান প্রতিপালকের পবিত্রতা ঘোষণা করছি।',
    description: '"আল্লাহু আকবার" বলে দুই হাত হাঁটুতে রেখে পিঠ সোজা করে ঝুঁকে যান। হাতের আঙুল প্রসারিত করে হাঁটু জড়িয়ে ধরুন এবং তাসবিহ অন্তত ৩ বার পাঠ করুন।'
  },
  {
    title: '৫. কওমা বা রুকু হতে খাড়া হওয়া',
    arabic: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ ۝ رَبَّنَا وَلَكَ الْحَمْدُ',
    transliteration: 'সামিআল্লাহু লিমান হামিদাহ (খাড়া হওয়ার সময়) • রাব্বানা লাকাল হামদ (খাড়া হয়ে দাঁড়িয়ে)',
    translation: 'আল্লাহ তার প্রশংসা শুনলেন যিনি তার প্রশংসা করল। • হে আমাদের প্রতিপালক! সমস্ত প্রশংসা কেবল তোমারই।',
    description: 'রুকু হতে সোজা হয়ে দাঁড়ান এবং তাসবিহগুলো আদায় করুন।'
  },
  {
    title: '৬. সিজদাহ বা মাটিতে মাথা রাখা',
    arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
    transliteration: 'সুবহানা রাব্বিয়াল আলা (তিনবার বা ততোধিক)',
    translation: 'আমার সর্বোচ্চ মহিমান্বিত রবের পবিত্রতা ঘোষণা করছি।',
    description: '"আল্লাহু আকবার" বলে প্রথমে হাঁটু, তারপর হাত, নাক ও সবশেষে কপাল মাটিতে রেখে সিজদা করুন। দুই সিজদার মাঝখানে সোজা হয়ে বসুন এবং অন্তত ৩ বার তাসবিহ বলুন।'
  },
  {
    title: '৭. বৈঠক ও তাশাহহুদ',
    description: 'দুই সিজদা ও দ্বিতীয় বা চতুর্থ রাকাতে সোজা হয়ে বসুন। বাম পা বিছিয়ে তার ওপর বসুন এবং ডান পা খাড়া রাখুন। হাত দুটো উরুর ওপর রেখে তাশাহহুদ, দরূদ ও দোয়া মাসূরা পাঠ করুন।'
  },
  {
    title: '৮. সালাম ফেরানো',
    arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ',
    transliteration: 'আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ',
    translation: 'আপনাদের ওপর শান্তি ও আল্লাহর রহমত বর্ষিত হোক।',
    description: 'প্রথমে ডান দিকে ঘাড় ঘুরিয়ে এবং পরে বাম দিকে ঘাড় ঘুরিয়ে সালাম ফেরানোর মাধ্যমে সালাত সম্পন্ন করুন।'
  }
];

const ESSENTIAL_DUAS = [
  {
    name: 'ছানা (Sana)',
    context: 'সালাত শুরুর পর হাত বেঁধে হাত বাঁধার পরপরই পড়তে হয়',
    arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ ، وَتَبَارَكَ اسْمُكَ ، وَتَعَالَى جَدُّكَ ، وَلَا إِلَهَ غَيْرُكَ',
    transliteration: 'সুবহানাকা আল্লাহুম্মা ওয়া বিহামদিকা, ওয়া তাবারাকাসমুকা, ওয়া তাআলা জাদ্দুকা, ওয়া লা ইলাহা গাইরুকা।',
    translation: 'হে আল্লাহ! আমি তোমার প্রশংসা সহকারে পবিত্রতা ঘোষণা করছি। তোমার নাম কল্যাণময় এবং তোমার মর্যাদা অতি উচ্চ এবং তুমি ছাড়া আর কোনো উপাস্য নেই।'
  },
  {
    name: 'তাশাহহুদ (Tashahhud)',
    context: 'দ্বিতীয় ও শেষ রাকাতে বৈঠকে বসার পর পড়তে হয়',
    arabic: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    transliteration: 'আত্তাহিয়্যাতু লিল্লাহি ওয়াস সালাওয়াতু ওয়াত তায়্যিবাতু, আসসালামু আলাইকা আইয়্যুহান নাবিয়্যু ওয়া রহমাতুল্লাহি ওয়া বারাকাতুহু, আসসালামু আলাইনা ওয়া আলা ইবাদিল্লাহিস সালিহীন, আশহাদু আল লা ইলাহা ইল্লাল্লাহু ওয়া আশহাদু আন্না মুহাম্মাদান আবদুহু ওয়া রাসুলুহু।',
    translation: 'সমস্ত সম্মানজনক সম্ভাষণ, সালাত ও পবিত্রতা আল্লাহর জন্য। হে নবী! আপনার ওপর শান্তি, আল্লাহর রহমত ও বরকত বর্ষিত হোক। শান্তি আমাদের ওপর এবং আল্লাহর নেক বান্দাদের ওপর বর্ষিত হোক। আমি সাক্ষ্য দিচ্ছি যে, আল্লাহ ছাড়া আর কোনো উপাস্য নেই এবং আমি আরও সাক্ষ্য দিচ্ছি যে, মুহাম্মদ আল্লাহর বান্দা ও তাঁর রাসূল।'
  },
  {
    name: 'দরূদে ইব্রাহিম (Durood Ibrahim)',
    context: 'তাশাহহুদের পর শেষ রাকাতে বৈঠকে পড়তে হয়',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
    transliteration: 'আল্লাহুম্মা সাল্লি আলা মুহাম্মাদিওঁ ওয়া আলা আলি মুহাম্মাদীন, কামা সাল্লাইতা আলা ইব্রাহীমা ওয়া আলা আলি ইব্রাহীমা, ইন্নাকা হামীদুম মাজীদ। আল্লাহুম্মা বারিক আলা মুহাম্মাদিওঁ ওয়া আলা আলি মুহাম্মাদীন, কামা বারাকতা আলা ইব্রাহীমা ওয়া আলা আলি ইব্রাহীমা, ইন্নাকা হামীদুম মাজীদ।',
    translation: 'হে আল্লাহ! মুহাম্মদ (সা.) এবং তাঁর বংশধরদের ওপর রহমত বর্ষণ করো, যেমন তুমি ইব্রাহিম (আ.) এবং তাঁর বংশধরদের ওপর রহমত বর্ষণ করেছিলে। নিশ্চয়ই তুমি অতি প্রশংসিত ও মহিমান্বিত। হে আল্লাহ! মুহাম্মদ (সা.) এবং তাঁর বংশধরদের ওপর বরকত বর্ষণ করো, যেমন তুমি ইব্রাহিম (আ.) এবং তাঁর বংশধরদের ওপর বরকত বর্ষণ করেছিলে। নিশ্চয়ই তুমি অতি প্রশংসিত ও মহিমান্বিত।'
  },
  {
    name: 'দোয়া মাসূরা (Dua Masura)',
    context: 'দরূদ পাঠের পর সালাম ফেরানোর পূর্বে পাঠ করার দুআ',
    arabic: 'اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ ، فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ وَارْحَمْنِي إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ',
    transliteration: 'আল্লাহুম্মা ইন্নি জালামতু নাফসি জুলমান কাসীরাওঁ ওয়ালা ইয়াগফিরুজ জুনুবা ইল্লা আন্তা, ফাগফিরলী মাগফিরাতাম মিন ইনদিকা ওয়ারহামনী ইন্নাকা আন্তাল গাফুরুর রাহীম।',
    translation: 'হে আল্লাহ! আমি নিজের ওপর অনেক জুলুম করেছি। আর তুমি ছাড়া গুনাহ ক্ষমা করার কেউ নেই। অতএব তুমি তোমার অশেষ অনুগ্রহে আমাকে ক্ষমা করো এবং আমার ওপর দয়া করো। নিশ্চয়ই তুমি ক্ষমাশীল ও পরম দয়ালু।'
  },
  {
    name: 'দোয়া কুনুত (Dua Qunut)',
    context: 'বিতর সালাতের শেষ রাকাতে সূরা মেলানোর পর পড়ার বিশেষ দুআ',
    arabic: 'اللَّهُمَّ إِنَّا نَسْتَعِينُكَ وَنَسْتَغْفِرُكَ وَنُؤْمِنُ بِكَ وَنَتَوَكَّلُ عَلَيْكَ وَنُثْنِي عَلَيْكَ الْخَيْرَ وَنَشْكُرُكَ وَلَا نَكْفُرُكَ وَنَخْلَعُ وَنَتْرُكُ مَنْ يَفْجُرُكَ ، اللَّهُمَّ إِيَّاكَ نَعْبُدُ وَلَكَ نُصَلِّي وَنَسْجُدُ وَإِلَيْكَ نَسْعَى وَنَحْفِدُ وَنَرْجُو رَحْمَتَكَ وَنَخْشَى عَذَابَكَ إِنَّ عَذَابَكَ بِالْكُفَّارِ مُلْحِقٌ',
    transliteration: 'আল্লাহুম্মা ইন্না নাস্তাইনুকা ওয়া নাস্তাগফিরুকা ওয়া নু’মিনু বিকা ওয়া নাতাওয়াক্কালু আলাইকা ওয়া নুছনী আলাইকাল খায়রা ওয়া নাশকুরুকা ওয়া লা নাকফুরুকা ওয়া নাখলাউ ওয়া নাতরুকু মাইঁ ইয়াফজুরুক। আল্লাহুম্মা ইয়্যাকা নাবুদু ওয়া লাকা নুসল্লী ওয়া নাসজুদু ওয়া ইলাইকা নাস’আ ওয়ানাহফিদু ওয়ানারজু রাহমাতাকা ওয়ানাখশা আজাবাকা ইন্না আজাবাকা বিল কুফফারি মুলহিক।',
    translation: 'হে আল্লাহ! আমরা তোমারই সাহায্য চাই, তোমারই নিকট ক্ষমা প্রার্থনা করি, তোমার ওপর বিশ্বাস রাখি, তোমার ওপর ভরসা করি এবং তোমার উত্তম প্রশংসা করি। আমরা তোমার কৃতজ্ঞতা প্রকাশ করি, অকৃতজ্ঞ হই না। যারা তোমার অবাধ্য হয় তাদের ছেড়ে দিই ও তাদের সাথে সম্পর্ক ছিন্ন করি। হে আল্লাহ! আমরা কেবল তোমারই ইবাদত করি, তোমারই উদ্দেশ্যে সালাত আদায় করি ও সিজদা করি। তোমার নিকটেই আসার চেষ্টা করি ও সদা উপস্থিত থাকি। আমরা তোমার রহমতের আশা করি এবং তোমার আযাবকে ভয় করি। নিশ্চয়ই তোমার আযাব কাফেরদের গ্রাস করবে।'
  }
];

const COMMON_MISTAKES = [
  {
    mistake: '১. রুকু ও সিজদায় তাড়াতাড়ি করা',
    fix: 'রুকু বা সিজদায় গিয়ে অন্তত ৩ বার শান্তভাবে তাসবিহ পড়ুন। রাসূলুল্লাহ (সা.) রুকু-সিজদা অত্যন্ত ধীরস্থিরভাবে ও পূর্ণ স্থিরতা সহকারে লম্বা সময় আদায় করতেন।'
  },
  {
    mistake: '২. সিজদার সময় দুই হাতের কনুই মাটিতে বিছিয়ে রাখা',
    fix: 'পুরুষদের জন্য সিজদা করার সময় দুই কনুই মাটি হতে ও পাঞ্জা বা পাঁজর হতে দূরে রাখতে হবে। তবে নারীরা নিজেকে গুটিয়ে নিয়ে কনুই মাটির সাথে সামান্য রাখতে পারেন।'
  },
  {
    mistake: '৩. সূরা তিলাওয়াত করার সময় ভুল ও দ্রুত পাঠ করা',
    fix: 'কুরআন তিলাওয়াত স্পষ্ট ও বিশুদ্ধভাবে ধীরস্থির গতিতে তরতীবের সাথে করতে হবে। তাড়াহুড়ো করে পড়লে অর্থের বিকৃতি ঘটতে পারে।'
  },
  {
    mistake: '৪. সিজদার সময় দুই পা সম্পূর্ণ মাটি হতে ওপরে তুলে ফেলা',
    fix: 'সিজদার সময় পায়ের আঙুল অবশ্যই মাটির সাথে লেগে থাকতে হবে। অন্তত একটি আঙুল মাটির সাথে স্থির থাকা ওয়াজিব এবং দুই পা সম্পূর্ণ তুলে ফেললে সিজদা বাতিল হয়ে যেতে পারে।'
  },
  {
    mistake: '৫. সিজদার স্থান ছাড়া অন্যদিকে দৃষ্টি রাখা',
    fix: 'সালাতে দাঁড়িয়ে থাকা অবস্থায় আপনার চোখ বা দৃষ্টি থাকবে সর্বদা সিজদার স্থানে। ডানে-বামে বা ওপরে তাকালে মনোযোগ নষ্ট হয় এবং এটি সালাতের মার্জিত আচরণের খেলাফ।'
  }
];

export const SalahGuideView = () => {
  const [activeTab, setActiveTab] = useState<'prep' | 'steps' | 'duas' | 'mistakes'>('prep');
  const [expandedDuas, setExpandedDuas] = useState<Record<number, boolean>>({});
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});

  const toggleDua = (idx: number) => {
    setExpandedDuas(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const toggleStep = (idx: number) => {
    setExpandedSteps(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full select-none" id="salah-guide-screen">
      {/* Title Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 w-max px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/10 mb-2">
          <BookOpen className="w-3.5 h-3.5 mr-1" />
          <span>ইসলামিক জ্ঞানভান্ডার ও আমল সেকশন</span>
        </div>
        <h1 className="text-2xl font-black text-[var(--text-main)] tracking-tight font-bengali">সহজ ও বিশুদ্ধ সালাত শিক্ষা গাইড</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1 font-sans">Learn how to make proper Ablution (Wudu), steps to perform prayers correctly, and read all essential Salah supplications.</p>
      </div>

      {/* Guide Tabs Selector (Prep, Steps, Duas, Mistakes) */}
      <div className="flex bg-[var(--bg-surface)] p-2 rounded-2xl border border-[var(--border)] mb-6 overflow-x-auto scrollbar-none font-bengali">
        <button
          onClick={() => setActiveTab('prep')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold text-center shrink-0 rounded-xl transition-all cursor-pointer ${
            activeTab === 'prep'
              ? 'bg-[var(--primary)] text-white shadow-md'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          ওজু ও প্রস্তুতি
        </button>
        <button
          onClick={() => setActiveTab('steps')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold text-center shrink-0 rounded-xl transition-all cursor-pointer ${
            activeTab === 'steps'
              ? 'bg-[var(--primary)] text-white shadow-md'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          সালাতের নিয়ম
        </button>
        <button
          onClick={() => setActiveTab('duas')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold text-center shrink-0 rounded-xl transition-all cursor-pointer ${
            activeTab === 'duas'
              ? 'bg-[var(--primary)] text-white shadow-md'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          প্রয়োজনীয় দোয়া
        </button>
        <button
          onClick={() => setActiveTab('mistakes')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold text-center shrink-0 rounded-xl transition-all cursor-pointer ${
            activeTab === 'mistakes'
              ? 'bg-[var(--primary)] text-white shadow-md'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          সাধারণ ভুলত্রুটি
        </button>
      </div>

      {/* Dynamic Tab Content Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* TAB 1: prep (Wudu Steps) */}
          {activeTab === 'prep' && (
            <div className="bg-[var(--bg-surface)] rounded-[2.5rem] border border-[var(--border)] p-6 shadow-sm relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-bl-full blur-xl pointer-events-none" />
              
              <div className="flex items-center space-x-3 mb-5 border-b border-[var(--border)] border-dashed pb-4">
                <div className="w-10 h-10 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center border border-teal-500/10 font-bold text-lg">💡</div>
                <div>
                  <h3 className="font-extrabold text-base text-[var(--text-main)] font-bengali">অজু করার সঠিক নিয়মতান্ত্রিক ধারাবাহিকতা</h3>
                  <p className="text-[10px] text-[var(--text-muted)] font-sans">Step-by-step guidance to perform pure Ablution before prayers.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WUDU_STEPS.map((step, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 bg-[var(--bg-main)]/65 border border-[var(--border)]/70 hover:border-teal-500/30 rounded-2xl flex items-start space-x-3.5 group transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/10 flex items-center justify-center text-xs font-black shrink-0 font-sans">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-[var(--text-main)] font-bengali">{step.title}</h4>
                      <p className="text-[11px] text-[var(--text-muted)] mt-1 font-semibold leading-relaxed font-bengali">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-teal-500/5 p-4 rounded-3xl border border-teal-500/15 dark:border-teal-500/25 mt-6 flex items-start space-x-3.5">
                <Info className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed font-bengali text-teal-980 dark:text-teal-300">
                  <span className="font-black">অজু নষ্ট হওয়ার সাধারণ কারণসমূহ:</span> প্রস্রাব-পায়খানার রাস্তা দিয়ে কোন কিছু বের হওয়া, বায়ু নির্গত হওয়া, কোনো কিছুতে হেলান দিয়ে ঘুমানো বা গভীর ঘুমে আচ্ছন্ন হওয়া, এবং অজ্ঞান হয়ে পড়া বা মস্তিষ্ক বিকৃতি ঘটা।
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: steps (Salah Steps - Action by Action) */}
          {activeTab === 'steps' && (
            <div className="bg-[var(--bg-surface)] rounded-[2.5rem] border border-[var(--border)] p-6 shadow-sm relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full blur-xl pointer-events-none" />
              
              <div className="flex items-center space-x-3 mb-5 border-b border-[var(--border)] border-dashed pb-4">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/10 font-bold text-lg">🕋</div>
                <div>
                  <h3 className="font-extrabold text-base text-[var(--text-main)] font-bengali">সালাতের ধারাবাহিক ফরজ ও গুরুত্বপূর্ণ ধাপসমূহ</h3>
                  <p className="text-[10px] text-[var(--text-muted)] font-sans">Follow each key action correctly for both male and female prayers.</p>
                </div>
              </div>

              <div className="space-y-3">
                {SALAH_STEPS.map((step, idx) => {
                  const isOpened = expandedSteps[idx] || false;
                  return (
                    <div 
                      key={idx} 
                      className="border border-[var(--border)] rounded-2xl overflow-hidden transition-all duration-300"
                    >
                      <button
                        onClick={() => toggleStep(idx)}
                        className="w-full p-4 bg-[var(--bg-main)]/35 hover:bg-[var(--bg-main)]/80 flex justify-between items-center transition-colors cursor-pointer text-left font-bengali"
                      >
                        <div className="flex items-center space-x-3.5">
                          <div className="w-7 h-7 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)] border-opacity-10 flex items-center justify-center text-xs font-black shrink-0 font-sans">
                            {idx + 1}
                          </div>
                          <span className="font-extrabold text-sm text-[var(--text-main)]">{step.title}</span>
                        </div>
                        <div className="text-[var(--text-muted)] select-none">
                          {isOpened ? <ChevronDown className="w-4.5 h-4.5" /> : <ChevronRight className="w-4.5 h-4.5" />}
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpened && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="p-4 bg-[var(--bg-surface)] border-t border-[var(--border)] leading-separate space-y-3 font-bengali text-xs">
                              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed font-bold">
                                {step.description}
                              </p>
                              {step.arabic && (
                                <div className="bg-[var(--bg-main)]/60 rounded-2xl p-4 border border-[var(--border)] border-opacity-40 space-y-2.5">
                                  <p className="text-right font-arabic text-xl text-emerald-700 dark:text-emerald-450 leading-relaxed font-bold" dir="rtl">
                                    {step.arabic}
                                  </p>
                                  <p className="text-[10px] text-zinc-550 dark:text-zinc-400 font-extrabold">উচ্চারণ: <span className="text-[var(--text-main)]">{step.transliteration}</span></p>
                                  <p className="text-[10px] text-zinc-550 dark:text-zinc-400 font-extrabold">অর্থ: <span className="text-[var(--primary)]">{step.translation}</span></p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: duas (Essential Supplications in prayer) */}
          {activeTab === 'duas' && (
            <div className="bg-[var(--bg-surface)] rounded-[2.5rem] border border-[var(--border)] p-6 shadow-sm relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full blur-xl pointer-events-none" />
              
              <div className="flex items-center space-x-3 mb-5 border-b border-[var(--border)] border-dashed pb-4">
                <div className="w-10 h-10 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/10 font-bold text-lg">🤲</div>
                <div>
                  <h3 className="font-extrabold text-base text-[var(--text-main)] font-bengali">সালাতে অতি গুরুত্বপূর্ণ ও পঠিত দোয়া সংগ্রহ</h3>
                  <p className="text-[10px] text-[var(--text-muted)] font-sans">Read required supplications of prayer, with Arabic text and Bengali translations.</p>
                </div>
              </div>

              <div className="space-y-3.5">
                {ESSENTIAL_DUAS.map((dua, idx) => {
                  const isOpened = expandedDuas[idx] || false;
                  return (
                    <div 
                      key={idx} 
                      className="border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <button
                        onClick={() => toggleDua(idx)}
                        className="w-full p-4 bg-[var(--bg-main)]/40 hover:bg-[var(--bg-main)]/80 flex justify-between items-center transition-colors cursor-pointer text-left font-bengali"
                      >
                        <div>
                          <h4 className="font-extrabold text-sm text-[var(--text-main)]">{dua.name}</h4>
                          <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold mt-1 block">পড়ার স্থান: {dua.context}</span>
                        </div>
                        <div className="text-[var(--text-muted)] select-none shrink-0 ml-4">
                          {isOpened ? <ChevronDown className="w-4.5 h-4.5" /> : <ChevronRight className="w-4.5 h-4.5" />}
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpened && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="p-4 bg-[var(--bg-surface)] border-t border-[var(--border)] space-y-4 font-bengali text-[11px]">
                              {/* Beautiful Arabic script panel */}
                              <div className="p-4 bg-orange-500/2 rounded-2xl border border-orange-500/10 space-y-3">
                                <p className="text-right font-arabic text-xl sm:text-2xl text-emerald-700 dark:text-emerald-450 leading-loose font-bold" dir="rtl">
                                  {dua.arabic}
                                </p>
                              </div>

                              {/* Transliteration */}
                              <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase text-[var(--text-muted)] font-sans tracking-widest block">বাংলা উচ্চারণ</span>
                                <p className="text-[11px] leading-relaxed text-[var(--text-main)] font-semibold font-bengali">
                                  {dua.transliteration}
                                </p>
                              </div>

                              {/* Meaning */}
                              <div className="space-y-1 border-t border-[var(--border)] border-dashed pt-3">
                                <span className="text-[9px] font-black uppercase text-amber-650 dark:text-amber-400 font-sans tracking-widest block">বাংলা অর্থ ও তাৎপর্য</span>
                                <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-400 font-bold font-bengali">
                                  {dua.translation}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: mistakes (Common Mistakes in Prayer) */}
          {activeTab === 'mistakes' && (
            <div className="bg-[var(--bg-surface)] rounded-[2.5rem] border border-[var(--border)] p-6 shadow-sm relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full blur-xl pointer-events-none" />
              
              <div className="flex items-center space-x-3 mb-5 border-b border-[var(--border)] border-dashed pb-4">
                <div className="w-10 h-10 bg-red-500/10 text-red-650 dark:text-red-400 rounded-xl flex items-center justify-center border border-red-500/10 font-bold text-lg">⚠️</div>
                <div>
                  <h3 className="font-extrabold text-base text-[var(--text-main)] font-bengali">সালাত বা নামাজে সচরাচর ঘটে যাওয়া ভুলসমূহ</h3>
                  <p className="text-[10px] text-[var(--text-muted)] font-sans">Common mistakes that could void your prayers and how to correct them.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COMMON_MISTAKES.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 bg-red-500/3 dark:bg-red-950/10 border border-red-500/10 hover:border-red-500/25 rounded-2xl flex flex-col justify-between group transition-colors"
                  >
                    <div>
                      <h4 className="font-black text-xs text-red-800 dark:text-red-400 font-bengali">{item.mistake}</h4>
                      <p className="text-[11px] text-[var(--text-muted)] mt-2 leading-relaxed font-medium font-bengali">
                        {item.fix}
                      </p>
                    </div>
                    <div className="mt-3 text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold font-bengali flex items-center gap-1.5 bg-emerald-500/8 dark:bg-emerald-950/20 px-2.5 py-1 rounded-lg w-max border border-emerald-500/10">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>সংশোধন নিয়ম</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
