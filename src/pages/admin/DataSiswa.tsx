import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import { formatRupiah } from '../../utils/format';
import { Plus, Search, Edit, Trash2, KeyRound, Activity, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';

export const AdminDataSiswa = () => {
  const { siswa, addSiswa, updateSiswa, deleteSiswa, fetchSiswa, isLoadingData, refreshAll } = useContext(DataContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<any>(null);
  const [nipd, setNipd] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('Semua');
  const [limit, setLimit] = useState(50);
  const NO_INSTANSI = '10104711';

  useEffect(() => {
    fetchSiswa();
  }, []);

  const handleLoadMore = () => {
    setLimit(prev => prev + 50);
  };

  const [formData, setFormData] = useState({
    rekening: '',
    nama: '',
    kelas: '',
    username: '',
    password: '',
    status: 'AKTIF'
  });

  const filteredSiswa = siswa.filter((s: any) => {
    const name = String(s.nama || '');
    const kelas = String(s.kelas || '');
    const search = String(searchTerm || '').toLowerCase();

    return (selectedKelas === 'Semua' || s.kelas === selectedKelas) &&
      (name.toLowerCase().includes(search) ||
       String(s.rekening || '').includes(searchTerm) ||
       kelas.toLowerCase().includes(search));
  });


  const displayedSiswa = filteredSiswa.slice(0, limit);

  const handleNipdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNipd(val);
    setFormData({
      ...formData,
      rekening: val + NO_INSTANSI,
      username: val ? `${val}simpira` : ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const confirmResult = await Swal.fire({
      title: editingSiswa ? 'Konfirmasi Perubahan' : 'Konfirmasi Pendaftaran',
      html: `
        <div class="text-left space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <div class="flex justify-between border-b border-slate-200 pb-2 mb-2">
            <span class="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Nama Nasabah</span>
            <span class="text-slate-900 font-bold">${formData.nama}</span>
          </div>
          <div class="flex justify-between border-b border-slate-200 pb-2 mb-2">
            <span class="text-slate-500 text-[10px] uppercase font-bold tracking-wider">No. Rekening</span>
            <span class="text-slate-900 font-mono text-sm">${formData.rekening}</span>
          </div>
          <div class="flex justify-between border-b border-slate-200 pb-2 mb-2">
            <span class="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Kelas</span>
            <span class="text-slate-900 font-bold">Kelas ${formData.kelas}</span>
          </div>
          <div class="flex justify-between ${!editingSiswa ? 'border-b border-slate-200 pb-2 mb-2' : ''}">
            <span class="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Status</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
              formData.status === 'AKTIF' ? 'bg-emerald-100 text-emerald-700' : 
              formData.status === 'LULUS' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
            }">${formData.status}</span>
          </div>
          ${!editingSiswa ? `
          <div class="pt-1">
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Akses Login</p>
            <div class="flex justify-between text-xs">
              <span class="text-slate-500">User: <span class="font-mono text-slate-900 font-bold">${formData.username}</span></span>
              <span class="text-slate-500">Pass: <span class="font-mono text-slate-900 font-bold">${formData.password}</span></span>
            </div>
          </div>
          ` : ''}
        </div>
        <p class="mt-4 text-sm text-slate-500 italic">Apakah data nasabah ini sudah benar?</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#64748b',
      confirmButtonText: editingSiswa ? 'Ya, Simpan' : 'Ya, Daftarkan',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (!confirmResult.isConfirmed) return;

    let success = false;
    if (editingSiswa) {
      success = await updateSiswa(formData.rekening, formData);
    } else {
      success = await addSiswa(formData);
    }
    if (success) setIsModalOpen(false);
  };

  const handleEdit = (s: any) => {
    setEditingSiswa(s);
    const currentNipd = s.rekening.endsWith(NO_INSTANSI) 
      ? s.rekening.slice(0, -NO_INSTANSI.length) 
      : s.rekening;
    setNipd(currentNipd);
    setFormData({
      rekening: s.rekening,
      nama: s.nama,
      kelas: s.kelas,
      username: s.username,
      password: '',
      status: s.status || 'AKTIF'
    });
    setIsModalOpen(true);
  };

  const handleDelete = (rekening: string) => {
    Swal.fire({
      title: 'Hapus Nasabah?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteSiswa(rekening);
      }
    });
  };

  const handleResetPassword = async (s: any) => {
    const { value: newPassword } = await Swal.fire({
      title: 'Reset Password',
      input: 'password',
      inputLabel: `Password baru untuk ${s.nama}`,
      inputPlaceholder: 'Masukkan password baru',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'Password tidak boleh kosong!';
        }
      }
    });

    if (newPassword) {
      updateSiswa(s.rekening, { password: newPassword });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Data Nasabah SIMPIRA MENABUNG</h1>
          <p className="text-slate-500 mt-1">Kelola data siswa dan rekening tabungan secara profesional.</p>
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
          <button
            onClick={() => {
              setEditingSiswa(null);
              setNipd('');
              setFormData({ rekening: '', nama: '', kelas: '1', username: '', password: 'simpira123', status: 'AKTIF' });
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm hover:shadow-md font-medium"
          >
            <Plus size={20} />
            Tambah Nasabah
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, rekening, atau kelas..."
              className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isLoadingData && (
            <span className="text-sm font-medium text-indigo-600 flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></span> 
              Memuat...
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4 font-semibold">Rekening</th>
                <th className="px-6 py-4 font-semibold">Nama Nasabah</th>
                <th className="px-6 py-4 font-semibold">Kelas</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Saldo (Rp)</th>
                <th className="px-6 py-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedSiswa.length > 0 ? (
                displayedSiswa.map((s: any, index: number) => (
                  <tr key={index} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-mono text-sm text-slate-600 font-medium">{s.rekening}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          <img 
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=modern-user-123" 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 leading-tight">{s.nama}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider">User: {s.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {s.kelas}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        s.status === 'AKTIF' || !s.status ? 'bg-emerald-100 text-emerald-700' :
                        s.status === 'LULUS' ? 'bg-blue-100 text-blue-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {s.status || 'AKTIF'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">
                      {formatRupiah(s.saldo)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEdit(s)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleResetPassword(s)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(s.rekening)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada data nasabah ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredSiswa.length > limit && (
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

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white rounded-t-[2rem] sm:rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90dvh] sm:max-h-[85dvh] overflow-hidden mt-auto sm:mt-0"
            >
              <div className="px-6 py-5 border-b border-slate-100 bg-white sticky top-0 z-10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">
                  {editingSiswa ? 'Edit Data Nasabah' : 'Tambah Nasabah Baru'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <form id="nasabah-form" onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">No. Rekening</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">NIPD / ID</span>
                        <input
                          type="text"
                          required
                          disabled={!!editingSiswa}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-400 font-mono text-sm transition-all"
                          value={nipd}
                          onChange={handleNipdChange}
                          placeholder="001"
                        />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Instansi</span>
                        <input
                          type="text"
                          disabled
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-400 font-mono text-sm"
                          value={NO_INSTANSI}
                        />
                      </div>
                    </div>
                    {nipd && (
                      <div className="mt-2 p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                        <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-tight">
                          Format Rekening: <span className="font-mono">{formData.rekening}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama lengkap nasabah"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Kelas</label>
                      <select
                        required
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all appearance-none"
                        value={formData.kelas}
                        onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                      >
                        <option value="" disabled>Pilih</option>
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num.toString()}>Kelas {num}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                      <select
                        required
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all appearance-none"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="AKTIF">AKTIF</option>
                        <option value="TIDAK AKTIF">NON-AKTIF</option>
                        <option value="LULUS">LULUS</option>
                      </select>
                    </div>
                  </div>

                  {!editingSiswa && (
                    <div className="pt-2 space-y-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Akses Login Nasabah</p>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">Username</label>
                          <input
                            type="text"
                            required
                            readOnly
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-500 font-mono text-sm"
                            value={formData.username}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">Password Default</label>
                          <input
                            type="text"
                            required
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm bg-white"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0 flex gap-3 z-10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all border border-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="nasabah-form"
                  className="flex-[2] py-3.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                >
                  {editingSiswa ? 'Simpan Perubahan' : 'Daftarkan Nasabah'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
