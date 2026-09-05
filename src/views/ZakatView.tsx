import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, Coins, Landmark, AlertCircle, CheckCircle2, 
  HelpCircle, Copy, Check, Share2, RotateCcw, Sparkles, BookOpen,
  ArrowRight, ShieldCheck, ChevronDown, ChevronUp, Scale, Wallet,
  Building2, HandCoins, Info, ArrowUpRight
} from 'lucide-react';

export const ZakatView: React.FC = () => {
  // Navigation tabs within Zakat section
  const [activeSubTab, setActiveSubTab] = useState<'calculator' | 'recipients' | 'faq'>('calculator');

  // Nisab Basis: Silver (more beneficial for the poor) or Gold
  const [nisabBasis, setNisabBasis] = useState<'silver' | 'gold'>('silver');
  
  // Market Prices in BDT
  // 1 Vori/Tola = 11.664 grams
  const [goldPricePerGram, setGoldPricePerGram] = useState<number>(12500); // ~145,000 BDT per vori
  const [silverPricePerGram, setSilverPricePerGram] = useState<number>(220); // ~2,560 BDT per vori

  // Gold Input Mode: 'weight' (vori or gram) or 'value' (direct BDT)
  const [goldInputMode, setGoldInputMode] = useState<'vori' | 'gram' | 'bdt'>('vori');
  const [goldWeight, setGoldWeight] = useState<number | ''>('');
  const [goldDirectValue, setGoldDirectValue] = useState<number | ''>('');

  // Silver Input Mode
  const [silverInputMode, setSilverInputMode] = useState<'vori' | 'gram' | 'bdt'>('vori');
  const [silverWeight, setSilverWeight] = useState<number | ''>('');
  const [silverDirectValue, setSilverDirectValue] = useState<number | ''>('');

  // Cash & Bank Assets (in BDT)
  const [cashInHand, setCashInHand] = useState<number | ''>('');
  const [bankBalance, setBankBalance] = useState<number | ''>('');
  const [dpsBalance, setDpsBalance] = useState<number | ''>('');

  // Business & Investments (in BDT)
  const [businessStock, setBusinessStock] = useState<number | ''>('');
  const [investments, setInvestments] = useState<number | ''>('');
  const [realEstateForSale, setRealEstateForSale] = useState<number | ''>('');
  const [receivables, setReceivables] = useState<number | ''>('');
  const [otherAssets, setOtherAssets] = useState<number | ''>('');

  // Liabilities (in BDT)
  const [immediateDebts, setImmediateDebts] = useState<number | ''>('');
  const [pendingBills, setPendingBills] = useState<number | ''>('');

  const [copied, setCopied] = useState<boolean>(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Calculated Gold Value in BDT
  const calculatedGoldValue = useMemo(() => {
    if (goldInputMode === 'bdt') {
      return Number(goldDirectValue || 0);
    }
    const weight = Number(goldWeight || 0);
    if (weight <= 0) return 0;
    const grams = goldInputMode === 'vori' ? weight * 11.664 : weight;
    return grams * goldPricePerGram;
  }, [goldInputMode, goldWeight, goldDirectValue, goldPricePerGram]);

  // Calculated Silver Value in BDT
  const calculatedSilverValue = useMemo(() => {
    if (silverInputMode === 'bdt') {
      return Number(silverDirectValue || 0);
    }
    const weight = Number(silverWeight || 0);
    if (weight <= 0) return 0;
    const grams = silverInputMode === 'vori' ? weight * 11.664 : weight;
    return grams * silverPricePerGram;
  }, [silverInputMode, silverWeight, silverDirectValue, silverPricePerGram]);

  // Nisab threshold calculation
  const nisabThreshold = useMemo(() => {
    if (nisabBasis === 'silver') {
      return 595 * silverPricePerGram; // 52.5 tola = 595.35 grams (~ 130,900 BDT)
    } else {
      return 85 * goldPricePerGram; // 7.5 tola = 87.48 grams (~ 1,062,500 BDT)
    }
  }, [nisabBasis, goldPricePerGram, silverPricePerGram]);

  // Total Gross Assets
  const totalAssets = useMemo(() => {
    return (
      Number(cashInHand || 0) +
      Number(bankBalance || 0) +
      Number(dpsBalance || 0) +
      calculatedGoldValue +
      calculatedSilverValue +
      Number(businessStock || 0) +
      Number(investments || 0) +
      Number(realEstateForSale || 0) +
      Number(receivables || 0) +
      Number(otherAssets || 0)
    );
  }, [
    cashInHand, bankBalance, dpsBalance, calculatedGoldValue, calculatedSilverValue,
    businessStock, investments, realEstateForSale, receivables, otherAssets
  ]);

  // Total Liabilities
  const totalLiabilities = useMemo(() => {
    return Number(immediateDebts || 0) + Number(pendingBills || 0);
  }, [immediateDebts, pendingBills]);

  // Net Zakatable Wealth
  const netWealth = useMemo(() => {
    return Math.max(0, totalAssets - totalLiabilities);
  }, [totalAssets, totalLiabilities]);

  // Is Zakat Obligatory
  const isZakatObligatory = netWealth >= nisabThreshold;

  // Progress percentage towards Nisab threshold
  const nisabProgress = useMemo(() => {
    if (nisabThreshold <= 0) return 0;
    return Math.min(100, Math.round((netWealth / nisabThreshold) * 100));
  }, [netWealth, nisabThreshold]);

  // Payable Zakat (2.5% or 1/40th)
  const payableZakat = useMemo(() => {
    if (!isZakatObligatory) return 0;
    return netWealth * 0.025;
  }, [isZakatObligatory, netWealth]);

  // Format currency in Bengali
  const formatBDT = (num: number) => {
    return new Intl.NumberFormat('bn-BD', {
      maximumFractionDigits: 0
    }).format(Math.round(num));
  };

  const handleReset = () => {
    setGoldWeight('');
    setGoldDirectValue('');
    setSilverWeight('');
    setSilverDirectValue('');
    setCashInHand('');
    setBankBalance('');
    setDpsBalance('');
    setBusinessStock('');
    setInvestments('');
    setRealEstateForSale('');
    setReceivables('');
    setOtherAssets('');
    setImmediateDebts('');
    setPendingBills('');
  };

  const handleCopySummary = async () => {
    const summaryText = `🕋 আল-কুরআনুল কারীম - যাকাত হিসাব বিবরণী
========================================
• নিসাব ভিত্তি: ${nisabBasis === 'silver' ? 'রৌপ্য (৫৯৫ গ্রাম / ৫২.৫ তোলা)' : 'স্বর্ণ (৮৫ গ্রাম / ৭.৫ তোলা)'}
• বর্তমান নিসাব মূল্য: ৳ ${formatBDT(nisabThreshold)}
----------------------------------------
• নগদ ও ব্যাংক আমানত: ৳ ${formatBDT(Number(cashInHand || 0) + Number(bankBalance || 0) + Number(dpsBalance || 0))}
• স্বর্ণ ও রৌপ্যের মূল্য: ৳ ${formatBDT(calculatedGoldValue + calculatedSilverValue)}
• ব্যবসা ও অন্যান্য সম্পদ: ৳ ${formatBDT(Number(businessStock || 0) + Number(investments || 0) + Number(realEstateForSale || 0) + Number(receivables || 0) + Number(otherAssets || 0))}
----------------------------------------
• সর্বমোট সম্পদ: ৳ ${formatBDT(totalAssets)}
• কর্তনযোগ্য দায়/ঋণ: ৳ ${formatBDT(totalLiabilities)}
• নিট যাকাতযোগ্য সম্পদ: ৳ ${formatBDT(netWealth)}
========================================
• যাকাতের হুকুম: ${isZakatObligatory ? 'যাকাত আদায় ফরজ' : 'নিসাব অপূর্ণ (যাকাত প্রযোজ্য নয়)'}
• প্রদেয় যাকাত (২.৫%): ৳ ${formatBDT(payableZakat)}
========================================
“তাদের সম্পদ থেকে সদকা গ্রহণ করুন, যার মাধ্যমে আপনি তাদের পবিত্র ও পরিশুদ্ধ করবেন।” — (সূরা আত-তাওবাহ: ১০৩)`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async () => {
    const shareText = `🕋 আমার যাকাত হিসাব:
মোট নিট সম্পদ: ৳ ${formatBDT(netWealth)}
প্রদেয় যাকাত (২.৫%): ৳ ${formatBDT(payableZakat)}
আল-কুরআনুল কারীম অ্যাপে সহজেই নিজের যাকাত হিসাব করুন।`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'যাকাত হিসাব বিবরণী',
          text: shareText
        });
      } catch {
        handleCopySummary();
      }
    } else {
      handleCopySummary();
    }
  };

  // FAQ List
  const FAQ_LIST = [
    {
      q: 'স্ত্রী বা নারীর ব্যবহারের স্বর্ণালঙ্কারে কি যাকাত দিতে হবে?',
      a: 'জমহুর ও হানাফী মাযহাবসহ অধিকাংশ ফকীহদের মতে, নারীদের ব্যবহারের সোনা-রূপা যদি নিসাব পরিমাণ (৭.৫ ভরি সোনা বা ৫২.৫ ভরি রূপা) স্পর্শ করে বা অন্য সম্পদের সাথে মিলে নিসাব হয়, তবে তার ওপর যাকাত প্রদান ওয়াজিব/ফরজ। এর যাকাত স্বর্ণের মালিক অর্থাৎ স্ত্রীকেই দিতে হবে, অথবা স্বামীর সম্মতিতে স্বামীও আদায় করে দিতে পারেন।'
    },
    {
      q: 'নিজের আত্মীয়দের কাউকে যাকাত দেওয়া যাবে কি?',
      a: 'হ্যাঁ, নিজের উর্ধ্বতন (মা, বাবা, দাদা-দাদী) এবং অধস্তন (ছেলে, মেয়ে, নাতি-নাতনি) এবং নিজের স্ত্রীকে যাকাত দেওয়া যাবে না। তবে সহোদর ভাই-বোন, চাচা, ফুফু, মামা, খালা ও শ্বশুরবাড়ির দরিদ্র আত্মীয়রা যদি যাকাতের উপযুক্ত হন, তবে তাদেরকে যাকাত দেওয়া কেবল জায়েযই নয় বরং দ্বিগুণ সওয়াবের কারণ (একটি সদকার সওয়াব, অন্যটি আত্মীয়তার বন্ধন রক্ষার সওয়াব)।'
    },
    {
      q: 'বিনিয়োগকৃত জমি বা ফ্ল্যাটের যাকাত কীভাবে হিসাব করতে হয়?',
      a: 'যেসব জমি বা ফ্ল্যাট ভবিষ্যতে অধিক মূল্যে বিক্রি করে লাভ করার উদ্দেশ্যে কেনা হয়েছে (বাণিজ্যিক পণ্য), তার বর্তমান বাজারমূল্যের ওপর প্রতি বছর যাকাত ফরজ। কিন্তু নিজের বসবাস, ভাড়া দেওয়া বা ব্যক্তিগত ব্যবহারের উদ্দেশ্যে কেনা ফ্ল্যাট/জমির মূল্যের ওপর যাকাত নেই, কেবল তা থেকে প্রাপ্ত নিট বাড়িভাড়ার সঞ্চিত অর্থের ওপর যাকাত হবে।'
    },
    {
      q: 'প্রভিডেন্ট ফান্ড ও পেনশনের টাকায় কখন যাকাত ফরজ হয়?',
      a: 'বাধ্যতামূলক জিপি ফান্ডের টাকা যতদিন সরকারের দায়িত্বে থাকবে ততদিন যাকাত নেই। টাকা উত্তোলন করার পর যদি তা নিসাব পরিমাণ হয় এবং এক বছর অতিবাহিত হয় (অথবা বিদ্যমান নিসাবের সাথে যোগ হয়), তখন যাকাত প্রযোজ্য হবে।'
    },
    {
      q: 'নিসাব পূর্ণ হওয়ার পর কত সময় পর যাকাত দেওয়া ওয়াজিব?',
      a: 'নিসাব পরিমাণ সম্পদের মালিক হওয়ার পর পূর্ণ এক চান্দ্র বছর (হাওলানুল হাওল / ৩৫৪ দিন) অতিক্রান্ত হলে যাকাত প্রদান ফরজ হয়। রমজান মাসে যাকাত দেওয়ার কোনো বাধ্যবাধকতা নেই, তবে রমজানে অধিক সওয়াবের আশায় অনেক মুমিন এ মাসে হিসাব করে থাকেন।'
    }
  ];

  // Recipients List (Surah Tawbah: 60)
  const RECIPIENTS_LIST = [
    {
      num: '১',
      title: 'আল-ফুক্বারা (অসহায় দরিদ্র)',
      desc: 'যাদের কোনো সম্পদ বা উপার্জনের ব্যবস্থা নেই অথবা এত কম সম্পদ আছে যা জীবনধারণের ন্যূনতম প্রয়োজন মেটাতে সক্ষম নয়।'
    },
    {
      num: '২',
      title: 'আল-মাসাকীন (অভাবী সম্বলহীন)',
      desc: 'যাদের কিছু সহায়-সম্বল থাকলেও তা পরিবারের ভরণপোষণের জন্য পর্যাপ্ত নয়, অথচ আত্মসম্মানের কারণে মানুষের কাছে হাত পাতেন না।'
    },
    {
      num: '৩',
      title: 'আল-আমিলীনা আলাইহা (যাকাত আদায়কারী কর্মকর্তা)',
      desc: 'ইসলামী রাষ্ট্রের পক্ষ থেকে যারা যাকাত সংগ্রহ, হিসাবরক্ষণ ও বিতরণের প্রশাসনিক কাজে নিয়োজিত কর্মী।'
    },
    {
      num: '৪',
      title: 'মুআল্লাফাতুল কুলুব (ইসলামের প্রতি আকৃষ্টকারী)',
      desc: 'নতুন মুসলিম যারা ইসলাম গ্রহণের কারণে পরিবার বা সমাজচ্যুত হয়েছেন এবং যাদের ঈমান সুদৃঢ় করতে সহযোগিতার প্রয়োজন।'
    },
    {
      num: '৫',
      title: 'ফির-রিক্বাব (দাস ও বন্দিমুক্তি)',
      desc: 'অন্যায়ভাবে আটক বা বন্দি মুসলিমকে মুক্ত করার কাজে এবং স্বাধীনতায় সহায়তা করার প্রয়োজনে।'
    },
    {
      num: '৬',
      title: 'আল-গারিমীন (ঋণগ্রস্ত ব্যক্তি)',
      desc: 'যে ব্যক্তি সৎ প্রয়োজনে ঋণগ্রস্ত হয়েছেন এবং নিজের যাবতীয় বৈধ সম্পদ দিয়েও ঋণ পরিশোধ করতে অসমর্থ।'
    },
    {
      num: '৭',
      title: 'ফী সাবিলিল্লাহ (আল্লাহর রাস্তায়)',
      desc: 'দ্বীন ইসলামের প্রচার, প্রতিষ্ঠা, দ্বীনি শিক্ষা প্রতিষ্ঠান পরিচালনা ও আল্লাহর সন্তুষ্টির পথে জিহাদ ও খিদমতকারীদের জন্য।'
    },
    {
      num: '৮',
      title: 'ইবনুস সাবীল (মুসাফির বা পথচারী)',
      desc: 'সফর অবস্থায় কোনো ব্যক্তি নিঃস্ব বা বিপদে পড়ে গেলে নিজ দেশে সে ধনী হলেও সফর নির্বাহের জন্য তাকে যাকাত দেওয়া যাবে।'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-bengali space-y-6 pb-32">
      {/* Top Islamic Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600/15 via-[var(--primary)]/10 to-amber-500/10 border border-[var(--border)] p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-bold font-sans">
            <Coins className="w-3.5 h-3.5" />
            <span>AUTHENTIC ISLAMIC ZAKAT CALCULATOR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
            যাকাত ক্যালকুলেটর ও নিসাব নির্দেশিকা
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
            পবিত্র কুরআন ও সুন্নাহর নির্দেশনা অনুযায়ী স্বর্ণ, রৌপ্য, নগদ অর্থ, ব্যাংক ব্যালেন্স ও ব্যবসার নিট যাকাত হিসাব করুন। আপনার সম্পদের ২.৫% হকদারদের মাঝে পৌঁছে দিয়ে নিজের সম্পদকে পবিত্র করুন।
          </p>
          <div className="pt-2 text-xs font-semibold text-[var(--primary)] italic">
            “خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا” — (সূরা আত-তাওবাহ: ১০৩)
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)]">
        <button
          type="button"
          onClick={() => setActiveSubTab('calculator')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'calculator'
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)]'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>যাকাত হিসাব</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('recipients')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'recipients'
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)]'
          }`}
        >
          <HandCoins className="w-4 h-4" />
          <span>যাকাতের ৮টি খাত</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('faq')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'faq'
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)]'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>জরুরি প্রশ্নোত্তর</span>
        </button>
      </div>

      {activeSubTab === 'calculator' && (
        <>
          {/* Master Live Summary Card */}
          <div className="rounded-3xl bg-[var(--bg-surface)] border-2 border-[var(--border)] p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Result Block */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>২.৫% হারে প্রদেয় যাকাত</span>
                  </div>
                  <div className="text-3xl sm:text-5xl font-black text-[var(--text-main)] tracking-tight">
                    ৳ {formatBDT(payableZakat)}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold ${
                      isZakatObligatory
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    }`}>
                      {isZakatObligatory ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      <span>{isZakatObligatory ? 'আলহামদুলিল্লাহ, আপনার উপর যাকাত ফরজ' : 'নিসাব পরিমাণ হয়নি (যাকাত ফরজ নয়)'}</span>
                    </span>
                  </div>
                </div>

                {/* Wealth Breakdown Pill Box */}
                <div className="bg-[var(--bg-main)] p-4 sm:p-5 rounded-2xl border border-[var(--border)] space-y-2.5 text-xs w-full md:w-72 shrink-0">
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>সর্বমোট সম্পদ:</span>
                    <span className="font-bold text-[var(--text-main)]">৳ {formatBDT(totalAssets)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>কর্তনযোগ্য দায়/দেনা:</span>
                    <span className="font-bold text-rose-500">- ৳ {formatBDT(totalLiabilities)}</span>
                  </div>
                  <div className="h-px bg-[var(--border)] my-1" />
                  <div className="flex justify-between text-[var(--text-main)] font-bold text-sm">
                    <span>নিট যাকাতযোগ্য সম্পদ:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">৳ {formatBDT(netWealth)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-muted)] pt-0.5">
                    <span>বর্তমান নিসাব থ্রেশহোল্ড:</span>
                    <span className="font-semibold text-[var(--text-main)]">৳ {formatBDT(nisabThreshold)}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar towards Nisab */}
              <div className="space-y-2 bg-[var(--bg-main)]/60 p-4 rounded-2xl border border-[var(--border)]">
                <div className="flex justify-between text-xs font-bold text-[var(--text-muted)]">
                  <span>নিসাবের সাপেক্ষে সম্পদ অগ্রগতি</span>
                  <span className={isZakatObligatory ? 'text-emerald-500' : 'text-amber-500'}>
                    {nisabProgress}%
                  </span>
                </div>
                <div className="w-full h-3 bg-[var(--border)] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${nisabProgress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full rounded-full transition-all ${
                      isZakatObligatory 
                        ? 'bg-gradient-to-r from-emerald-500 to-[var(--primary)]' 
                        : 'bg-gradient-to-r from-amber-400 to-amber-600'
                    }`}
                  />
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  {isZakatObligatory ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      আপনার সম্পদ নিসাব থ্রেশহোল্ড (৳ {formatBDT(nisabThreshold)}) অতিক্রম করেছে।
                    </span>
                  ) : (
                    <span>
                      যাকাত ফরজ হতে আপনার আরও নিট ৳ {formatBDT(Math.max(0, nisabThreshold - netWealth))} সম্পদের প্রয়োজন।
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--bg-main)] text-[var(--text-main)] text-xs font-bold border border-[var(--border)] hover:bg-[var(--border)] active:scale-95 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'কপি সম্পন্ন!' : 'বিবরণী কপি করুন'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--bg-main)] text-[var(--text-main)] text-xs font-bold border border-[var(--border)] hover:bg-[var(--border)] active:scale-95 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>শেয়ার করুন</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--bg-main)] text-rose-500 text-xs font-bold border border-rose-500/20 hover:bg-rose-500/10 active:scale-95 transition-all ml-auto cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>রিসেট (নতুন হিসাব)</span>
                </button>
              </div>
            </div>
          </div>

          {/* 1. Nisab Configuration Section */}
          <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border)] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center font-bold text-sm font-sans">
                  ১
                </span>
                <div>
                  <h3 className="font-bold text-base text-[var(--text-main)]">নিসাব নির্ধারণ (স্বর্ণ বা রূপার ভিত্তি)</h3>
                  <p className="text-xs text-[var(--text-muted)]">যাকাত ফরজ হওয়ার ন্যূনতম সম্পদের পরিমাণ নির্ধারণ করুন</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setNisabBasis('silver')}
                className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  nisabBasis === 'silver'
                    ? 'bg-[var(--primary-soft)] border-[var(--primary)] shadow-xs'
                    : 'bg-[var(--bg-main)] border-[var(--border)] hover:bg-[var(--border)]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-[var(--text-main)] flex items-center gap-1.5">
                    <span>রৌপ্যের নিসাব (৫২.৫ তোলা / ৫৯৫ গ্রাম)</span>
                  </div>
                  {nisabBasis === 'silver' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  গরিব-অভাবীদের অধিক উপকারের সুবিধার্থে অধিকাংশ ফকীহদের মতে রূপার নিসাবকে ভিত্তি ধরা উত্তম।
                </p>
                <div className="mt-2 text-xs font-bold text-[var(--primary)]">
                  বর্তমান নিসাব মান: ৳ {formatBDT(595 * silverPricePerGram)}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setNisabBasis('gold')}
                className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  nisabBasis === 'gold'
                    ? 'bg-[var(--primary-soft)] border-[var(--primary)] shadow-xs'
                    : 'bg-[var(--bg-main)] border-[var(--border)] hover:bg-[var(--border)]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-[var(--text-main)] flex items-center gap-1.5">
                    <span>স্বর্ণের নিসাব (৭.৫ তোলা / ৮৫ গ্রাম)</span>
                  </div>
                  {nisabBasis === 'gold' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  যাদের কাছে শুধুমাত্র সোনা রয়েছে এবং নগদ টাকা বা রূপা নেই, তাদের জন্য এই নিসাব প্রযোজ্য।
                </p>
                <div className="mt-2 text-xs font-bold text-[var(--primary)]">
                  বর্তমান নিসাব মান: ৳ {formatBDT(85 * goldPricePerGram)}
                </div>
              </button>
            </div>

            {/* Editable Market Rates */}
            <div className="bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] font-bold mb-1">
                  প্রতি গ্রাম রূপার মূল্য (টাকা)
                </label>
                <input
                  type="number"
                  value={silverPricePerGram}
                  onChange={e => setSilverPricePerGram(Number(e.target.value) || 0)}
                  className="w-full bg-[var(--bg-surface)] text-[var(--text-main)] font-bold rounded-xl px-3.5 py-2 border border-[var(--border)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]/30"
                />
                <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block">
                  ১ তোলা/ভরি রূপা = ৳ {formatBDT(silverPricePerGram * 11.664)}
                </span>
              </div>
              <div>
                <label className="block text-[var(--text-muted)] font-bold mb-1">
                  প্রতি গ্রাম স্বর্ণের মূল্য (টাকা)
                </label>
                <input
                  type="number"
                  value={goldPricePerGram}
                  onChange={e => setGoldPricePerGram(Number(e.target.value) || 0)}
                  className="w-full bg-[var(--bg-surface)] text-[var(--text-main)] font-bold rounded-xl px-3.5 py-2 border border-[var(--border)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]/30"
                />
                <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block">
                  ১ তোলা/ভরি স্বর্ণ (২২ ক্যারেট) = ৳ {formatBDT(goldPricePerGram * 11.664)}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Gold & Silver Asset Section */}
          <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border)] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm font-sans">
                ২
              </span>
              <div>
                <h3 className="font-bold text-base text-[var(--text-main)]">স্বর্ণ ও রৌপ্য অলঙ্কারাদি</h3>
                <p className="text-xs text-[var(--text-muted)]">ওজন (ভরি বা গ্রাম) অথবা সরাসরি বাজারমূল্য টাকায় লিখুন</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gold Box */}
              <div className="bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--text-main)]">
                    স্বর্ণের পরিমাণ বা মূল্য
                  </label>
                  <div className="flex rounded-lg bg-[var(--bg-surface)] p-0.5 border border-[var(--border)] text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setGoldInputMode('vori')}
                      className={`px-2 py-1 rounded-md transition-all ${goldInputMode === 'vori' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)]'}`}
                    >
                      ভরি
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoldInputMode('gram')}
                      className={`px-2 py-1 rounded-md transition-all ${goldInputMode === 'gram' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)]'}`}
                    >
                      গ্রাম
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoldInputMode('bdt')}
                      className={`px-2 py-1 rounded-md transition-all ${goldInputMode === 'bdt' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)]'}`}
                    >
                      টাকা (BDT)
                    </button>
                  </div>
                </div>

                {goldInputMode === 'bdt' ? (
                  <input
                    type="number"
                    placeholder="সরাসরি বাজারমূল্য লিখুন (৳)"
                    value={goldDirectValue}
                    onChange={e => setGoldDirectValue(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[var(--bg-surface)] text-[var(--text-main)] text-sm font-semibold rounded-xl px-3.5 py-2.5 border border-[var(--border)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]/30"
                  />
                ) : (
                  <div>
                    <input
                      type="number"
                      step="any"
                      placeholder={`স্বর্ণের মোট ${goldInputMode === 'vori' ? 'ভরি/তোলা' : 'গ্রাম'} লিখুন`}
                      value={goldWeight}
                      onChange={e => setGoldWeight(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-[var(--bg-surface)] text-[var(--text-main)] text-sm font-semibold rounded-xl px-3.5 py-2.5 border border-[var(--border)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]/30"
                    />
                    <div className="text-[11px] text-[var(--primary)] font-semibold mt-1">
                      মূল্য: ৳ {formatBDT(calculatedGoldValue)}
                    </div>
                  </div>
                )}
              </div>

              {/* Silver Box */}
              <div className="bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--text-main)]">
                    রৌপ্যের পরিমাণ বা মূল্য
                  </label>
                  <div className="flex rounded-lg bg-[var(--bg-surface)] p-0.5 border border-[var(--border)] text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setSilverInputMode('vori')}
                      className={`px-2 py-1 rounded-md transition-all ${silverInputMode === 'vori' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)]'}`}
                    >
                      ভরি
                    </button>
                    <button
                      type="button"
                      onClick={() => setSilverInputMode('gram')}
                      className={`px-2 py-1 rounded-md transition-all ${silverInputMode === 'gram' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)]'}`}
                    >
                      গ্রাম
                    </button>
                    <button
                      type="button"
                      onClick={() => setSilverInputMode('bdt')}
                      className={`px-2 py-1 rounded-md transition-all ${silverInputMode === 'bdt' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)]'}`}
                    >
                      টাকা (BDT)
                    </button>
                  </div>
                </div>

                {silverInputMode === 'bdt' ? (
                  <input
                    type="number"
                    placeholder="সরাসরি বাজারমূল্য লিখুন (৳)"
                    value={silverDirectValue}
                    onChange={e => setSilverDirectValue(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[var(--bg-surface)] text-[var(--text-main)] text-sm font-semibold rounded-xl px-3.5 py-2.5 border border-[var(--border)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]/30"
                  />
                ) : (
                  <div>
                    <input
                      type="number"
                      step="any"
                      placeholder={`রৌপ্যের মোট ${silverInputMode === 'vori' ? 'ভরি/তোলা' : 'গ্রাম'} লিখুন`}
                      value={silverWeight}
                      onChange={e => setSilverWeight(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-[var(--bg-surface)] text-[var(--text-main)] text-sm font-semibold rounded-xl px-3.5 py-2.5 border border-[var(--border)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]/30"
                    />
                    <div className="text-[11px] text-[var(--primary)] font-semibold mt-1">
                      মূল্য: ৳ {formatBDT(calculatedSilverValue)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. Cash & Bank Balance Section */}
          <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border)] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm font-sans">
                ৩
              </span>
              <div>
                <h3 className="font-bold text-base text-[var(--text-main)]">নগদ টাকা ও ব্যাংক আমানত</h3>
                <p className="text-xs text-[var(--text-muted)]">হাতে থাকা ক্যাশ, সেভিংস, ডিপিএস বা ফিক্সড ডিপোজিটের মূলধন</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                  হাতে থাকা ক্যাশ টাকা
                </label>
                <input
                  type="number"
                  placeholder="০"
                  value={cashInHand}
                  onChange={e => setCashInHand(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm font-semibold rounded-xl px-3.5 py-2.5 border border-[var(--border)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                  ব্যাংক একাউন্ট ব্যালেন্স
                </label>
                <input
                  type="number"
                  placeholder="০"
                  value={bankBalance}
                  onChange={e => setBankBalance(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm font-semibold rounded-xl px-3.5 py-2.5 border border-[var(--border)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                  ডিপিএস / ফিক্সড ডিপোজিট (মূল জমা)
                </label>
                <input
                  type="number"
                  placeholder="০"
                  value={dpsBalance}
                  onChange={e => setDpsBalance(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm font-semibold rounded-xl px-3.5 py-2.5 border border-[var(--border)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]/30"
                />
              </div>
            </div>
          </div>

          {/* 4. Business & Investments */}
          <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border)] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm font-sans">
                ৪
              </span>
              <div>
                <h3 className="font-bold text-base text-[var(--text-main)]">ব্যবসা, শেয়ার ও অন্যান্য সম্পদ</h3>
                <p className="text-xs text-[var(--text-muted)]">দোকান বা কারখানার পণ্য, শেয়ারবাজার, পাওনা ও বিক্রির উদ্দেশ্যে কেনা সম্পত্তি</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                  ব্যবসায়িক পণ্য / দোকানের স্টক (পাইকারি বিক্রয়মূল্য)
                </label>
                <input
                  type="number"
                  placeholder="০"
                  value={businessStock}
                  onChange={e => setBusinessStock(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm font-semibold rounded-xl px-3.5 py-2.5 border border-[var(--border)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                  শেয়ার বাজার, মিউচুয়াল ফান্ড ও সঞ্চয়পত্র
                </label>
                <input
                  type="number"
                  placeholder="০"
                  value={investments}
                  onChange={e => setInvestments(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm font-semibold rounded-xl px-3.5 py-2.5 border border-[var(--border)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                  বিক্রির উদ্দেশ্যে কেনা জমি / প্লট / ফ্ল্যাট
                </label>
                <input
                  type="number"
                  placeholder="০"
                  value={realEstateForSale}
                  onChange={e => setRealEstateForSale(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm font-semibold rounded-xl px-3.5 py-2.5 border border-[var(--border)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                  অন্যকে দেওয়া ঋণ (যা ফেরত পাওয়ার নিশ্চয়তা রয়েছে)
                </label>
                <input
                  type="number"
                  placeholder="০"
                  value={receivables}
                  onChange={e => setReceivables(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm font-semibold rounded-xl px-3.5 py-2.5 border border-[var(--border)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]/30"
                />
              </div>
            </div>
          </div>

          {/* 5. Deductible Liabilities */}
          <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border)] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center font-bold text-sm font-sans">
                ৫
              </span>
              <div>
                <h3 className="font-bold text-base text-[var(--text-main)]">কর্তনযোগ্য দায় ও জরুরি ঋণ</h3>
                <p className="text-xs text-[var(--text-muted)]">তাৎক্ষণিক প্রদেয় ব্যক্তিগত ঋণ, কর্মচারীদের বকেয়া বেতন ও জরুরি বিল</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                  তাৎক্ষণিক প্রদেয় ব্যক্তিগত বা বাণিজ্যিক দেনা
                </label>
                <input
                  type="number"
                  placeholder="০"
                  value={immediateDebts}
                  onChange={e => setImmediateDebts(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm font-semibold rounded-xl px-3.5 py-2.5 border border-[var(--border)] focus:outline-hidden focus:ring-2 focus:ring-rose-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                  বকেয়া বেতন, বাসাভাড়া ও ইউটিলিটি বিল
                </label>
                <input
                  type="number"
                  placeholder="০"
                  value={pendingBills}
                  onChange={e => setPendingBills(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm font-semibold rounded-xl px-3.5 py-2.5 border border-[var(--border)] focus:outline-hidden focus:ring-2 focus:ring-rose-500/30"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tab 2: The 8 Quranic Recipients */}
      {activeSubTab === 'recipients' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border)] p-6 space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--primary)]" />
              <h2 className="text-lg font-bold text-[var(--text-main)]">
                কুরআনে বর্ণিত যাকাত গ্রহণের ৮টি হকদার খাত
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              আল্লাহ সুবহানাহু ওয়া তা‘আলা সূরা আত-তাওবার ৬০ নম্বর আয়াতে যাকাতের অর্থ বণ্টনের ৮টি খাত সুনির্দিষ্টভাবে নির্ধারণ করে দিয়েছেন। এই আটটি শ্রেণী ছাড়া অন্য কোথাও যাকাতের অর্থ ব্যয় করা বৈধ নয়:
            </p>
            <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] text-xs font-serif text-[var(--text-main)] text-center italic">
              “إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ وَالْعَامِلِينَ عَلَيْهَا وَالْمُؤَلَّفَةِ قُلُوبُهُمْ وَفِي الرِّقَابِ وَالْغَارِمِينَ وَفِي سَبِيلِ اللَّهِ وَابْنِ السَّبِيلِ ۖ فَرِيضَةً مِّنَ اللَّهِ ۗ وَاللَّهُ عَلِيمٌ حَكِيمٌ” (সূরা তাওবা: ৬০)
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {RECIPIENTS_LIST.map(r => (
              <div
                key={r.num}
                className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--primary)]/40 transition-all space-y-2 shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center font-bold text-xs font-sans">
                    {r.num}
                  </span>
                  <h3 className="font-bold text-sm text-[var(--text-main)]">{r.title}</h3>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed pl-9">
                  {r.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Essential Zakat FAQ */}
      {activeSubTab === 'faq' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border)] p-6 space-y-2">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-[var(--text-main)]">
                যাকাত সম্পর্কিত গুরুত্বপূর্ণ ফতোয়া ও প্রশ্নোত্তর
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              দৈনন্দিন জীবনে যাকাত হিসাব ও আদায়ের ক্ষেত্রে সাধারণ মুমিনদের সাধারণ প্রশ্নসমূহ ও প্রামাণ্য উত্তর:
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_LIST.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 hover:bg-[var(--bg-main)] transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-sm text-[var(--text-main)]">
                      {faq.q}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[var(--primary)] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-[var(--text-muted)] leading-relaxed border-t border-[var(--border)] pt-3 bg-[var(--bg-main)]/50"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
