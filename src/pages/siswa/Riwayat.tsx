import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import { formatRupiah, formatDate } from '../../utils/format';
import { Filter, ArrowUpRight, ArrowDownRight, Calendar, Download } from 'lucide-react';
import { motion } from 'motion/react';

export const SiswaRiwayat = () => {
  const { user } = useContext(AuthContext);
  const { transaksi, totalTransaksi, fetchTransaksi, isLoadingData } = useContext(DataContext);
  const [filterJenis, setFilterJenis] = useState('Semua');
  const [filterTanggal, setFilterTanggal] = useState('');
  const [offset, setOffset] = useState(0);
  const LIMIT_PER_PAGE = 50;

  useEffect(() => {
    if (user?.rekening) {
      fetchTransaksi(user.rekening, undefined, false, LIMIT_PER_PAGE, 0, false);
    }
  }, [user?.rekening]);

  const handleLoadMore = () => {
    if (user?.rekening) {
      const nextOffset = offset + LIMIT_PER_PAGE;
      setOffset(nextOffset);
      fetchTransaksi(user.rekening, undefined, true, LIMIT_PER_PAGE, nextOffset, true);
    }
  };

  const myTransaksi = transaksi.filter((t: any) => t.rekening?.toString() === user?.rekening?.toString());

  const filteredTransaksi = myTransaksi.filter((trx: any) => {
    const matchJenis = filterJenis === 'Semua' || trx.jenis === filterJenis;
    const matchTanggal = filterTanggal === '' || (trx.tanggal || '').startsWith(filterTanggal);
    return matchJenis && matchTanggal;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mutasi Rekening SIMPIRA MENABUNG</h1>
          <p className="text-slate-500 mt-1">Riwayat lengkap transaksi tabungan Anda secara transparan.</p>
        </div>
        <button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm font-medium">
          <Download size={18} />
          Unduh Laporan
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="flex items-center gap-3 text-slate-700 font-medium">
            <Filter size={20} className="text-slate-400" />
            <span>Filter Transaksi:</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm font-medium text-slate-700 w-full sm:w-auto shadow-sm"
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
            >
              <option value="Semua">Semua Jenis</option>
              <option value="Setor">Setoran Masuk</option>
              <option value="Tarik">Penarikan Keluar</option>
            </select>
            
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="date"
                className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-700 w-full sm:w-auto shadow-sm"
                value={filterTanggal}
                onChange={(e) => setFilterTanggal(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {isLoadingData && transaksi.length === 0 ? (
               <div className="text-center py-12 text-slate-500">
                 <span className="animate-spin inline-block rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></span>
                 <p>Memuat riwayat transaksi...</p>
               </div>
            ) : filteredTransaksi.length > 0 ? (
              filteredTransaksi.map((trx: any, index: number) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={index} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl transition-all shadow-sm hover:shadow-md group"
                >
                  <div className="flex items-start sm:items-center gap-4 mb-4 sm:mb-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      trx.jenis === 'Setor' 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'bg-rose-100 text-rose-600'
                    }`}>
                      {trx.jenis === 'Setor' ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{trx.jenis === 'Setor' ? 'Setoran Tunai' : 'Penarikan Tunai'}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                        <span className="text-sm text-slate-500 font-medium">{formatDate(trx.tanggal)}</span>
                        <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{trx.id_trx}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right pl-16 sm:pl-0">
                    <p className={`text-xl font-bold ${trx.jenis === 'Setor' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {trx.jenis === 'Setor' ? '+' : '-'}{formatRupiah(trx.jumlah)}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">{trx.keterangan || 'Tidak ada keterangan'}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Filter size={24} className="text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium text-lg">Tidak ada transaksi ditemukan.</p>
                <p className="text-sm text-slate-400 mt-1">Coba ubah filter pencarian Anda.</p>
              </div>
            )}
          </div>

          {transaksi.length < totalTransaksi && (
            <div className="mt-8 text-center pb-12 sm:pb-4">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingData}
                className="px-8 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl font-bold transition-all shadow-sm border border-emerald-100 disabled:opacity-50"
              >
                {isLoadingData ? 'Memuat...' : 'Muat Lebih Banyak'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
