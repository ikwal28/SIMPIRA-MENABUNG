import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { apiCall } from '../services/api';
import Swal from 'sweetalert2';

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("AuthContext: Failed to parse user from localStorage", e);
      localStorage.removeItem('user');
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('user', JSON.stringify(user));
      } catch (e) {
        console.error("AuthContext: Failed to set user in localStorage", e);
      }
      // Inactivity and Tab Closure logic
      const checkSession = () => {
        try {
          const lastActivity = parseInt(localStorage.getItem('lastActivity') || '0');
          const now = Date.now();
          if (now - lastActivity > 10 * 60 * 1000) {
            forceLogout();
          }
        } catch (e) {
          console.error("AuthContext: Failed to access localStorage in checkSession", e);
        }
      };
      const interval = setInterval(checkSession, 60000); // Check every minute
      
      const updateActivity = () => {
        try {
          localStorage.setItem('lastActivity', Date.now().toString());
        } catch (e) {
          console.error("AuthContext: Failed to set lastActivity in localStorage", e);
        }
      };
      window.addEventListener('mousemove', updateActivity);
      window.addEventListener('keydown', updateActivity);
      window.addEventListener('click', updateActivity);
      window.addEventListener('scroll', updateActivity);

      const handleVisibilityChange = () => {
        try {
          if (document.hidden) {
            localStorage.setItem('tabClosedAt', Date.now().toString());
          } else {
            const tabClosedAt = parseInt(localStorage.getItem('tabClosedAt') || '0');
            if (Date.now() - tabClosedAt > 3 * 60 * 1000) {
              forceLogout();
            }
          }
        } catch (e) {
          console.error("AuthContext: Failed to access localStorage in handleVisibilityChange", e);
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        clearInterval(interval);
        window.removeEventListener('mousemove', updateActivity);
        window.removeEventListener('keydown', updateActivity);
        window.removeEventListener('click', updateActivity);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      try {
        localStorage.removeItem('user');
      } catch (e) {
        console.error("AuthContext: Failed to remove user from localStorage", e);
      }
    }
  }, [user]);

  const login = async (username: string, password: string, role: string) => {
    setIsLoading(true);
    try {
      const response = await apiCall({
        action: 'loginV2',
        username,
        password
      });
      
      // Generate a simple session ID
      const sessionId = Date.now().toString();
      setUser({ ...response.data, role: response.role, sessionId });
      try {
        localStorage.setItem('lastActivity', Date.now().toString());
      } catch (e) {
        console.error("AuthContext: Failed to set lastActivity in login", e);
      }
      
      // Log admin login
      if (response.role === 'admin') {
        apiCall({
          action: 'logAudit',
          payload: {
            action: 'Login Admin',
            details: `Admin ${response.data.nama} berhasil masuk ke sistem.`,
            admin: response.data.nama,
            timestamp: new Date().toISOString()
          }
        }).catch(console.error);
      }
      
      const avatarUrl = response.role === 'admin' 
        ? "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop"
        : "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=200&auto=format&fit=crop";

      Swal.fire({
        title: 'Berhasil Masuk',
        html: `
          <div class="text-center space-y-3">
            <div class="w-20 h-20 mx-auto rounded-full bg-indigo-50 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
              <img src="${avatarUrl}" alt="Avatar" class="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <p class="text-slate-500 text-sm">Selamat datang kembali,</p>
              <h3 class="text-xl font-bold text-slate-900">${response.data.nama}</h3>
            </div>
            <div class="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
              <p class="text-xs text-indigo-700 leading-relaxed font-medium">
                "Gunakanlah Aplikasi <span class="font-bold">SIMPIRA MENABUNG</span> secara bijak untuk masa depan yang lebih gemilang."
              </p>
            </div>
          </div>
        `,
        icon: 'success',
        showConfirmButton: true,
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#4f46e5',
        customClass: {
          popup: 'rounded-[2rem]',
          confirmButton: 'rounded-xl px-10 py-3 font-bold'
        }
      });
      return response.role;
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Masuk',
        text: error.message || 'Terjadi kesalahan saat menghubungi server.',
        footer: '<a href="https://script.google.com" target="_blank">Buka Google Apps Script</a>'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const avatarUrl = user?.role === 'admin' 
      ? "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop"
      : "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=200&auto=format&fit=crop";

    const result = await Swal.fire({
      title: 'Konfirmasi Keluar',
      html: `
        <div class="text-center space-y-4">
          <div class="w-20 h-20 mx-auto rounded-full bg-slate-50 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
            <img src="${avatarUrl}" alt="Avatar" class="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">Hallo, ${user?.nama?.split(' ')[0] || 'Pengguna'}</h3>
            <p class="text-slate-500 text-sm mt-1">Terima kasih telah menggunakan layanan <span class="font-bold text-indigo-600">SIMPIRA MENABUNG</span> hari ini.</p>
          </div>
          <p class="text-sm font-medium text-slate-700">Apakah Anda yakin ingin mengakhiri sesi ini?</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Keluar Sekarang',
      cancelButtonText: 'Tetap Disini',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-[2rem]',
      }
    });

    if (result.isConfirmed || !user) {
      setUser(null);
      try {
        localStorage.removeItem('user');
        localStorage.removeItem('lastActivity');
        localStorage.removeItem('tabClosedAt');
      } catch (e) {
        console.error("AuthContext: Failed to remove items from localStorage in logout", e);
      }
      
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Sesi Berakhir',
          text: 'Sampai jumpa kembali di SIMPIRA MENABUNG!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-[2rem]',
          }
        });
      }
    }
  };

  const forceLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('lastActivity');
      localStorage.removeItem('tabClosedAt');
    } catch (e) {
      console.error("AuthContext: Failed to remove items from localStorage in forceLogout", e);
    }
    Swal.fire({
      title: 'Sesi Berakhir',
      text: 'Sesi Anda telah berakhir demi keamanan.',
      icon: 'info',
      customClass: {
        popup: 'rounded-[2rem]',
      }
    });
  };

  const refreshUser = async () => {
    if (user && user.role === 'siswa') {
      try {
        const res = await apiCall({ action: 'getSiswaByUser', username: user.username });
        setUser({ ...res.data, role: 'siswa' });
      } catch (error: any) {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal Memperbarui Data',
          text: error.message,
          footer: '<a href="https://script.google.com" target="_blank">Buka Google Apps Script</a>'
        });
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
