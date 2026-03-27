import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import { formatRupiah, formatDate } from '../../utils/format';
import { Search, Filter, ArrowUpRight, ArrowDownRight, Download, Trash2, Activity } from 'lucide-react';
import Swal from 'sweetalert2';

export const AdminRiwayat = () => {
  const { transaksi, totalTransaksi, fetchTransaksi, isLoadingData, deleteTransaksi, refreshAll } = useContext(DataContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState('Semua');
  const [filterTanggal, setFilterTanggal] = useState('');

  const [offset, setOffset] = useState(0);
  const LIMIT_PER_PAGE = 50;

  useEffect(() => {
    fetchTransaksi(undefined, undefined, false, LIMIT_PER_PAGE, 0, false);
  }, []);

  const handleLoadMore = () => {
    const nextOffset = offset + LIMIT_PER_PAGE;
    setOffset(nextOffset);
    fetchTransaksi(undefined, undefined, true, LIMIT_PER_PAGE, nextOffset, true);
  };

  const handleDelete = async (idTrx: string) => {
    const result = await Swal.fire({
      title: 'Hapus Transaksi?',
      text: 'Tindakan ini akan menghapus transaksi dan mengembalikan saldo nasabah.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      await deleteTransaksi(idTrx);
    }
  };

  const filteredTransaksi = transaksi.filter((trx: any) => {
    const matchSearch =
      (trx.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trx.rekening || '').toString().includes(searchTerm) ||
      (trx.id_trx || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchJenis = filterJenis === 'Semua' || trx.jenis === filterJenis;
    const matchTanggal = filterTanggal === '' || (trx.tanggal || '').startsWith(filterTanggal);

    return matchSearch && matchJenis && matchTanggal;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Riwayat Transaksi SIMPIRA MENABUNG</h1>
          <p className="text-slate-500 mt-1">Laporan lengkap seluruh aktivitas keuangan nasabah.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => refreshAll()}
            disabled={isLoadingData}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm font-medium disabled:opacity-50"
          >
            <Activity size={18} className={isLoadingData ? 'animate-pulse' : ''} />
            Refresh
          </button>
          <button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm font-medium">
            <Download size={18} />
            Ekspor Data
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row gap-4 justify-between">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cari ID, nama, atau rekening..."
              className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                className="pl-10 pr-8 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white text-sm font-medium text-slate-700 w-full sm:w-auto"
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
              >
                <option value="Semua">Semua Jenis</option>
                <option value="Setor">Setoran</option>
                <option value="Tarik">Penarikan</option>
              </select>
            </div>
            <input
              type="date"
              className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium text-slate-700 w-full sm:w-auto"
              value={filterTanggal}
              onChange={(e) => setFilterTanggal(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4 font-semibold">Waktu & ID</th>
                <th className="px-6 py-4 font-semibold">Nasabah</th>
                <th className="px-6 py-4 font-semibold">Jenis</th>
                <th className="px-6 py-4 font-semibold text-right">Jumlah (Rp)</th>
                <th className="px-6 py-4 font-semibold">Keterangan</th>
                <th className="px-6 py-4 font-semibold">Petugas</th>
                <th className="px-6 py-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingData ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <span className="animate-spin inline-block rounded-full h-6 w-6 border-b-2 border-indigo-500 mb-2"></span>
                    <p>Memuat data transaksi...</p>
                  </td>
                </tr>
              ) : filteredTransaksi.length > 0 ? (
                filteredTransaksi.map((trx: any, index: number) => (
                  <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{formatDate(trx.tanggal)}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{trx.id_trx}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{trx.nama}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{trx.rekening} • {trx.kelas}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        trx.jenis === 'Setor' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {trx.jenis === 'Setor' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {trx.jenis}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${
                      trx.jenis === 'Setor' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {trx.jenis === 'Setor' ? '+' : '-'}{formatRupiah(trx.jumlah)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                      {trx.keterangan}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {trx.petugas || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(trx.id_trx)}
                        className="text-rose-600 hover:text-rose-800 transition-colors p-2 hover:bg-rose-50 rounded-lg"
                        title="Hapus Transaksi"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada transaksi ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {transaksi.length < totalTransaksi && (
          <div className="p-6 border-t border-slate-100 text-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingData}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {isLoadingData ? 'Memuat...' : 'Muat Lebih Banyak'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
