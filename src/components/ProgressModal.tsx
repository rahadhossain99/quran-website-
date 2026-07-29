import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { X, TrendingUp, Clock, BookOpen, Target, Activity, Flame, ChevronRight, BarChart2, Sparkles, RefreshCcw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAppStore } from '../Store';
import { SurahInfo } from '../types';

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  allSurahs?: SurahInfo[];
}

const BENGALI_DAYS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

export const ProgressModal: React.FC<ProgressModalProps> = ({ isOpen, onClose, allSurahs = [] }) => {
  const { weeklyProgress, resetProgress } = useAppStore();
  const [confirmText, setConfirmText] = useState('');
  const [isRestarting, setIsRestarting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const chartData = weeklyProgress.map(p => {
    const date = new Date(p.date);
    const dayName = BENGALI_DAYS[date.getDay()];
    const surahNames = p.surahs
      .map(num => allSurahs.find(s => s.number === num)?.englishName || num)
      .join(', ');

    return {
      name: dayName,
      ayahs: p.ayahs,
      time: p.minutes,
      seconds: p.seconds % 60,
      surahs: surahNames || 'নেই'
    };
  });

  const todayProgress = weeklyProgress[weeklyProgress.length - 1] || { ayahs: 0, minutes: 0, seconds: 0, surahs: [] };
  const todayDayName = BENGALI_DAYS[new Date().getDay()];
  const totalAyahs = weeklyProgress.reduce((acc, curr) => acc + (curr.ayahs || 0), 0);
  const totalSeconds = weeklyProgress.reduce((acc, curr) => acc + (curr.seconds || 0), 0);

  const formatSecs = (ts: number) => {
    const total = ts || 0;
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
  };

  const avgAyahs = Math.round(totalAyahs / 7);
  const bestDay = [...weeklyProgress].sort((a, b) => b.ayahs - a.ayahs)[0];
  const bestDayName = BENGALI_DAYS[new Date(bestDay.date).getDay()];

  const dailyGoal = 30; // Hardcoded goal
  const goalProgress = Math.min(100, Math.round((todayProgress.ayahs / dailyGoal) * 100));
  
  // Calculate streak (consecutive days with at least 1 ayah)
  let streak = 0;
  for (let i = weeklyProgress.length - 1; i >= 0; i--) {
    if (weeklyProgress[i].ayahs > 0) streak++;
    else if (i === weeklyProgress.length - 1) continue; // Allow today to be 0 for a while
    else break;
  }

  const handleRestart = () => {
    if (confirmText === 'RESTART') {
      const success = resetProgress('RESTART');
      if (success) {
        setConfirmText('');
        setIsRestarting(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[var(--bg-main)] w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] my-auto font-bengali border border-[var(--border)] relative"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-[var(--border)] bg-[var(--bg-surface)] sticky top-0 z-20">
             <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[var(--primary-soft)] rounded-2xl flex items-center justify-center border border-[var(--primary)]/20 shadow-inner">
                  <Activity className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-[var(--text-main)] flex items-center">
                    অগ্রগতি ড্যাশবোর্ড
                    <span className="ml-3 px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] uppercase font-bold rounded-full border border-red-500/20 flex items-center animate-pulse">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1" />
                      Live
                    </span>
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] font-bold opacity-80 mt-1">আপনার বাস্তব কর্মদক্ষতা ট্র্যাক করুন</p>
                </div>
             </div>
             <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--bg-main)] hover:bg-[var(--border)] transition-colors border border-[var(--border)]">
               <X className="w-5 h-5 text-[var(--text-muted)]" />
             </button>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Today's Special Box */}
            <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-soft)] p-6 rounded-[2.5rem] text-white shadow-lg shadow-[var(--primary)]/20 relative overflow-hidden group"
            >
              <div className="relative z-10">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                       <span className="text-xs font-bold uppercase tracking-widest opacity-80 bg-white/20 px-3 py-1 rounded-full">{todayDayName}, আজকের অগ্রগতি</span>
                       <h2 className="text-3xl font-bold mt-2">মাশাআল্লাহ!</h2>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                       <CheckCircle className="w-6 h-6" />
                    </div>
                 </div>
                 <div className="flex items-center space-x-8">
                    <div className="bg-white/10 px-6 py-4 rounded-3xl backdrop-blur-md border border-white/10">
                       <p className="text-[10px] uppercase font-bold opacity-70 mb-1">আয়াত পঠিত</p>
                       <p className="text-4xl font-bold font-sans tracking-tight">{todayProgress.ayahs || 0}</p>
                    </div>
                    <div className="bg-white/10 px-6 py-4 rounded-3xl backdrop-blur-md border border-white/10">
                       <p className="text-[10px] uppercase font-bold opacity-70 mb-1">সময় ব্যয়িত (লাইভ)</p>
                       <p className="text-4xl font-bold font-sans tracking-tight">
                         {Math.floor((todayProgress.seconds || 0) / 60)}m 
                         <span className="text-xl ml-1 opacity-80">{(todayProgress.seconds || 0) % 60}s</span>
                       </p>
                    </div>
                    <div className="hidden md:block bg-white/10 px-6 py-4 rounded-3xl backdrop-blur-md border border-white/10">
                       <p className="text-[10px] uppercase font-bold opacity-70 mb-1">লক্ষ্য পূরণ</p>
                       <p className="text-4xl font-bold font-sans tracking-tight">{goalProgress}%</p>
                    </div>
                 </div>
              </div>
              {/* Decoration */}
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute -left-10 -top-10 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border)] flex flex-col justify-center items-center text-center shadow-sm">
                <BookOpen className="w-8 h-8 text-blue-500 mb-3" />
                <span className="text-3xl font-bold font-sans text-[var(--text-main)]">{totalAyahs}</span>
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1">সাপ্তাহিক আয়াত</span>
              </div>
              <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border)] flex flex-col justify-center items-center text-center shadow-sm">
                <Clock className="w-8 h-8 text-emerald-500 mb-3" />
                <span className="text-3xl font-bold font-sans text-[var(--text-main)]">{formatSecs(totalSeconds)}</span>
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1">সাপ্তাহিক সময়</span>
              </div>
              <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border)] relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-3xl" />
                <Flame className="w-8 h-8 text-orange-500 mb-3 fill-orange-500/20" />
                <span className="text-3xl font-bold font-sans text-[var(--text-main)]">{streak || 0} দিন</span>
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1">পঠন স্ট্রাইক</span>
              </div>
            </div>

            {/* Reading Habits & Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border)] flex items-center space-x-5">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                    <Target className="w-7 h-7 text-blue-500" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">দৈনিক গড় পঠন</h5>
                    <p className="text-2xl font-bold font-sans text-[var(--text-main)]">{avgAyahs} <span className="text-xs font-bengali font-normal">আয়াত / দিন</span></p>
                  </div>
               </div>
               <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border)] flex items-center space-x-5">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-emerald-500" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">সবচেয়ে ভালো দিন</h5>
                    <p className="text-2xl font-bold font-bengali text-[var(--text-main)]">{bestDayName} <span className="text-xs font-sans font-bold text-[var(--primary)] text-emerald-500">({bestDay.ayahs} আয়াত)</span></p>
                  </div>
               </div>
            </div>

            {/* Success Toast */}
            <AnimatePresence>
               {showSuccess && (
                 <motion.div 
                   initial={{ opacity: 0, y: -20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0 }}
                   className="bg-emerald-500 text-white p-4 rounded-2xl flex items-center justify-center space-x-3 shadow-lg shadow-emerald-500/20"
                 >
                   <CheckCircle className="w-5 h-5" />
                   <span className="font-bold text-sm">সফলভাবে সমস্ত তথ্য পুনোরায় শুরু করা হয়েছে!</span>
                 </motion.div>
               )}
            </AnimatePresence>

            {/* Detailed Charts Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Area Chart: Ayahs read over week */}
              <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border)]">
                <h4 className="font-bold mb-4 flex items-center text-sm text-[var(--text-main)]">
                  <TrendingUp className="w-4 h-4 mr-2 text-[var(--primary)]" /> দৈনিক আয়াত পঠন
                </h4>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorAyahsDetailed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 'bold' }} dy={10} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', borderRadius: '12px', fontSize: '12px', color: 'var(--text-main)' }}
                        formatter={(value: any, name: any, props: any) => [`${value} আয়াত`, `সূরা: ${props.payload.surahs}`]}
                      />
                      <Area type="monotone" dataKey="ayahs" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorAyahsDetailed)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart: Time spent learning */}
              <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border)]">
                <h4 className="font-bold mb-4 flex items-center text-sm text-[var(--text-main)]">
                  <BarChart2 className="w-4 h-4 mr-2 text-emerald-500" /> ব্যয়িত সময় (মিনিট)
                </h4>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 'bold' }} dy={10} />
                      <RechartsTooltip 
                        cursor={{ fill: 'var(--text-muted)', opacity: 0.1 }}
                        contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', borderRadius: '12px', fontSize: '12px', color: 'var(--text-main)' }}
                      />
                      <Bar dataKey="time" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.time > 15 ? '#10b981' : '#3b82f6'} opacity={0.8} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recently Read Surahs list */}
            {chartData.some(d => d.ayahs > 0) && (
              <div>
                <h4 className="font-bold mb-4 flex items-center text-lg text-[var(--text-main)] px-1">
                  <Sparkles className="w-5 h-5 mr-2 text-[var(--primary)]" />
                  এই সপ্তাহে পঠিত সূরাসমূহ
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {Array.from(new Set(weeklyProgress.flatMap(p => p.surahs))).map((surahNum) => {
                     const surah = allSurahs.find(s => s.number === surahNum);
                     if (!surah) return null;
                     return (
                       <div key={surahNum} className="flex items-center justify-between p-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl hover:border-[var(--primary)] transition-colors cursor-pointer group">
                          <div className="flex items-center space-x-3">
                             <div className="w-10 h-10 bg-[var(--bg-main)] rounded-xl flex items-center justify-center font-bold text-sm text-[var(--text-main)] border border-[var(--border)]">
                               {surahNum}
                             </div>
                             <div>
                               <div className="font-bold text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">{surah.englishName}</div>
                               <div className="text-xs text-[var(--text-muted)] font-sans">{surah.englishNameTranslation}</div>
                             </div>
                          </div>
                          <div className="bg-[var(--primary-soft)] text-[var(--primary)] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap">
                             পঠিত
                          </div>
                       </div>
                     );
                   })}
                </div>
              </div>
            )}

            {/* Reset Section */}
            <div className="border-t border-[var(--border)] pt-6">
               <button 
                onClick={() => setIsRestarting(!isRestarting)}
                className="w-full py-4 rounded-2xl border border-red-500/20 text-red-500 flex items-center justify-center space-x-2 hover:bg-red-500/5 transition-all font-bold text-sm"
               >
                 <RefreshCcw className="w-4 h-4" />
                 <span>সমস্ত তথ্য রিস্টার্ট করুন</span>
               </button>

               <AnimatePresence>
                 {isRestarting && (
                   <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-red-500/5 rounded-2xl mt-3 p-5 border border-red-500/10"
                   >
                     <div className="flex items-start space-x-3 mb-4">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <div>
                           <p className="text-xs text-red-500/80 font-bold leading-relaxed">
                             সতর্কতা: এটি আপনার গত ৭ দিনের সমস্ত রীডিং প্রগ্রেস মুছে ফেলবে। নিশ্চিত করতে নিচে ইংরেজিতে <b>RESTART</b> শব্দটি টাইপ করুন।
                           </p>
                        </div>
                     </div>
                     <input 
                       type="text" 
                       placeholder="এখানে RESTART লিখুন" 
                       value={confirmText}
                       onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                       className="w-full bg-[var(--bg-main)] border border-red-500/20 rounded-xl px-4 py-3 text-red-500 font-bold outline-none mb-3 focus:border-red-500 transition-all text-center tracking-widest placeholder:tracking-normal placeholder:font-normal placeholder:text-xs"
                     />
                     <button 
                      disabled={confirmText !== 'RESTART'}
                      onClick={handleRestart}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                        confirmText === 'RESTART' 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/20 active:scale-95' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                     >
                       নিশ্চিত করুন
                     </button>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

