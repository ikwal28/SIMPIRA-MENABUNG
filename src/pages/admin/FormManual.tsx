import React, { useContext, useState, useMemo, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import { FileText, Download, Search, Users } from 'lucide-react';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const AdminFormManual = () => {
  const { siswa, isLoadingData, fetchSiswa } = useContext(DataContext);
  const [selectedKelas, setSelectedKelas] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSiswa();
  }, []);

  const classes = useMemo(() => {
    const uniqueClasses = Array.from(new Set(siswa.map((s: any) => String(s.kelas || '').trim()))).filter(Boolean).sort((a: any, b: any) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numB - numA; // Descending
      return b.localeCompare(a);
    });
    return ['Semua', ...uniqueClasses];
  }, [siswa]);

  const filteredSiswa = useMemo(() => {
    return siswa.filter((s: any) => {
      const sKelas = String(s.kelas || '').trim();
      const matchKelas = selectedKelas === 'Semua' || sKelas === selectedKelas;
      const name = String(s.nama || '');
      const search = String(searchQuery || '').toLowerCase();
      const matchSearch = name.toLowerCase().includes(search) || 
                          String(s.rekening || '').includes(searchQuery);
      return matchKelas && matchSearch;
    }).sort((a: any, b: any) => {
      const classA = parseInt(a.kelas);
      const classB = parseInt(b.kelas);
      if (classA !== classB) {
        return classB - classA; // Descending order: 6 to 1
      }
      return a.nama.localeCompare(b.nama);
    });
  }, [siswa, selectedKelas, searchQuery]);

  const generatePDF = (data: any) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SIMPIRA MENABUNG', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('SD NEGERI 2 LAOT TADU', 105, 22, { align: 'center' });
    doc.setFontSize(10);
    doc.text('FORM MANUAL TABUNGAN', 105, 28, { align: 'center' });
    
    // Line
    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);

    // Student Info
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`NAMA : ${data.nama}`, 20, 40);
    doc.text(`No Rekening : ${data.rekening}`, 120, 40);
    
    doc.text(`Kelas : ${data.kelas || '-'}`, 20, 46);
    doc.text(`Status : ${data.status || 'Aktif'}`, 120, 46);
    
    doc.text(`Nama Panggilan : ...........................................`, 20, 52);
    
    const formattedSaldo = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(data.saldo || 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`SALDO TERAKHIR : ${formattedSaldo}`, 20, 60);

    // Table Data
    const rows = [];
    for (let i = 1; i <= 25; i++) {
      rows.push([
        i, '', '', '', // Left side
        i + 25, '', '', '' // Right side
      ]);
    }

    autoTable(doc, {
      startY: 65,
      head: [['No', 'Tanggal', 'Setoran', 'Saldo', 'No', 'Tanggal', 'Setoran', 'Saldo']],
      body: rows,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 2.2,
        halign: 'center',
        valign: 'middle',
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 20 },
        2: { cellWidth: 20 },
        3: { cellWidth: 30 },
        4: { cellWidth: 8 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 },
        7: { cellWidth: 30 },
      },
      margin: { left: 20, right: 20 }
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Petugas', 150, finalY + 5, { align: 'center' });
    doc.line(130, finalY + 22, 170, finalY + 22);

    return doc;
  };

  const handleDownloadAll = () => {
    if (filteredSiswa.length === 0) return;
    
    const doc = new jsPDF('p', 'mm', 'a4');
    
    filteredSiswa.forEach((data: any, index: number) => {
      if (index > 0) doc.addPage();
      
      // Header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('SIMPIRA MENABUNG', 105, 15, { align: 'center' });
      doc.setFontSize(12);
      doc.text('SD NEGERI 2 LAOT TADU', 105, 22, { align: 'center' });
      doc.setFontSize(10);
      doc.text('FORM MANUAL TABUNGAN', 105, 28, { align: 'center' });
      
      // Line
      doc.setLineWidth(0.5);
      doc.line(20, 32, 190, 32);

      // Student Info
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`NAMA : ${data.nama}`, 20, 40);
      doc.text(`No Rekening : ${data.rekening}`, 120, 40);
      doc.text(`Kelas : ${data.kelas || '-'}`, 20, 46);
      doc.text(`Status : ${data.status || 'Aktif'}`, 120, 46);
      doc.text(`Nama Panggilan : ...........................................`, 20, 52);
      
      const formattedSaldo = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(data.saldo || 0);
      doc.setFont('helvetica', 'bold');
      doc.text(`SALDO TERAKHIR : ${formattedSaldo}`, 20, 60);

      const rows = [];
      for (let i = 1; i <= 25; i++) {
        rows.push([i, '', '', '', i + 25, '', '', '']);
      }

      autoTable(doc, {
        startY: 65,
        head: [['No', 'Tanggal', 'Setoran', 'Saldo', 'No', 'Tanggal', 'Setoran', 'Saldo']],
        body: rows,
        theme: 'grid',
        styles: { 
          fontSize: 7.5, 
          cellPadding: 2.2, 
          halign: 'center', 
          valign: 'middle', 
          lineWidth: 0.1, 
          lineColor: [0, 0, 0] 
        },
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 20 }, 2: { cellWidth: 20 }, 3: { cellWidth: 30 }, 4: { cellWidth: 8 }, 5: { cellWidth: 20 }, 6: { cellWidth: 20 }, 7: { cellWidth: 30 } },
        margin: { left: 20, right: 20 }
      });

      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Petugas', 150, finalY + 5, { align: 'center' });
      doc.line(130, finalY + 22, 170, finalY + 22);
    });

    window.open(doc.output('bloburl'), '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Form Manual SIMPIRA MENABUNG</h1>
          <p className="text-slate-500">Cetak form manual kolektif nasabah secara profesional.</p>
        </div>
        <button
          onClick={handleDownloadAll}
          disabled={filteredSiswa.length === 0}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText size={20} />
          Cetak Kolektif ({filteredSiswa.length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Cari nama atau nomor rekening..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="relative">
          <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <select
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
          >
            {classes.map((c: any) => (
              <option key={c} value={c}>{c === 'Semua' ? 'Semua Kelas' : `Kelas ${c}`}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nasabah</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rekening</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kelas</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Saldo Terakhir</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingData ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">Memuat data...</td>
                </tr>
              ) : filteredSiswa.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">Tidak ada data nasabah</td>
                </tr>
              ) : (
                filteredSiswa.map((s: any) => (
                  <tr key={s.rekening} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{s.nama}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">{s.rekening}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase">
                        Kelas {s.kelas || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-indigo-600">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(s.saldo || 0)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          const doc = generatePDF(s);
                          window.open(doc.output('bloburl'), '_blank');
                        }}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Cetak Form Manual"
                      >
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
