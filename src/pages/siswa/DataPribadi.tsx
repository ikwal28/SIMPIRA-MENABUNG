import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, CreditCard, GraduationCap, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const SiswaDataPribadi = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profil Nasabah SIMPIRA MENABUNG</h1>
          <p className="text-slate-500 mt-1">Informasi detail akun tabungan Anda secara profesional.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 h-32 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>
        
        <div className="px-8 pb-8 relative">
          <div className="flex justify-between items-end -mt-12 mb-8">
            <div className="w-24 h-24 bg-white rounded-2xl p-2 shadow-lg shadow-slate-200/50 overflow-hidden">
              <div className="w-full h-full bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-4xl uppercase overflow-hidden">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=modern-user-123" 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
              user?.status === 'AKTIF' || !user?.status ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
              user?.status === 'LULUS' ? 'bg-blue-50 text-blue-700 border-blue-100' :
              'bg-rose-50 text-rose-700 border-rose-100'
            }`}>
              <ShieldCheck size={18} />
              <span className="text-sm font-bold tracking-wide">
                {user?.status ? `AKUN ${user.status}` : 'AKUN AKTIF'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <User size={14} /> Nama Lengkap
                </p>
                <p className="text-xl font-semibold text-slate-900">{user?.nama || '-'}</p>
              </div>
              
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <CreditCard size={14} /> Nomor Rekening
                </p>
                <p className="text-lg font-mono text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 inline-block">
                  {user?.rekening || '-'}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <GraduationCap size={14} /> Kelas / Rombel
                </p>
                <p className="text-lg font-medium text-slate-800">{user?.kelas || '-'}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <User size={14} /> Username Login
                </p>
                <p className="text-lg font-mono text-slate-700">{user?.username || '-'}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm shrink-0">
                <ShieldCheck size={24} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Keamanan Akun</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Jaga kerahasiaan password Anda. Jika Anda lupa password atau melihat aktivitas mencurigakan, segera hubungi Administrator atau Wali Kelas Anda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
