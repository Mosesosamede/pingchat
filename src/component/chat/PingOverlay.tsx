import React from 'react';
import { useChat } from '../../context/ChatContext';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, X, BellRing } from 'lucide-react';

export const PingOverlay: React.FC = () => {
  const { activePing, dismissPing, sendPing } = useChat();

  if (!activePing) return null;

  const handlePingBack = () => {
    if (activePing) {
      sendPing(activePing.senderId);
      dismissPing();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md pointer-events-auto">
        {/* Radar Ripple Waves Animation Background */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
          <motion.div
            initial={{ scale: 0.2, opacity: 0.8 }}
            animate={{ scale: 3.5, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            className="w-64 h-64 border-2 border-pink-500 rounded-full"
          />
          <motion.div
            initial={{ scale: 0.2, opacity: 0.8 }}
            animate={{ scale: 3.5, opacity: 0 }}
            transition={{ duration: 1.8, delay: 0.6, repeat: Infinity, ease: 'easeOut' }}
            className="w-64 h-64 border-2 border-sky-400 rounded-full"
          />
        </div>

        {/* Action Card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm p-6 overflow-hidden text-center bg-slate-900/95 border-2 border-pink-500/60 rounded-3xl shadow-2xl shadow-pink-500/30 text-white"
        >
          {/* Close button */}
          <button
            onClick={dismissPing}
            className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Avatar and Ping icon */}
          <div className="relative w-20 h-20 mx-auto mb-4">
            <img
              src={activePing.senderPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={activePing.senderName}
              className="w-full h-full rounded-2xl object-cover border-2 border-pink-400 shadow-lg shadow-pink-500/40"
            />
            <div className="absolute -bottom-2 -right-2 p-2 bg-gradient-to-r from-pink-500 to-sky-400 rounded-xl text-white shadow-md animate-bounce">
              <Zap className="w-5 h-5 fill-current" />
            </div>
          </div>

          <div className="space-y-1 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold border border-pink-500/30">
              <BellRing className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              <span>Instant Ping Alert</span>
            </div>
            <h3 className="text-xl font-black text-white tracking-wide pt-1">
              {activePing.senderName}
            </h3>
            <p className="text-xs text-slate-300">
              is trying to grab your attention right now! ⚡
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={dismissPing}
              className="flex-1 py-2.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700"
            >
              Dismiss
            </button>
            <button
              onClick={handlePingBack}
              className="flex-1 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 rounded-xl shadow-lg shadow-pink-500/40 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Ping Back!</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
