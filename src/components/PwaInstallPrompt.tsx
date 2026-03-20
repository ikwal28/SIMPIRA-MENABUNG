import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, CheckCircle2, X } from 'lucide-react';

export const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
        setIsInstalled(true);
        setShowPrompt(true);
      }
    };
    
    checkInstalled();

    // Listen for the install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowPrompt(true);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/60 p-4 flex items-center gap-4">
            <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-indigo-50 flex items-center justify-center">
              <img src="/logo-s.svg" alt="SIMPIRA Logo" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-sm">SIMPIRA MENABUNG</h3>
              <p className="text-xs text-slate-500">
                {isInstalled ? 'Aplikasi sudah terinstal di perangkat Anda.' : 'Instal aplikasi untuk akses lebih cepat.'}
              </p>
            </div>

            {isInstalled ? (
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full shrink-0">
                <CheckCircle2 size={20} />
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shrink-0 flex items-center gap-2 shadow-lg shadow-indigo-200"
              >
                <Download size={16} />
                Instal
              </button>
            )}

            <button 
              onClick={() => setShowPrompt(false)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center border border-slate-200 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
