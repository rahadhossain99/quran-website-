import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallBannerProps {
  variant?: 'banner' | 'button' | 'badge';
  className?: string;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ variant = 'banner', className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('pwa_banner_dismissed') === 'true';
    }
    return false;
  });

  // If already running as installed standalone PWA, do not show banner
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success && isIOS) {
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-sm hover:shadow-md active:scale-95 transition-all font-bengali cursor-pointer ${className}`}
          title="অ্যাপ ইনস্টল করুন"
        >
          <Download className="w-3.5 h-3.5" />
          <span>অ্যাপ ইনস্টল</span>
        </button>
        <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  if (variant === 'badge') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold font-bengali hover:bg-emerald-500/25 active:scale-95 transition-all ${className}`}
        >
          <Smartphone className="w-3 h-3 text-emerald-600" />
          <span>অ্যাপ নামান</span>
        </button>
        <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  // Full banner mode
  if (isDismissed) {
    return (
      <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`w-full bg-gradient-to-r from-emerald-900/90 via-emerald-800/95 to-teal-900/90 text-white rounded-2xl p-3.5 sm:p-4 shadow-md border border-emerald-500/30 relative overflow-hidden font-bengali ${className}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0 text-emerald-300">
              <Smartphone className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1.5">
                <span>আল-কুরআন অ্যাপ হিসেবে ইনস্টল করুন</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-medium border border-emerald-400/30">
                  অফলাইন সাপোর্ট
                </span>
              </h4>
              <p className="text-[11px] text-emerald-100/80 truncate">
                হোম স্ক্রিনে আইকন বানিয়ে সরাসরি ফুলস্ক্রিনে কুরআনুল কারীম পড়ুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleClick}
              className="px-3.5 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-extrabold text-xs rounded-xl shadow-sm hover:shadow transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ইনস্টল</span>
            </button>
            <button
              onClick={handleDismiss}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-emerald-200 transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
