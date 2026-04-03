import React, { useContext, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import { formatRupiah, formatDate } from '../../utils/format';
import { Users, CreditCard, ArrowUpRight, ArrowDownRight, Activity, Wallet, RefreshCw, TrendingUp, TrendingDown, ShieldCheck, GraduationCap, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const { siswa, transaksi, dashboardStats, fetchSiswa, fetchTransaksi, fetchDashboardStats, isLoadingData, refreshAll } = useContext(DataContext);

  useEffect(() => {
    fetchSiswa();
    fetchTransaksi(undefined, undefined, false, 100); // Fetch only last 100 for dashboard
    fetchDashboardStats();
  }, []);

  const totalSaldo = dashboardStats.totalSaldo || 0;
  const totalSiswa = dashboardStats.totalSiswa || 0;
  
  const nasabahAktif = siswa.filter((s: any) => s.status === 'AKTIF' || !s.status).length;
  
  const statsPerKelas = siswa.reduce((acc: any, s: any) => {
    const kelas = s.kelas || 'N/A';
    const saldo = parseFloat(s.saldo) || 0;
    const isAktif = s.status === 'AKTIF' || !s.status;
    
    if (!acc[kelas]) acc[kelas] = { saldo: 0, aktif: 0 };
    acc[kelas].saldo += saldo;
    if (isAktif) acc[kelas].aktif += 1;
    return acc;
  }, {});

  const sortedKelas = Object.keys(statsPerKelas).sort((a, b) => a.localeCompare(b));

  // Calculate daily and monthly totals from transaction list
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const totalSetorHarian = transaksi
    .filter(t => t.jenis === 'Setor' && new Date(t.tanggal).getTime() >= today)
    .reduce((acc, t) => acc + (parseFloat(t.jumlah) || 0), 0);

  const totalSetorBulanan = transaksi
    .filter(t => t.jenis === 'Setor' && new Date(t.tanggal).getTime() >= firstDayOfMonth)
    .reduce((acc, t) => acc + (parseFloat(t.jumlah) || 0), 0);

  // Prepare chart data (group by date)
  const chartDataMap = new Map();
  const sortedTransaksi = [...transaksi]
    .filter(t => t.tanggal && !isNaN(new Date(t.tanggal).getTime()))
    .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
  
  sortedTransaksi.forEach(t => {
    const date = new Date(t.tanggal);
    const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    if (!chartDataMap.has(dateStr)) {
      chartDataMap.set(dateStr, { name: dateStr, Setor: 0, Tarik: 0 });
    }
    const current = chartDataMap.get(dateStr);
    if (t.jenis === 'Setor') current.Setor += (parseFloat(t.jumlah) || 0);
    if (t.jenis === 'Tarik') current.Tarik += (parseFloat(t.jumlah) || 0);
  });
  
  const chartData = Array.from(chartDataMap.values()).slice(-14); // Last 14 days with activity

  const stats = [
    { label: 'Total Saldo', value: formatRupiah(totalSaldo), icon: <Wallet size={20} />, color: 'bg-indigo-500', trend: 'Sistem Aktif' },
    { label: 'Total Nasabah', value: `${totalSiswa} Siswa`, icon: <Users size={20} />, color: 'bg-sky-500', trend: 'Terdaftar' },
    { label: 'Nasabah Aktif', value: `${nasabahAktif} Siswa`, icon: <Activity size={20} />, color: 'bg-emerald-500', trend: 'Status Aktif' },
    { label: 'Total Setoran Harian', value: formatRupiah(totalSetorHarian), icon: <TrendingUp size={20} />, color: 'bg-emerald-500', trend: 'Hari Ini' },
    { label: 'Total Setoran Bulanan', value: formatRupiah(totalSetorBulanan), icon: <TrendingUp size={20} />, color: 'bg-amber-500', trend: 'Bulan Ini' },
  ];

  return (
    <div className="max-w-[1600px] mx-auto pb-4 lg:h-full lg:flex lg:flex-col lg:overflow-hidden space-y-4 lg:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1 shrink-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">Ringkasan Sistem SIMPIRA MENABUNG</h1>
          <p className="text-slate-500 text-sm mt-0.5">Pantau aktivitas keuangan sekolah secara real-time dan profesional.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => refreshAll()}
            disabled={isLoadingData}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-sm font-bold text-sm disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoadingData ? 'animate-spin' : ''} />
            Refresh
          </button>
          {isLoadingData && (
            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
              <div className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Sinkronisasi</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:flex-1 lg:grid lg:grid-cols-12 lg:gap-6 lg:overflow-hidden">
        {/* Left Column (Stats + Summary) */}
        <div className="lg:col-span-8 space-y-4 lg:space-y-6 lg:overflow-y-auto lg:pr-2 custom-scrollbar">
          
          {/* Row 1: Total Saldo (Large & Clear) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-600 rounded-[2rem] p-8 shadow-xl shadow-indigo-200 relative overflow-hidden text-white"
          >
            <div className="relative z-10">
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-[0.2em] mb-2">Total Saldo Keseluruhan</p>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight">{formatRupiah(totalSaldo)}</h2>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">Sistem Aktif & Terpantau</p>
              </div>
            </div>
            <Wallet className="absolute right-[-20px] bottom-[-20px] text-white/10 w-48 h-48 -rotate-12" />
          </motion.div>

          {/* Row 2: Total Nasabah & Nasabah Aktif */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[stats[1], stats[2]].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.1 }}
                className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-200/60 relative overflow-hidden group hover:shadow-md transition-all flex items-center gap-6"
              >
                <div className={`w-14 h-14 shrink-0 rounded-2xl ${stat.color} flex items-center justify-center text-white shadow-lg shadow-slate-200`}>
                  {React.cloneElement(stat.icon as any, { size: 28 })}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{stat.label}</p>
                  <p className="text-2xl font-extrabold text-slate-900 truncate tracking-tight">{stat.value}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.trend}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Row 3: Total Setoran Harian & Bulanan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[stats[3], stats[4]].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-200/60 relative overflow-hidden group hover:shadow-md transition-all flex items-center gap-6"
              >
                <div className={`w-14 h-14 shrink-0 rounded-2xl ${stat.color} flex items-center justify-center text-white shadow-lg shadow-slate-200`}>
                  {React.cloneElement(stat.icon as any, { size: 28 })}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{stat.label}</p>
                  <p className="text-2xl font-extrabold text-slate-900 truncate tracking-tight">{stat.value}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.trend}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detailed Summary Section - Table Style for Class Stats */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                  <GraduationCap size={20} />
                </div>
                Statistik Per Kelas
              </h2>
              <div className="bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data Real-time</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="px-8 py-4">Kelas</th>
                    <th className="px-8 py-4 text-center">Nasabah Aktif</th>
                    <th className="px-8 py-4 text-right">Total Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sortedKelas.map((kelas, idx) => (
                    <motion.tr
                      key={kelas}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            {kelas}
                          </div>
                          <span className="font-bold text-slate-700">Kelas {kelas}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                          {statsPerKelas[kelas].aktif} Nasabah
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="font-mono font-bold text-slate-900">
                          {formatRupiah(statsPerKelas[kelas].saldo)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                  {sortedKelas.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-8 py-12 text-center text-slate-400">
                        <Activity size={32} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">Belum ada data kelas</p>
                      </td>
                    </tr>
                  )}
                </tbody>
                {sortedKelas.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50/30 font-bold text-slate-900 border-t border-slate-100">
                      <td className="px-8 py-4 text-xs uppercase tracking-wider text-slate-500">Total Keseluruhan</td>
                      <td className="px-8 py-4 text-center text-sm">{nasabahAktif} Nasabah</td>
                      <td className="px-8 py-4 text-right text-indigo-600 font-mono">{formatRupiah(totalSaldo)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Recent Transactions) - Hidden on Mobile */}
        <div className="hidden lg:flex mt-6 lg:mt-0 lg:col-span-4 bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden flex-col lg:h-full">
          <div className="p-5 lg:p-6 flex items-center justify-between border-b border-slate-50 shrink-0">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-xl text-slate-600">
                <Activity size={16} />
              </div>
              Transaksi Terbaru
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
            {transaksi.slice(0, 12).map((trx: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    trx.jenis === 'Setor' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {trx.jenis === 'Setor' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 truncate">{trx.nama}</p>
                    <p className="text-[9px] text-slate-500 font-medium mt-0.5 uppercase tracking-wider">{formatDate(trx.tanggal)}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className={`text-xs font-bold ${trx.jenis === 'Setor' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {trx.jenis === 'Setor' ? '+' : '-'}{formatRupiah(trx.jumlah)}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">{trx.rekening}</p>
                </div>
              </div>
            ))}
            {transaksi.length === 0 && (
              <div className="text-center text-slate-400 py-16 px-6">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Activity size={24} className="text-slate-200" />
                </div>
                <p className="text-sm font-bold">Belum Ada Transaksi</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
