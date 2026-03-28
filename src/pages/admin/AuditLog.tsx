import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import { formatDate } from '../../utils/format';
import { Search, Filter, ShieldCheck, Activity, Clock, User, Info } from 'lucide-react';
import { motion } from 'motion/react';

export const AdminAuditLog = () => {
  const { auditLogs, fetchAuditLogs, isLoadingData, refreshAll } = useContext(DataContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('Semua');
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleLoadMore = () => {
    setLimit(prev => prev + 50);
  };

  const filteredLogs = auditLogs.filter((log: any) => {
    const admin = String(log.admin || '');
    const action = String(log.action || '');
    const details = String(log.details || '');
    const search = String(searchTerm || '').toLowerCase();

    const matchSearch =
      admin.toLowerCase().includes(search) ||
      action.toLowerCase().includes(search) ||
      details.toLowerCase().includes(search);
    
    const matchAction = filterAction === 'Semua' || action.includes(filterAction);

    return matchSearch && matchAction;
  });

  const displayedLogs = filteredLogs.slice(0, limit);

  const getActionColor = (action: string) => {
    if (action.includes('Hapus')) return 'bg-rose-100 text-rose-700 border-rose-200';
    if (action.includes('Tambah')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (action.includes('Update')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (action.includes('Login')) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-emerald-600" size={24} />
            Audit Log Sistem
          </h2>
          <p className="text-sm text-slate-500 mt-1">Rekaman jejak digital seluruh aktivitas administratif SIMPIRA MENABUNG.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => refreshAll()}
            disabled={isLoadingData}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm font-medium disabled:opacity-50"
          >
            <Activity size={18} className={isLoadingData ? 'animate-pulse' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row gap-4 justify-between">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cari admin, aksi, atau detail..."
              className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                className="pl-10 pr-8 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white text-sm font-medium text-slate-700 w-full sm:w-auto"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
              >
                <option value="Semua">Semua Aksi</option>
                <option value="Tambah">Tambah Data</option>
                <option value="Update">Update Data</option>
                <option value="Hapus">Hapus Data</option>
                <option value="Login">Login</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoadingData && auditLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <span className="animate-spin inline-block rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-4"></span>
              <p>Memuat log aktivitas...</p>
            </div>
          ) : displayedLogs.length > 0 ? (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100"></div>
              
              <div className="space-y-8 relative">
                {displayedLogs.map((log: any, index: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    key={index} 
                    className="flex gap-6 group"
                  >
                    <div className="relative z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm border-2 border-white ${
                        log.action?.includes('Hapus') ? 'bg-rose-500 text-white' :
                        log.action?.includes('Tambah') ? 'bg-emerald-500 text-white' :
                        log.action?.includes('Update') ? 'bg-blue-500 text-white' :
                        'bg-indigo-500 text-white'
                      }`}>
                        {log.action?.includes('Login') ? <Clock size={14} /> : <ShieldCheck size={14} />}
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-slate-50/50 rounded-2xl p-4 border border-slate-100 group-hover:border-indigo-200 transition-all group-hover:bg-white group-hover:shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getActionColor(log.action || '')}`}>
                            {log.action}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(log.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <User size={14} className="text-slate-400" />
                          {log.admin}
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {log.details}
                      </p>
                      {log.ip && (
                        <div className="mt-2 text-[10px] text-slate-400 font-mono">
                          IP Address: {log.ip}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Info size={24} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium text-lg">Tidak ada log aktivitas ditemukan.</p>
              <p className="text-sm text-slate-400 mt-1">Seluruh aktivitas administratif akan tercatat di sini.</p>
            </div>
          )}

          {filteredLogs.length > limit && (
            <div className="mt-10 text-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingData}
                className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all disabled:opacity-50"
              >
                {isLoadingData ? 'Memuat...' : 'Muat Lebih Banyak'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
        <div className="p-2 bg-amber-100 rounded-xl text-amber-600 shrink-0">
          <ShieldCheck size={20} />
        </div>
        <div>
          <p className="font-bold text-amber-900">Catatan Keamanan</p>
          <p className="text-sm text-amber-800 mt-1 leading-relaxed">
            Audit Log bersifat <strong>Read-Only</strong> dan tidak dapat dihapus oleh admin manapun untuk menjaga integritas data dan transparansi pengelolaan keuangan sekolah.
          </p>
        </div>
      </div>
    </div>
  );
};
