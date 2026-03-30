import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import { formatRupiah, formatDate } from '../../utils/format';
import { Wallet, Activity, ArrowUpRight, ArrowDownRight, CreditCard, History, User, ShieldCheck, QrCode, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

export const SiswaDashboard = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const { transaksi, fetchTransaksi, isLoadingData } = useContext(DataContext);

  useEffect(() => {
    refreshUser();
    if (user?.rekening) {
      fetchTransaksi(user.rekening, undefined, false, 20);
    }
  }, [user?.rekening]);

  const myTransaksi = transaksi.filter((t: any) => t.rekening?.toString() === user?.rekening?.toString());
  const recentTransaksi = myTransaksi.slice(0, 10);

  const quickActions = [
    { label: 'Mutasi', icon: <History size={24} />, path: '/siswa/riwayat', color: 'bg-blue-500' },
    { label: 'Profil', icon: <User size={24} />, path: '/siswa/profil', color: 'bg-emerald-500' },
    { 
      label: 'QR Bayar', 
      icon: <QrCode size={24} />, 
      path: '#', 
      color: 'bg-amber-500',
      onClick: () => {
        Swal.fire({
          title: 'Informasi Fitur',
          text: 'Fitur Ini Akan Segera Hadir Jika Diperlukan Pihak Sekolah',
          icon: 'info',
          confirmButtonText: 'Tutup',
          confirmButtonColor: '#f59e0b',
          customClass: {
            popup: 'rounded-[2rem]',
            confirmButton: 'rounded-xl px-6 py-2.5 font-bold'
          }
        });
      }
    },
    { 
      label: 'Tarik', 
      icon: <Download size={24} />, 
      path: '#', 
      color: 'bg-rose-500',
      onClick: () => {
        Swal.fire({
          title: 'Aturan Penarikan',
          text: 'SESUAI PERATURAN SEKOLAH, PENARIKAN HANYA BOLEH DILAKUKAN PADA SAAT NASABAH TELAH MENYELESAIKAN PENDIDIKAN',
          icon: 'warning',
          confirmButtonText: 'Tutup',
          confirmButtonColor: '#f43f5e',
          customClass: {
            popup: 'rounded-[2rem]',
            confirmButton: 'rounded-xl px-6 py-2.5 font-bold'
          }
        });
      }
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto lg:h-full lg:flex lg:flex-col lg:overflow-hidden space-y-4 lg:space-y-6">
      {/* Welcome Section - Mobile Optimized */}
      <div className="flex items-center justify-between px-1 sm:px-0 shrink-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">Selamat Datang</h1>
          <p className="text-slate-500 text-sm lg:text-base mt-0.5">Halo, <span className="font-bold text-emerald-600">{user?.nama?.split(' ')[0] || 'Nasabah'}</span>!</p>
        </div>
        {isLoadingData && (
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Memperbarui</span>
          </div>
        )}
      </div>

      <div className="lg:flex-1 lg:grid lg:grid-cols-12 lg:gap-8 lg:overflow-hidden">
        {/* Left Column: Saldo & Quick Actions */}
        <div className="lg:col-span-5 space-y-6 lg:overflow-y-auto lg:pr-2 custom-scrollbar">
          {/* Saldo Card - Professional Banking Look */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2rem] p-6 lg:p-7 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden border border-white/10"
          >
            {/* Abstract Background Elements */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShieldCheck size={140} />
            </div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-8">
                <div className="space-y-1">
                  <p className="text-white/60 text-[9px] font-bold uppercase tracking-[0.2em]">Nomor Rekening</p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base tracking-[0.15em] text-emerald-50">{user?.rekening || '----'}</span>
                    <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                      <CreditCard size={12} className="text-white/40" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{user?.status || 'AKTIF'}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">Saldo Tersedia</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-medium text-emerald-500">Rp</span>
                  <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                    {formatRupiah(user?.saldo || 0).replace('Rp', '').trim()}
                  </h2>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <User size={16} className="text-white/60" />
                  </div>
                  <div>
                    <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Pemilik Rekening</p>
                    <p className="text-[11px] font-bold text-slate-200">{user?.nama || 'Siswa'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Kelas</p>
                  <p className="text-[11px] font-bold text-slate-200">{user?.kelas || '-'}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions - Mobile Banking Style */}
          <div className="grid grid-cols-4 gap-4 px-2">
            {quickActions.map((action, idx) => (
              <Link 
                key={idx} 
                to={action.path}
                onClick={(e) => {
                  if (action.onClick) {
                    e.preventDefault();
                    action.onClick();
                  }
                }}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl ${action.color} flex items-center justify-center text-white shadow-lg shadow-slate-200 transition-transform group-active:scale-95`}>
                  {action.icon}
                </div>
                <span className="text-[9px] lg:text-[10px] font-bold text-slate-600 uppercase tracking-wider">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Transactions */}
        <div className="mt-6 lg:mt-0 lg:col-span-7 bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden flex flex-col lg:h-full">
          <div className="p-5 lg:p-6 flex items-center justify-between border-b border-slate-50 shrink-0">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <Activity size={16} />
              </div>
              Riwayat Transaksi
            </h2>
            <Link to="/siswa/riwayat" className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest">
              Lihat Semua
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
            {isLoadingData ? (
              <div className="text-center py-12 text-slate-500">
                <span className="animate-spin inline-block rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></span>
                <p className="text-sm font-medium">Sinkronisasi data...</p>
              </div>
            ) : recentTransaksi.length > 0 ? (
              recentTransaksi.map((trx: any, index: number) => (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  key={index} 
                  className="flex items-center justify-between p-4 lg:p-5 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      trx.jenis === 'Setor' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-rose-50 text-rose-600'
                    }`}>
                      {trx.jenis === 'Setor' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs lg:text-sm">{trx.jenis === 'Setor' ? 'Setoran Tabungan' : 'Penarikan Dana'}</p>
                      <p className="text-[10px] lg:text-[11px] text-slate-500 font-medium mt-0.5">
                        {formatDate(trx.tanggal)} • {trx.id_trx}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs lg:text-sm font-bold ${trx.jenis === 'Setor' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {trx.jenis === 'Setor' ? '+' : '-'}{formatRupiah(trx.jumlah)}
                    </p>
                    <p className="text-[9px] lg:text-[10px] text-slate-400 font-medium mt-0.5">Berhasil</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-16 px-6">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Wallet size={24} className="text-slate-200" />
                </div>
                <p className="text-slate-500 font-bold text-sm">Belum Ada Transaksi</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[180px] mx-auto">Mulai menabung untuk melihat riwayat transaksi Anda di sini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
