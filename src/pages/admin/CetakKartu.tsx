import React, { useState, useContext } from 'react';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { Printer, CreditCard, Loader2 } from 'lucide-react';
import { createRoot } from 'react-dom/client';
import { KartuTabunganPDF } from '../../components/KartuTabunganPDF';
import Swal from 'sweetalert2';

export const AdminCetakKartu = () => {
  const { siswa } = useContext(DataContext);
  const { user } = useContext(AuthContext);
  const [selectedKelas, setSelectedKelas] = useState('Semua');
  const [isPrinting, setIsPrinting] = useState(false);

  const kelasList = ['Semua', ...Array.from(new Set(siswa.map((s: any) => s.kelas))).sort((a: any, b: any) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) return numB - numA; // Descending order
    return b.toString().localeCompare(a.toString());
  })];

  const handlePrintKartu = () => {
    if (user?.role !== 'admin') {
      Swal.fire('Error', 'Anda tidak memiliki akses.', 'error');
      return;
    }
    
    setIsPrinting(true);
    const dataToPrint = (selectedKelas === 'Semua' ? [...siswa] : siswa.filter((s: any) => s.kelas.toString() === selectedKelas)).sort((a: any, b: any) => {
      const classA = parseInt(a.kelas);
      const classB = parseInt(b.kelas);
      if (classA !== classB) {
        return classB - classA; // Descending order: 6 to 1
      }
      return a.nama.localeCompare(b.nama);
    });
    
    if (dataToPrint.length === 0) {
      Swal.fire('Info', 'Tidak ada data siswa untuk kelas yang dipilih.', 'info');
      setIsPrinting(false);
      return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      Swal.fire('Error', 'Gagal membuka jendela cetak. Pastikan popup diizinkan.', 'error');
      setIsPrinting(false);
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Kartu Tabungan</title>
          <style>
            body { margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    `);
    
    const container = printWindow.document.getElementById('root');
    if (container) {
      const root = createRoot(container);
      root.render(<KartuTabunganPDF siswa={dataToPrint} />);
    }

    setTimeout(() => {
      printWindow.print();
      setIsPrinting(false);
      // printWindow.close(); // Keep open for user to review
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CreditCard className="text-indigo-600" />
          Cetak Kartu Tabungan
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Pilih Kelas</label>
            <select 
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              {kelasList.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handlePrintKartu}
            disabled={isPrinting}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all disabled:opacity-50"
          >
            {isPrinting ? <Loader2 className="animate-spin" size={20} /> : <Printer size={20} />}
            {isPrinting ? 'Menyiapkan...' : 'Cetak Kartu'}
          </button>
        </div>
      </div>
    </div>
  );
};
