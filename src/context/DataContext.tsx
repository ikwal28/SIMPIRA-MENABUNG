import React, { createContext, useState, ReactNode, useRef } from 'react';
import { apiCall } from '../services/api';
import Swal from 'sweetalert2';

export const DataContext = createContext<any>(null);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [siswa, setSiswa] = useState<any[]>([]);
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Cache refs
  const lastFetchSiswa = useRef<number>(0);
  const lastFetchTransaksi = useRef<number>(0);
  // Cache duration reduced to 30 seconds for better responsiveness
  const CACHE_DURATION = 30 * 1000; 

  const showProcessingModal = () => {
    Swal.fire({
      title: 'Sedang Memproses',
      html: 'Mohon tunggu sebentar, data sedang dikirim ke server...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  };

  const fetchSiswa = async (force = false) => {
    const now = Date.now();
    // Only skip if not forced AND we have data AND it's very fresh
    if (!force && siswa.length > 0 && (now - lastFetchSiswa.current < CACHE_DURATION)) {
      return;
    }

    // Don't show global loader if we already have data (background refresh)
    if (siswa.length === 0) setIsLoadingData(true);
    
    try {
      const res = await apiCall({ action: 'getSiswa' });
      setSiswa(res.data || []);
      lastFetchSiswa.current = Date.now();
    } catch (error: any) {
      console.error("Fetch Siswa Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Data Nasabah',
        text: error.message,
        footer: '<a href="https://script.google.com" target="_blank">Buka Google Apps Script</a>'
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchTransaksi = async (rekening?: string, tanggal?: string, force = false, limit = 500) => {
    const now = Date.now();
    
    // Background refresh logic
    if (!force && !rekening && !tanggal && transaksi.length > 0 && (now - lastFetchTransaksi.current < CACHE_DURATION)) {
      return;
    }

    if (transaksi.length === 0) setIsLoadingData(true);
    
    try {
      const res = await apiCall({ action: 'getTransaksi', rekening, tanggal, limit });
      
      // Update main transaction list with fetched data
      setTransaksi(res.data || []);
      
      // Only update the "last full fetch" timestamp if it was a full fetch
      if (!rekening && !tanggal) {
        lastFetchTransaksi.current = Date.now();
      }
    } catch (error: any) {
      console.error("Fetch Transaksi Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Data Transaksi',
        text: error.message,
        footer: '<a href="https://script.google.com" target="_blank">Buka Google Apps Script</a>'
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const refreshAll = async () => {
    setIsLoadingData(true);
    await Promise.all([
      fetchSiswa(true),
      fetchTransaksi(undefined, undefined, true)
    ]);
    setIsLoadingData(false);
  };

  const addSiswa = async (newSiswa: any) => {
    showProcessingModal();
    try {
      await apiCall({ action: 'addSiswaV2', payload: newSiswa });
      
      // Immediate background refresh for all menus
      refreshAll();

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data nasabah berhasil ditambahkan',
        timer: 1500,
        showConfirmButton: false
      });
      return true;
    } catch (error: any) {
      refreshAll();
      Swal.fire('Gagal', error.message, 'error');
      return false;
    }
  };

  const updateSiswa = async (rekening: string, updatedData: any) => {
    showProcessingModal();
    try {
      await apiCall({ action: 'updateSiswaV2', rekening, payload: updatedData });
      
      // Immediate background refresh for all menus
      refreshAll();

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data nasabah berhasil diupdate',
        timer: 1500,
        showConfirmButton: false
      });
      return true;
    } catch (error: any) {
      refreshAll();
      Swal.fire('Gagal', error.message, 'error');
      return false;
    }
  };

  const deleteSiswa = async (rekening: string) => {
    showProcessingModal();
    try {
      await apiCall({ action: 'deleteSiswa', rekening });
      
      // Immediate background refresh for all menus
      refreshAll();

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data nasabah berhasil dihapus',
        timer: 1500,
        showConfirmButton: false
      });
      return true;
    } catch (error: any) {
      refreshAll();
      Swal.fire('Gagal', error.message, 'error');
      return false;
    }
  };

  const addTransaksi = async (newTrx: any) => {
    showProcessingModal();
    try {
      let finalTanggal = new Date().toISOString();
      if (newTrx.tanggal) {
        const now = new Date();
        const [year, month, day] = newTrx.tanggal.split('-');
        if (year && month && day) {
          const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), now.getHours(), now.getMinutes(), now.getSeconds());
          finalTanggal = selectedDate.toISOString();
        }
      }

      const payloadToSubmit = { ...newTrx, tanggal: finalTanggal, petugas: newTrx.petugas || 'Admin' };
      await apiCall({ action: 'transaksi', payload: payloadToSubmit });
      
      // Immediate background refresh for all menus (Saldo & Riwayat)
      refreshAll();

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Transaksi berhasil disimpan',
        timer: 1500,
        showConfirmButton: false
      });
      return true;
    } catch (error: any) {
      refreshAll();
      Swal.fire('Gagal', error.message, 'error');
      return false;
    }
  };

  const deleteTransaksi = async (idTrx: string) => {
    showProcessingModal();
    try {
      await apiCall({ action: 'deleteTransaksi', idTrx });
      
      // Immediate background refresh for all menus (Saldo & Riwayat)
      refreshAll();
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Transaksi berhasil dihapus dan saldo diperbarui',
        timer: 1500,
        showConfirmButton: false
      });
      return true;
    } catch (error: any) {
      refreshAll();
      Swal.fire('Gagal', error.message, 'error');
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        siswa,
        transaksi,
        isLoadingData,
        fetchSiswa,
        fetchTransaksi,
        refreshAll,
        addSiswa,
        updateSiswa,
        deleteSiswa,
        addTransaksi,
        deleteTransaksi,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
