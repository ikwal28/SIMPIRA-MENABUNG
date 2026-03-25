import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Wallet } from 'lucide-react';

interface SplashScreenProps {
  onComplete?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden"
    >
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />

      <div className="relative flex flex-col items-center">
        {/* Animated Logo Container */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.8, 
            ease: [0, 0.71, 0.2, 1.01],
            scale: {
              type: "spring",
              damping: 12,
              stiffness: 100,
              restDelta: 0.001
            }
          }}
          className="relative mb-8"
        >
          {/* Outer Glow Ring */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="absolute inset-0 bg-indigo-500/20 rounded-[2.5rem] blur-2xl"
          />
          
          {/* Main Icon Box */}
          <div className="relative w-24 h-24 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/40 border border-white/20">
            <Wallet size={48} className="text-white" />
            <motion.div 
              initial={{ x: 10, y: 10, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute -top-2 -right-2 bg-emerald-500 p-1.5 rounded-full shadow-lg border-2 border-slate-900"
            >
              <ShieldCheck size={16} className="text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Text Animation */}
        <div className="text-center space-y-2">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl font-black tracking-tighter"
          >
            SIMPIRA <span className="text-indigo-400">MENABUNG</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-400"
          >
            Simpanan Pintar Rajin menabung
          </motion.p>
        </div>

        {/* Loading Indicator */}
        <div className="absolute bottom-[-100px] w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-1/2 h-full bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
          />
        </div>
      </div>

      {/* Footer Branding */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-10 flex flex-col items-center gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-indigo-500/50" />
          <motion.div 
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" 
          />
          <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-indigo-500/50" />
        </div>
        
        <div className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-xl">
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-300">
            SIMPIRA <span className="text-indigo-400">MENABUNG</span> 
            <span className="mx-2 text-slate-600">©</span> 
            2026 <span className="text-emerald-400 ml-1">IKWAL PRESETIAWAN</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
