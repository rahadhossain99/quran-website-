import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Smartphone, Share, PlusSquare, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden font-bengali p-6 z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-[var(--bg-surface)] rounded-[14px] flex items-center justify-center">
                <Smartphone className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--text-main)] leading-tight">
                আল-কুরআন অ্যাপ ইনস্টল
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                মোবাইল বা কম্পিউটারে সরাসরি অ্যাপ আকারে চালান
              </p>
            </div>
          </div>

          {/* Already installed state */}
          {isInstalled ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                আল-কুরআন অ্যাপটি আপনার ডিভাইসে ইতিমধ্যেই ইনস্টল করা রয়েছে!
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                আপনি সরাসরি আপনার হোম স্ক্রিন বা অ্যাপ ড্রয়ার থেকে এটি খুলতে পারেন।
              </p>
            </div>
          ) : isIOS ? (
            /* iOS Safari Instructions */
            <div className="space-y-3 mb-5">
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">
                  iPhone / iPad ব্যবহারকারীদের জন্য নির্দেশিকা:
                </p>
                <div className="space-y-2.5 text-xs text-[var(--text-main)] mt-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center text-xs flex-shrink-0">
                      ১
                    </span>
                    <span className="flex items-center gap-1.5 flex-wrap">
                      Safari ব্রাউজারের নিচে বা উপরে থাকা <Share className="w-3.5 h-3.5 text-blue-500 inline" /> <strong>Share</strong> আইকনে চাপুন।
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center text-xs flex-shrink-0">
                      ২
                    </span>
                    <span className="flex items-center gap-1.5 flex-wrap">
                      নিচের দিকে স্ক্রোল করে <PlusSquare className="w-3.5 h-3.5 text-emerald-500 inline" /> <strong>Add to Home Screen</strong> নির্বাচন করুন।
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center text-xs flex-shrink-0">
                      ৩
                    </span>
                    <span>
                      উপরে ডানপাশে <strong>Add</strong> চাপলেই হোম স্ক্রিনে অ্যাপ আইকন চলে আসবে!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : isInstallable ? (
            /* Android / Chrome One-Click Install */
            <div className="mb-5">
              <button
                onClick={handleInstallClick}
                className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 active:scale-98 transition flex items-center justify-center gap-2.5 group cursor-pointer"
              >
                <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                <span className="text-base">এখনই অ্যাপ হিসেবে ইনস্টল করুন</span>
              </button>
            </div>
          ) : (
            /* Browser doesn't trigger prompt yet or desktop browser instructions */
            <div className="space-y-3 mb-5">
              <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-xs text-[var(--text-main)]">
                <p className="font-bold text-blue-700 dark:text-blue-400 mb-1.5">
                  ব্রাউজার মেনু থেকে ইনস্টল করার উপায়:
                </p>
                <p className="leading-relaxed">
                  ব্রাউজারের ডানদিকের মেনুতে (৩ ডট ⫶) ক্লিক করে <strong>"Install app"</strong> অথবা <strong>"Add to Home screen"</strong> চাপুন।
                </p>
              </div>
            </div>
          )}

          {/* App features list */}
          <div className="border-t border-[var(--border)] pt-4 space-y-2 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>সম্পূর্ণ ফুলস্ক্রিন ভিউ — কোনো ব্রাউজার বার ছাড়া মসৃণ অভিজ্ঞতা</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>অফলাইন সুবিধা — ইন্টারনেটের গতি কম থাকলেও দ্রুত লোড হবে</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-500" />
              <span>হোম স্ক্রিনে সরাসরি এক ট্যাপে কুরআন পড়ার সুবিধা</span>
            </div>
          </div>

          <div className="mt-5 text-center">
            <button
              onClick={onClose}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] underline py-1 px-3"
            >
              পরে করব
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
