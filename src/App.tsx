/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { Login } from './pages/Login';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminDataSiswa } from './pages/admin/DataSiswa';
import { AdminManajemenKelas } from './pages/admin/ManajemenKelas';
import { AdminTransaksi } from './pages/admin/Transaksi';
import { AdminRiwayat } from './pages/admin/Riwayat';
import { AdminAuditLog } from './pages/admin/AuditLog';
import { AdminCetakRekening } from './pages/admin/CetakRekening';
import { AdminCetakKartu } from './pages/admin/CetakKartu';
import { AdminFormManual } from './pages/admin/FormManual';
import { AboutPage } from './pages/About';
import { SiswaLayout } from './layouts/SiswaLayout';
import { SiswaDashboard } from './pages/siswa/Dashboard';
import { SiswaDataPribadi } from './pages/siswa/DataPribadi';
import { SiswaRiwayat } from './pages/siswa/Riwayat';
import { SplashScreen } from './components/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Check if splash has already been shown in this session
    return !sessionStorage.getItem('hasShownSplash');
  });

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('hasShownSplash', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  return (
    <AuthProvider>
      <DataProvider>
        <AnimatePresence mode="wait">
          {showSplash && <SplashScreen key="splash" />}
        </AnimatePresence>
        
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="siswa" element={<AdminDataSiswa />} />
              <Route path="manajemen-kelas" element={<AdminManajemenKelas />} />
              <Route path="transaksi" element={<AdminTransaksi />} />
              <Route path="riwayat" element={<AdminRiwayat />} />
              <Route path="audit-log" element={<AdminAuditLog />} />
              <Route path="cetak" element={<AdminCetakRekening />} />
              <Route path="cetak-kartu" element={<AdminCetakKartu />} />
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
      </DataProvider>
    </AuthProvider>
  );
}
