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
          {/* Stats Grid - Bento Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
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

          {/* Detailed Summary Section - Professional Text-Based Data */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                  <Activity size={20} />
                </div>
                Analisis & Performa Keuangan
              </h2>
              <div className="bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Laporan Otomatis</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Insight 1: Pertumbuhan */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Pertumbuhan Nasabah</h3>
                    <p className="text-xs text-slate-500">Statistik pendaftaran nasabah baru.</p>
                  </div>
                </div>
                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Aktif</p>
                      <p className="text-2xl font-black text-slate-900">{totalSiswa}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Status</p>
                      <p className="text-xs font-bold text-slate-700">Stabil & Meningkat</p>
                    </div>
                  </div>
                  <div className="mt-4 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>

              {/* Insight 2: Aktivitas Transaksi */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <RefreshCw size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Aktivitas Transaksi</h3>
                    <p className="text-xs text-slate-500">Ringkasan perputaran dana harian.</p>
                  </div>
                </div>
                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Volume Hari Ini</p>
                      <p className="text-2xl font-black text-slate-900">{transaksi.filter(t => new Date(t.tanggal).getTime() >= today).length} Trx</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Efisiensi</p>
                      <p className="text-xs font-bold text-slate-700">Sangat Optimal</p>
                    </div>
                  </div>
                  <div className="mt-4 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 bg-indigo-900 rounded-3xl text-white relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight">Keamanan Sistem Terjamin</h3>
                    <p className="text-sm text-indigo-100/80 font-medium">Seluruh data transaksi dienkripsi dan dipantau secara berkala.</p>
                  </div>
                </div>
                <Link to="/admin/riwayat" className="bg-white text-indigo-900 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-all shadow-lg shadow-indigo-950/20 text-center">
                  Lihat Audit Log
                </Link>
              </div>
              {/* Decorative background element */}
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute -left-10 -top-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
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
