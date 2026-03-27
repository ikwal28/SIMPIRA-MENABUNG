/**
 * GOOGLE APPS SCRIPT - SIMPIRA MENABUNG (PRO VERSION)
 * Update: Fitur Kenaikan Kelas, Bulk Update, & Audit Log
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
  }
  
  // 3. Transaksi Sheet
  let transSheet = ss.getSheetByName("Transaksi");
  if (!transSheet) {
    transSheet = ss.insertSheet("Transaksi");
    transSheet.appendRow(["ID_TRX", "Tanggal", "Rekening", "Nama", "Kelas", "Jenis", "Jumlah", "Keterangan", "Petugas"]);
    transSheet.getRange("A1:I1").setFontWeight("bold").setBackground("#fff2cc");
  }
  
  // 4. Audit Log Sheet
  let auditSheet = ss.getSheetByName("AuditLog");
  if (!auditSheet) {
    auditSheet = ss.insertSheet("AuditLog");
    auditSheet.appendRow(["Tanggal", "Admin", "Aksi", "Detail"]);
    auditSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#ead1dc");
  }
}

function doPost(e) {
  try {
    setup(); // Ensure sheets exist
    const requestData = JSON.parse(e.postData.contents);
    const data = requestData.payload || requestData;
    const action = requestData.action || data.action;
    let result = {};

    if (action === "ping") {
      result = { status: "success", version: "3.2.0", message: "API Simpira Aktif" };
    } else if (action === "loginV2") {
      result = loginV2(data.username, data.password);
    } else if (action === "getSiswa") {
      result = { status: "success", data: getSheetData("Siswa") };
    } else if (action === "getSiswaByUser") {
      result = getSiswaByUser(data.username);
    } else if (action === "getTransaksi") {
      result = { status: "success", data: getSheetData("Transaksi") };
    } else if (action === "getAuditLogs") {
      result = { status: "success", data: getSheetData("AuditLog") };
    } else if (action === "addSiswaV2") {
      result = addSiswaV2(data.siswa || data);
    } else if (action === "updateSiswaV2") {
      result = updateSiswaV2(data.rekening, data.siswa || data);
    } else if (action === "deleteSiswa") {
      result = deleteSiswa(data.rekening);
    } else if (action === "bulkUpdateSiswa") {
      result = bulkUpdateSiswa(data.updates);
    } else if (action === "deleteLulusan") {
      result = deleteLulusan();
    } else if (action === "transaksi") {
      result = transaksi(data.trans || data);
    } else if (action === "deleteTransaksi") {
      result = deleteTransaksi(data.id);
    } else if (action === "logAudit") {
      result = logAudit(data.admin, data.aksi, data.detail);
    } else {
      result = { status: "error", message: "Action '" + action + "' not found." };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: "Server Error V3.2: " + error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// --- UTILITIES ---

function safeString(val) {
  if (val === null || val === undefined) return "";
  return String(val).toLowerCase().trim();
}

function getSheetData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      const key = safeString(header);
      obj[key] = row[index];
      
      // Aliases for frontend compatibility
      if (key === "tipe") obj["jenis"] = row[index];
      if (key === "jenis") obj["tipe"] = row[index];
      if (key === "id") obj["id_trx"] = row[index];
      if (key === "id_trx") obj["id"] = row[index];
      if (key === "admin") obj["petugas"] = row[index];
      if (key === "petugas") obj["admin"] = row[index];
    });
    return obj;
  });
}

// --- CORE FUNCTIONS ---

function loginV2(username, password) {
  const u = safeString(username);
  const p = safeString(password);
  
  // Check Admin
  const admins = getSheetData("Admin");
  const admin = admins.find(a => safeString(a.username) === u && safeString(a.password) === p);
  if (admin) return { status: "success", role: "admin", data: admin };
  
  // Check Siswa
  const siswas = getSheetData("Siswa");
  const siswa = siswas.find(s => safeString(s.username) === u && safeString(s.password) === p);
  if (siswa) {
    if (safeString(siswa.status) === "nonaktif") {
      return { status: "error", message: "Akun Anda dinonaktifkan. Hubungi Admin." };
    }
    return { status: "success", role: "siswa", data: siswa };
  }
  
  return { status: "error", message: "Username atau password salah" };
}

function getSiswaByUser(username) {
  const u = safeString(username);
  const siswas = getSheetData("Siswa");
  const siswa = siswas.find(s => safeString(s.username) === u);
  return { status: "success", data: siswa };
}

function addSiswaV2(siswa) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Siswa");
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const newRow = headers.map(h => {
    const key = safeString(h);
    return siswa[key] !== undefined ? siswa[key] : "";
  });
  
  sheet.appendRow(newRow);
  return { status: "success", message: "Siswa berhasil ditambahkan" };
}

function updateSiswaV2(rekening, updates) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Siswa");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rekIdx = headers.findIndex(h => safeString(h) === "rekening");
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][rekIdx]) === String(rekening)) {
      headers.forEach((h, idx) => {
        const key = safeString(h);
        if (updates[key] !== undefined) {
          sheet.getRange(i + 1, idx + 1).setValue(updates[key]);
        }
      });
      return { status: "success", message: "Data siswa diperbarui" };
    }
  }
  return { status: "error", message: "Siswa tidak ditemukan" };
}

function bulkUpdateSiswa(updates) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Siswa");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rekIdx = headers.findIndex(h => safeString(h) === "rekening");
  const kelasIdx = headers.findIndex(h => safeString(h) === "kelas");
  const statusIdx = headers.findIndex(h => safeString(h) === "status");
  
  let count = 0;
  updates.forEach(upd => {
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][rekIdx]) === String(upd.rekening)) {
        if (upd.kelas !== undefined) sheet.getRange(i + 1, kelasIdx + 1).setValue(upd.kelas);
        if (upd.status !== undefined) sheet.getRange(i + 1, statusIdx + 1).setValue(upd.status);
        count++;
        break;
      }
    }
  });
  
  return { status: "success", message: count + " siswa diperbarui" };
}

function deleteLulusan() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const siswaSheet = ss.getSheetByName("Siswa");
  const transSheet = ss.getSheetByName("Transaksi");
  
  if (!siswaSheet) return { status: "error", message: "Sheet Siswa tidak ditemukan" };
  
  const data = siswaSheet.getDataRange().getValues();
  const headers = data[0];
  const rekIdx = headers.findIndex(h => safeString(h) === "rekening");
  const statusIdx = headers.findIndex(h => safeString(h) === "status");
  
  let count = 0;
  // Iterate backwards to safely delete rows
  for (let i = data.length - 1; i >= 1; i--) {
    if (safeString(data[i][statusIdx]) === "lulus") {
      const rek = String(data[i][rekIdx]);
      
      // 1. Hapus Riwayat Transaksi Siswa Tersebut
      if (transSheet) {
        const transData = transSheet.getDataRange().getValues();
        if (transData.length > 1) {
          const tHeaders = transData[0];
          const tRekIdx = tHeaders.findIndex(h => safeString(h) === "rekening");
          
          for (let j = transData.length - 1; j >= 1; j--) {
            if (String(transData[j][tRekIdx]) === rek) {
              transSheet.deleteRow(j + 1);
            }
          }
        }
      }
      
      // 2. Hapus Data Siswa
      siswaSheet.deleteRow(i + 1);
      count++;
    }
  }
  
  return { status: "success", message: count + " data lulusan dan riwayatnya berhasil dihapus" };
}

function deleteSiswa(rekening) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Siswa");
  const data = sheet.getDataRange().getValues();
  const rekIdx = data[0].findIndex(h => safeString(h) === "rekening");
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][rekIdx]) === String(rekening)) {
      sheet.deleteRow(i + 1);
      return { status: "success", message: "Siswa dihapus" };
    }
  }
  return { status: "error", message: "Siswa tidak ditemukan" };
}

function transaksi(trans) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const siswaSheet = ss.getSheetByName("Siswa");
  const transSheet = ss.getSheetByName("Transaksi");
  
  const sData = siswaSheet.getDataRange().getValues();
  const sHeaders = sData[0];
  const rekIdx = sHeaders.findIndex(h => safeString(h) === "rekening");
  const saldoIdx = sHeaders.findIndex(h => safeString(h) === "saldo");
  const namaIdx = sHeaders.findIndex(h => safeString(h) === "nama");
  const kelasIdx = sHeaders.findIndex(h => safeString(h) === "kelas");
  
  for (let i = 1; i < sData.length; i++) {
    if (String(sData[i][rekIdx]) === String(trans.rekening)) {
      const currentSaldo = Number(sData[i][saldoIdx]) || 0;
      const amount = Number(trans.jumlah);
      let newSaldo = currentSaldo;
      
      const jenis = safeString(trans.jenis || trans.tipe).toUpperCase();
      
      if (jenis === "SETOR" || jenis === "SETORAN") {
        newSaldo += amount;
      } else if (jenis === "TARIK" || jenis === "PENARIKAN") {
        if (currentSaldo < amount) return { status: "error", message: "Saldo tidak mencukupi" };
        newSaldo -= amount;
      } else {
        return { status: "error", message: "Jenis transaksi tidak valid: " + jenis };
      }
      
      // Update Saldo
      siswaSheet.getRange(i + 1, saldoIdx + 1).setValue(newSaldo);
      
      // Record Transaction
      const tHeaders = transSheet.getRange(1, 1, 1, transSheet.getLastColumn()).getValues()[0];
      const newTRow = tHeaders.map(h => {
        const key = safeString(h);
        if (key === "id" || key === "id_trx") return "TRX" + Date.now();
        if (key === "tanggal") return new Date();
        if (key === "nama" && !trans.nama) return sData[i][namaIdx];
        if (key === "kelas") return sData[i][kelasIdx];
        if (key === "jenis" || key === "tipe") return trans.jenis || trans.tipe;
        if (key === "admin" || key === "petugas") return trans.petugas || trans.admin;
        return trans[key] !== undefined ? trans[key] : "";
      });
      transSheet.appendRow(newTRow);
      
      return { status: "success", message: "Transaksi berhasil", newSaldo: newSaldo };
    }
  }
  return { status: "error", message: "Rekening tidak ditemukan" };
}

function deleteTransaksi(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const transSheet = ss.getSheetByName("Transaksi");
  const siswaSheet = ss.getSheetByName("Siswa");
  
  const tData = transSheet.getDataRange().getValues();
  const tHeaders = tData[0];
  const idIdx = tHeaders.findIndex(h => safeString(h) === "id");
  const rekIdx = tHeaders.findIndex(h => safeString(h) === "rekening");
  const tipeIdx = tHeaders.findIndex(h => safeString(h) === "tipe");
  const jumlahIdx = tHeaders.findIndex(h => safeString(h) === "jumlah");
  
  for (let i = 1; i < tData.length; i++) {
    if (String(tData[i][idIdx]) === String(id)) {
      const rek = tData[i][rekIdx];
      const tipe = tData[i][tipeIdx];
      const jumlah = Number(tData[i][jumlahIdx]);
      
      // Revert Saldo
      const sData = siswaSheet.getDataRange().getValues();
      const sHeaders = sData[0];
      const sRekIdx = sHeaders.findIndex(h => safeString(h) === "rekening");
      const sSaldoIdx = sHeaders.findIndex(h => safeString(h) === "saldo");
      
      for (let j = 1; j < sData.length; j++) {
        if (String(sData[j][sRekIdx]) === String(rek)) {
          let currentSaldo = Number(sData[j][sSaldoIdx]) || 0;
          if (tipe === "SETOR") currentSaldo -= jumlah;
          else if (tipe === "TARIK") currentSaldo += jumlah;
          siswaSheet.getRange(j + 1, sSaldoIdx + 1).setValue(currentSaldo);
          break;
        }
      }
      
      transSheet.deleteRow(i + 1);
      return { status: "success", message: "Transaksi dibatalkan" };
    }
  }
  return { status: "error", message: "Transaksi tidak ditemukan" };
}

function logAudit(admin, aksi, detail) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("AuditLog");
  if (sheet) {
    sheet.appendRow([new Date(), admin, aksi, detail]);
    return { status: "success" };
  }
  return { status: "error" };
}
