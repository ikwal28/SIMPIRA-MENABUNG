import React, { useContext } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, User, History, LogOut, Menu, ShieldCheck, Bell, Info } from 'lucide-react';
import { motion } from 'motion/react';

export const SiswaLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  if (!user || user.role !== 'siswa') {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { path: '/siswa', label: 'Ringkasan', icon: <LayoutDashboard size={20} /> },
    { path: '/siswa/profil', label: 'Profil Saya', icon: <User size={20} /> },
    { path: '/siswa/riwayat', label: 'Mutasi Rekening', icon: <History size={20} /> },
    { path: '/siswa/about', label: 'Tentang', icon: <Info size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col border-r border-slate-800 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 h-20 px-6 shrink-0 border-b border-slate-800">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">SIMPIRA <span className="text-emerald-400">MENABUNG</span></h1>
        </div>

        <div className="px-6 py-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3 px-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-inner overflow-hidden">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=modern-user-123" 
                alt="Avatar" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user?.nama || 'Siswa'}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Rek: {user?.rekening || '-'}</p>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 flex-1 overflow-y-auto custom-scrollbar">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Menu Nasabah</p>
          <nav className="space-y-1.5 flex-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className={`${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800 shrink-0">
          <button
            onClick={logout}
            className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-slate-800 hover:border-rose-500/20"
          >
            <LogOut size={18} />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header - Mobile Banking Style */}
        <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-10 z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center shadow-sm">
                <ShieldCheck size={16} className="text-white" />
              </div>
              <span className="font-bold text-slate-900 tracking-tight">SIMPIRA <span className="text-emerald-600">MENABUNG</span></span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 hidden lg:block tracking-tight">
              {navItems.find(item => item.path === location.pathname)?.label || 'Panel Nasabah'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-4">
            <button className="hidden sm:flex p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-6 w-px bg-slate-200 hidden lg:block"></div>
            
            <Link to="/siswa/profil" className="flex items-center gap-2 p-1.5 sm:p-2 sm:pr-4 bg-slate-50 sm:bg-transparent border border-slate-200 sm:border-transparent rounded-2xl sm:rounded-full transition-all">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-emerald-600/20 overflow-hidden">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=modern-user-123" 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none">{user?.nama?.split(' ')[0] || 'Siswa'}</p>
                <p className="text-[10px] text-slate-500 leading-none mt-1 font-medium">Nasabah</p>
              </div>
            </Link>

            <button 
              onClick={logout}
              className="flex p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
              title="Keluar"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 pb-24 lg:pb-10 p-4 lg:p-10">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Bottom Navigation - Mobile Banking Essential */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-4 py-3 flex items-center justify-around z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 transition-all duration-200 min-w-[64px] ${
                  isActive ? 'text-emerald-600 scale-105' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {React.cloneElement(item.icon as React.ReactElement, { size: 22, strokeWidth: isActive ? 2.5 : 2 })}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-tight ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {item.label === 'Ringkasan' ? 'DASHBOARD' : 
                   item.label === 'Profil Saya' ? 'PROFIL' : 
                   item.label === 'Mutasi Rekening' ? 'RIWAYAT' : 'TENTANG'}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
