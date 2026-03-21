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
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8mm;
          width: 100%;
        }
        .kartu {
          width: 85.6mm;
          height: 53.98mm;
          border-radius: 3mm;
          position: relative;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          background-image: url('https://picsum.photos/seed/school/856/540?blur=5');
          background-size: cover;
          background-position: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          page-break-inside: avoid;
        }
        .kartu::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(135deg, rgba(96, 165, 250, 0.85) 0%, rgba(52, 211, 153, 0.85) 100%);
          z-index: 0;
        }
        .card-content {
          position: relative;
          z-index: 1;
          padding: 4mm;
          color: white;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .header { display: flex; align-items: center; gap: 2mm; margin-bottom: 2mm; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 1mm; }
        .title { font-size: 2.8mm; font-weight: 500; letter-spacing: 0.3px; }
        .subtitle { font-size: 4mm; font-weight: 800; color: #fbbf24; letter-spacing: 0.2px; }
        .field { font-size: 2.8mm; margin-bottom: 0.5mm; display: flex; }
        .label { font-weight: 600; width: 22mm; color: #e2e8f0; }
        .login-box { 
          background: rgba(255,255,255,0.15); 
          padding: 2mm; 
          border-radius: 1.5mm; 
          margin-top: auto; 
          border: 1px solid rgba(255,255,255,0.2);
        }
        .footer { text-align: center; font-size: 1.8mm; opacity: 0.8; margin-top: 1mm; }
      `}</style>
      
      <div className="kartu-container">
        {siswa.map((s, index) => (
          <div key={index} className="kartu">
            <div className="card-content">
              <div className="header">
                <ShieldCheck size={16} className="text-yellow-400" />
                <div>
                  <div className="title">KARTU TABUNGAN</div>
                  <div className="subtitle">SIMPIRA MENABUNG</div>
                </div>
              </div>
              
              <div className="field"><span className="label">NO REK</span> : {s.rekening}</div>
              <div className="field"><span className="label">NAMA</span> : {s.nama}</div>
              <div className="field"><span className="label">KELAS</span> : {s.kelas}</div>
              <div className="field"><span className="label">STATUS</span> : {s.status}</div>
              <div className="field"><span className="label">SEKOLAH</span> : SD NEGERI 2 LAOT TADU</div>
              
              <div className="login-box">
                <div className="field" style={{fontSize: '2.5mm', fontWeight: 'bold', color: '#fbbf24', marginBottom: '0.5mm'}}>INFORMASI LOGIN</div>
                <div className="field"><span className="label">USER</span> : {s.username}</div>
                <div className="field"><span className="label">PASS</span> : {s.password}</div>
              </div>
              
              <div className="footer">
                SIMPIRA MENABUNG © 2026 IKWAL PRESETIAWAN
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
