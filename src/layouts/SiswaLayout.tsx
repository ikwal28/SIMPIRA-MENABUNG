import React, { useContext } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, User, History, LogOut, Menu, ShieldCheck, Bell, Info } from 'lucide-react';
import { motion } from 'motion/react';

export const SiswaLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

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
    <div className="flex h-screen h-[100dvh] bg-slate-100 font-sans overflow-hidden">
      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Mobile Drawer Only) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-300 transform transition-all duration-300 ease-in-out md:hidden flex flex-col border-r border-slate-800 w-72 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className={`flex items-center h-20 px-6 shrink-0 border-b border-slate-800 transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-3'}`}>
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <ShieldCheck size={20} className="text-white" />
          </div>
          {!isSidebarCollapsed && (
            <motion.h1 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold tracking-tight text-white truncate"
            >
              SIMPIRA <span className="text-emerald-400">MENABUNG</span>
            </motion.h1>
          )}
        </div>

        <div className={`px-6 py-6 border-b border-slate-800/50 transition-all duration-300 ${isSidebarCollapsed ? 'px-4' : ''}`}>
          <div className={`flex items-center transition-all duration-300 ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-2'}`}>
            <div className={`rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold shadow-inner overflow-hidden shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'w-10 h-10' : 'w-12 h-12'}`}>
              <img 
                src="https://api.dicebear.com/7.x/icons/svg?seed=graduation-cap" 
                alt="Avatar" 
                className="w-full h-full object-cover p-1"
                referrerPolicy="no-referrer"
              />
            </div>
            {!isSidebarCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-bold text-white truncate">{user?.nama || 'Siswa'}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Rek: {user?.rekening || '-'}</p>
              </motion.div>
            )}
          </div>
        </div>
        
        <div className={`py-4 flex-1 overflow-y-auto custom-scrollbar transition-all duration-300 ${isSidebarCollapsed ? 'px-2' : 'px-6'}`}>
          {!isSidebarCollapsed && (
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-4">Menu Nasabah</p>
          )}
          <nav className="space-y-1.5 flex-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  title={isSidebarCollapsed ? item.label : ''}
                  className={`flex items-center rounded-xl transition-all duration-200 group ${
                    isSidebarCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
                  } ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {item.icon}
                  </div>
                  {!isSidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={`mt-auto p-6 border-t border-slate-800 shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'p-4' : ''}`}>
          <button
            onClick={logout}
            title={isSidebarCollapsed ? 'Keluar Sistem' : ''}
            className={`flex items-center justify-center rounded-xl text-sm font-bold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-slate-800 hover:border-rose-500/20 w-full ${
              isSidebarCollapsed ? 'p-3' : 'space-x-2 px-4 py-3'
            }`}
          >
            <LogOut size={18} className="shrink-0" />
            {!isSidebarCollapsed && <span>Keluar Sistem</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header - Modern Horizontal Style */}
        <header className="h-16 md:h-24 bg-white border-b border-slate-200 flex flex-col z-20 sticky top-0 shadow-sm">
          {/* Top Bar */}
          <div className="flex-1 flex items-center justify-between px-4 md:px-8 border-b border-slate-100/50 md:border-none">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 -ml-1 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Menu size={22} />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                  <ShieldCheck size={22} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">
                    SIMPIRA <span className="text-emerald-600">MENABUNG</span>
                  </h1>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 hidden md:block">Layanan Perbankan Nasabah</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link to="/siswa/profil" className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                  <img 
                    src="https://api.dicebear.com/7.x/icons/svg?seed=graduation-cap" 
                    alt="Avatar" 
                    className="w-full h-full object-cover p-1"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800 leading-none">{user?.nama || 'Nasabah'}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter mt-1">Rek: {user?.rekening || '-'}</p>
                </div>
              </Link>

              <button className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>

              <button 
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                title="Keluar"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Horizontal Navigation - Desktop & Tablet */}
          <div className="hidden md:flex h-12 bg-white px-8 items-center border-t border-slate-100">
            <nav className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {React.cloneElement(item.icon as any, { size: 16, strokeWidth: isActive ? 2.5 : 2 })}
                    <span>{item.label.toUpperCase()}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 pb-32 md:pb-8 p-4 md:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-[1600px] mx-auto h-full"
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Bottom Navigation - Mobile Banking Essential */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-4 py-3 flex items-center justify-around z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
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
                  {React.cloneElement(item.icon as any, { size: 22, strokeWidth: isActive ? 2.5 : 2 })}
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-tight ${isActive ? 'opacity-100' : 'opacity-70'}`}>
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
