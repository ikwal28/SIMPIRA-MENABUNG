import React, { useContext, useState } from 'react';
import { DataContext } from '../../context/DataContext';
import { apiCall } from '../../services/api';
import { formatRupiah } from '../../utils/format';
import { RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert, Database, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import Swal from 'sweetalert2';

export const AdminMaintenance = () => {
  const { siswa, transaksi, fetchSiswa, fetchTransaksi, bulkUpdateSiswa, isLoadingData, refreshAll } = useContext(DataContext);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [discrepancies, setDiscrepancies] = useState<any[]>([]);
  const [isFixed, setIsFixed] = useState(false);

  const analyzeData = async () => {
    setIsAnalyzing(true);
    setDiscrepancies([]);
    setIsFixed(false);

    try {
      // Ensure we have the latest data
      await Promise.all([
        fetchSiswa(true),
        fetchTransaksi(undefined, undefined, true, 5000) // Fetch a large number of transactions
      ]);

      const foundDiscrepancies: any[] = [];
      
      siswa.forEach((s: any) => {
        const studentTransactions = transaksi.filter((t: any) => t.rekening?.toString() === s.rekening?.toString());
        
        const calculatedSaldo = studentTransactions.reduce((acc: number, t: any) => {
          const jumlah = parseFloat(t.jumlah) || 0;
          return t.jenis === 'Setor' ? acc + jumlah : acc - jumlah;
        }, 0);

        const currentSaldo = parseFloat(s.saldo) || 0;
        
        if (Math.abs(calculatedSaldo - currentSaldo) > 0.01) {
          foundDiscrepancies.push({
            rekening: s.rekening,
            nama: s.nama,
            currentSaldo,
            calculatedSaldo,
            diff: calculatedSaldo - currentSaldo,
            transactionCount: studentTransactions.length
          });
        }
      });

      setDiscrepancies(foundDiscrepancies);
      
      if (foundDiscrepancies.length === 0) {
        Swal.fire({
          icon: 'success',
          title: 'Data Sinkron!',
          text: 'Tidak ditemukan selisih antara saldo dan riwayat transaksi.',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Ditemukan Selisih!',
          text: `Terdapat ${foundDiscrepancies.length} nasabah dengan saldo yang tidak sesuai dengan riwayat transaksi.`,
        });
      }
    } catch (error: any) {
      Swal.fire('Error', 'Gagal menganalisis data: ' + error.message, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fixDiscrepancies = async () => {
    const confirm = await Swal.fire({
      title: 'Sinkronisasi Saldo?',
      text: `Sistem akan menghitung ulang seluruh saldo nasabah berdasarkan riwayat transaksi di server.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Sinkronkan Sekarang',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#4f46e5'
    });

    if (!confirm.isConfirmed) return;

    setIsAnalyzing(true);
    try {
      const res = await apiCall({ action: 'syncAllBalances' });
      if (res.status === 'success') {
        setIsFixed(true);
        setDiscrepancies([]);
        await refreshAll();
        Swal.fire('Berhasil', res.message, 'success');
      } else {
        throw new Error(res.message);
      }
    } catch (error: any) {
      Swal.fire('Gagal', 'Gagal sinkronisasi: ' + error.message, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pemeliharaan & Sinkronisasi Data</h2>
          <p className="text-sm text-slate-500 mt-1">Gunakan fitur ini untuk mendeteksi dan memperbaiki ketidaksesuaian saldo.</p>
        </div>
        <button
          onClick={analyzeData}
          disabled={isAnalyzing || isLoadingData}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md font-bold disabled:opacity-50"
        >
          {isAnalyzing ? <RefreshCw size={18} className="animate-spin" /> : <Database size={18} />}
          Analisis Data
        </button>
      </div>

      {isAnalyzing && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
            <RefreshCw size={32} className="text-indigo-600 animate-spin" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Sedang Menganalisis...</h3>
            <p className="text-sm text-slate-500">Memeriksa ribuan data transaksi dan mencocokkan dengan saldo nasabah.</p>
          </div>
        </div>
      )}

      {!isAnalyzing && discrepancies.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-amber-900">Ditemukan {discrepancies.length} Ketidaksesuaian</h3>
                <p className="text-sm text-amber-700">Saldo di database tidak sesuai dengan akumulasi riwayat transaksi.</p>
              </div>
            </div>
            <button
              onClick={fixDiscrepancies}
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all"
            >
              Perbaiki Semua
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="px-6 py-3">Nasabah</th>
                  <th className="px-6 py-3 text-right">Saldo Saat Ini</th>
                  <th className="px-6 py-3 text-right">Saldo Seharusnya</th>
                  <th className="px-6 py-3 text-right">Selisih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {discrepancies.map((d, i) => (
                  <tr key={i} className="text-sm">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{d.nama}</p>
                      <p className="text-xs text-slate-500 font-mono">{d.rekening}</p>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-600">{formatRupiah(d.currentSaldo)}</td>
                    <td className="px-6 py-4 text-right font-mono text-emerald-600 font-bold">{formatRupiah(d.calculatedSaldo)}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-rose-600">
                      {d.diff > 0 ? '+' : ''}{formatRupiah(d.diff)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {!isAnalyzing && discrepancies.length === 0 && !isFixed && (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
            <ShieldAlert size={40} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Siap Menganalisis</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            Klik tombol "Analisis Data" untuk memeriksa integritas data antara saldo nasabah dan riwayat transaksi mereka.
          </p>
        </div>
      )}

      {isFixed && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-emerald-50 border border-emerald-200 rounded-3xl p-12 text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="text-xl font-bold text-emerald-900">Data Berhasil Disinkronkan!</h3>
          <p className="text-emerald-700 max-w-md mx-auto mt-2">
            Seluruh saldo nasabah telah diperbarui dan kini sesuai dengan riwayat transaksi yang tercatat di sistem.
          </p>
          <button
            onClick={() => setIsFixed(false)}
            className="mt-8 text-emerald-600 font-bold flex items-center gap-2 mx-auto hover:underline"
          >
            Selesai <ArrowRight size={18} />
          </button>
        </motion.div>
      )}
    </div>
  );
};
