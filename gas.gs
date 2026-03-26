/**
 * GOOGLE APPS SCRIPT - SIMPIRA MENABUNG (PRO VERSION)
 * Update: Fitur Kenaikan Kelas, Bulk Update, & Audit Log
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
  
  // 1. Admin Sheet
  let adminSheet = ss.getSheetByName("Admin");
  if (!adminSheet) {
    adminSheet = ss.insertSheet("Admin");
    adminSheet.appendRow(["Role", "Nama", "Username", "Password"]);
    adminSheet.appendRow(["admin", "Administrator", "admin", "123"]);
    adminSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#d9ead3");
  }
  
  // 2. Siswa Sheet
  let siswaSheet = ss.getSheetByName("Siswa");
  if (!siswaSheet) {
    siswaSheet = ss.insertSheet("Siswa");
    siswaSheet.appendRow(["Rekening", "Nama", "Kelas", "Saldo", "Username", "Password", "Status"]);
    siswaSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#c9daf8");
    
    // Dummy Data
    siswaSheet.appendRow(["1001", "Ahmad Budi", "1", 150000, "ahmad", "123", "AKTIF"]);
    siswaSheet.appendRow(["1002", "Siti Aminah", "2", 200000, "siti", "123", "AKTIF"]);
  } else {
    // Pastikan kolom G adalah Status
    const statusHeader = siswaSheet.getRange("G1").getValue();
    if (safeString(statusHeader).toLowerCase() !== "status") {
      siswaSheet.getRange("G1").setValue("Status").setFontWeight("bold").setBackground("#c9daf8");
      const lastRow = siswaSheet.getLastRow();
      if (lastRow > 1) {
        const defaultStatus = Array(lastRow - 1).fill(["AKTIF"]);
        siswaSheet.getRange(2, 7, lastRow - 1, 1).setValues(defaultStatus);
      }
    }
  }
  
  // 3. Transaksi Sheet
  let trxSheet = ss.getSheetByName("Transaksi");
  if (!trxSheet) {
    trxSheet = ss.insertSheet("Transaksi");
    trxSheet.appendRow(["ID_TRX", "Rekening", "Nama", "Kelas", "Jenis", "Jumlah", "Keterangan", "Tanggal", "Petugas"]);
    trxSheet.getRange("A1:I1").setFontWeight("bold").setBackground("#fff2cc");
  }

  // 4. Audit Log Sheet
  let auditSheet = ss.getSheetByName("AuditLog");
  if (!auditSheet) {
    auditSheet = ss.insertSheet("AuditLog");
    auditSheet.appendRow(["Timestamp", "Admin", "Action", "Details"]);
    auditSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#ead1dc");
  }
}

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
    } 
    // --- ACTION BARU ---
    else if (action === "bulkUpdateSiswa") {
      result = bulkUpdateSiswa(data.payload);
    } else if (action === "deleteLulusan") {
      result = deleteLulusan();
    } else if (action === "logAudit") {
      result = logAudit(data.payload);
    } else if (action === "getAuditLogs") {
      result = getAuditLogs();
    } else if (action === "ping") {
      result = { status: "success", version: "3.0.0" };
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

// --- CORE FUNCTIONS ---

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
      if (header) obj[safeString(header).toLowerCase().trim()] = row[index];
    });
    return obj;
  });
}

function bulkUpdateSiswa(updates) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Siswa");
  const range = sheet.getDataRange();
  const data = range.getValues();
  const headers = data[0];
  
  const getIdx = (name) => headers.findIndex(h => safeString(h).toLowerCase().trim() === name.toLowerCase());
  const rekIdx = getIdx("Rekening");
  const kelasIdx = getIdx("Kelas");
  const statusIdx = getIdx("Status");

  if (rekIdx === -1 || kelasIdx === -1 || statusIdx === -1) {
    return { status: "error", message: "Struktur kolom Siswa tidak lengkap" };
  }

  const updateMap = new Map();
  updates.forEach(u => updateMap.set(safeString(u.rekening), u));

  let count = 0;
  for (let i = 1; i < data.length; i++) {
    const rek = safeString(data[i][rekIdx]);
    if (updateMap.has(rek)) {
      const u = updateMap.get(rek);
      data[i][kelasIdx] = u.kelas;
      data[i][statusIdx] = u.status;
      count++;
    }
  }

  if (count > 0) {
    range.setValues(data);
  }
  
  return { status: "success", message: "Update massal " + count + " siswa berhasil" };
}

function deleteLulusan() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetSiswa = ss.getSheetByName("Siswa");
  const sheetTrx = ss.getSheetByName("Transaksi");
  
  const dataSiswa = sheetSiswa.getDataRange().getValues();
  const headersSiswa = dataSiswa[0];
  const statusIdx = headersSiswa.findIndex(h => safeString(h).toLowerCase().trim() === "status");
  const rekIdx = headersSiswa.findIndex(h => safeString(h).toLowerCase().trim() === "rekening");

  const reksToDelete = [];
  for (let i = 1; i < dataSiswa.length; i++) {
    if (safeString(dataSiswa[i][statusIdx]) === "LULUS") {
      reksToDelete.push(safeString(dataSiswa[i][rekIdx]));
    }
  }

  if (reksToDelete.length === 0) {
    return { status: "success", message: "Tidak ada data lulusan untuk dibersihkan" };
  }

  // Delete transactions
  const dataTrx = sheetTrx.getDataRange().getValues();
  for (let j = dataTrx.length - 1; j >= 1; j--) {
    if (reksToDelete.includes(safeString(dataTrx[j][1]))) {
      sheetTrx.deleteRow(j + 1);
    }
  }

  // Delete students
  for (let i = dataSiswa.length - 1; i >= 1; i--) {
    if (safeString(dataSiswa[i][statusIdx]) === "LULUS") {
      sheetSiswa.deleteRow(i + 1);
    }
  }

  return { status: "success", message: "Data lulusan (" + reksToDelete.length + " siswa) dibersihkan" };
}

function logAudit(payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("AuditLog");
  sheet.appendRow([
    payload.timestamp || new Date().toISOString(),
    payload.admin || "Admin",
    payload.action,
    payload.details
  ]);
  return { status: "success" };
}

function getAuditLogs() {
  return { status: "success", data: getSheetData("AuditLog").reverse().slice(0, 200) };
}

function login(username, password, role) {
  const sheetName = role === 'admin' ? 'Admin' : 'Siswa';
  const users = getSheetData(sheetName);
  const u = safeString(username);
  const p = safeString(password);
  const user = users.find(userObj => safeString(userObj.username) === u && safeString(userObj.password) === p);
  if (user) return { status: "success", role: role, data: user };
  return { status: "error", message: "Username atau password salah" };
}

function loginV2(username, password) {
  const u = safeString(username);
  const p = safeString(password);
  const admins = getSheetData('Admin');
  const admin = admins.find(a => safeString(a.username) === u && safeString(a.password) === p);
  if (admin) return { status: "success", role: "admin", data: admin };
  const siswas = getSheetData('Siswa');
  const siswa = siswas.find(s => safeString(s.username) === u && safeString(s.password) === p);
  if (siswa) return { status: "success", role: "siswa", data: siswa };
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
  const statusIndex = getIdx("Status");
  
  let rowIndex = -1;
  let currentSaldo = 0;
  const targetRek = safeString(payload.rekening);
  
  for (let i = 1; i < siswaData.length; i++) {
    if (safeString(siswaData[i][rekIndex]) === targetRek) {
      if (safeString(siswaData[i][statusIndex]) === "LULUS") return { status: "error", message: "Nasabah sudah LULUS" };
      rowIndex = i + 1;
      currentSaldo = parseFloat(siswaData[i][saldoIndex]) || 0;
      break;
    }
  }
  
  if (rowIndex === -1) return { status: "error", message: "Rekening tidak ditemukan" };
  const jumlah = parseFloat(payload.jumlah);
  if (payload.jenis === "Tarik" && currentSaldo < jumlah) return { status: "error", message: "Saldo tidak mencukupi" };
  const newSaldo = payload.jenis === "Setor" ? currentSaldo + jumlah : currentSaldo - jumlah;
  siswaSheet.getRange(rowIndex, saldoIndex + 1).setValue(newSaldo);
  
  trxSheet.appendRow([
    "TRX-" + targetRek + "-" + new Date().getTime(),
    targetRek,
    siswaData[rowIndex-1][namaIndex],
    siswaData[rowIndex-1][kelasIndex],
    payload.jenis,
    jumlah,
    payload.keterangan || "",
    payload.tanggal || new Date().toISOString(),
    payload.petugas || "Admin"
  ]);
  return { status: "success", message: "Transaksi berhasil", newSaldo: newSaldo };
}

function deleteTransaksi(idTrx) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const siswaSheet = ss.getSheetByName("Siswa");
  const trxSheet = ss.getSheetByName("Transaksi");
  const trxData = trxSheet.getDataRange().getValues();
  const trxHeaders = trxData[0];
  const idTrxIdx = trxHeaders.findIndex(h => safeString(h).toLowerCase().trim() === "id_trx");
  
  let trxRow = -1;
  for (let i = 1; i < trxData.length; i++) {
    if (safeString(trxData[i][idTrxIdx]) === safeString(idTrx)) {
      trxRow = i + 1;
      const rek = safeString(trxData[i][1]);
      const jenis = safeString(trxData[i][4]);
      const jumlah = parseFloat(trxData[i][5]);
      
      const siswaData = siswaSheet.getDataRange().getValues();
      const rekIdx = siswaData[0].findIndex(h => safeString(h).toLowerCase().trim() === "rekening");
      const saldoIdx = siswaData[0].findIndex(h => safeString(h).toLowerCase().trim() === "saldo");
      
      for (let j = 1; j < siswaData.length; j++) {
        if (safeString(siswaData[j][rekIdx]) === rek) {
          const curSaldo = parseFloat(siswaData[j][saldoIdx]);
          const newSaldo = jenis.toLowerCase().includes("setor") ? curSaldo - jumlah : curSaldo + jumlah;
          siswaSheet.getRange(j + 1, saldoIdx + 1).setValue(newSaldo);
          break;
        }
      }
      trxSheet.deleteRow(trxRow);
      return { status: "success", message: "Transaksi dihapus" };
    }
  }
  return { status: "error", message: "Transaksi tidak ditemukan" };
}

function getTransaksi(rekening, tanggal, limit) {
  const trx = getSheetData("Transaksi");
  let filtered = trx;
  if (rekening) filtered = filtered.filter(t => safeString(t.rekening) === safeString(rekening));
  if (tanggal) filtered = filtered.filter(t => safeString(t.tanggal).startsWith(safeString(tanggal)));
  filtered.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  return { status: "success", data: filtered.slice(0, limit || 500) };
}

function addSiswa(payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Siswa");
  const data = sheet.getDataRange().getValues();
  const rekIdx = data[0].findIndex(h => safeString(h).toLowerCase().trim() === "rekening");
  if (data.some(row => safeString(row[rekIdx]) === safeString(payload.rekening))) return { status: "error", message: "Rekening terdaftar" };
  
  const headers = data[0];
  const newRow = new Array(headers.length).fill("");
  const setVal = (name, val) => {
    const idx = headers.findIndex(h => safeString(h).toLowerCase().trim() === name.toLowerCase());
    if (idx !== -1) newRow[idx] = val;
  };
  setVal("Rekening", payload.rekening);
  setVal("Nama", payload.nama);
  setVal("Kelas", payload.kelas);
  setVal("Saldo", 0);
  setVal("Username", payload.username);
  setVal("Password", payload.password);
  setVal("Status", payload.status || "AKTIF");
  sheet.appendRow(newRow);
  return { status: "success", message: "Siswa ditambahkan" };
}

function updateSiswa(rekening, payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Siswa");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rekIdx = headers.findIndex(h => safeString(h).toLowerCase().trim() === "rekening");
  for (let i = 1; i < data.length; i++) {
    if (safeString(data[i][rekIdx]) === safeString(rekening)) {
      const setVal = (name, val) => {
        const idx = headers.findIndex(h => safeString(h).toLowerCase().trim() === name.toLowerCase());
        if (idx !== -1 && val !== undefined) sheet.getRange(i + 1, idx + 1).setValue(val);
      };
      setVal("Nama", payload.nama);
      setVal("Kelas", payload.kelas);
      setVal("Username", payload.username);
      setVal("Password", payload.password);
      setVal("Status", payload.status);
      return { status: "success", message: "Data diupdate" };
    }
  }
  return { status: "error", message: "Siswa tidak ditemukan" };
}

function deleteSiswa(rekening) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Siswa");
  const data = sheet.getDataRange().getValues();
  const rekIdx = data[0].findIndex(h => safeString(h).toLowerCase().trim() === "rekening");
  for (let i = 1; i < data.length; i++) {
    if (safeString(data[i][rekIdx]) === safeString(rekening)) {
      sheet.deleteRow(i + 1);
      return { status: "success", message: "Siswa dihapus" };
    }
  }
  return { status: "error", message: "Siswa tidak ditemukan" };
}
