import React, { useContext, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import { formatRupiah, formatDate } from '../../utils/format';
import { Users, CreditCard, ArrowUpRight, ArrowDownRight, Activity, Wallet, RefreshCw, TrendingUp, TrendingDown, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';

export const AdminDashboard = () => {
  const { siswa, transaksi, fetchSiswa, fetchTransaksi, isLoadingData, refreshAll } = useContext(DataContext);

  useEffect(() => {
    fetchSiswa();
    fetchTransaksi(undefined, undefined, false, 100); // Fetch only last 100 for dashboard
  }, []);

  const totalSaldo = siswa.reduce((sum: number, s: any) => sum + s.saldo, 0);
  const totalSiswa = siswa.length;

  const totalSetor = transaksi
    .filter((t: any) => t.jenis === 'Setor')
    .reduce((sum: number, t: any) => sum + t.jumlah, 0);

  const totalTarik = transaksi
    .filter((t: any) => t.jenis === 'Tarik')
    .reduce((sum: number, t: any) => sum + t.jumlah, 0);

  // Prepare chart data (group by date)
  const chartDataMap = new Map();
  const sortedTransaksi = [...transaksi].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
  
  sortedTransaksi.forEach(t => {
    const dateStr = new Date(t.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    if (!chartDataMap.has(dateStr)) {
      chartDataMap.set(dateStr, { name: dateStr, Setor: 0, Tarik: 0 });
    }
    const current = chartDataMap.get(dateStr);
    if (t.jenis === 'Setor') current.Setor += t.jumlah;
    if (t.jenis === 'Tarik') current.Tarik += t.jumlah;
  });
  
  const chartData = Array.from(chartDataMap.values()).slice(-14); // Last 14 days with activity

  const stats = [
    { label: 'Total Saldo', value: formatRupiah(totalSaldo), icon: <Wallet size={20} />, color: 'bg-indigo-500', trend: 'Sistem Aktif' },
    { label: 'Total Nasabah', value: `${totalSiswa} Siswa`, icon: <Users size={20} />, color: 'bg-sky-500', trend: 'Terdaftar' },
    { label: 'Total Setoran', value: formatRupiah(totalSetor), icon: <TrendingUp size={20} />, color: 'bg-emerald-500', trend: 'Pemasukan' },
    { label: 'Total Tarikan', value: formatRupiah(totalTarik), icon: <TrendingDown size={20} />, color: 'bg-rose-500', trend: 'Pengeluaran' },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
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

      {/* Stats Grid - Bento Style */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl lg:rounded-[2rem] p-3.5 sm:p-4 lg:p-6 shadow-sm border border-slate-200/60 relative overflow-hidden group hover:shadow-md transition-all flex items-center lg:block gap-3 sm:gap-4 lg:gap-0"
          >
            <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-12 lg:h-12 shrink-0 rounded-xl sm:rounded-2xl ${stat.color} flex items-center justify-center text-white lg:mb-4 shadow-md`}>
              {stat.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5 lg:mb-1">{stat.label}</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 truncate">{stat.value}</p>
            </div>
            <div className="hidden lg:flex mt-3 items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.trend}</p>
            </div>
            <div className="lg:hidden flex items-center justify-end pl-1 sm:pl-2">
               <div className="bg-slate-50 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-100">
                 <p className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{stat.trend}</p>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 p-6 lg:p-8 lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <Activity size={18} />
              </div>
              Arus Kas (14 Hari)
            </h2>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Setor</div>
              <div className="flex items-center gap-1.5 text-rose-600"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Tarik</div>
            </div>
          </div>
          <div className="h-[250px] lg:h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSetor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTarik" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} tickFormatter={(value) => `Rp${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#1e293b' }}
                    formatter={(value: number) => [formatRupiah(value), '']}
                  />
                  <Area type="monotone" dataKey="Setor" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSetor)" />
                  <Area type="monotone" dataKey="Tarik" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorTarik)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">Belum ada data transaksi</div>
            )}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden flex flex-col">
          <div className="p-6 lg:p-8 flex items-center justify-between border-b border-slate-50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-xl text-slate-600">
                <Activity size={18} />
              </div>
              Transaksi Terbaru
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {transaksi.slice(0, 8).map((trx: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    trx.jenis === 'Setor' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {trx.jenis === 'Setor' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 truncate">{trx.nama}</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5 uppercase tracking-wider">{formatDate(trx.tanggal)}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className={`text-sm font-bold ${trx.jenis === 'Setor' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {trx.jenis === 'Setor' ? '+' : '-'}{formatRupiah(trx.jumlah)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{trx.rekening}</p>
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

      {/* Security Info - Admin View */}
      <div className="bg-indigo-600 rounded-[2rem] p-6 lg:p-8 text-white flex flex-col sm:flex-row items-center gap-6 shadow-xl shadow-indigo-900/20">
        <div className="w-16 h-16 rounded-[1.5rem] bg-white/20 flex items-center justify-center shrink-0">
          <ShieldCheck size={32} />
        </div>
        <div className="text-center sm:text-left">
          <h3 className="font-bold text-lg">Sistem Keamanan Terpusat</h3>
          <p className="text-sm text-indigo-100 opacity-80 mt-1">Seluruh data nasabah dan transaksi dienkripsi secara otomatis dan dipantau 24/7 untuk menjamin integritas data sekolah.</p>
        </div>
        <div className="sm:ml-auto">
          <button className="px-6 py-3 bg-white text-indigo-600 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg shadow-black/10">
            Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};
