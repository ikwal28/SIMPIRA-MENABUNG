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
          border-radius: 4mm;
          position: relative;
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
          background-color: #ecfdf5; /* Light Green */
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          page-break-inside: avoid;
        }
        .kartu::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: 
            radial-gradient(circle at 100% 0%, #34d399 0%, transparent 50%),
            radial-gradient(circle at 0% 100%, #3b82f6 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, #facc15 0%, transparent 30%);
          opacity: 0.15;
          z-index: 0;
        }
        .kartu::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 12mm;
          background: linear-gradient(90deg, #3b82f6 0%, #34d399 100%);
          z-index: 0;
        }
        .card-content {
          position: relative;
          z-index: 1;
          padding: 4mm;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .header { display: flex; align-items: center; gap: 2mm; margin-bottom: 3mm; color: white; }
        .title { font-size: 2.2mm; font-weight: 500; opacity: 0.9; }
        .subtitle { font-size: 3.5mm; font-weight: 700; letter-spacing: -0.2px; }
        .data-grid { display: grid; grid-template-columns: 1fr; gap: 1mm; margin-bottom: 2mm; }
        .field { font-size: 2.6mm; display: flex; align-items: baseline; }
        .label { font-weight: 600; width: 20mm; color: #475569; font-size: 2.2mm; text-transform: uppercase; }
        .value { font-weight: 600; color: #1e293b; }
        .login-box { 
          background: rgba(255, 255, 255, 0.6); 
          padding: 2mm; 
          border-radius: 2mm; 
          margin-top: auto; 
          border: 1px solid #d1fae5;
        }
        .login-title { font-size: 2mm; font-weight: 700; color: #3b82f6; margin-bottom: 1mm; text-transform: uppercase; }
        .footer { 
          text-align: center; 
          font-size: 1.6mm; 
          color: #065f46; 
          margin-top: 1.5mm; 
          font-weight: 600;
          border-top: 1px solid rgba(6, 95, 70, 0.2);
          padding-top: 1mm;
        }
      `}</style>
      
      <div className="kartu-container">
        {siswa.map((s, index) => (
          <div key={index} className="kartu">
            <div className="card-content">
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
                <div className="login-title">Informasi Login</div>
                <div className="field"><span className="label">USER</span> : <span className="value">{s.username}</span></div>
                <div className="field"><span className="label">PASS</span> : <span className="value">{s.password}</span></div>
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
