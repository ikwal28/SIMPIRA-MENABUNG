// @ts-ignore
const GAS_URL = import.meta.env.VITE_GAS_API_URL;

export const apiCall = async (data: any) => {
  if (!GAS_URL) {
    throw new Error("VITE_GAS_API_URL belum diatur di .env. Silakan deploy Google Apps Script dan masukkan URL-nya.");
  }

  if (!GAS_URL.startsWith("https://script.google.com/")) {
    throw new Error("URL Google Apps Script tidak valid. Pastikan URL dimulai dengan 'https://script.google.com/macros/s/...'");
  }

  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error("Non-JSON API Response:", responseText);
      if (responseText.includes("API Simpir") || responseText.includes("Google Apps Script")) {
        throw new Error("Sistem mendeteksi respon teks dari Google Apps Script. Pastikan Anda telah melakukan Deploy ulang sebagai 'Versi Baru' dan memilih 'Akses: Siapa Saja (Anyone)'.");
      }
      throw new Error("Respon dari server tidak valid (Bukan JSON). Silakan periksa konfigurasi Google Apps Script Anda.");
    }

    if (result.status === 'error') {
      const msg = result.message || "";
      const maskedUrl = GAS_URL ? `${GAS_URL.substring(0, 35)}...${GAS_URL.substring(GAS_URL.length - 10)}` : "URL Kosong";
      
      if (msg.toLowerCase().includes("action") && msg.toLowerCase().includes("not found")) {
        throw new Error(`Sistem mendeteksi API lama (Error: ${msg}).\n\nURL Aktif: ${maskedUrl}\n\nSOLUSI: Di Google Apps Script, Anda WAJIB klik 'Deploy' > 'New Deployment' (Deployment Baru) dan salin URL yang baru muncul ke Settings aplikasi ini.`);
      }
      throw new Error(result.message);
    }
    return result;
  } catch (error: any) {
    console.error("API Error:", error);
    
    // Handle specific fetch errors
    if (error.name === 'TypeError' && (error.message === 'Failed to fetch' || error.message.includes('NetworkError'))) {
      throw new Error("Gagal terhubung ke server (Failed to fetch). Pastikan URL Google Apps Script benar, sudah di-deploy sebagai 'Anyone', dan koneksi internet Anda stabil.");
    }
    
    throw error;
  }
};
