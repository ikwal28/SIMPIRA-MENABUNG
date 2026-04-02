import React from 'react';
import { formatRupiah, formatDate } from '../utils/format';

interface RiwayatTransaksiPDFProps {
  user: any;
  transaksi: any[];
}

export const RiwayatTransaksiPDF: React.FC<RiwayatTransaksiPDFProps> = ({ user, transaksi }) => {
  const totalSetor = transaksi
    .filter(t => t.jenis === 'Setor')
    .reduce((acc, curr) => acc + (curr.jumlah || 0), 0);
  
  const totalTarik = transaksi
    .filter(t => t.jenis === 'Tarik')
    .reduce((acc, curr) => acc + (curr.jumlah || 0), 0);

  return (
    <div className="p-8 bg-white font-sans text-slate-900">
      <style>{`
        @media print {
          @page { size: A4; margin: 20mm; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        .header-banner {
          background: linear-gradient(90deg, #059669 0%, #10b981 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
          background: #f8fafc;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .info-label {
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .info-value {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background: #f1f5f9;
          text-align: left;
          padding: 12px;
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          border-bottom: 2px solid #e2e8f0;
        }
        td {
          padding: 12px;
          font-size: 12px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
        }
        .amount-setor { color: #059669; font-weight: 700; }
        .amount-tarik { color: #dc2626; font-weight: 700; }
        .summary-box {
          margin-top: 30px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }
        .summary-item {
          padding: 15px;
          border-radius: 10px;
          text-align: center;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 10px;
          color: #94a3b8;
          border-top: 1px solid #f1f5f9;
          padding-top: 20px;
        }
      `}</style>

      <div className="header-banner">
        <div>
          <h1 className="text-2xl font-bold m-0">Laporan Transaksi Nasabah</h1>
          <p className="text-sm opacity-90 mt-1">SIMPIRA MENABUNG - SD NEGERI 2 LAOT TADU</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Tanggal Cetak</p>
          <p className="text-sm font-bold">{formatDate(new Date().toISOString())}</p>
        </div>
      </div>

      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Nama Nasabah</span>
          <span className="info-value">{user?.nama || '-'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Nomor Rekening</span>
          <span className="info-value font-mono">{user?.rekening || '-'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Kelas</span>
          <span className="info-value">{user?.kelas || '-'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Status Rekening</span>
          <span className="info-value text-emerald-600 font-bold">{user?.status || 'AKTIF'}</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>ID Transaksi</th>
            <th>Jenis</th>
            <th>Keterangan</th>
            <th style={{ textAlign: 'right' }}>Jumlah</th>
          </tr>
        </thead>
        <tbody>
          {transaksi.map((trx, idx) => (
            <tr key={idx}>
              <td>{formatDate(trx.tanggal)}</td>
              <td className="font-mono text-[10px]">{trx.id_trx}</td>
              <td>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  trx.jenis === 'Setor' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {trx.jenis === 'Setor' ? 'SETORAN' : 'PENARIKAN'}
                </span>
              </td>
              <td>{trx.keterangan || '-'}</td>
              <td style={{ textAlign: 'right' }} className={trx.jenis === 'Setor' ? 'amount-setor' : 'amount-tarik'}>
                {trx.jenis === 'Setor' ? '+' : '-'}{formatRupiah(trx.jumlah)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="summary-box">
        <div className="summary-item bg-emerald-50 border border-emerald-100">
          <p className="info-label text-emerald-600">Total Setoran</p>
          <p className="text-lg font-bold text-emerald-700">{formatRupiah(totalSetor)}</p>
        </div>
        <div className="summary-item bg-rose-50 border border-rose-100">
          <p className="info-label text-rose-600">Total Penarikan</p>
          <p className="text-lg font-bold text-rose-700">{formatRupiah(totalTarik)}</p>
        </div>
        <div className="summary-item bg-slate-900 text-white">
          <p className="info-label text-slate-400">Saldo Akhir</p>
          <p className="text-lg font-bold text-emerald-400">{formatRupiah(user?.saldo || 0)}</p>
        </div>
      </div>

      <div className="footer">
        <p>Dokumen ini dihasilkan secara otomatis oleh Sistem Informasi Tabungan Siswa (SIMPIRA).</p>
        <p className="mt-1">© 2026 SD NEGERI 2 LAOT TADU - SIMPIRA MENABUNG</p>
      </div>
    </div>
  );
};
