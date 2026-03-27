import React, { useState, useContext, useMemo } from 'react';
import { DataContext } from '../../context/DataContext';
import { apiCall } from '../../services/api';
import { formatRupiah } from '../../utils/format';
import { 
  GraduationCap, 
  ArrowUpCircle, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  FileSpreadsheet,
  Users,
  Info,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

export const AdminManajemenKelas = () => {
  const { siswa, bulkUpdateSiswa, deleteLulusan, fetchSiswa, isLoadingData } = useContext(DataContext);
  const [step, setStep] = useState(1);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiStatus, setApiStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle');

  const checkApi = async () => {
    setApiStatus('checking');
    try {
      const res = await apiCall({ action: 'ping' });
      if (res.version === '3.2.2') {
        setApiStatus('ok');
        Swal.fire('Berhasil', 'API terhubung! Versi: ' + res.version, 'success');
      } else {
        setApiStatus('error');
        Swal.fire('Versi Salah', 'API terhubung tapi versinya lama (' + (res.version || 'Unknown') + '). Mohon Deploy Ulang.', 'warning');
      }
    } catch (error: any) {
      setApiStatus('error');
      Swal.fire('Error', error.message, 'error');
    }
  };

  // Filter only active students for promotion
  const activeSiswa = useMemo(() => siswa.filter((s: any) => s.status === 'AKTIF' || !s.status), [siswa]);
  
  // Filter already graduated students for cleanup
  const graduatedSiswa = useMemo(() => siswa.filter((s: any) => s.status === 'LULUS'), [siswa]);

  // Simulation logic
  const simulation = useMemo(() => {
    return activeSiswa.map((s: any) => {
      const currentKelas = parseInt(s.kelas);
      let nextKelas = currentKelas + 1;
      let nextStatus = 'AKTIF';
      
      if (currentKelas === 6) {
        nextKelas = 6; // Stay at 6 but status LULUS
        nextStatus = 'LULUS';
      }

      return {
        ...s,
        nextKelas,
        nextStatus,
        isGraduating: currentKelas === 6
      };
    });
  }, [activeSiswa]);

  const graduates = useMemo(() => simulation.filter(s => s.isGraduating), [simulation]);

  const handleExportGraduates = () => {
    if (graduates.length === 0) {
      Swal.fire('Info', 'Tidak ada siswa kelas 6 yang akan lulus.', 'info');
      return;
    }

    const dataToExport = graduates.map(s => ({
      'No. Rekening': s.rekening,
      'Nama Lengkap': s.nama,
      'Kelas Terakhir': s.kelas,
      'Saldo Akhir (Rp)': s.saldo,
      'Status': 'LULUS (ARSIP)'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lulusan 2026");
    
    const dateStr = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
    XLSX.writeFile(wb, `Arsip_Lulusan_SIMPIRA_${dateStr}.xlsx`);
    
    setHasDownloaded(true);
    Swal.fire({
      icon: 'success',
      title: 'Arsip Berhasil Diunduh',
      text: 'Sekarang Anda dapat melanjutkan ke tahap eksekusi.',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleExecutePromotion = async () => {
    const confirm = await Swal.fire({
      title: 'Konfirmasi Akhir',
      html: `
        <div class="text-left p-4 bg-rose-50 border border-rose-100 rounded-2xl">
          <p class="text-rose-700 font-bold mb-2 flex items-center gap-2">
            <ShieldAlert size={18} /> PERINGATAN KRITIKAL
          </p>
          <ul class="text-xs text-rose-600 space-y-1 list-disc pl-4">
            <li>Data kelas 1-5 akan naik ke tingkat berikutnya.</li>
            <li>Data kelas 6 akan berubah status menjadi <b>LULUS</b>.</li>
            <li>Pastikan arsip sudah disimpan dengan aman.</li>
            <li>Tindakan ini tidak dapat dibatalkan secara otomatis.</li>
          </ul>
        </div>
        <p class="mt-4 text-sm font-medium">Ketik <b>"KONFIRMASI"</b> untuk melanjutkan:</p>
      `,
      input: 'text',
      inputPlaceholder: 'Ketik KONFIRMASI di sini...',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Proses Sekarang',
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (value !== 'KONFIRMASI') {
          return 'Anda harus mengetik KONFIRMASI dengan benar!';
        }
      }
    });

    if (confirm.isConfirmed) {
      setIsProcessing(true);
      const updates = simulation.map(s => ({
        rekening: s.rekening,
        kelas: s.nextKelas.toString(),
        status: s.nextStatus
      }));

      const success = await bulkUpdateSiswa(updates);
      if (success) {
        setStep(1);
        setHasDownloaded(false);
      }
      setIsProcessing(false);
    }
  };

  const handleCleanupGraduates = async () => {
    const confirm = await Swal.fire({
      title: 'Bersihkan Data Lulusan?',
      text: `Seluruh data ${graduatedSiswa.length} siswa berstatus LULUS akan dihapus permanen dari sistem. Pastikan Anda sudah mencetak laporan akhir mereka!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus Permanen!',
      cancelButtonText: 'Batal'
    });

    if (confirm.isConfirmed) {
      await deleteLulusan();
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <GraduationCap className="text-indigo-600" size={32} />
            Manajemen Kenaikan Kelas
          </h1>
          <p className="text-slate-500 mt-1">Kelola siklus tahunan kenaikan tingkat dan kelulusan nasabah.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={checkApi}
            disabled={apiStatus === 'checking'}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              apiStatus === 'ok' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              apiStatus === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
              'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <RefreshCw size={16} className={apiStatus === 'checking' ? 'animate-spin' : ''} />
            {apiStatus === 'checking' ? 'Mengecek...' : apiStatus === 'ok' ? 'API OK (V3)' : 'Cek Koneksi API'}
          </button>
          
          <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-medium border border-indigo-100 flex items-center gap-2">
            <Users size={16} />
            {activeSiswa.length} Siswa Aktif
          </div>
        </div>
      </div>

      {/* Wizard Steps Indicator */}
      <div className="flex items-center justify-center max-w-2xl mx-auto mb-10">
        {[1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                step >= i ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-200 text-slate-500'
              }`}>
                {step > i ? <CheckCircle2 size={20} /> : i}
              </div>
              <span className={`absolute -bottom-6 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                step >= i ? 'text-indigo-600' : 'text-slate-400'
              }`}>
                {i === 1 ? 'Simulasi' : i === 2 ? 'Arsip Data' : 'Eksekusi'}
              </span>
            </div>
            {i < 3 && (
              <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${
                step > i ? 'bg-indigo-600' : 'bg-slate-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        {/* Main Wizard Content */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Users size={20} className="text-indigo-600" />
                    Simulasi Kenaikan Kelas
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Berikut adalah perubahan yang akan terjadi pada data nasabah aktif.</p>
                </div>
                <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white shadow-sm z-10">
                      <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100">
                        <th className="px-6 py-4 font-bold">Nasabah</th>
                        <th className="px-6 py-4 font-bold text-center">Kelas Sekarang</th>
                        <th className="px-6 py-4 font-bold text-center">Aksi</th>
                        <th className="px-6 py-4 font-bold text-center">Kelas Baru</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {simulation.map((s: any, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="font-bold text-slate-800 text-sm">{s.nama}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{s.rekening}</div>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">
                              Kelas {s.kelas}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <div className="flex justify-center">
                              <ChevronRight size={16} className="text-indigo-300" />
                            </div>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                              s.isGraduating 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              {s.isGraduating ? 'LULUS' : `Kelas ${s.nextKelas}`}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200"
                  >
                    Lanjut ke Arsip Data
                    <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet size={40} />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-slate-800">Wajib Arsip Data Lulusan</h3>
                  <p className="text-slate-500 mt-2">
                    Sebelum memproses kelulusan, Anda <b>WAJIB</b> mengunduh data siswa kelas 6 yang akan lulus sebagai arsip fisik/digital sekolah.
                  </p>
                </div>
                
                <div className="bg-slate-50 rounded-2xl p-6 border border-dashed border-slate-300 flex flex-col items-center">
                  <p className="text-sm font-bold text-slate-600 mb-4">
                    Terdapat <span className="text-indigo-600">{graduates.length} siswa</span> yang akan lulus.
                  </p>
                  <button
                    onClick={handleExportGraduates}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-xl shadow-emerald-100 group"
                  >
                    <Download size={24} className="group-hover:translate-y-1 transition-transform" />
                    Unduh Arsip Lulusan (.xlsx)
                  </button>
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="text-slate-500 font-bold flex items-center gap-2 hover:text-slate-800 transition-colors"
                  >
                    <ChevronLeft size={18} />
                    Kembali
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!hasDownloaded}
                    className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                      hasDownloaded 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Lanjut ke Eksekusi
                    <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert size={40} />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-slate-800">Konfirmasi Eksekusi Massal</h3>
                  <p className="text-slate-500 mt-2">
                    Sistem akan memperbarui tingkat kelas seluruh siswa aktif dan mengubah status kelas 6 menjadi lulus.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                    <p className="text-2xl font-black text-indigo-600">{activeSiswa.length - graduates.length}</p>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Naik Kelas</p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                    <p className="text-2xl font-black text-emerald-600">{graduates.length}</p>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Lulus</p>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="text-slate-500 font-bold flex items-center gap-2 hover:text-slate-800 transition-colors"
                  >
                    <ChevronLeft size={18} />
                    Kembali
                  </button>
                  <button
                    onClick={handleExecutePromotion}
                    disabled={isProcessing}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-xl shadow-indigo-200 active:scale-95"
                  >
                    {isProcessing ? 'Memproses...' : 'Eksekusi Sekarang'}
                    <ArrowUpCircle size={20} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Info & Cleanup */}
        <div className="space-y-6">
          <div className="bg-indigo-900 text-white rounded-3xl p-6 shadow-xl shadow-indigo-200 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold flex items-center gap-2 mb-4">
                <Info size={18} />
                Panduan Sistem
              </h4>
              <ul className="text-xs text-indigo-100 space-y-3">
                <li className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/30 flex items-center justify-center shrink-0 font-bold">1</div>
                  <span>Siswa Kelas 1-5 akan naik 1 tingkat (misal: 1 → 2).</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/30 flex items-center justify-center shrink-0 font-bold">2</div>
                  <span>Siswa Kelas 6 akan berubah status menjadi <b>LULUS</b>.</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/30 flex items-center justify-center shrink-0 font-bold">3</div>
                  <span>Siswa LULUS tidak akan muncul di menu Transaksi.</span>
                </li>
              </ul>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <GraduationCap size={180} />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Trash2 size={18} className="text-rose-500" />
              Pembersihan Data
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Hapus data siswa yang sudah lulus secara permanen untuk mengosongkan database.
            </p>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Total Lulusan:</span>
                <span className="text-lg font-black text-slate-800">{graduatedSiswa.length}</span>
              </div>
            </div>
            <button
              onClick={handleCleanupGraduates}
              disabled={graduatedSiswa.length === 0}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                graduatedSiswa.length > 0
                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                  : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
              }`}
            >
              <AlertTriangle size={16} />
              Hapus Data Lulusan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
