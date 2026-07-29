import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Download, Share2, Sparkles, Image as ImageIcon, Type, Sliders, CheckCircle2 } from 'lucide-react';
import { toPng } from 'html-to-image';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  arabicText: string;
  bengaliText: string;
  surahName: string;
  ayahNumber: number;
}

type DesignTheme = 'royal' | 'emerald' | 'night' | 'parchment' | 'sunset' | 'mihrab';
type AspectRatio = 'square' | 'story' | 'card';

export const ShareModal: React.FC<ShareModalProps> = ({ 
  isOpen, 
  onClose, 
  arabicText, 
  bengaliText, 
  surahName, 
  ayahNumber 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [design, setDesign] = useState<DesignTheme>('royal');
  const [aspect, setAspect] = useState<AspectRatio>('card');
  const [arabicSize, setArabicSize] = useState<number>(26);
  const [bengaliSize, setBengaliSize] = useState<number>(14);
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'theme' | 'adjust'>('theme');

  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ modal: 'share' }, '');
      const handlePopState = () => onClose();
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const textToCopy = `${arabicText}\n\n${bengaliText}\n\n- কুরআনুল কারিম (${surahName}, আয়াত ${ayahNumber})`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch(e) {
      console.log('Failed to copy', e);
    }
  };

  const generateImage = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    setIsProcessing(true);
    try {
      const dataUrl = await toPng(cardRef.current, { 
        quality: 1, 
        pixelRatio: 3,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      return dataUrl;
    } catch (err) {
      console.error('Image generation failed', err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;
    
    const link = document.createElement('a');
    link.download = `Ayah-${surahName}-${ayahNumber}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!navigator.share) {
      alert("আপনার ব্রাউজারে সরাসরি শেয়ার সাপোর্ট করে না। দয়া করে ইমেজটি ডাউনলোড করুন।");
      return;
    }

    const dataUrl = await generateImage();
    if (!dataUrl) return;

    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `Ayah-${surahName}-${ayahNumber}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Al-Quran',
          text: `${surahName} (${ayahNumber})`,
        });
      } else {
        await navigator.share({
          title: 'Al-Quran',
          text: `${arabicText}\n\n${bengaliText}\n\n- ${surahName} (${ayahNumber})`,
        });
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleClose = () => {
    window.history.back(); 
  };

  // Dimension mapping
  const getCardDimensions = () => {
    switch(aspect) {
      case 'square': return { width: '320px', minHeight: '320px' };
      case 'story': return { width: '300px', minHeight: '480px' };
      case 'card': default: return { width: '320px', minHeight: '420px' };
    }
  };

  const dimensions = getCardDimensions();

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[220] bg-black/85 backdrop-blur-md flex justify-center items-center p-3 sm:p-4 font-bengali select-none overflow-y-auto"
        onClick={handleClose}
      >
        <motion.div 
          initial={{ y: 30, scale: 0.96 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 20, scale: 0.96 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[var(--bg-main)] w-full max-w-[440px] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[92vh] border border-[var(--border)] my-auto"
        >
          {/* Top Header */}
          <div className="flex justify-between items-center px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-surface)]">
             <div className="flex items-center space-x-2.5">
               <div className="w-8 h-8 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center font-bold">
                 <Sparkles className="w-4 h-4" />
               </div>
               <div>
                 <h3 className="font-bold text-base text-[var(--text-main)]">আয়াত কার্ড জেনারেটর</h3>
                 <p className="text-[10px] text-[var(--text-muted)] font-semibold">সোশ্যাল মিডিয়ায় শেয়ার করার জন্য ইসলামিক সুন্দর কার্ড</p>
               </div>
             </div>
             <button onClick={handleClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
               <X className="w-5 h-5" />
             </button>
          </div>

          <div className="overflow-y-auto p-4 sm:p-5 flex flex-col items-center flex-1 bg-[var(--bg-main)] custom-scrollbar">
            
            {/* Control Tabs: Themes vs Fine Tuning */}
            <div className="flex bg-[var(--bg-surface)] p-1 rounded-2xl w-full border border-[var(--border)] mb-4">
              <button
                onClick={() => setActiveTab('theme')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                  activeTab === 'theme'
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>থিম ও ডিজাইন</span>
              </button>
              <button
                onClick={() => setActiveTab('adjust')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                  activeTab === 'adjust'
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>লেখা ও সাইজ কাস্টমাইজ</span>
              </button>
            </div>

            {/* Tab 1: Theme & Aspect Ratio Selection */}
            {activeTab === 'theme' ? (
              <div className="w-full space-y-3.5 mb-4">
                {/* Themes List */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'royal', label: 'গোল্ডেন রয়্যাল', bg: 'bg-[#0B132B] text-[#DFB15B] border-[#DFB15B]/40' },
                    { id: 'emerald', label: 'এমোরাল্ড সুন্নাহ', bg: 'bg-[#064E3B] text-[#34D399] border-[#34D399]/40' },
                    { id: 'night', label: 'নাইট ভেলভেট', bg: 'bg-[#111827] text-white border-white/20' },
                    { id: 'parchment', label: 'ক্লাসিক পার্চমেন্ট', bg: 'bg-[#FAF6F0] text-[#2D251E] border-[#D4AF37]' },
                    { id: 'sunset', label: 'সানসেট নূর', bg: 'bg-gradient-to-br from-[#2E1065] to-[#701A75] text-[#FDE047] border-[#FDE047]/40' },
                    { id: 'mihrab', label: 'ইসলামিক মেহরাব', bg: 'bg-[#0f172a] text-[#38BDF8] border-[#38BDF8]/40' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setDesign(t.id as DesignTheme)}
                      className={`p-2 rounded-xl text-[11px] font-bold border transition-all flex flex-col items-center justify-center gap-1.5 ${t.bg} ${
                        design === t.id ? 'ring-2 ring-emerald-500 scale-[1.03] shadow-md' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <span>{t.label}</span>
                      {design === t.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>

                {/* Aspect Ratio Selector */}
                <div className="flex items-center justify-between bg-[var(--bg-surface)] p-2 rounded-2xl border border-[var(--border)] text-xs">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase pl-1">সাইজ:</span>
                  <div className="flex space-x-1">
                    {[
                      { id: 'card', label: 'কার্ড (4:5)' },
                      { id: 'square', label: 'স্কয়ার (1:1)' },
                      { id: 'story', label: 'স্টোরি (9:16)' }
                    ].map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setAspect(a.id as AspectRatio)}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                          aspect === a.id
                            ? 'bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/30'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Tab 2: Custom Adjustments */
              <div className="w-full space-y-3 bg-[var(--bg-surface)] p-3.5 rounded-2xl border border-[var(--border)] mb-4 text-xs">
                {/* Arabic Size Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-[11px] text-[var(--text-main)]">
                    <span>আরবি সাইজ (Arabic Size):</span>
                    <span className="text-[var(--primary)] font-sans">{arabicSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="40"
                    value={arabicSize}
                    onChange={(e) => setArabicSize(Number(e.target.value))}
                    className="w-full accent-[var(--primary)]"
                  />
                </div>

                {/* Bengali Size Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-[11px] text-[var(--text-main)]">
                    <span>অনুবাদ সাইজ (Bengali Size):</span>
                    <span className="text-[var(--primary)] font-sans">{bengaliSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="11"
                    max="22"
                    value={bengaliSize}
                    onChange={(e) => setBengaliSize(Number(e.target.value))}
                    className="w-full accent-[var(--primary)]"
                  />
                </div>

                {/* Watermark Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-[11px] text-[var(--text-main)]">অ্যাপ লোগো / ওয়াটারমার্ক প্রদর্শন:</span>
                  <button
                    onClick={() => setShowWatermark(!showWatermark)}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] border transition-all ${
                      showWatermark
                        ? 'bg-[var(--primary-soft)] text-[var(--primary)] border-[var(--primary)]/30'
                        : 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border)]'
                    }`}
                  >
                    {showWatermark ? 'চালু' : 'বন্ধ'}
                  </button>
                </div>
              </div>
            )}

            {/* Renderable Card Preview */}
            <div className="w-full flex justify-center py-1">
              <div 
                ref={cardRef} 
                className={`relative p-6 sm:p-8 shadow-2xl flex flex-col justify-between items-center text-center overflow-hidden transition-all duration-300 ${
                  design === 'royal' 
                    ? 'bg-[#0B132B] text-[#FAF6F0] border-[5px] border-[#DFB15B] rounded-2xl'
                    : design === 'emerald'
                    ? 'bg-gradient-to-b from-[#064E3B] via-[#022C22] to-[#064E3B] text-emerald-100 border-2 border-[#34D399]/40 rounded-3xl'
                    : design === 'night'
                    ? 'bg-[#111827] text-white rounded-[2.5rem] border border-white/10'
                    : design === 'parchment'
                    ? 'bg-[#FAF6F0] text-[#2D251E] border-[6px] border-[#D4AF37] rounded-sm'
                    : design === 'sunset'
                    ? 'bg-gradient-to-b from-[#2E1065] via-[#4C1D95] to-[#701A75] text-amber-100 border-2 border-amber-400/40 rounded-3xl'
                    : 'bg-[#0F172A] text-slate-100 border-2 border-sky-400/40 rounded-t-[3.5rem] rounded-b-2xl'
                }`}
                style={{
                  width: dimensions.width,
                  minHeight: dimensions.minHeight,
                }}
              >
                {/* Decorative Geometric Borders & Accents */}
                {design === 'royal' && (
                  <>
                    <div className="absolute inset-1.5 border border-[#DFB15B]/40 pointer-events-none" />
                    <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#DFB15B] pointer-events-none" />
                    <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#DFB15B] pointer-events-none" />
                    <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#DFB15B] pointer-events-none" />
                    <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#DFB15B] pointer-events-none" />
                  </>
                )}
                {design === 'emerald' && (
                  <>
                    <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#34D399]/15 to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#34D399]/15 to-transparent pointer-events-none" />
                  </>
                )}
                {design === 'night' && (
                  <>
                    <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-36 h-36 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                  </>
                )}
                {design === 'parchment' && (
                  <>
                    <div className="absolute inset-1.5 border border-[#D4AF37]/50 pointer-events-none" />
                    <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#D4AF37] pointer-events-none" />
                    <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#D4AF37] pointer-events-none" />
                    <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#D4AF37] pointer-events-none" />
                    <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#D4AF37] pointer-events-none" />
                  </>
                )}
                {design === 'mihrab' && (
                  <div className="absolute top-0 inset-x-6 h-12 rounded-b-full border-b-2 border-sky-400/30 bg-sky-500/5 pointer-events-none" />
                )}

                {/* Content Container */}
                <div className="relative z-10 w-full flex flex-col h-full items-center justify-between gap-4 my-auto">
                  
                  {/* Surah Header Badge */}
                  <div className={`px-4 py-1.5 inline-flex rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm ${
                    design === 'royal' ? 'bg-[#DFB15B]/15 text-[#DFB15B] border border-[#DFB15B]/30' 
                    : design === 'emerald' ? 'bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30'
                    : design === 'night' ? 'bg-white/10 text-white border border-white/10'
                    : design === 'parchment' ? 'bg-[#D4AF37]/15 text-[#8B6508] border border-[#D4AF37]/40'
                    : design === 'sunset' ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                    : 'bg-sky-400/15 text-sky-300 border border-sky-400/30'
                  }`}>
                    {surahName} • আয়াত {ayahNumber}
                  </div>

                  {/* Texts Body */}
                  <div className="flex-1 flex flex-col justify-center items-center gap-4 w-full py-2 my-auto">
                    {/* Arabic Text */}
                    <p 
                      className={`font-arabic leading-[1.8] px-1 drop-shadow-sm transition-all ${
                        design === 'royal' ? 'text-[#DFB15B]' 
                        : design === 'emerald' ? 'text-emerald-200' 
                        : design === 'parchment' ? 'text-[#1A1A1A]' 
                        : design === 'sunset' ? 'text-amber-200'
                        : design === 'mihrab' ? 'text-sky-200'
                        : 'text-white'
                      }`} 
                      dir="rtl"
                      style={{ fontSize: `${arabicSize}px` }}
                    >
                      {arabicText}
                    </p>
                    
                    {/* Divider Line */}
                    <div className="flex items-center justify-center space-x-2 w-full opacity-60 my-1">
                       <div className={`h-[1px] w-10 ${
                         design === 'royal' ? 'bg-[#DFB15B]' 
                         : design === 'emerald' ? 'bg-[#34D399]' 
                         : design === 'parchment' ? 'bg-[#D4AF37]' 
                         : design === 'sunset' ? 'bg-amber-400'
                         : design === 'mihrab' ? 'bg-sky-400'
                         : 'bg-white'
                       }`} />
                       <div className={`w-1.5 h-1.5 rotate-45 ${
                         design === 'royal' ? 'bg-[#DFB15B]' 
                         : design === 'emerald' ? 'bg-[#34D399]' 
                         : design === 'parchment' ? 'bg-[#D4AF37]' 
                         : design === 'sunset' ? 'bg-amber-400'
                         : design === 'mihrab' ? 'bg-sky-400'
                         : 'bg-white'
                       }`} />
                       <div className={`h-[1px] w-10 ${
                         design === 'royal' ? 'bg-[#DFB15B]' 
                         : design === 'emerald' ? 'bg-[#34D399]' 
                         : design === 'parchment' ? 'bg-[#D4AF37]' 
                         : design === 'sunset' ? 'bg-amber-400'
                         : design === 'mihrab' ? 'bg-sky-400'
                         : 'bg-white'
                       }`} />
                    </div>

                    {/* Bengali Translation */}
                    <p 
                      className={`font-bengali leading-[1.7] font-semibold px-1 ${
                        design === 'royal' ? 'text-slate-200' 
                        : design === 'emerald' ? 'text-emerald-100' 
                        : design === 'parchment' ? 'text-[#3E3228]' 
                        : design === 'sunset' ? 'text-amber-100'
                        : design === 'mihrab' ? 'text-slate-200'
                        : 'text-gray-200'
                      }`}
                      style={{ fontSize: `${bengaliSize}px` }}
                    >
                      {bengaliText}
                    </p>
                  </div>

                  {/* Watermark Label */}
                  {showWatermark && (
                    <div className={`text-[9px] font-sans font-bold tracking-[0.25em] uppercase mt-2 ${
                      design === 'royal' ? 'text-[#DFB15B]/70' 
                      : design === 'emerald' ? 'text-[#34D399]/70' 
                      : design === 'parchment' ? 'text-[#8B6508]/80' 
                      : design === 'sunset' ? 'text-amber-300/70'
                      : design === 'mihrab' ? 'text-sky-300/70'
                      : 'text-white/50'
                    }`}>
                      Al-Quran • কুরআনুল কারিম
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>

          {/* Bottom Footer Action Controls */}
          <div className="p-4 bg-[var(--bg-surface)] border-t border-[var(--border)] flex flex-col gap-2.5">
             <div className="grid grid-cols-2 gap-2.5">
                <button 
                  onClick={handleCopy}
                  className="flex items-center justify-center space-x-2 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border)] font-bold text-[var(--text-main)] active:scale-95 transition-all text-xs"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-[var(--text-muted)]" />}
                  <span>{copied ? 'কপি হয়েছে' : 'টেক্সট কপি'}</span>
                </button>
                <button 
                  onClick={handleDownload}
                  disabled={isProcessing}
                  className="flex items-center justify-center space-x-2 py-3 rounded-xl bg-[var(--primary)] text-white font-bold active:scale-95 transition-all text-xs shadow-md"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{isProcessing ? 'তৈরি হচ্ছে...' : 'ছবি সেভ করুন'}</span>
                </button>
             </div>
             
             {navigator.share && (
               <button 
                  onClick={handleShare}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--primary-soft)] border border-[var(--border)] text-[var(--text-main)] font-bold active:scale-95 transition-all text-xs flex justify-center items-center gap-2"
               >
                 {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                 ) : (
                    <Share2 className="w-4 h-4 text-[var(--primary)]" />
                 )}
                 <span>সরাসরি সোশ্যাল মিডিয়ায় শেয়ার</span>
               </button>
             )}
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
