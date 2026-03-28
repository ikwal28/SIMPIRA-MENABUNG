import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Lock, ShieldCheck, ArrowRight, TrendingUp, Sparkles, Wallet, Download, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import Swal from 'sweetalert2';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  // PWA Install Logic
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // If deferredPrompt is null but we are in browser, it usually means it's already installed or not supported.
      Swal.fire({
        icon: 'info',
        title: 'Informasi',
        text: 'Aplikasi sudah terinstal di perangkat Anda atau browser tidak mendukung fitur instalasi.',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const role = await login(username, password, '');
    if (role) {
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/siswa');
      }
    }
  };

  return (
    <div className="h-screen h-[100dvh] w-full flex font-sans bg-slate-100 overflow-hidden fixed inset-0">
      {/* Left Pane - Branding & Visuals */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 h-full">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1616514197671-15f99ce7a6f1?q=80&w=2074&auto=format&fit=crop" 
            alt="Banking Architecture" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950/90 to-emerald-950/80 z-[1]" />
        
        {/* Floating Decorative Cards */}
        <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none hidden xl:block">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 right-12 bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-3xl shadow-2xl flex items-center gap-5"
          >
            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
              <TrendingUp className="text-emerald-400" size={28} />
            </div>
            <div>
              <p className="text-white/60 text-sm font-medium mb-1">Total Tabungan</p>
              <p className="text-white font-bold text-xl tracking-tight">Rp 12.5M+</p>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/3 right-24 bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-3xl shadow-2xl flex items-center gap-5"
          >
            <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
              <Wallet className="text-indigo-400" size={28} />
            </div>
            <div>
              <p className="text-white/60 text-sm font-medium mb-1">Transaksi Aman</p>
              <p className="text-white font-bold text-lg tracking-tight">Enkripsi 256-bit</p>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 text-white mb-16"
          >
            <motion.div 
              animate={{ 
                boxShadow: ["0px 0px 0px rgba(99, 102, 241, 0)", "0px 0px 20px rgba(99, 102, 241, 0.5)", "0px 0px 0px rgba(99, 102, 241, 0)"] 
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30"
            >
              <ShieldCheck size={24} className="text-white" />
            </motion.div>
            <span className="text-2xl font-bold tracking-tight flex items-center gap-2">
              SIMPIRA
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="text-indigo-400 font-light tracking-widest text-lg"
              >
                MENABUNG
              </motion.span>
            </span>
          </motion.div>
          
          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl font-semibold text-white leading-tight tracking-tight"
            >
              Masa Depan <br/>
              <span className="text-indigo-400">Keuangan Sekolah</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-slate-400 text-lg max-w-md leading-relaxed"
            >
              Platform perbankan digital modern untuk SD Negeri 2 Laot Tadu. Kelola tabungan dengan aman, transparan, dan profesional.
            </motion.p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="relative z-10 text-slate-500 text-sm font-mono"
        >
          &copy; {new Date().getFullYear()} SIMPIRA MENABUNG. HAK CIPTA DILINDUNGI.
        </motion.div>
      </div>

      {/* Right Pane - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 lg:p-24 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 relative overflow-hidden h-full">
        {/* Colorful background decoration - Simplified for mobile */}
        <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] bg-indigo-400/10 rounded-full blur-[60px] lg:blur-[80px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] lg:w-[600px] lg:h-[600px] bg-emerald-400/10 rounded-full blur-[60px] lg:blur-[80px] mix-blend-multiply" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10 bg-white/80 p-6 sm:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80"
        >
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:hidden flex items-center gap-3 text-slate-900 mb-8"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight flex items-center gap-2">
              SIMPIRA
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-indigo-600 font-light tracking-widest text-lg"
              >
                MENABUNG
              </motion.span>
            </span>
          </motion.div>

          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/80 text-indigo-700 text-[10px] font-bold tracking-wide mb-4 border border-indigo-200/50"
            >
              <Sparkles size={12} className="text-indigo-500" />
              SISTEM TERBARU 2026
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight mb-1"
            >
              Selamat Datang
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-slate-500 text-sm"
            >
              Silakan masuk ke akun Anda untuk melanjutkan.
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <User size={20} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 sm:py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-base sm:text-sm shadow-sm"
                    placeholder="Masukkan username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Lock size={20} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-4 sm:py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-base sm:text-sm shadow-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </motion.div>
            </div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 sm:mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-indigo-500/20 disabled:bg-indigo-400 disabled:cursor-not-allowed flex justify-center items-center group text-sm"
            >
              {isLoading ? (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              ) : (
                <span className="flex items-center gap-2">
                  Masuk ke Sistem
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </motion.button>

            {/* PWA Install Button (Only visible in browser, not standalone) */}
            {!isStandalone && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleInstallClick}
                className="w-full mt-2 bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-sm flex justify-center items-center group text-sm"
              >
                <span className="flex items-center gap-2">
                  <Download size={18} className="text-indigo-500 group-hover:-translate-y-0.5 transition-transform" />
                  Instal Aplikasi
                </span>
              </motion.button>
            )}
          </form>
        </motion.div>

        {/* Mobile Footer */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10 lg:hidden px-6">
          <div className="flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm py-2 px-6 rounded-2xl border border-white/30 shadow-sm w-full max-w-xs">
            <div className="flex items-center gap-1.5 mb-0.5">
              <ShieldCheck size={12} className="text-indigo-500" />
              <span className="text-[10px] font-bold text-slate-700 tracking-widest uppercase">SIMPIRA MENABUNG</span>
            </div>
            <p className="text-[8px] font-medium text-slate-400 tracking-widest uppercase">
              &copy; 2026 IKWAL PRESETIAWAN
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
