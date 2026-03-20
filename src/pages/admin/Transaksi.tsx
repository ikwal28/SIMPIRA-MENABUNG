import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { formatRupiah } from '../../utils/format';
import { ArrowDownToLine, ArrowUpFromLine, Search, UserCheck, QrCode, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { AnimatePresence, motion } from 'framer-motion';

export const AdminTransaksi = () => {
  const { siswa, addTransaksi, fetchSiswa, isLoadingData } = useContext(DataContext);
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSiswa, setSelectedSiswa] = useState<any>(null);
  const [view, setView] = useState<'search' | 'form'>('search');
  const [jenisTrx, setJenisTrx] = useState<'Setor' | 'Tarik'>('Setor');
  const [jumlah, setJumlah] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchSiswa();
  }, []);

  const filteredSiswa = siswa.filter(
    (s: any) =>
      (s.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.rekening || '').toString().includes(searchTerm)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswa) {
      Swal.fire('Error', 'Pilih nasabah terlebih dahulu', 'error');
      return;
    }

    if (selectedSiswa.status && selectedSiswa.status !== 'AKTIF') {
      Swal.fire({
        title: 'Transaksi Terkunci',
        text: `Nasabah ini berstatus ${selectedSiswa.status}. Transaksi tidak dapat dilakukan.`,
        icon: 'warning',
        confirmButtonColor: '#4f46e5',
        confirmButtonText: 'Mengerti'
      });
      return;
    }

    const numJumlah = parseFloat(jumlah);
    if (isNaN(numJumlah) || numJumlah <= 0) {
      Swal.fire('Error', 'Jumlah harus lebih dari 0', 'error');
      return;
    }

    if (jenisTrx === 'Tarik' && numJumlah > selectedSiswa.saldo) {
      Swal.fire('Error', 'Saldo tidak mencukupi', 'error');
      return;
    }

    const confirmResult = await Swal.fire({
      title: 'Konfirmasi Transaksi',
      html: `
        <div class="text-left space-y-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
          <div class="flex justify-between border-b border-slate-200 pb-2 mb-2">
            <span class="text-slate-500 text-xs uppercase font-bold">Nasabah</span>
            <span class="text-slate-900 font-bold">${selectedSiswa.nama}</span>
          </div>
          <div class="flex justify-between border-b border-slate-200 pb-2 mb-2">
            <span class="text-slate-500 text-xs uppercase font-bold">No. Rekening</span>
            <span class="text-slate-900 font-mono">${selectedSiswa.rekening}</span>
          </div>
          <div class="flex justify-between border-b border-slate-200 pb-2 mb-2">
            <span class="text-slate-500 text-xs uppercase font-bold">Tanggal</span>
            <span class="text-slate-900 font-bold">${new Date(tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div class="flex justify-between border-b border-slate-200 pb-2 mb-2">
            <span class="text-slate-500 text-xs uppercase font-bold">Jenis</span>
            <span class="font-bold ${jenisTrx === 'Setor' ? 'text-emerald-600' : 'text-rose-600'}">${jenisTrx === 'Setor' ? 'SETORAN' : 'PENARIKAN'}</span>
          </div>
          <div class="flex justify-between pt-1">
            <span class="text-slate-500 text-xs uppercase font-bold">Jumlah</span>
            <span class="text-lg font-black text-indigo-600">${formatRupiah(numJumlah)}</span>
          </div>
        </div>
        <p class="mt-4 text-sm text-slate-500 italic">Apakah data di atas sudah benar?</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: jenisTrx === 'Setor' ? '#059669' : '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Proses!',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (!confirmResult.isConfirmed) return;

    const success = await addTransaksi({
      rekening: selectedSiswa.rekening,
      jenis: jenisTrx,
      jumlah: numJumlah,
      keterangan: keterangan || (jenisTrx === 'Setor' ? 'Setoran tunai' : 'Penarikan tunai'),
      tanggal: tanggal,
      petugas: user?.nama || 'Admin'
    });

    if (success) {
      setJumlah('');
      setKeterangan('');
      setTanggal(new Date().toISOString().split('T')[0]);
      setSelectedSiswa(null);
      setSearchTerm('');
      setView('search');
    }
  };

  const renderFormContent = (isMobile: boolean) => (
    <>
      <div className={`px-4 lg:px-6 py-4 lg:py-5 border-b border-slate-100 bg-white flex items-center justify-between ${isMobile ? 'sticky top-0 z-10' : ''}`}>
        <div className="flex items-center gap-3">
          <h2 className={`font-bold text-slate-800 ${isMobile ? 'text-xl' : 'text-lg'}`}>Detail Transaksi</h2>
        </div>
        {isMobile ? (
          <button 
            onClick={() => setView('search')}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <X size={24} />
          </button>
        ) : (
          <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">Langkah 2/2</span>
        )}
      </div>
      
      <div className={`p-4 lg:p-6 ${isMobile ? 'flex-1 overflow-y-auto custom-scrollbar' : ''}`}>
        {!selectedSiswa ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <UserCheck size={32} className="text-slate-300" />
            </div>
            <p>Silakan pilih nasabah dari daftar<br/>untuk memulai transaksi.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
            {/* Info Nasabah Terpilih */}
            <div className="bg-slate-50 p-3 lg:p-4 rounded-xl border border-slate-200 flex justify-between items-center">
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Nasabah</p>
                <div className="flex items-center gap-2 overflow-hidden">
                  <p className="font-bold text-slate-900 truncate">{selectedSiswa.nama}</p>
                  {selectedSiswa.status && selectedSiswa.status !== 'AKTIF' && (
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold flex-shrink-0 ${
                      selectedSiswa.status === 'LULUS' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {selectedSiswa.status}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 font-mono truncate">{selectedSiswa.rekening}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Saldo</p>
                <p className="font-bold text-indigo-600 text-base lg:text-lg">{formatRupiah(selectedSiswa.saldo)}</p>
              </div>
            </div>

            {/* Jenis Transaksi */}
            <div>
              <label className="block text-xs lg:text-sm font-medium text-slate-700 mb-2">Jenis Transaksi</label>
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <button
                  type="button"
                  onClick={() => setJenisTrx('Setor')}
                  className={`flex items-center justify-center gap-2 py-2.5 lg:py-3 px-3 lg:px-4 rounded-xl border-2 transition-all text-sm lg:text-base ${
                    jenisTrx === 'Setor'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold shadow-sm'
                      : 'border-slate-200 hover:border-emerald-200 text-slate-600'
                  }`}
                >
                  <ArrowUpFromLine size={18} />
                  Setoran
                </button>
                <button
                  type="button"
                  onClick={() => setJenisTrx('Tarik')}
                  className={`flex items-center justify-center gap-2 py-2.5 lg:py-3 px-3 lg:px-4 rounded-xl border-2 transition-all text-sm lg:text-base ${
                    jenisTrx === 'Tarik'
                      ? 'border-rose-500 bg-rose-50 text-rose-700 font-bold shadow-sm'
                      : 'border-slate-200 hover:border-rose-200 text-slate-600'
                  }`}
                >
                  <ArrowDownToLine size={18} />
                  Penarikan
                </button>
              </div>
            </div>

            {/* Tanggal Transaksi */}
            <div>
              <label className="block text-xs lg:text-sm font-medium text-slate-700 mb-1.5">Tanggal Transaksi</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2.5 lg:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 text-sm lg:text-base"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
              />
            </div>

            {/* Jumlah */}
            <div>
              <label className="block text-xs lg:text-sm font-medium text-slate-700 mb-1.5">Jumlah (Rp)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">Rp</span>
                <input
                  type="number"
                  required
                  min="1000"
                  className="w-full pl-12 pr-4 py-2.5 lg:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base lg:text-lg font-bold text-slate-900"
                  placeholder="0"
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                />
              </div>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-xs lg:text-sm font-medium text-slate-700 mb-1.5">Keterangan (Opsional)</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 lg:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base"
                placeholder={jenisTrx === 'Setor' ? 'Setoran tunai' : 'Penarikan tunai'}
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoadingData}
              className={`w-full py-3 lg:py-4 rounded-xl text-white font-bold text-base lg:text-lg transition-all shadow-sm hover:shadow-md flex justify-center items-center gap-2 ${
                jenisTrx === 'Setor' 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-rose-600 hover:bg-rose-700'
              } disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {isLoadingData ? (
                <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
              ) : (
                <>
                  Proses {jenisTrx}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Layanan Transaksi SIMPIRA MENABUNG</h1>
          <p className="text-slate-500 mt-1">Proses setoran dan penarikan tunai nasabah dengan aman.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Panel Kiri: Cari Nasabah */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col h-[calc(100vh-180px)] lg:h-[600px]">
          <div className="p-4 lg:p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Pilih Nasabah</h2>
              <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full lg:hidden">Langkah 1/2</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Cari nama atau no. rekening..."
                className="w-full pl-11 pr-20 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="p-1.5 text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => Swal.fire('Info', 'Fitur Scan QR akan segera hadir', 'info')}
                  className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <QrCode size={18} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {isLoadingData ? (
              <div className="flex justify-center items-center h-full text-slate-400">
                <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mr-2"></span>
                Memuat data...
              </div>
            ) : filteredSiswa.length > 0 ? (
              <div className="space-y-1">
                {filteredSiswa.map((s: any, index: number) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedSiswa(s);
                      setView('form');
                    }}
                    className={`p-3 lg:p-4 rounded-xl cursor-pointer transition-all border ${
                      selectedSiswa?.rekening === s.rekening
                        ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                        : 'border-transparent hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                          selectedSiswa?.rekening === s.rekening ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {s.nama.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-semibold truncate ${selectedSiswa?.rekening === s.rekening ? 'text-indigo-900' : 'text-slate-900'}`}>
                            {s.nama}
                          </p>
                          <p className="text-[10px] lg:text-xs text-slate-500 font-mono truncate">Rek: {s.rekening} • Kls: {s.kelas}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] text-slate-500 mb-0.5">Saldo</p>
                        <p className={`text-sm lg:text-base font-bold ${selectedSiswa?.rekening === s.rekening ? 'text-indigo-700' : 'text-slate-700'}`}>
                          {formatRupiah(s.saldo)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12">
                Nasabah tidak ditemukan.
              </div>
            )}
          </div>
        </div>

        {/* Panel Kanan: Form Transaksi (Desktop) */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden h-fit">
          {renderFormContent(false)}
        </div>

        {/* Modal Form Transaksi (Mobile) */}
        <AnimatePresence>
          {view === 'form' && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4 lg:hidden">
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-white rounded-t-[2rem] sm:rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90dvh] sm:max-h-[85dvh] overflow-hidden mt-auto sm:mt-0"
              >
                {renderFormContent(true)}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
