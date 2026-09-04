import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, MapPin, Sun, Sunrise, Sunset, Moon, CloudSun, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { toBengaliDigits } from '../utils/prayerTimes';
import { useAppStore } from '../Store';

interface PrayerTimesModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  prayerTimes?: any;
  location?: any;
  onPlayAzan?: () => void;
  isAzanPlaying?: boolean;
}

export const PrayerTimesModal: React.FC<PrayerTimesModalProps> = (props) => {
  const store = useAppStore();
  const isOpen = props.isOpen !== undefined ? props.isOpen : true;
  const onClose = props.onClose || (() => {});
  const prayerTimes = props.prayerTimes || store.prayerTimes;
  const location = props.location || store.location;
  const onPlayAzan = props.onPlayAzan || store.playAzan;
  const isAzanPlaying = props.isAzanPlaying !== undefined ? props.isAzanPlaying : store.isAzanPlaying;

  if (!isOpen || !prayerTimes) return null;

  const prayers = [
    { id: 'Fajr', name: 'ফজর', icon: Sunrise, color: 'from-blue-400 to-indigo-500' },
    { id: 'Sunrise', name: 'সূর্যোদয়', icon: Sun, color: 'from-orange-300 to-yellow-500' },
    { id: 'Dhuhr', name: 'যোহর', icon: Sun, color: 'from-yellow-400 to-orange-500' },
    { id: 'Asr', name: 'আসর', icon: CloudSun, color: 'from-orange-400 to-red-500' },
    { id: 'Maghrib', name: 'মাগরিব', icon: Sunset, color: 'from-red-500 to-purple-600' },
    { id: 'Isha', name: 'এশা', icon: Moon, color: 'from-indigo-600 to-slate-900' },
  ];

  const convertTo12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${toBengaliDigits(hours12)}:${toBengaliDigits(minutes.toString().padStart(2, '0'))} ${period}`;
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex justify-center items-center p-4 font-bengali"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[var(--bg-surface)] w-full max-w-md min-h-[480px] rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col border border-[var(--border)]"
        >
          {/* Header */}
          <div className="p-6 border-b border-[var(--border)] bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-main)]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                   <Sparkles className="w-5 h-5 text-[var(--primary)]" />
                   <h3 className="text-2xl font-bold text-[var(--text-main)]">নামাজের সময়সূচী</h3>
                </div>
                {location && (
                  <div className="flex items-center text-[var(--text-muted)] text-sm ml-7">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    <span>{location.city}, {location.country}</span>
                  </div>
                )}
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 bg-[var(--bg-main)] rounded-full flex items-center justify-center hover:bg-[var(--border)] transition-colors border border-[var(--border)] shadow-sm"
              >
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>
            
            {/* Bright Green Banner with Action */}
            <div className="bg-gradient-to-r from-[#10b981] to-[#059669] rounded-2xl p-5 shadow-lg border border-white/20 flex items-center justify-between text-white">
              <div className="flex-1 pr-4">
                <p className="font-bold text-lg leading-tight tracking-tight">সালাত কায়েম করুন</p>
                <p className="text-[10px] opacity-90 font-medium uppercase tracking-[0.15em] mt-1 leading-relaxed">
                  নিশ্চয়ই নামাজ মুমিনদের ওপর নির্দিষ্ট সময়ে ফরজ করা হয়েছে
                </p>
              </div>
              <button 
                onClick={onPlayAzan}
                className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-[11px] font-bold backdrop-blur-md transition-all border shadow-sm ${isAzanPlaying ? 'bg-red-500 text-white border-red-400 ring-4 ring-red-500/20 animate-pulse' : 'bg-white/20 text-white border-white/30 hover:bg-white/40'}`}
              >
                {isAzanPlaying ? <VolumeX className="w-4 h-4 shadow-sm" /> : <Volume2 className="w-4 h-4 shadow-sm" />}
                <span>{isAzanPlaying ? 'বন্ধ করুন' : 'আজান শুনুন'}</span>
              </button>
            </div>
          </div>

          {/* Times List */}
          <div className="p-6 space-y-3 overflow-y-auto max-h-[50vh] custom-scrollbar bg-[var(--bg-surface)]">
            {prayers.map((p, idx) => {
              const time24 = prayerTimes[p.id];
              if (!time24) return null;
              
              const time12 = convertTo12Hour(time24);
              const Icon = p.icon;
              
              return (
                <motion.div 
                  key={p.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-4 bg-[var(--bg-main)] rounded-2xl border border-[var(--border)] group hover:border-[var(--primary)] hover:shadow-md transition-all shadow-sm"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white shadow-md ring-4 ring-opacity-10 ring-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--text-main)] text-sm">{p.name}</h4>
                      <div className="flex items-center space-x-1 mt-0.5">
                        <Clock className="w-3 h-3 text-[var(--text-muted)] opacity-50" />
                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">{p.id}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold font-sans text-[var(--text-main)] tabular-nums tracking-tight">{time12}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="p-6 bg-[var(--bg-main)] bg-opacity-50 border-t border-[var(--border)] text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-[var(--text-muted)] opacity-60">
              <Clock className="w-3.5 h-3.5" />
              <p className="text-[10px] font-bold font-sans uppercase tracking-[0.1em]">
                {new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            <a 
              href={`https://aladhan.com/prayer-times/bangladesh/${location?.city === 'ঢাকা' ? 'dhaka' : (location?.city || 'dhaka')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full px-6 py-3.5 text-xs font-bold text-white bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] hover:shadow-lg transition-all rounded-2xl border border-white/10 group"
            >
              <span>বিস্তারিত সময় ও ক্যালেন্ডার</span>
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </a>
            
            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-40">ইসলামিক ফাউন্ডেশন বাংলাদেশ ও ঢাকা স্ট্যান্ডার্ড সময়সূচি</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
