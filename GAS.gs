/**
 * GOOGLE APPS SCRIPT - SIMPIRA MENABUNG (PRO VERSION)
 * 
 * CARA DEPLOY:
 * 1. Buka Google Spreadsheet baru
 * 2. Klik Ekstensi > Apps Script
 * 3. Hapus semua kode bawaan, paste kode ini
 * 4. Klik Simpan (ikon disket)
 * 5. Pilih fungsi `setup` di dropdown atas, lalu klik Jalankan (Run)
 *    - Beri izin akses (Review Permissions -> Advanced -> Go to script)
 * 6. Klik tombol "Terapkan" (Deploy) > "Deployment baru" (New deployment)
 * 7. Pilih jenis: "Aplikasi Web" (Web app)
 * 8. Setelan:
 *    - Deskripsi: API Simpira
 *    - Jalankan sebagai: Saya (Me)
 *    - Siapa yang memiliki akses: Siapa saja (Anyone)
 * 9. Klik Terapkan (Deploy)
 * 10. Copy "URL Aplikasi Web" dan masukkan ke file .env di project React Anda:
 *     VITE_GAS_API_URL="URL_YANG_DICOPY"
 */

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Admin Sheet
  let adminSheet = ss.getSheetByName("Admin");
  if (!adminSheet) {
    adminSheet = ss.insertSheet("Admin");
    adminSheet.appendRow(["Role", "Nama", "Username", "Password"]);
    adminSheet.appendRow(["admin", "Administrator", "admin", "123"]);
    adminSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#d9ead3");
  }
  
  // Siswa Sheet
  let siswaSheet = ss.getSheetByName("Siswa");
  if (!siswaSheet) {
    siswaSheet = ss.insertSheet("Siswa");
    siswaSheet.appendRow(["Rekening", "Nama", "Kelas", "Saldo", "Username", "Password", "Status"]);
    siswaSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#c9daf8");
    
    // Dummy Data Siswa
    siswaSheet.appendRow(["1001", "Ahmad Budi", "1A", 150000, "ahmad", "123", "AKTIF"]);
    siswaSheet.appendRow(["1002", "Siti Aminah", "2B", 200000, "siti", "123", "AKTIF"]);
  } else {
    // Paksa pastikan kolom G (kolom ke-7) adalah "Status"
    const statusHeader = siswaSheet.getRange("G1").getValue();
    if (safeString(statusHeader).toLowerCase() !== "status") {
      siswaSheet.getRange("G1").setValue("Status").setFontWeight("bold").setBackground("#c9daf8");
      
      // Set default value 'AKTIF' untuk baris yang sudah ada
      const lastRow = siswaSheet.getLastRow();
      if (lastRow > 1) {
        const defaultStatus = Array(lastRow - 1).fill(["AKTIF"]);
        siswaSheet.getRange(2, 7, lastRow - 1, 1).setValues(defaultStatus);
      }
    }
  }
  
  // Transaksi Sheet
  let trxSheet = ss.getSheetByName("Transaksi");
  if (!trxSheet) {
    trxSheet = ss.insertSheet("Transaksi");
    trxSheet.appendRow(["ID_TRX", "Rekening", "Nama", "Kelas", "Jenis", "Jumlah", "Keterangan", "Tanggal", "Petugas"]);
    trxSheet.getRange("A1:I1").setFontWeight("bold").setBackground("#fff2cc");
  } else {
    // Otomatis tambahkan kolom Petugas jika belum ada
    const headers = trxSheet.getRange(1, 1, 1, Math.max(trxSheet.getLastColumn(), 1)).getValues()[0];
    const headerStrings = headers.map(h => safeString(h));
    if (!headerStrings.includes("Petugas")) {
      trxSheet.getRange(1, headers.length + 1).setValue("Petugas").setFontWeight("bold").setBackground("#fff2cc");
    }
  }
}

// Helper untuk menghindari error .toString() pada nilai null/undefined
function safeString(val) {
  return val === null || val === undefined ? "" : val.toString().trim();
}

function doPost(e) {
  try {
    setup();

    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    let result = {};

    if (action === "login") {
      result = login(data.username, data.password, data.role);
    } else if (action === "loginV2") {
      result = loginV2(data.username, data.password);
    } else if (action === "getSiswa") {
      result = getSiswa();
    } else if (action === "getSiswaByUser") {
      result = getSiswaByUser(data.username);
    } else if (action === "transaksi") {
      result = prosesTransaksi(data.payload);
    } else if (action === "deleteTransaksi") {
      result = deleteTransaksi(data.idTrx);
    } else if (action === "getTransaksi") {
      result = getTransaksi(data.rekening, data.tanggal, data.limit);
    } else if (action === "addSiswa" || action === "addSiswaV2") {
      result = addSiswa(data.payload);
    } else if (action === "updateSiswa" || action === "updateSiswaV2") {
      result = updateSiswa(data.rekening, data.payload);
    } else if (action === "deleteSiswa") {
      result = deleteSiswa(data.rekening);
    } else {
      result = { status: "error", message: "Action '" + action + "' not found." };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Server Error: " + error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("API Simpira Menabung Berjalan Normal")
    .setMimeType(ContentService.MimeType.TEXT);
}

// --- HELPER FUNCTIONS ---

function getSheetData(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  return rows.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      if (header) {
        obj[safeString(header).toLowerCase().trim()] = row[index];
      }
    });
    return obj;
  });
}

function login(username, password, role) {
  const sheetName = role === 'admin' ? 'Admin' : 'Siswa';
  const users = getSheetData(sheetName);
  
  const u = safeString(username);
  const p = safeString(password);
  
  const user = users.find(userObj => safeString(userObj.username) === u && safeString(userObj.password) === p);
  if (user) {
    return { status: "success", role: role, data: user };
  }
  return { status: "error", message: "Username atau password salah" };
}

function loginV2(username, password) {
  const u = safeString(username);
  const p = safeString(password);
  
  // Check Admin first
  const admins = getSheetData('Admin');
  const admin = admins.find(a => safeString(a.username) === u && safeString(a.password) === p);
  if (admin) {
    return { status: "success", role: "admin", data: admin };
  }

  // Check Siswa
  const siswas = getSheetData('Siswa');
  const siswa = siswas.find(s => safeString(s.username) === u && safeString(s.password) === p);
  if (siswa) {
    return { status: "success", role: "siswa", data: siswa };
  }

  return { status: "error", message: "Username atau password salah" };
}

function getSiswa() {
  return { status: "success", data: getSheetData("Siswa") };
}

function getSiswaByUser(username) {
  const u = safeString(username);
  const siswa = getSheetData("Siswa").find(s => safeString(s.username) === u);
  if (siswa) return { status: "success", data: siswa };
  return { status: "error", message: "Siswa tidak ditemukan" };
}

function prosesTransaksi(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const siswaSheet = ss.getSheetByName("Siswa");
  const trxSheet = ss.getSheetByName("Transaksi");
  
  const siswaData = siswaSheet.getDataRange().getValues();
  const headers = siswaData[0];
  
  const getIdx = (name) => headers.findIndex(h => safeString(h).toLowerCase().trim() === name.toLowerCase());
  const rekIndex = getIdx("Rekening");
  const saldoIndex = getIdx("Saldo");
  const namaIndex = getIdx("Nama");
  const kelasIndex = getIdx("Kelas");
  
  if (rekIndex === -1 || saldoIndex === -1) {
    return { status: "error", message: "Struktur kolom Siswa tidak valid" };
  }
  
  let rowIndex = -1;
  let currentSaldo = 0;
  let nama = "";
  let kelas = "";
  
  const targetRek = safeString(payload.rekening);
  
  for (let i = 1; i < siswaData.length; i++) {
    if (safeString(siswaData[i][rekIndex]) === targetRek) {
      rowIndex = i + 1;
      currentSaldo = parseFloat(siswaData[i][saldoIndex]) || 0;
      nama = siswaData[i][namaIndex];
      kelas = siswaData[i][kelasIndex];
      break;
    }
  }
  
  if (rowIndex === -1) {
    return { status: "error", message: "Rekening tidak ditemukan" };
  }
  
  const jumlah = parseFloat(payload.jumlah);
  if (payload.jenis === "Tarik" && currentSaldo < jumlah) {
    return { status: "error", message: "Saldo tidak mencukupi" };
  }
  
  const newSaldo = payload.jenis === "Setor" ? currentSaldo + jumlah : currentSaldo - jumlah;
  
  // Update saldo
  siswaSheet.getRange(rowIndex, saldoIndex + 1).setValue(newSaldo);
  
  // Insert Transaksi
  const idTrx = "TRX-" + targetRek + "-" + new Date().getTime();
  const tanggal = payload.tanggal ? payload.tanggal : new Date().toISOString();
  const petugas = payload.petugas || "Admin";
  
  trxSheet.appendRow([
    idTrx,
    targetRek,
    nama,
    kelas,
    payload.jenis,
    jumlah,
    payload.keterangan || "",
    tanggal,
    petugas
  ]);
  
  return { status: "success", message: "Transaksi berhasil", newSaldo: newSaldo };
}

function deleteTransaksi(idTrx) {
  if (!idTrx) return { status: "error", message: "ID Transaksi tidak disertakan" };
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const siswaSheet = ss.getSheetByName("Siswa");
  const trxSheet = ss.getSheetByName("Transaksi");
  
  const trxData = trxSheet.getDataRange().getValues();
  const trxHeaders = trxData[0];
  const getTrxIdx = (name) => trxHeaders.findIndex(h => safeString(h).toLowerCase().trim() === name.toLowerCase());
  
  const idTrxIdx = getTrxIdx("ID_TRX");
  const rekTrxIdx = getTrxIdx("Rekening");
  const jenisTrxIdx = getTrxIdx("Jenis");
  const jumlahTrxIdx = getTrxIdx("Jumlah");
  
  if (idTrxIdx === -1) return { status: "error", message: "Kolom ID_TRX tidak ditemukan" };
  
  let trxRowIndex = -1;
  let trxInfo = null;
  
  const targetId = safeString(idTrx);
  
  for (let i = 1; i < trxData.length; i++) {
    if (safeString(trxData[i][idTrxIdx]) === targetId) {
      trxRowIndex = i + 1;
      trxInfo = { 
        rekening: trxData[i][rekTrxIdx], 
        jenis: safeString(trxData[i][jenisTrxIdx]), 
        jumlah: parseFloat(trxData[i][jumlahTrxIdx]) || 0 
      };
      break;
    }
  }
  
  if (trxRowIndex === -1) return { status: "error", message: "Transaksi tidak ditemukan" };
  
  const siswaData = siswaSheet.getDataRange().getValues();
  const siswaHeaders = siswaData[0];
  const getSiswaIdx = (name) => siswaHeaders.findIndex(h => safeString(h).toLowerCase().trim() === name.toLowerCase());
  
  const rekSiswaIdx = getSiswaIdx("Rekening");
  const saldoSiswaIdx = getSiswaIdx("Saldo");
  
  if (rekSiswaIdx === -1 || saldoSiswaIdx === -1) return { status: "error", message: "Struktur kolom Siswa tidak valid" };
  
  let siswaRowIndex = -1;
  let currentSaldo = 0;
  
  const targetRek = safeString(trxInfo.rekening);
  
  for (let i = 1; i < siswaData.length; i++) {
    if (safeString(siswaData[i][rekSiswaIdx]) === targetRek) {
      siswaRowIndex = i + 1;
      currentSaldo = parseFloat(siswaData[i][saldoSiswaIdx]) || 0;
      break;
    }
  }
  
  if (siswaRowIndex === -1) return { status: "error", message: "Nasabah tidak ditemukan" };
  
  // Logika perbandingan yang lebih aman
  const isSetor = trxInfo.jenis.toLowerCase().includes("setor");
  const newSaldo = isSetor ? currentSaldo - trxInfo.jumlah : currentSaldo + trxInfo.jumlah;
  
  siswaSheet.getRange(siswaRowIndex, saldoSiswaIdx + 1).setValue(newSaldo);
  
  trxSheet.deleteRow(trxRowIndex);
  return { status: "success", message: "Transaksi berhasil dihapus dan saldo diperbarui" };
}

function getTransaksi(rekening, tanggal, limit) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Transaksi");
  if (!sheet) return { status: "success", data: [] };
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { status: "success", data: [] };
  
  const maxResults = limit ? parseInt(limit) : 500; // Default limit to 500 for performance
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  let trx = rows.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      if (header) obj[safeString(header).toLowerCase().trim()] = row[index];
    });
    return obj;
  });

  if (rekening) {
    const r = safeString(rekening);
    trx = trx.filter(t => safeString(t.rekening) === r);
  }
  if (tanggal) {
    const d = safeString(tanggal);
    trx = trx.filter(t => safeString(t.tanggal).startsWith(d));
  }
  
  // Sort descending by date (newest first)
  trx.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  
  // Apply limit
  if (trx.length > maxResults) {
    trx = trx.slice(0, maxResults);
  }
  
  return { status: "success", data: trx };
}

function addSiswa(payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Siswa");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const getIdx = (name) => headers.findIndex(h => safeString(h).toLowerCase().trim() === name.toLowerCase());
  const rekIndex = getIdx("Rekening");
  
  const targetRek = safeString(payload.rekening);
  
  for (let i = 1; i < data.length; i++) {
    if (safeString(data[i][rekIndex]) === targetRek) {
      return { status: "error", message: "Rekening sudah terdaftar" };
    }
  }
  
  // Pastikan array minimal memiliki 7 elemen (A-G)
  const newRow = new Array(Math.max(headers.length, 7)).fill("");
  if (getIdx("Rekening") !== -1) newRow[getIdx("Rekening")] = targetRek;
  if (getIdx("Nama") !== -1) newRow[getIdx("Nama")] = payload.nama;
  if (getIdx("Kelas") !== -1) newRow[getIdx("Kelas")] = payload.kelas;
  if (getIdx("Saldo") !== -1) newRow[getIdx("Saldo")] = 0;
  if (getIdx("Username") !== -1) newRow[getIdx("Username")] = payload.username;
  if (getIdx("Password") !== -1) newRow[getIdx("Password")] = payload.password;
  
  const statusIdx = getIdx("Status") !== -1 ? getIdx("Status") : 6; // 6 adalah index array untuk kolom G
  newRow[statusIdx] = payload.status || "AKTIF";
  
  sheet.appendRow(newRow);
  
  return { status: "success", message: "Siswa berhasil ditambahkan" };
}

function updateSiswa(rekening, payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Siswa");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const getIdx = (name) => headers.findIndex(h => safeString(h).toLowerCase().trim() === name.toLowerCase());
  const rekIndex = getIdx("Rekening");
  
  let rowIndex = -1;
  const targetRek = safeString(rekening);
  for (let i = 1; i < data.length; i++) {
    if (safeString(data[i][rekIndex]) === targetRek) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex === -1) return { status: "error", message: "Siswa tidak ditemukan" };
  
  if (payload.nama && getIdx("Nama") !== -1) sheet.getRange(rowIndex, getIdx("Nama") + 1).setValue(payload.nama);
  if (payload.kelas && getIdx("Kelas") !== -1) sheet.getRange(rowIndex, getIdx("Kelas") + 1).setValue(payload.kelas);
  if (payload.username && getIdx("Username") !== -1) sheet.getRange(rowIndex, getIdx("Username") + 1).setValue(payload.username);
  if (payload.password && getIdx("Password") !== -1) sheet.getRange(rowIndex, getIdx("Password") + 1).setValue(payload.password);
  
  const statusCol = getIdx("Status") !== -1 ? getIdx("Status") + 1 : 7; // 7 adalah kolom G
  if (payload.status) sheet.getRange(rowIndex, statusCol).setValue(payload.status);
  
  return { status: "success", message: "Data siswa berhasil diupdate" };
}

function deleteSiswa(rekening) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Siswa");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const getIdx = (name) => headers.findIndex(h => safeString(h).toLowerCase().trim() === name.toLowerCase());
  const rekIndex = getIdx("Rekening");
  
  const targetRek = safeString(rekening);
  for (let i = 1; i < data.length; i++) {
    if (safeString(data[i][rekIndex]) === targetRek) {
      sheet.deleteRow(i + 1);
      return { status: "success", message: "Siswa berhasil dihapus" };
    }
  }
  
  return { status: "error", message: "Siswa tidak ditemukan" };
}
