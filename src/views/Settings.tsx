import { useAppStore } from '../Store';
import { QARIS } from '../types';
import { motion } from 'motion/react';
import { Palette, Headphones, BookOpen, Settings2, MoveDown, Download, Bell, Plus, X, Clock, ZoomIn, Lock, Unlock, Smartphone, CheckCircle2, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from '../components/PWAInstallModal';

export const SettingsView = () => {
  const { 
    theme, setTheme, 
    qari, setQari, 
    autoScrollAyah, setAutoScrollAyah, 
    arabicFontSize, setArabicFontSize, 
    bengaliFontSize, setBengaliFontSize,
    reminders, addReminder, removeReminder,
    firebaseAuthError,
    globalZoom, setGlobalZoom,
    zoomLocked, setZoomLocked
  } = useAppStore();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReminder, setNewReminder] = useState("08:00");

  const handleInstall = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success && isIOS) {
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="pb-32 px-4 pt-6 max-w-3xl mx-auto font-bengali">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-main)] rounded-[2.5rem] p-10 mb-8 border border-[var(--border)] shadow-sm text-center relative overflow-hidden"
      >
        <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] rounded-[2rem] p-[2px] mb-5 shadow-lg transform rotate-3">
           <div className="w-full h-full bg-[var(--bg-surface)] rounded-[1.8rem] flex items-center justify-center">
             <BookOpen className="w-12 h-12 text-[var(--primary)]" />
           </div>
        </div>
        <h2 className="text-3xl font-bold font-sans text-[var(--text-main)]">আল-কুরআন সেটিংস</h2>
        <p className="text-[var(--text-muted)] text-sm font-bold mt-2 bg-[var(--bg-main)] px-4 py-1.5 rounded-full inline-block border border-[var(--border)] border-opacity-50">অ্যাপের নিজস্ব কন্ট্রোল</p>
      </motion.div>

      {/* PWA Install Section */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-[2rem] shadow-lg shadow-emerald-600/20 overflow-hidden mb-6 p-5 sm:p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="w-13 h-13 rounded-2xl bg-white/20 text-white flex items-center justify-center shadow-inner shrink-0">
            {isInstalled ? <CheckCircle2 className="w-7 h-7 text-emerald-200" /> : <Smartphone className="w-7 h-7" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-lg">
                {isInstalled ? 'আল-কুরআন অ্যাপ ইনস্টল সম্পন্ন' : 'ওয়েবসাইট থেকে অ্যাপ ইনস্টল করুন'}
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wide">
                PWA
              </span>
            </div>
            <p className="text-white/85 text-xs font-medium tracking-wide mt-0.5">
              {isInstalled 
                ? 'অ্যাপটি সরাসরি আপনার ডিভাইসে অফলাইন সুবিধা সহ সক্রিয় রয়েছে।' 
                : 'হোম স্ক্রিনে আইকন বানিয়ে কোনো ব্রাউজার বার ছাড়া ফুলস্ক্রিন অ্যাপ মোডে পড়ুন।'}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2 justify-end">
          {isInstalled ? (
            <div className="px-4 py-2 bg-white/20 rounded-xl text-xs font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>ইনস্টল করা আছে</span>
            </div>
          ) : (
            <button
              onClick={handleInstall}
              className="w-full sm:w-auto px-5 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>{isIOS ? 'ইনস্টল নিয়মাবলী' : 'এখনই ইনস্টল করুন'}</span>
            </button>
          )}
        </div>
      </motion.div>

      <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="space-y-6 mt-6">
        {/* Appearance */}
        <div className="bg-[var(--bg-surface)] rounded-[2rem] border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-main)] bg-opacity-30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[var(--text-main)] text-lg">অ্যাপ থিম (Theme)</h4>
            </div>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 border-b border-[var(--border)]">
            {(['light', 'dark', 'emerald', 'luxury', 'ocean', 'rose', 'sunset', 'midnight'] as const).map((t) => (
              <button 
                key={t}
                onClick={() => setTheme(t)}
                className={`py-4 rounded-2xl text-[10px] font-bold border transition-all uppercase tracking-wider ${
                  theme === t 
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] scale-[1.02] shadow-lg' 
                    : 'text-[var(--text-muted)] border-[var(--border)] bg-[var(--bg-main)] hover:border-[var(--primary)] hover:scale-[1.01]'
                }`}
              >
                {t === 'light' ? 'লাইট' : 
                 t === 'dark' ? 'ডার্ক' : 
                 t === 'emerald' ? 'এমারেল্ড' : 
                 t === 'luxury' ? 'লাক্সারি' : 
                 t === 'ocean' ? 'ওশান' : 
                 t === 'rose' ? 'রোজ' : 
                 t === 'sunset' ? 'সানসেট' : 'মিডনাইট'}
              </button>
            ))}
          </div>

          {/* Font Sizes Controls */}
          <div className="p-6">
            <h5 className="font-bold text-[var(--text-main)] mb-4">ফন্ট সাইজ (Font Size)</h5>
            
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[var(--text-main)]">আরবি ফন্ট</p>
                  <p className="text-xs text-[var(--text-muted)] font-semibold">بِسْمِ ٱللَّهِ</p>
                </div>
                <div className="flex items-center space-x-3 bg-[var(--bg-main)] p-1.5 rounded-2xl border border-[var(--border)]">
                   <button 
                     onClick={() => setArabicFontSize(Math.max(20, arabicFontSize - 2))}
                     className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] text-[var(--text-main)] font-bold border border-[var(--border)] active:scale-95 transition-transform"
                   >
                     -
                   </button>
                   <span className="w-8 text-center font-bold text-sm text-[var(--primary)]">{arabicFontSize}</span>
                   <button 
                     onClick={() => setArabicFontSize(Math.min(60, arabicFontSize + 2))}
                     className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] text-[var(--text-main)] font-bold border border-[var(--border)] active:scale-95 transition-transform"
                   >
                     +
                   </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[var(--text-main)]">অনুবাদ ফন্ট</p>
                  <p className="text-xs text-[var(--text-muted)] font-semibold">বিসমিল্লাহ</p>
                </div>
                <div className="flex items-center space-x-3 bg-[var(--bg-main)] p-1.5 rounded-2xl border border-[var(--border)]">
                   <button 
                     onClick={() => setBengaliFontSize(Math.max(12, bengaliFontSize - 1))}
                     className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] text-[var(--text-main)] font-bold border border-[var(--border)] active:scale-95 transition-transform"
                   >
                     -
                   </button>
                   <span className="w-8 text-center font-bold text-sm text-[var(--primary)]">{bengaliFontSize}</span>
                   <button 
                     onClick={() => setBengaliFontSize(Math.min(30, bengaliFontSize + 1))}
                     className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] text-[var(--text-main)] font-bold border border-[var(--border)] active:scale-95 transition-transform"
                   >
                     +
                   </button>
                </div>
              </div>

              {/* Global App Zoom scaling */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] border-opacity-40">
                <div>
                  <p className="text-sm font-bold text-[var(--text-main)] flex items-center space-x-1.5">
                    <ZoomIn className="w-4 h-4 text-[var(--primary)]" />
                    <span>অ্যাপ জুম লেভেল (Layout Zoom)</span>
                  </p>
                  <p className="text-xs text-[var(--text-muted)] font-semibold">সম্পূর্ণ অ্যাপ্লিকেশন বড় বা ছোট করুন</p>
                </div>
                <div className="flex items-center space-x-3 bg-[var(--bg-main)] p-1.5 rounded-2xl border border-[var(--border)]">
                   <button 
                     onClick={() => setGlobalZoom(Math.max(80, globalZoom - 5))}
                     className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] text-[var(--text-main)] font-bold border border-[var(--border)] active:scale-95 transition-transform"
                     title="কমান"
                   >
                     -
                   </button>
                   <span className="w-14 text-center font-bold text-sm text-[var(--primary)]">{globalZoom}%</span>
                   <button 
                     onClick={() => setGlobalZoom(Math.min(150, globalZoom + 5))}
                     className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] text-[var(--text-main)] font-bold border border-[var(--border)] active:scale-95 transition-transform"
                     title="বাড়ান"
                   >
                     +
                   </button>
                </div>
              </div>

              {/* Screen Zoom Stability Lock */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] border-opacity-40">
                <div>
                  <p className="text-sm font-bold text-[var(--text-main)] flex items-center space-x-1.5">
                    {zoomLocked ? (
                      <Lock className="w-4 h-4 text-[var(--primary)] animate-pulse" />
                    ) : (
                      <Unlock className="w-4 h-4 text-[var(--text-muted)]" />
                    )}
                    <span>স্ক্রিন জুম প্রটেকশন (Zoom Prevention)</span>
                  </p>
                  <p className="text-xs text-[var(--text-muted)] font-semibold">মোবাইলে অনাকাঙ্ক্ষিত ও অনিচ্ছাকৃত জুম হওয়া রোধ করুন</p>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => setZoomLocked(!zoomLocked)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                      zoomLocked ? 'bg-[var(--primary)]' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                        zoomLocked ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Live Interactive Font Preview Panel */}
            <div className="mt-8 p-6 rounded-[1.75rem] bg-[var(--bg-main)] border border-[var(--border)] border-dashed relative overflow-hidden">
              <span className="absolute top-4 right-4 text-[9px] font-black tracking-widest text-[var(--text-muted)] uppercase font-sans bg-[var(--bg-surface)] border border-[var(--border)] px-2.5 py-1 rounded-full shadow-inner">
                লাইভ প্রিভিউ / Live Preview
              </span>
              <div className="space-y-5 pt-3">
                <div className="border-b border-[var(--border)] border-opacity-40 pb-4">
                  <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-wider block mb-2 font-sans">আরবি হরফ তিলাওয়াত</span>
                  <div className="overflow-x-auto py-2">
                    <p className="font-arabic text-right leading-relaxed pr-2 text-indigo-500 dark:text-indigo-400 select-none custom-transition" style={{ fontSize: `${arabicFontSize}px` }} dir="rtl">
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-wider block mb-2 font-sans">বাংলা অনুবাদ ফন্ট</span>
                  <p className="font-bengali leading-relaxed text-emerald-600 dark:text-emerald-400 select-none custom-transition" style={{ fontSize: `${bengaliFontSize}px` }}>
                    পরম করুণাময় অসীম দয়ালু আল্লাহর নামে শুরু করছি।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="bg-[var(--bg-surface)] rounded-[2rem] border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-main)] bg-opacity-30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center">
                <Settings2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[var(--text-main)] text-lg">অডিও কন্ট্রোল</h4>
            </div>
          </div>
          
          {/* List Toggles */}
          <div className="p-6 flex items-center justify-between hover:bg-[var(--bg-main)] transition-colors cursor-pointer" onClick={() => setAutoScrollAyah(!autoScrollAyah)}>
            <div className="flex items-center space-x-4">
               <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center">
                 <MoveDown className="w-5 h-5" />
               </div>
               <div>
                 <h5 className="font-bold text-[var(--text-main)] text-base">অটো-স্ক্রল (Auto Scroll)</h5>
                 <p className="text-xs text-[var(--text-muted)] font-semibold mt-1">কুরআন পড়ার সময় স্ক্রিন নিজে নিজে এগোবে</p>
               </div>
            </div>
            {/* iOS Style Toggle Switch */}
            <div className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${autoScrollAyah ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}>
              <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${autoScrollAyah ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>
        </div>

        {/* Qari Selection */}
        <div className="bg-[var(--bg-surface)] rounded-[2rem] border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-main)] bg-opacity-30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[var(--text-main)] text-lg">তেলাওয়াতকারী নির্বাচন</h4>
            </div>
          </div>
          <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 border-b border-[var(--border)]">
            {QARIS.map(q => (
              <div 
                key={q.id}
                onClick={() => setQari(q.id)}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  qari === q.id 
                    ? 'bg-[var(--primary-soft)] border-[var(--primary)] shadow-sm scale-[1.01]' 
                    : 'bg-[var(--bg-main)] border-transparent hover:border-[var(--border)] hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    qari === q.id ? 'bg-[var(--primary)] text-white shadow-md' : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border)]'
                  }`}>
                    <Headphones className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-[var(--text-main)] text-sm">{q.name}</h5>
                </div>
                {qari === q.id && (
                  <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-inner">
                     <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reminders Section */}
        <div className="bg-[var(--bg-surface)] rounded-[2rem] border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-main)] bg-opacity-30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-md">
                <Bell className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[var(--text-main)] text-lg">নোটিফিকেশন ও রিমাইন্ডার</h4>
            </div>
          </div>
          
          <div className="divide-y divide-[var(--border)]">
            {/* Daily Reminders */}
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-[var(--text-main)] text-base">দৈনিক রিমাইন্ডার</h5>
                  <p className="text-xs text-[var(--text-muted)] font-semibold mt-1">কোরআন পড়ার সময় নির্ধারণ করুন</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 py-2">
                {reminders.map(time => (
                  <div key={time} className="flex items-center space-x-2 bg-[var(--bg-main)] border border-[var(--border)] px-4 py-2 rounded-full shadow-sm text-sm font-bold text-[var(--text-main)]">
                    <span>{time}</span>
                    <button onClick={() => removeReminder(time)} className="text-red-400 hover:text-red-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input 
                  type="time" 
                  value={newReminder}
                  onChange={(e) => setNewReminder(e.target.value)}
                  className="bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-main)] px-4 py-2 rounded-xl text-sm outline-none focus:border-[var(--primary)] transition-colors"
                />
                <button 
                  onClick={() => addReminder(newReminder)}
                  className="bg-[var(--primary)] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 hover:opacity-90 active:scale-95 transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>রিমাইন্ডার যোগ করুন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


