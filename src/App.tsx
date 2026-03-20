/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { Login } from './pages/Login';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminDataSiswa } from './pages/admin/DataSiswa';
import { AdminTransaksi } from './pages/admin/Transaksi';
import { AdminRiwayat } from './pages/admin/Riwayat';
import { AdminCetakRekening } from './pages/admin/CetakRekening';
import { AdminFormManual } from './pages/admin/FormManual';
import { AboutPage } from './pages/About';
import { SiswaLayout } from './layouts/SiswaLayout';
import { SiswaDashboard } from './pages/siswa/Dashboard';
import { SiswaDataPribadi } from './pages/siswa/DataPribadi';
import { SiswaRiwayat } from './pages/siswa/Riwayat';

export default function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="siswa" element={<AdminDataSiswa />} />
              <Route path="transaksi" element={<AdminTransaksi />} />
              <Route path="riwayat" element={<AdminRiwayat />} />
              <Route path="cetak" element={<AdminCetakRekening />} />
              <Route path="form-manual" element={<AdminFormManual />} />
              <Route path="about" element={<AboutPage />} />
            </Route>

            {/* Siswa Routes */}
            <Route path="/siswa" element={<SiswaLayout />}>
              <Route index element={<SiswaDashboard />} />
              <Route path="profil" element={<SiswaDataPribadi />} />
              <Route path="riwayat" element={<SiswaRiwayat />} />
              <Route path="about" element={<AboutPage />} />
            </Route>

            {/* Default Redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </DataProvider>
  );
}
