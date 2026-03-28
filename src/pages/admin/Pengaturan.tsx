import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Settings, GraduationCap, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminPengaturan = () => {
  const location = useLocation();

  const menuItems = [
    {
      id: 'akademik',
      path: '/admin/pengaturan/manajemen-kelas',
      label: 'Kenaikan Kelas',
      description: 'Kelola siklus tahunan dan kelulusan',
      icon: <GraduationCap size={20} />,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      activeBg: 'bg-indigo-600',
    },
    {
      id: 'keamanan',
      path: '/admin/pengaturan/audit-log',
      label: 'Audit Log',
      description: 'Pantau aktivitas dan riwayat sistem',
      icon: <ShieldCheck size={20} />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      activeBg: 'bg-emerald-600',
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <Settings className="text-slate-600" size={32} />
          Pengaturan Sistem
        </h1>
        <p className="text-slate-500 mt-1">Konfigurasi lanjutan, manajemen akademik, dan keamanan sistem.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Menu Pengaturan */}
        <div className="lg:col-span-3 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`block p-4 rounded-2xl border transition-all duration-200 ${
                  isActive 
                    ? `border-transparent shadow-md ${item.activeBg} text-white` 
                    : `bg-white ${item.border} hover:border-slate-300 hover:shadow-sm`
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20 text-white' : `${item.bg} ${item.color}`}`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-800'}`}>
                        {item.label}
                      </h3>
                      <p className={`text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className={isActive ? 'text-white/50' : 'text-slate-300'} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Konten Pengaturan */}
        <div className="lg:col-span-9">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 lg:p-8 min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
