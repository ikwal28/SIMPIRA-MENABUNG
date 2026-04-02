import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const KartuTabunganPDF = ({ siswa }: { siswa: any[] }) => {
  return (
    <div className="p-0 bg-white">
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          .page-break { page-break-after: always; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        .kartu-container {
          display: flex;
          flex-direction: column;
          gap: 8mm;
          width: 100%;
        }
        .kartu {
          width: 171.2mm;
          height: 53.98mm;
          border-radius: 4mm;
          position: relative;
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
          border: 1px solid rgba(0, 0, 0, 0.1);
          overflow: hidden;
          background-color: #ffffff;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          page-break-inside: avoid;
          display: flex;
        }
        .kartu::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: 
            radial-gradient(circle at 100% 0%, #34d399 0%, transparent 50%),
            radial-gradient(circle at 0% 100%, #3b82f6 0%, transparent 50%);
          opacity: 0.05;
          z-index: 0;
        }
        .left-col {
          width: 85.6mm;
          height: 100%;
          position: relative;
          border-right: 1px dashed #cbd5e1;
          padding: 4mm;
          display: flex;
          flex-direction: column;
          z-index: 1;
        }
        .left-col::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 10mm;
          background: linear-gradient(90deg, #3b82f6 0%, #34d399 100%);
          z-index: -1;
        }
        .right-col {
          width: 85.6mm;
          height: 100%;
          padding: 4mm;
          display: flex;
          flex-direction: column;
          z-index: 1;
          background-color: #f8fafc;
        }
        .header { display: flex; align-items: center; gap: 2mm; margin-bottom: 3mm; color: white; }
        .title { font-size: 2.2mm; font-weight: 500; opacity: 0.9; }
        .subtitle { font-size: 3.5mm; font-weight: 700; letter-spacing: -0.2px; }
        .data-grid { display: grid; grid-template-columns: 1fr; gap: 1mm; margin-bottom: 2mm; }
        .field { font-size: 2.6mm; display: flex; align-items: baseline; }
        .label { font-weight: 600; width: 20mm; color: #475569; font-size: 2.2mm; text-transform: uppercase; }
        .value { font-weight: 600; color: #1e293b; }
        .login-box { 
          background: rgba(255, 255, 255, 0.8); 
          padding: 2mm; 
          border-radius: 2mm; 
          margin-top: auto; 
          border: 1px solid #e2e8f0;
        }
        .login-title { font-size: 2.4mm; font-weight: 800; color: #4f46e5; margin-bottom: 1.5mm; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5mm; }
        .instruction-item { font-size: 2.2mm; color: #475569; margin-bottom: 1mm; display: flex; gap: 1.5mm; }
        .step-num { background: #4f46e5; color: white; width: 3.5mm; height: 3.5mm; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8mm; flex-shrink: 0; }
        .footer { 
          text-align: center; 
          font-size: 1.6mm; 
          color: #64748b; 
          margin-top: auto; 
          font-weight: 600;
          padding-top: 1mm;
        }
      `}</style>
      
      <div className="kartu-container">
        {siswa.map((s, index) => (
          <div key={index} className="kartu">
            {/* Left Column: Student Data */}
            <div className="left-col">
              <div className="header">
                <ShieldCheck size={16} className="text-white" />
                <div>
                  <div className="title">KARTU TABUNGAN</div>
                  <div className="subtitle">SIMPIRA MENABUNG</div>
                </div>
              </div>
              
              <div className="data-grid">
                <div className="field"><span className="label">NO REK</span> : <span className="value">{s.rekening}</span></div>
                <div className="field"><span className="label">NAMA</span> : <span className="value">{s.nama}</span></div>
                <div className="field"><span className="label">KELAS</span> : <span className="value">{s.kelas}</span></div>
                <div className="field"><span className="label">STATUS</span> : <span className="value">{s.status}</span></div>
                <div className="field"><span className="label">SEKOLAH</span> : <span className="value">SD NEGERI 2 LAOT TADU</span></div>
              </div>
              
              <div className="login-box">
                <div className="login-title" style={{ color: '#059669', borderColor: '#d1fae5' }}>Akses Login</div>
                <div className="field"><span className="label">USER</span> : <span className="value">{s.username}</span></div>
                <div className="field"><span className="label">PASS</span> : <span className="value">{s.password}</span></div>
              </div>
              
              <div className="footer">
                SIMPIRA MENABUNG © 2026
              </div>
            </div>

            {/* Right Column: Login Instructions */}
            <div className="right-col">
              <div className="login-title">Petunjuk Login Aplikasi</div>
              
              <div className="space-y-2">
                <div className="instruction-item">
                  <div className="step-num">1</div>
                  <div>Buka browser di HP/Laptop dan akses alamat URL <b>simpira.my.id</b></div>
                </div>
                <div className="instruction-item">
                  <div className="step-num">2</div>
                  <div>Pilih menu <b>"Login Nasabah"</b> pada halaman utama.</div>
                </div>
                <div className="instruction-item">
                  <div className="step-num">3</div>
                  <div>Masukkan <b>Username</b> dan <b>Password</b> yang tertera di kartu ini.</div>
                </div>
                <div className="instruction-item">
                  <div className="step-num">4</div>
                  <div>Klik tombol <b>"Masuk"</b> untuk melihat saldo dan riwayat tabungan Anda.</div>
                </div>
                <div className="instruction-item">
                  <div className="step-num">5</div>
                  <div>Simpan kartu ini dengan baik dan jangan berikan password kepada orang lain.</div>
                </div>
              </div>

              <div className="mt-auto p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                <p className="text-[1.8mm] text-indigo-700 font-medium leading-tight">
                  Aplikasi ini dapat diinstal di HP (PWA) untuk akses yang lebih cepat dan mudah.
                </p>
              </div>

              <div className="footer" style={{ color: '#4f46e5' }}>
                Layanan Mandiri Nasabah v3.2.3
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
