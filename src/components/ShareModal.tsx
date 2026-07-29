import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Download, Share2 } from 'lucide-react';
import { toPng } from 'html-to-image';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  arabicText: string;
  bengaliText: string;
  surahName: string;
  ayahNumber: number;
}

type DesignTheme = 'classic' | 'night' | 'royal';

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, arabicText, bengaliText, surahName, ayahNumber }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [design, setDesign] = useState<DesignTheme>('classic');
  const [isProcessing, setIsProcessing] = useState(false);

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
      // html-to-image is much more reliable with web fonts and modern layouts
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
    
    // Create an invisible link to trigger download
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

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex justify-center items-center p-4 font-bengali"
        onClick={handleClose}
      >
        <motion.div 
          initial={{ y: 50, scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 20, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[var(--bg-main)] w-full max-w-[400px] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] border border-[var(--border)]"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-[var(--border)] bg-[var(--bg-surface)]">
             <div>
               <h3 className="font-bold text-lg text-[var(--text-main)]">আয়াত শেয়ার করুন</h3>
             </div>
             <button onClick={handleClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--border)] transition-colors">
               <X className="w-5 h-5 text-[var(--text-muted)]" />
             </button>
          </div>

          <div className="overflow-y-auto p-6 flex flex-col items-center flex-1 bg-[var(--bg-main)] custom-scrollbar">
            
            {/* Design Selector */}
            <div className="flex space-x-2 w-full mb-6 relative z-20">
                <button 
                  onClick={() => setDesign('classic')}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all border ${design === 'classic' ? 'bg-white text-black border-transparent shadow-[0_4px_15px_rgba(0,0,0,0.1)] scale-105' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`}
                >
                  ক্লাসিক
                </button>
                <button 
                  onClick={() => setDesign('night')}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all border ${design === 'night' ? 'bg-[#111] text-white border-transparent shadow-[0_4px_15px_rgba(0,0,0,0.2)] scale-105' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`}
                >
                  নাইট
                </button>
                <button 
                  onClick={() => setDesign('royal')}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all border ${design === 'royal' ? 'bg-[#0f172a] text-[#ffd700] border-[#ffd700]/30 shadow-[0_4px_15px_rgba(255,215,0,0.15)] scale-105' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`}
                >
                  রয়্যাল
                </button>
            </div>

            {/* Renderable Card */}
            <div className="w-full flex justify-center">
              <div 
                ref={cardRef} 
                className={`w-[320px] relative p-8 shadow-2xl flex flex-col justify-center items-center text-center overflow-hidden transition-all duration-500 ${
                  design === 'classic' 
                    ? 'bg-[#FDFBF7] text-[#1A1A1A] border-[6px] border-[#D4AF37] rounded-sm'
                    : design === 'night'
                    ? 'bg-[#18181B] text-[#F3F4F6] rounded-[2.5rem] border border-white/10'
                    : 'bg-[#0F172A] text-[#F8FAFC] border-2 border-[#D4AF37]/40 rounded-t-full rounded-b-[2rem] pt-16 pb-12'
                }`}
                style={{
                  minHeight: '440px'
                }}
              >
                {/* Background Details based on theme */}
                {design === 'classic' && (
                  <>
                    <div className="absolute inset-1.5 border border-[#D4AF37]/50 pointer-events-none" />
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#D4AF37]/40 pointer-events-none" />
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#D4AF37]/40 pointer-events-none" />
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#D4AF37]/40 pointer-events-none" />
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#D4AF37]/40 pointer-events-none" />
                  </>
                )}
                {design === 'night' && (
                  <>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                  </>
                )}
                {design === 'royal' && (
                  <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBmaWxsPSIjRkZEMzAwIiBkPSJNNTAgMEw2MS44IDM4LjJMMTAwIDUwTDYxLjggNjEuOEw1MCAxMDBMMzguMiA2MS44TDAgNTBMMzguMiAzOC4yWiIvPjwvc3ZnPg==')] bg-repeat pointer-events-none" />
                )}

                <div className="relative z-10 w-full flex flex-col h-full items-center justify-between gap-6">
                  {/* Surah Header */}
                  <div className={`px-5 py-1.5 inline-flex rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm ${
                    design === 'classic' ? 'bg-[#D4AF37]/10 text-[#B8860B] border border-[#D4AF37]/30' 
                    : design === 'night' ? 'bg-white/10 text-white border border-white/10 backdrop-blur-md'
                    : 'bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30 backdrop-blur-md'
                  }`}>
                    {surahName} • আয়াত {ayahNumber}
                  </div>

                  {/* Texts */}
                  <div className="flex-1 flex flex-col justify-center gap-6 w-full py-4">
                    <p className={`text-[28px] leading-[1.8] font-arabic px-2 drop-shadow-sm ${
                      design === 'classic' ? 'text-black' : design === 'royal' ? 'text-[#FFD700]' : 'text-white'
                    }`} dir="rtl">
                      {arabicText}
                    </p>
                    
                    <div className="flex items-center justify-center space-x-3 w-full opacity-60">
                       <div className={`h-[1px] w-12 ${design === 'classic' ? 'bg-[#D4AF37]' : design === 'royal' ? 'bg-[#FFD700]' : 'bg-white'}`} />
                       <div className={`w-1.5 h-1.5 rotate-45 ${design === 'classic' ? 'bg-[#D4AF37]' : design === 'royal' ? 'bg-[#FFD700]' : 'bg-white'}`} />
                       <div className={`h-[1px] w-12 ${design === 'classic' ? 'bg-[#D4AF37]' : design === 'royal' ? 'bg-[#FFD700]' : 'bg-white'}`} />
                    </div>

                    <p className={`text-[15px] font-bengali leading-[1.7] font-semibold px-2 ${
                      design === 'classic' ? 'text-[#4A4A4A]' : design === 'royal' ? 'text-[#E2E8F0]' : 'text-gray-300'
                    }`}>
                      {bengaliText}
                    </p>
                  </div>

                  {/* Footer Label */}
                  <div className={`text-[8px] font-sans font-bold tracking-[0.3em] uppercase mt-4 ${
                    design === 'classic' ? 'text-[#B8860B]' : design === 'royal' ? 'text-[#FFD700]/60' : 'text-white/40'
                  }`}>
                    Al-Quran App
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-[var(--bg-surface)] border-t border-[var(--border)] flex flex-col gap-3">
             <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleCopy}
                  className="flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border)] font-bold text-[var(--text-main)] active:scale-95 transition-all text-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-[var(--text-muted)]" />}
                  <span>{copied ? 'কপি হয়েছে' : 'টেক্সট কপি'}</span>
                </button>
                <button 
                  onClick={handleDownload}
                  disabled={isProcessing}
                  className="flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border)] font-bold text-[var(--text-main)] active:scale-95 transition-all text-sm relative overflow-hidden"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-[var(--text-muted)] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 text-[var(--text-muted)]" />
                  )}
                  <span>{isProcessing ? 'ডাউনলোডিং...' : 'ডাউনলোড'}</span>
                </button>
             </div>
             
             {navigator.share && (
               <button 
                  onClick={handleShare}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-xl bg-[var(--primary)] text-white font-bold shadow-lg active:scale-95 transition-all text-sm flex justify-center items-center gap-2"
               >
                 {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 ) : (
                    <Share2 className="w-4 h-4" />
                 )}
                 <span>সরাসরি শেয়ার করুন</span>
               </button>
             )}
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
