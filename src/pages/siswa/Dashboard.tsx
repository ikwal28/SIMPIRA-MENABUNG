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
      fetchTransaksi(user.rekening);
    }
  }, [user?.rekening]);

  const myTransaksi = transaksi.filter((t: any) => t.rekening?.toString() === user?.rekening?.toString());
  const recentTransaksi = myTransaksi.slice(0, 5);

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
    <div className="space-y-6 lg:space-y-8 max-w-4xl mx-auto">
      {/* Welcome Section - Mobile Optimized */}
      <div className="flex items-center justify-between px-1 sm:px-0">
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

      {/* Saldo Card - Professional Banking Look */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-6 lg:p-8 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden border border-white/10"
      >
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ShieldCheck size={180} />
        </div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-10">
            <div className="space-y-1">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Nomor Rekening</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg tracking-[0.15em] text-emerald-50">{user?.rekening || '----'}</span>
                <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                  <CreditCard size={14} className="text-slate-500" />
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
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Saldo Tersedia</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-medium text-emerald-500">Rp</span>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
                {formatRupiah(user?.saldo || 0).replace('Rp', '').trim()}
              </h2>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <User size={16} className="text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Pemilik Rekening</p>
                <p className="text-xs font-bold text-slate-200">{user?.nama || 'Siswa'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Kelas</p>
              <p className="text-xs font-bold text-slate-200">{user?.kelas || '-'}</p>
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
            <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl ${action.color} flex items-center justify-center text-white shadow-lg shadow-slate-200 transition-transform group-active:scale-95`}>
              {action.icon}
            </div>
            <span className="text-[10px] lg:text-xs font-bold text-slate-600 uppercase tracking-wider">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-6 lg:p-8 flex items-center justify-between border-b border-slate-50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Activity size={18} />
            </div>
            Riwayat Transaksi
          </h2>
          <Link to="/siswa/riwayat" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest">
            Lihat Semua
          </Link>
        </div>

        <div className="divide-y divide-slate-50">
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
                className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    trx.jenis === 'Setor' 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-rose-50 text-rose-600'
                  }`}>
                    {trx.jenis === 'Setor' ? <ArrowUpRight size={22} /> : <ArrowDownRight size={22} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{trx.jenis === 'Setor' ? 'Setoran Tabungan' : 'Penarikan Dana'}</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {formatDate(trx.tanggal)} • {trx.id_trx}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${trx.jenis === 'Setor' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {trx.jenis === 'Setor' ? '+' : '-'}{formatRupiah(trx.jumlah)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Berhasil</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-16 px-6">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Wallet size={32} className="text-slate-200" />
              </div>
              <p className="text-slate-500 font-bold">Belum Ada Transaksi</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">Mulai menabung untuk melihat riwayat transaksi Anda di sini.</p>
            </div>
          )}
        </div>
      </div>

      {/* Security Banner */}
      <div className="bg-emerald-600 rounded-3xl p-6 text-white flex items-center gap-4 shadow-lg shadow-emerald-900/10">
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          <ShieldCheck size={24} />
        </div>
        <div>
          <p className="font-bold text-sm">Keamanan Terjamin</p>
          <p className="text-xs text-emerald-100 opacity-80 mt-0.5">Transaksi Anda dilindungi oleh sistem enkripsi SIMPIRA MENABUNG.</p>
        </div>
      </div>
    </div>
  );
};
