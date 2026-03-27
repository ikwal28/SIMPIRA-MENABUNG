import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Cpu, Zap, Globe, Github, Mail, Instagram, Code2, Info, Calendar, CheckCircle2 } from 'lucide-react';

export const AboutPage = () => {
  const appInfo = {
    version: '3.2.2-stable',
    updateDate: '27 Maret 2026',
    developer: 'Ikwal Presetiawan',
    description: 'SIMPIRA MENABUNG (Simpanan Pintar Rajin Menabung) adalah platform perbankan sekolah modern yang dirancang untuk menumbuhkan budaya menabung sejak dini dengan transparansi dan keamanan tingkat tinggi.'
  };

  const features = [
    { title: 'Real-time Sync', description: 'Sinkronisasi data instan antara Teller dan Nasabah.', icon: <Zap size={20} /> },
    { title: 'Multi-platform', description: 'Optimasi penuh untuk perangkat mobile dan desktop.', icon: <Globe size={20} /> },
    { title: 'Audit Log', description: 'Pencatatan riwayat transaksi yang detail dan tidak dapat diubah.', icon: <Info size={20} /> },
    { title: 'E-Statement', description: 'Cetak mutasi rekening mandiri dalam format digital profesional.', icon: <Calendar size={20} /> },
  ];

  const security = [
    { title: 'End-to-End Encryption', description: 'Data sensitif dienkripsi menggunakan standar industri.' },
    { title: 'Role-Based Access', description: 'Hak akses ketat berdasarkan peran (Admin/Nasabah).' },
    { title: 'Secure Session', description: 'Manajemen sesi otomatis untuk mencegah akses tidak sah.' },
    { title: 'Database Integrity', description: 'Validasi data berlapis pada setiap transaksi keuangan.' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <ShieldCheck size={200} />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <Cpu size={14} />
            Ditenagai oleh SIMPIRA MENABUNG Engine
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">SIMPIRA MENABUNG <span className="text-emerald-500">v{appInfo.version}</span></h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
            {appInfo.description}
          </p>
          <div className="flex flex-wrap gap-6 pt-4 border-t border-white/10">
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Update Terakhir</p>
              <p className="font-semibold text-slate-200">{appInfo.updateDate}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Status Sistem</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="font-semibold text-emerald-400 text-sm">Operasional</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Features Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 px-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Zap size={20} />
            </div>
            Fitur Unggulan
          </h2>
          <div className="grid gap-4">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex gap-4 group hover:border-indigo-200 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{f.title}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Security Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 px-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck size={20} />
            </div>
            Keamanan & Privasi
          </h2>
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden divide-y divide-slate-100">
            {security.map((s, i) => (
              <div key={i} className="p-5 flex gap-4">
                <div className="mt-1">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{s.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Developer Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-200/60 shadow-sm flex flex-col lg:flex-row items-center gap-8 text-center lg:text-left"
      >
        <div className="w-32 h-32 rounded-full shadow-2xl shadow-slate-900/40 border-4 border-white overflow-hidden shrink-0 ring-4 ring-slate-900/20 bg-slate-900 flex items-center justify-center">
          <img 
            src="https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=300&h=300&auto=format&fit=crop" 
            alt="Ninja Lead Developer" 
            className="w-full h-full object-cover brightness-110 contrast-125"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>
        <div className="space-y-2 flex-1">
          <p className="text-indigo-600 font-bold text-xs uppercase tracking-[0.2em]">Lead Developer</p>
          <h2 className="text-3xl font-bold text-slate-900">{appInfo.developer}</h2>
          <p className="text-slate-500 max-w-xl">
            Berdedikasi untuk menciptakan solusi teknologi yang berdampak positif bagi dunia pendidikan dan literasi keuangan digital.
          </p>
          <div className="flex justify-center lg:justify-start gap-4 pt-4">
            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
              <Github size={20} />
            </button>
            <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
              <Instagram size={20} />
            </button>
            <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
              <Mail size={20} />
            </button>
            <button className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all">
              <Code2 size={20} />
            </button>
          </div>
        </div>
        <div className="lg:border-l border-slate-100 lg:pl-8 flex flex-col items-center lg:items-end gap-6">
          <div className="flex flex-col items-center lg:items-end gap-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Lisensi Aplikasi</p>
            <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-mono">
              Apache License 2.0
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="pt-12 border-t border-slate-200/60 text-center space-y-6"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-2 text-indigo-600 font-black tracking-tighter text-2xl italic">
            <ShieldCheck size={28} className="text-indigo-500" />
            SIMPIRA MENABUNG
          </div>
          <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
        </div>
        
        <div className="space-y-2">
          <p className="text-slate-600 text-sm font-bold tracking-wide">
            © 2026 <span className="text-slate-900">IKWAL PRESETIAWAN</span>
          </p>
          <div className="flex items-center justify-center gap-4 text-slate-400 text-[9px] uppercase tracking-[0.3em] font-bold">
            <span>Keamanan Terverifikasi</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>Pendidikan Utama</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>Literasi Digital</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
