import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'motion/react';
import { RotateCcw, Volume2, VolumeX, History, X, Trash2, Check, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const TASBIH_TYPES = [
  { label: 'সুবহানাল্লাহ', value: 'Subhanallah', target: 33, arabic: 'سُبْحَانَ ٱللَّٰهِ' },
  { label: 'আলহামদুলিল্লাহ', value: 'Alhamdulillah', target: 33, arabic: 'ٱلْحَمْدُ لِلَّٰهِ' },
  { label: 'আল্লাহু আকবার', value: 'Allahu Akbar', target: 34, arabic: 'ٱللَّٰهُ أَكْبَرُ' },
  { label: 'লা ইলাহা ইল্লাল্লাহ', value: 'La ilaha illallah', target: 100, arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ' },
  { label: 'ইস্তেগফার', value: 'Astaghfirullah', target: 100, arabic: 'أَسْتَغْفِرُ اللّٰهَ' }
];

let globalAudioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!globalAudioContext) {
    globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (globalAudioContext.state === 'suspended') {
    globalAudioContext.resume();
  }
  return globalAudioContext;
};

export const TasbihView = () => {
  const [count, setCount] = useState(() => Number(localStorage.getItem('tasbih_count')) || 0);
  const [selectedIdx, setSelectedIdx] = useState(() => Number(localStorage.getItem('tasbih_type')) || 0);
  const [sound, setSound] = useState(() => localStorage.getItem('tasbih_sound') !== 'false');

  const [history, setHistory] = useState<any[]>(() => JSON.parse(localStorage.getItem('tasbih_history') || '[]'));
  const [showHistory, setShowHistory] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hardware mobile back button for History Modal
  useEffect(() => {
    if (showHistory) {
      window.history.pushState({ modal: 'tasbih-history' }, '');
      const handlePopState = () => {
        setShowHistory(false);
        setShowClearConfirm(false);
      };
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [showHistory]);

  const handleCloseHistory = () => {
    window.history.back();
  };

  const totalCounts = history.reduce((acc, curr) => acc + curr.count, 0);
  const sessionCount = history.length;

  const graphData = TASBIH_TYPES.map(t => {
    return {
      name: t.label,
      count: history.filter(h => h.type === t.label).reduce((a, b) => a + b.count, 0)
    };
  });
  
  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const selectedTasbih = TASBIH_TYPES[selectedIdx];
  const [clickScale, setClickScale] = useState(1);

  // Motion values for draggability and rotation
  const tasbihX = useMotionValue(0);
  const tasbihY = useMotionValue(0);
  const tasbihRotate = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTasbihDrag = (_: any, info: any) => {
    // Organic rotation based on velocity
    tasbihRotate.set(info.velocity.x * 0.05);
  };

  const handleTasbihDragEnd = () => {
    setIsDragging(false);
    tasbihRotate.set(0); // Reset rotation smoothly when released
  };

  useEffect(() => {
    localStorage.setItem('tasbih_count', count.toString());
  }, [count]);

  useEffect(() => {
    localStorage.setItem('tasbih_type', selectedIdx.toString());
  }, [selectedIdx]);

  useEffect(() => {
    localStorage.setItem('tasbih_sound', sound ? 'true' : 'false');
  }, [sound]);

  const saveToHistory = (countValue: number) => {
    if (countValue === 0) return;
    const newEntry = {
      date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
      time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      type: selectedTasbih.label,
      count: countValue,
      id: Date.now()
    };
    const newHistory = [newEntry, ...history].slice(0, 100);
    setHistory(newHistory);
    localStorage.setItem('tasbih_history', JSON.stringify(newHistory));
  };

  const deleteHistoryEntry = (id: number) => {
    const newHistory = history.filter(entry => entry.id !== id);
    setHistory(newHistory);
    localStorage.setItem('tasbih_history', JSON.stringify(newHistory));
    setConfirmDeleteId(null);
  };

  const clearAllHistory = () => {
    setHistory([]);
    localStorage.setItem('tasbih_history', JSON.stringify([]));
    setShowClearConfirm(false);
  };

  const playTapSound = (isTargetReached: boolean = false) => {
    if (!sound) return;
    try {
      const audioCtx = getAudioContext();
      
      if (isTargetReached) {
        const playNote = (freq: number, startTime: number, duration: number) => {
           const osc = audioCtx.createOscillator();
           const gain = audioCtx.createGain();
           osc.type = 'sine';
           osc.frequency.value = freq;
           gain.gain.setValueAtTime(0.5, startTime);
           gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
           osc.connect(gain);
           gain.connect(audioCtx.destination);
           osc.start(startTime);
           osc.stop(startTime + duration);
        };
        const t = audioCtx.currentTime;
        playNote(523.25, t, 0.2); 
        playNote(659.25, t + 0.1, 0.2); 
        playNote(783.99, t + 0.2, 0.4); 
      } else {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.6, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
      }
    } catch(e) {}
  };

  const handleTap = () => {
    setClickScale(0.95);
    setTimeout(() => setClickScale(1), 100);
    setCount(c => {
      const next = c + 1;
      const isTarget = next === selectedTasbih.target || next % selectedTasbih.target === 0;
      playTapSound(isTarget);
      return next;
    });
  };

  const handleReset = () => {
    saveToHistory(count);
    setCount(0);
  };

  const handleChangeType = (idx: number) => {
    saveToHistory(count);
    setSelectedIdx(idx);
    setCount(0);
  };

  const renderGraph = () => {
    if (!isMounted || history.length === 0) return null;
    return (
      <div className="mb-8 p-6 bg-[var(--bg-main)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-inner">
        <div className="flex items-center space-x-2 mb-6">
          <BarChart3 className="w-5 h-5 text-[var(--primary)]" />
          <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">ধরণ অনুযায়ী তাসবিহ গ্রাফ</p>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-muted)', fontSize: 9, fontWeight: 700 }}
                interval={0}
                tickFormatter={(val) => val.length > 8 ? val.substring(0, 7) + '...' : val}
              />
              <Tooltip 
                cursor={{ fill: 'var(--bg-surface)', opacity: 0.1 }}
                contentStyle={{ 
                  backgroundColor: 'var(--bg-surface)', 
                  borderColor: 'var(--border)', 
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={32}>
                {graphData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-32 px-4 pt-6 max-w-2xl mx-auto font-bengali flex flex-col items-center">
      
      {/* History Modal Overlay */}
      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[var(--bg-surface)] w-full max-w-md rounded-[2rem] p-6 shadow-2xl border border-[var(--border)] max-h-[80vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-sans text-[var(--text-main)]">তাসবিহ হিস্টোরি</h2>
                <div className="flex items-center space-x-2">
                  {history.length > 0 && !showClearConfirm && (
                    <button onClick={() => setShowClearConfirm(true)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors" title="সব হিস্টোরি মুছুন">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button onClick={handleCloseHistory} className="p-2 bg-[var(--bg-main)] rounded-full hover:bg-[var(--border)] transition-colors">
                    <X className="w-6 h-6 text-[var(--text-muted)]" />
                  </button>
                </div>
              </div>

              {showClearConfirm && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex flex-col items-center">
                  <p className="text-red-500 font-bold mb-3 text-center">সব হিস্টোরি মুছে ফেলতে নিশ্চিত?</p>
                  <div className="flex space-x-3 w-full">
                    <button onClick={() => setShowClearConfirm(false)} className="flex-1 bg-[var(--bg-main)] py-2 rounded-xl font-bold">বাতিল</button>
                    <button onClick={clearAllHistory} className="flex-1 bg-red-500 text-white py-2 rounded-xl font-bold">মুছুন</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[var(--primary)] bg-opacity-5 border border-[var(--primary)] border-opacity-10 p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider mb-1">মোট তসবিহ</p>
                  <p className="text-2xl font-bold text-[var(--text-main)] font-sans">{totalCounts}</p>
                </div>
                <div className="bg-[var(--accent)] bg-opacity-5 border border-[var(--accent)] border-opacity-10 p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider mb-1">মোট সেশন</p>
                  <p className="text-2xl font-bold text-[var(--text-main)] font-sans">{sessionCount}</p>
                </div>
              </div>

              {renderGraph()}
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                {history.length === 0 ? (
                  <div className="text-center py-20 opacity-30">
                    <History className="w-16 h-16 mx-auto mb-4" />
                    <p className="font-bold">কোনো হিস্টোরি নেই</p>
                  </div>
                ) : (
                  history.map((entry, i) => (
                    <div key={entry.id || i} className="bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border)] flex justify-between items-center group transition-all hover:border-[var(--primary)]">
                       <div>
                          <p className="font-bold text-[var(--text-main)]">{entry.type}</p>
                          <p className="text-[10px] text-[var(--text-muted)] font-bold">{entry.date} • {entry.time}</p>
                       </div>
                       <div className="flex items-center space-x-3">
                          <span className="bg-[var(--bg-surface)] px-3 py-1 rounded-full text-xs font-black text-[var(--primary)] border border-[var(--border)]">{entry.count}</span>
                          <button onClick={() => deleteHistoryEntry(entry.id)} className="text-red-500 opacity-30 hover:opacity-100 transition-opacity">
                            <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-[var(--bg-surface)] rounded-[2.5rem] p-8 mb-8 text-center border border-[var(--border)] shadow-sm relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)] opacity-5 to-transparent pointer-events-none" />
        <div className="flex justify-between items-center mb-6 border-b border-[var(--border)] pb-6">
          <div className="text-left">
            <h2 className="text-2xl font-bold font-sans text-[var(--text-main)]">ডিজিটাল তাসবিহ</h2>
            <p className="text-[var(--text-muted)] font-semibold text-xs mt-1">খুব সহজে স্ক্রিনে প্রেস করে তাসবিহ গুনে নিন</p>
          </div>
          <button 
            onClick={() => setShowHistory(true)}
            className="w-12 h-12 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] shadow-sm flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          >
            <History className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex bg-[var(--bg-main)] p-1.5 rounded-2xl border border-[var(--border)] overflow-x-auto custom-scrollbar relative z-10">
          {TASBIH_TYPES.map((t, idx) => (
            <button
              key={idx}
              onClick={() => handleChangeType(idx)}
              className={`whitespace-nowrap px-4 py-2.5 text-xs font-black rounded-xl transition-all flex-shrink-0 uppercase tracking-wider ${
                selectedIdx === idx 
                  ? 'bg-[var(--bg-surface)] text-[var(--primary)] shadow-md border border-[var(--border)]' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="text-center mb-10 w-full relative h-96 flex flex-col items-center justify-center">
        <h3 className="text-4xl font-arabic text-[var(--primary)] mb-2 h-14 transition-all">{selectedTasbih.arabic}</h3>
        <p className="text-[10px] font-black text-[var(--text-muted)] tracking-[0.3em] uppercase mb-8 opacity-60">{selectedTasbih.value}</p>
        
        <motion.div 
          drag
          dragMomentum={false}
          dragElastic={0.1}
          onDragStart={() => setIsDragging(true)}
          onDrag={handleTasbihDrag}
          onDragEnd={handleTasbihDragEnd}
          style={{ x: tasbihX, y: tasbihY, rotate: tasbihRotate }}
          animate={{ scale: isDragging ? 1.05 : 1 }}
          className="relative w-64 h-64 md:w-72 md:h-72 cursor-grab active:cursor-grabbing z-20"
        >
          <svg className="w-full h-full transform -rotate-90 absolute inset-0 drop-shadow-2xl" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border)" strokeWidth="5" strokeOpacity="0.2" />
            <motion.circle 
              cx="50" cy="50" r="45" fill="none" stroke="var(--primary)" strokeWidth="6" 
              strokeDasharray="283"
              animate={{ strokeDashoffset: 283 - (283 * (count % selectedTasbih.target)) / selectedTasbih.target }}
              transition={{ ease: "easeOut", duration: 0.3 }}
              strokeLinecap="round"
            />
          </svg>
          
          <button 
            onClick={(e) => {
              if (!isDragging) handleTap();
            }}
            style={{ transform: `scale(${clickScale})` }}
            className="w-full h-full rounded-full bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-main)] shadow-[0_20px_40px_rgba(0,0,0,0.1),inset_0_4px_10px_rgba(255,255,255,0.8)] border border-[var(--border)] border-opacity-50 flex items-center justify-center flex-col outline-none transition-transform active:shadow-inner relative overflow-hidden group pointer-events-auto"
          >
            <AnimatePresence mode="popLayout">
              <motion.span 
                key={count}
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="text-[5rem] font-black text-[var(--text-main)] font-sans tracking-tighter"
              >
                {count}
              </motion.span>
            </AnimatePresence>
            <span className="text-[10px] font-black text-[var(--text-muted)] opacity-50 uppercase tracking-widest mt-1">/ {selectedTasbih.target}</span>
          </button>
        </motion.div>
      </div>
      
      <div className="flex items-center space-x-6">
        <button onClick={handleReset} className="w-16 h-16 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-[var(--accent)] border border-[var(--border)] shadow-lg hover:rotate-180 transition-all duration-700 active:scale-90">
          <RotateCcw className="w-7 h-7" />
        </button>
        <button onClick={() => setSound(!sound)} className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 relative z-10 border border-[var(--border)] ${sound ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'}`}>
          {sound ? <Volume2 className="w-7 h-7" /> : <VolumeX className="w-7 h-7" />}
        </button>
      </div>
    </div>
  );
};
