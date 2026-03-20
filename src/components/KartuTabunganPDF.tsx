import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const KartuTabunganPDF = ({ siswa }: { siswa: any[] }) => {
  return (
    <div className="p-8 bg-white">
      <style>{`
        @media print {
          .page-break { page-break-after: always; }
          @page { size: A4; margin: 10mm; }
        }
        .kartu {
          width: 85.6mm;
          height: 53.98mm;
          border-radius: 5mm;
          position: relative;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin-bottom: 5mm;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .card-content {
          padding: 4mm;
          color: white;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .header { display: flex; align-items: center; gap: 2mm; margin-bottom: 2mm; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 1mm; }
        .title { font-size: 3mm; font-weight: 500; letter-spacing: 0.5px; }
        .subtitle { font-size: 4mm; font-weight: 800; color: #fbbf24; letter-spacing: 0.2px; }
        .field { font-size: 2.8mm; margin-bottom: 0.5mm; display: flex; }
        .label { font-weight: 600; width: 28mm; color: #e2e8f0; }
        .login-box { 
          background: rgba(255,255,255,0.15); 
          padding: 2mm; 
          border-radius: 2mm; 
          margin-top: auto; 
          border: 1px solid rgba(255,255,255,0.2);
        }
        .footer { text-align: center; font-size: 1.8mm; opacity: 0.7; margin-top: 1mm; }
      `}</style>
      
      <div className="grid grid-cols-2 gap-4">
        {siswa.map((s, index) => (
          <div key={index} className="kartu">
            <div className="card-content">
              <div className="header">
                <ShieldCheck size={18} className="text-yellow-400" />
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
                <div className="field" style={{fontSize: '2.5mm', fontWeight: 'bold', color: '#fbbf24', marginBottom: '1mm'}}>INFORMASI LOGIN</div>
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
