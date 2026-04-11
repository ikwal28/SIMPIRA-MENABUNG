import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { formatRupiah } from '../../utils/format';
import { ArrowDownToLine, ArrowUpFromLine, Search, UserCheck, QrCode, X, ArrowLeft, ChevronRight } from 'lucide-react';
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

  const filteredSiswa = siswa.filter((s: any) => {
    const name = String(s.nama || '');
    const search = String(searchTerm || '').toLowerCase();
    return name.toLowerCase().includes(search) ||
      String(s.rekening || '').includes(searchTerm);
  });

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

  const renderFormContent = () => (
    <>
      <div className="px-4 lg:px-6 py-4 lg:py-5 border-b border-slate-100 bg-white flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView('search')}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
            title="Kembali ke pencarian"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-bold text-slate-800 text-lg">Detail Transaksi</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Langkah 2 dari 2</p>
          </div>
        </div>
        <div className="flex gap-1">
          <div className="w-8 h-1.5 bg-indigo-100 rounded-full"></div>
          <div className="w-8 h-1.5 bg-indigo-600 rounded-full"></div>
        </div>
      </div>
      
      <div className="p-4 lg:p-8 max-w-2xl mx-auto">
        {!selectedSiswa ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <UserCheck size={32} className="text-slate-300" />
            </div>
            <p>Silakan pilih nasabah dari daftar<br/>untuk memulai transaksi.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Info Nasabah Terpilih */}
            <div className="bg-indigo-50/50 p-4 lg:p-6 rounded-2xl border border-indigo-100 flex justify-between items-center">
              <div className="min-w-0">
                <p className="text-[10px] text-indigo-500 uppercase tracking-wider font-bold mb-1">Informasi Nasabah</p>
                <div className="flex items-center gap-2 overflow-hidden">
                  <p className="font-bold text-slate-900 text-lg truncate">{selectedSiswa.nama}</p>
                  {selectedSiswa.status && selectedSiswa.status !== 'AKTIF' && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${
                      selectedSiswa.status === 'LULUS' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {selectedSiswa.status}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 font-mono truncate">{selectedSiswa.rekening} • Kelas {selectedSiswa.kelas}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-indigo-500 uppercase tracking-wider font-bold mb-1">Saldo Saat Ini</p>
                <p className="font-black text-indigo-600 text-xl lg:text-2xl">{formatRupiah(selectedSiswa.saldo)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Jenis Transaksi */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Jenis Transaksi</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setJenisTrx('Setor')}
                    className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all ${
                      jenisTrx === 'Setor'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold shadow-sm'
                        : 'border-slate-100 bg-slate-50/50 hover:border-emerald-200 text-slate-500'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${jenisTrx === 'Setor' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <ArrowUpFromLine size={20} />
                    </div>
                    <span className="text-xs uppercase tracking-wider">Setoran</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setJenisTrx('Tarik')}
                    className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all ${
                      jenisTrx === 'Tarik'
                        ? 'border-rose-500 bg-rose-50 text-rose-700 font-bold shadow-sm'
                        : 'border-slate-100 bg-slate-50/50 hover:border-rose-200 text-slate-500'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${jenisTrx === 'Tarik' ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <ArrowDownToLine size={20} />
                    </div>
                    <span className="text-xs uppercase tracking-wider">Penarikan</span>
                  </button>
                </div>
              </div>

              {/* Tanggal Transaksi */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Tanggal</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 font-medium"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Jumlah */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Jumlah Nominal</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                  <input
                    type="number"
                    required
                    min="1000"
                    className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xl font-black text-slate-900"
                    placeholder="0"
                    value={jumlah}
                    onChange={(e) => setJumlah(e.target.value)}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  />
                </div>
              </div>

              {/* Keterangan */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Keterangan</label>
                <input
                  type="text"
                  className="w-full px-4 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700"
                  placeholder={jenisTrx === 'Setor' ? 'Setoran tunai' : 'Penarikan tunai'}
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoadingData}
                className={`w-full py-4 rounded-2xl text-white font-black text-lg transition-all shadow-lg hover:shadow-xl flex justify-center items-center gap-3 ${
                  jenisTrx === 'Setor' 
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                } disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {isLoadingData ? (
                  <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
                ) : (
                  <>
                    Konfirmasi & Proses {jenisTrx === 'Setor' ? 'Setoran' : 'Penarikan'}
                  </>
                )}
              </button>
              <p className="text-center text-slate-400 text-xs mt-4">
                Pastikan nominal dan data nasabah sudah sesuai sebelum memproses transaksi.
              </p>
            </div>
          </form>
        )}
      </div>
    </>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Layanan Transaksi</h1>
          <p className="text-slate-500 mt-1">Sistem manajemen setoran dan penarikan tunai nasabah.</p>
        </div>
      </div>

      <div className="relative min-h-[600px]">
        <AnimatePresence mode="wait">
          {view === 'search' ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col h-[650px]"
            >
              <div className="p-6 lg:p-8 border-b border-slate-100 bg-slate-50/30">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Pilih Nasabah</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 uppercase tracking-wider">Langkah 1 dari 2</p>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-8 h-1.5 bg-indigo-600 rounded-full"></div>
                    <div className="w-8 h-1.5 bg-indigo-100 rounded-full"></div>
                  </div>
                </div>
                
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Ketik nama nasabah atau nomor rekening..."
                    className="w-full pl-12 pr-24 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-base shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        <X size={18} />
                      </button>
                    )}
                    <button 
                      type="button"
                      onClick={() => Swal.fire('Info', 'Fitur Scan QR akan segera hadir', 'info')}
                      className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                      title="Scan QR Card"
                    >
                      <QrCode size={20} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar">
                {isLoadingData ? (
                  <div className="flex flex-col justify-center items-center h-full text-slate-400 gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="font-medium">Sinkronisasi data nasabah...</p>
                  </div>
                ) : filteredSiswa.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredSiswa.map((s: any, index: number) => (
                      <div
                        key={index}
                        onClick={() => {
                          setSelectedSiswa(s);
                          setView('form');
                        }}
                        className="group p-4 rounded-2xl cursor-pointer transition-all border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-md bg-white"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-black text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                              {s.nama.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate group-hover:text-indigo-900 transition-colors">
                                {s.nama}
                              </p>
                              <p className="text-xs text-slate-500 font-mono truncate">
                                {s.rekening} • <span className="font-bold text-indigo-500">Kls {s.kelas}</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Saldo</p>
                            <p className="text-sm font-black text-slate-700 group-hover:text-indigo-600 transition-colors">
                              {formatRupiah(s.saldo)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Search size={40} className="text-slate-200" />
                    </div>
                    <p className="font-medium text-lg">Nasabah tidak ditemukan</p>
                    <p className="text-sm">Coba gunakan kata kunci pencarian lain</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden min-h-[650px]"
            >
              {renderFormContent()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
