import React, { useContext } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, ArrowRightLeft, History, LogOut, Menu, ShieldCheck, Bell, Printer, Info, FileText, CreditCard, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/siswa', label: 'Data Nasabah', icon: <Users size={20} /> },
    { path: '/admin/transaksi', label: 'Transaksi', icon: <ArrowRightLeft size={20} /> },
    { path: '/admin/riwayat', label: 'Riwayat', icon: <History size={20} /> },
    { path: '/admin/cetak', label: 'Cetak Rekening', icon: <Printer size={20} /> },
    { path: '/admin/cetak-kartu', label: 'Cetak Kartu', icon: <CreditCard size={20} /> },
    { path: '/admin/form-manual', label: 'Form Manual', icon: <FileText size={20} /> },
    { path: '/admin/pengaturan', label: 'Pengaturan', icon: <Settings size={20} /> },
    { path: '/admin/about', label: 'Tentang', icon: <Info size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-300 transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col border-r border-slate-800 ${
          isSidebarCollapsed ? 'lg:w-20' : 'lg:w-72'
        } ${
          isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72'
        }`}
      >
        <div className={`flex items-center h-20 px-6 shrink-0 border-b border-slate-800 transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-3'}`}>
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <ShieldCheck size={20} className="text-white" />
          </div>
          {!isSidebarCollapsed && (
            <motion.h1 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold tracking-tight text-white truncate"
            >
              SIMPIRA <span className="text-indigo-400">MENABUNG</span>
            </motion.h1>
          )}
        </div>

        <div className={`px-6 py-6 border-b border-slate-800/50 transition-all duration-300 ${isSidebarCollapsed ? 'px-4' : ''}`}>
          <div className={`flex items-center transition-all duration-300 ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-2'}`}>
            <div className={`rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold shadow-inner overflow-hidden shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'w-10 h-10' : 'w-12 h-12'}`}>
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop" 
                alt="Avatar" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {!isSidebarCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-bold text-white truncate">{user?.nama || 'Admin'}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Administrator</p>
              </motion.div>
            )}
          </div>
        </div>
        
        <div className={`py-4 flex-1 overflow-y-auto custom-scrollbar transition-all duration-300 ${isSidebarCollapsed ? 'px-2' : 'px-6'}`}>
          {!isSidebarCollapsed && (
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-4">Menu Utama</p>
          )}
          <nav className="space-y-1.5 flex-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/admin/pengaturan' && location.pathname.startsWith('/admin/pengaturan'));
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
                      ? 'bg-indigo-500/10 text-indigo-400 font-medium'
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}>
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
        {/* Header - Mobile Banking Style */}
        <header className="h-16 lg:h-20 bg-slate-100/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-10 z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Menu size={22} />
            </button>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-2 -ml-1 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center shadow-sm">
                <ShieldCheck size={16} className="text-white" />
              </div>
              <span className="font-bold text-slate-900 tracking-tight">SIMPIRA <span className="text-indigo-600">MENABUNG</span></span>
            </div>
            <div className="hidden lg:flex flex-col">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-none">
                {location.pathname.startsWith('/admin/pengaturan') 
                  ? 'Pengaturan Sistem' 
                  : navItems.find(item => item.path === location.pathname)?.label || 'Panel Administrator'}
              </h2>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-1">
                {location.pathname === '/admin' ? 'Overview & Analytics' : 'Manajemen Data & Keuangan'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-4">
            <button className="hidden sm:flex p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-6 w-px bg-slate-200 hidden lg:block"></div>
            
            <div className="flex items-center gap-2 p-1.5 sm:p-2 sm:pr-4 bg-white sm:bg-transparent border border-slate-200 sm:border-transparent rounded-2xl sm:rounded-full transition-all">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-600/20 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop" 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none">{user?.nama?.split(' ')[0] || 'Admin'}</p>
                <p className="text-xs text-slate-500 leading-none mt-1 font-medium">Administrator</p>
              </div>
            </div>

            <button 
              onClick={logout}
              className="flex p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
              title="Keluar"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto lg:overflow-y-hidden bg-slate-50/50 pb-32 lg:pb-0 p-4 lg:p-6">
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

        {/* Bottom Navigation - Mobile Banking Style */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-3 flex items-center justify-around z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          {navItems.filter(item => ['/admin', '/admin/siswa', '/admin/transaksi', '/admin/riwayat', '/admin/about'].includes(item.path)).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 transition-all duration-200 min-w-[50px] ${
                  isActive ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {React.cloneElement(item.icon as any, { size: 20, strokeWidth: isActive ? 2.5 : 2 })}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-tight ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {item.label === 'Dashboard' ? 'DASHBOARD' : 
                   item.label === 'Data Nasabah' ? 'DATA' : 
                   item.label === 'Transaksi' ? 'TRANSAKSI' : 
                   item.label === 'Riwayat' ? 'RIWAYAT' : 'ABOUT'}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
