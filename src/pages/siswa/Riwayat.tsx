import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import { formatRupiah, formatDate } from '../../utils/format';
import { Filter, ArrowUpRight, ArrowDownRight, Calendar, Download, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const SiswaRiwayat = () => {
  const { user } = useContext(AuthContext);
  const { transaksi, totalTransaksi, fetchTransaksi, isLoadingData } = useContext(DataContext);
  const [filterJenis, setFilterJenis] = useState('Semua');
  const [filterTanggal, setFilterTanggal] = useState('');
  const [offset, setOffset] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
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

  const handleDownload = () => {
    if (myTransaksi.length === 0) {
      Swal.fire('Info', 'Tidak ada transaksi untuk diunduh.', 'info');
      return;
    }

    setIsPrinting(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFillColor(5, 150, 105); // Emerald 600
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Laporan Transaksi Nasabah', 15, 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('SIMPIRA MENABUNG - SD NEGERI 2 LAOT TADU', 15, 28);
      
      doc.setFontSize(8);
      doc.text(`Dicetak pada: ${formatDate(new Date().toISOString())}`, pageWidth - 15, 20, { align: 'right' });

      // User Info Box
      doc.setTextColor(30, 41, 59); // Slate 800
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DATA NASABAH', 15, 50);
      
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.line(15, 52, pageWidth - 15, 52);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Nama Nasabah', 15, 60);
      doc.text('Nomor Rekening', 15, 66);
      doc.text('Kelas', 15, 72);
      doc.text('Status Rekening', 15, 78);

      doc.setFont('helvetica', 'bold');
      doc.text(`: ${user?.nama || '-'}`, 45, 60);
      doc.text(`: ${user?.rekening || '-'}`, 45, 66);
      doc.text(`: ${user?.kelas || '-'}`, 45, 72);
      doc.setTextColor(5, 150, 105);
      doc.text(`: ${user?.status || 'AKTIF'}`, 45, 78);

      // Table
      const tableData = myTransaksi.map(trx => [
        formatDate(trx.tanggal),
        trx.id_trx,
        trx.jenis === 'Setor' ? 'SETORAN' : 'PENARIKAN',
        trx.keterangan || '-',
        { 
          content: `${trx.jenis === 'Setor' ? '+' : '-'}${formatRupiah(trx.jumlah)}`,
          styles: { textColor: trx.jenis === 'Setor' ? [5, 150, 105] : [220, 38, 38] }
        }
      ]);

      autoTable(doc, {
        startY: 85,
        head: [['Tanggal', 'ID Transaksi', 'Jenis', 'Keterangan', 'Jumlah']],
        body: tableData,
        headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
          4: { halign: 'right', fontStyle: 'bold' }
        }
      });

      // Summary
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      const totalSetor = myTransaksi.filter(t => t.jenis === 'Setor').reduce((acc, curr) => acc + (curr.jumlah || 0), 0);
      const totalTarik = myTransaksi.filter(t => t.jenis === 'Tarik').reduce((acc, curr) => acc + (curr.jumlah || 0), 0);

      doc.setFillColor(248, 250, 252);
      doc.rect(15, finalY, pageWidth - 30, 25, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, finalY, pageWidth - 30, 25, 'S');

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text('Total Setoran', 20, finalY + 10);
      doc.text('Total Penarikan', pageWidth / 2, finalY + 10, { align: 'center' });
      doc.text('Saldo Akhir', pageWidth - 20, finalY + 10, { align: 'right' });

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 150, 105);
      doc.text(formatRupiah(totalSetor), 20, finalY + 18);
      doc.setTextColor(220, 38, 38);
      doc.text(formatRupiah(totalTarik), pageWidth / 2, finalY + 18, { align: 'center' });
      doc.setTextColor(15, 23, 42);
      doc.text(formatRupiah(user?.saldo || 0), pageWidth - 20, finalY + 18, { align: 'right' });

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('Dokumen ini dihasilkan secara otomatis oleh Sistem Informasi Tabungan Siswa (SIMPIRA).', pageWidth / 2, pageWidth > 200 ? 285 : 275, { align: 'center' });
      doc.text('© 2026 SD NEGERI 2 LAOT TADU - SIMPIRA MENABUNG', pageWidth / 2, pageWidth > 200 ? 290 : 280, { align: 'center' });

      doc.save(`Laporan_Transaksi_${user?.nama?.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
      
      Swal.fire({
        title: 'Berhasil',
        text: 'Laporan transaksi berhasil diunduh.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      Swal.fire('Error', 'Gagal menghasilkan PDF. Silakan coba lagi.', 'error');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mutasi Rekening SIMPIRA MENABUNG</h1>
          <p className="text-slate-500 mt-1">Riwayat lengkap transaksi tabungan Anda secara transparan.</p>
        </div>
        <button 
          onClick={handleDownload}
          disabled={isPrinting}
          className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm font-medium disabled:opacity-50"
        >
          {isPrinting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          Unduh Semua Transaksi
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
