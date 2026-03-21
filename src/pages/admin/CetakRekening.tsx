import React, { useState, useContext, useEffect, useRef } from 'react';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { formatRupiah } from '../../utils/format';
import { Printer, FileText, Users, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { KartuTabunganPDF } from '../../components/KartuTabunganPDF';
import { createRoot } from 'react-dom/client';

export const AdminCetakRekening = () => {
  const { siswa, transaksi, fetchSiswa, fetchTransaksi, isLoadingData } = useContext(DataContext);
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'siswa' | 'kelas'>('siswa');
  
  // State for Cetak Rekening Koran (Siswa)
  const [selectedSiswa, setSelectedSiswa] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // State for Cetak Laporan Kelas
  const [selectedKelas, setSelectedKelas] = useState<string>('Semua');

  useEffect(() => {
    fetchSiswa();
    fetchTransaksi();
  }, []);

  const filteredSiswa = siswa.filter(
    (s: any) =>
      (s.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.rekening || '').toString().includes(searchTerm)
  );

  const handleCetakRekeningKoran = () => {
    if (!selectedSiswa) return;
    
    const dataSiswa = siswa.find((s: any) => s.rekening?.toString() === selectedSiswa?.toString());
    if (!dataSiswa) return;

    const riwayatSiswa = transaksi.filter((t: any) => t.rekening?.toString() === selectedSiswa?.toString());
    
    // Sort ascending by date for rekening koran
    const sortedRiwayat = [...riwayatSiswa].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

    let saldoBerjalan = 0;
    const rows = sortedRiwayat.map((t: any) => {
      const jumlah = parseFloat(t.jumlah) || 0;
      if (t.jenis === 'Setor') {
        saldoBerjalan += jumlah;
      } else {
        saldoBerjalan -= jumlah;
      }
      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${new Date(t.tanggal).toLocaleDateString('id-ID')}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${t.id_trx || '-'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${t.keterangan || '-'}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right; color: green;">${t.jenis === 'Setor' ? formatRupiah(jumlah) : '-'}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right; color: red;">${t.jenis === 'Tarik' ? formatRupiah(jumlah) : '-'}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatRupiah(saldoBerjalan)}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <html>
        <head>
          <title>Rekening Koran - ${dataSiswa.nama}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { margin: 0 0 10px 0; color: #1e1b4b; }
            .header p { margin: 0; color: #666; }
            .info-table { width: 100%; margin-bottom: 30px; }
            .info-table td { padding: 5px; }
            .info-table td:first-child { font-weight: bold; width: 150px; }
            .data-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
            .data-table th { background-color: #f8fafc; padding: 10px; border: 1px solid #ddd; text-align: left; font-weight: bold; }
            .footer { margin-top: 50px; text-align: right; }
            .signature { margin-top: 80px; font-weight: bold; }
            @media print {
              body { padding: 0; }
              @page { margin: 2cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SIMPIRA MENABUNG</h1>
            <p>SD Negeri 2 Laot Tadu</p>
            <h2>REKENING KORAN NASABAH</h2>
          </div>
          
          <table class="info-table">
            <tr><td>No. Rekening</td><td>: ${dataSiswa.rekening}</td><td>Status</td><td>: ${dataSiswa.status || 'AKTIF'}</td></tr>
            <tr><td>Nama Nasabah</td><td>: ${dataSiswa.nama}</td><td>Tanggal Cetak</td><td>: ${new Date().toLocaleDateString('id-ID')}</td></tr>
            <tr><td>Kelas</td><td>: ${dataSiswa.kelas}</td><td>Saldo Akhir</td><td>: <strong>${formatRupiah(dataSiswa.saldo)}</strong></td></tr>
          </table>

          <table class="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>ID Transaksi</th>
                <th>Keterangan</th>
                <th style="text-align: right;">Setor</th>
                <th style="text-align: right;">Tarik</th>
                <th style="text-align: right;">Saldo</th>
              </tr>
            </thead>
            <tbody>
              ${rows.length > 0 ? rows : '<tr><td colspan="6" style="text-align: center; padding: 20px;">Belum ada riwayat transaksi</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            <p>Laot Tadu, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p>Administrator,</p>
            <div class="signature">( _________________________ )</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  const handleCetakLaporanKelas = () => {
    let dataToPrint = siswa;
    if (selectedKelas !== 'Semua') {
      dataToPrint = siswa.filter((s: any) => s.kelas.toString() === selectedKelas);
    }

    // Sort by class descending (6 to 1) then name
    dataToPrint.sort((a: any, b: any) => {
      const classA = parseInt(a.kelas);
      const classB = parseInt(b.kelas);
      if (classA !== classB) {
        return classB - classA; // Descending order: 6 to 1
      }
      return a.nama.localeCompare(b.nama);
    });

    const totalSaldo = dataToPrint.reduce((sum: number, s: any) => sum + (parseFloat(s.saldo) || 0), 0);

    const rows = dataToPrint.map((s: any, index: number) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${s.rekening}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${s.nama}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${s.kelas}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${s.status || 'AKTIF'}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatRupiah(s.saldo)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <title>Laporan Rekening - ${selectedKelas === 'Semua' ? 'Semua Kelas' : 'Kelas ' + selectedKelas}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { margin: 0 0 10px 0; color: #1e1b4b; }
            .header p { margin: 0; color: #666; }
            .info { margin-bottom: 20px; font-weight: bold; }
            .data-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
            .data-table th { background-color: #f8fafc; padding: 10px; border: 1px solid #ddd; text-align: left; font-weight: bold; }
            .total-row td { background-color: #f1f5f9; font-weight: bold; padding: 10px; border: 1px solid #ddd; }
            .footer { margin-top: 50px; text-align: right; }
            .signature { margin-top: 80px; font-weight: bold; }
            @media print {
              body { padding: 0; }
              @page { margin: 2cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SIMPIRA MENABUNG</h1>
            <p>SD Negeri 2 Laot Tadu</p>
            <h2>LAPORAN SALDO REKENING NASABAH</h2>
          </div>
          
          <div class="info">
            <p>Filter Kelas: ${selectedKelas === 'Semua' ? 'Semua Kelas' : 'Kelas ' + selectedKelas}</p>
            <p>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}</p>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th style="text-align: center; width: 50px;">No</th>
                <th>Rekening</th>
                <th>Nama Nasabah</th>
                <th style="text-align: center;">Kelas</th>
                <th style="text-align: center;">Status</th>
                <th style="text-align: right;">Saldo Akhir</th>
              </tr>
            </thead>
            <tbody>
              ${rows.length > 0 ? rows : '<tr><td colspan="6" style="text-align: center; padding: 20px;">Tidak ada data nasabah</td></tr>'}
              ${rows.length > 0 ? `
                <tr class="total-row">
                  <td colspan="5" style="text-align: right;">TOTAL SALDO KESELURUHAN</td>
                  <td style="text-align: right; color: #1e1b4b;">${formatRupiah(totalSaldo)}</td>
                </tr>
              ` : ''}
            </tbody>
          </table>

          <div class="footer">
            <p>Laot Tadu, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p>Administrator,</p>
            <div class="signature">( _________________________ )</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cetak Rekening SIMPIRA MENABUNG</h1>
        <p className="text-slate-500 mt-1">Cetak rekening koran siswa dan laporan saldo per kelas secara profesional.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('siswa')}
            className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'siswa' 
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FileText size={18} />
            Rekening Koran (Per Siswa)
          </button>
          <button
            onClick={() => setActiveTab('kelas')}
            className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'kelas' 
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Users size={18} />
            Laporan Saldo (Per Kelas)
          </button>
        </div>

        <div className="p-6 lg:p-8">
          {isLoadingData ? (
            <div className="flex justify-center items-center py-12">
              <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></span>
              <span className="ml-3 text-slate-500 font-medium">Memuat data...</span>
            </div>
          ) : (
            <>
              {/* Tab: Rekening Koran */}
              {activeTab === 'siswa' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl mx-auto space-y-6"
                >
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Pilih Nasabah</h3>
                    
                    <div className="relative mb-4">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type="text"
                        placeholder="Cari nama atau rekening..."
                        className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl bg-white">
                      {filteredSiswa.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {filteredSiswa.map((s: any) => (
                            <label 
                              key={s.rekening} 
                              className={`flex items-center p-4 cursor-pointer hover:bg-indigo-50/50 transition-colors ${selectedSiswa === s.rekening ? 'bg-indigo-50' : ''}`}
                            >
                              <input 
                                type="radio" 
                                name="siswa" 
                                value={s.rekening}
                                checked={selectedSiswa === s.rekening}
                                onChange={() => setSelectedSiswa(s.rekening)}
                                className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-600"
                              />
                              <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-slate-900">{s.nama}</p>
                                <p className="text-xs text-slate-500 font-mono">Rek: {s.rekening} • Kelas: {s.kelas}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-slate-700">{formatRupiah(s.saldo)}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-slate-500 text-sm">
                          Tidak ada nasabah ditemukan.
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleCetakRekeningKoran}
                    disabled={!selectedSiswa}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-indigo-500/20 disabled:bg-slate-300 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    <Printer size={20} />
                    Cetak Rekening Koran PDF
                  </button>
                </motion.div>
              )}

              {/* Tab: Laporan Kelas */}
              {activeTab === 'kelas' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl mx-auto space-y-6"
                >
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Pilih Kelas</h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => setSelectedKelas('Semua')}
                        className={`py-3 px-4 rounded-xl text-sm font-medium border transition-all ${
                          selectedKelas === 'Semua' 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                        }`}
                      >
                        Semua Kelas
                      </button>
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <button
                          key={num}
                          onClick={() => setSelectedKelas(num.toString())}
                          className={`py-3 px-4 rounded-xl text-sm font-medium border transition-all ${
                            selectedKelas === num.toString() 
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20' 
                              : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                          }`}
                        >
                          Kelas {num}
                        </button>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Nasabah</p>
                        <p className="text-xl font-bold text-slate-800">
                          {selectedKelas === 'Semua' 
                            ? siswa.length 
                            : siswa.filter((s: any) => s.kelas.toString() === selectedKelas).length}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Saldo</p>
                        <p className="text-xl font-bold text-emerald-600">
                          {formatRupiah(
                            (selectedKelas === 'Semua' 
                              ? siswa 
                              : siswa.filter((s: any) => s.kelas.toString() === selectedKelas)
                            ).reduce((sum: number, s: any) => sum + (parseFloat(s.saldo) || 0), 0)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCetakLaporanKelas}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-indigo-500/20 flex justify-center items-center gap-2"
                  >
                    <Printer size={20} />
                    Cetak Laporan Rekening PDF
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
