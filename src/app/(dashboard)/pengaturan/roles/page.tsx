'use client';

import React, { useEffect, useState } from 'react';
import { masterApi } from '@/lib/api';
import DynamicIcon from '@/components/common/DynamicIcon';
import {
  Shield,
  Layers,
  RefreshCw,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function PengaturanRolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [roleRes, modRes] = await Promise.all([
        masterApi.getRoles(),
        masterApi.getModul(true),
      ]);
      if (roleRes.data) setRoles(roleRes.data);
      if (modRes.data) setModules(modRes.data);
    } catch (err) {
      console.error('Failed to fetch roles & modules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            Master Data & Hak Akses
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Role Pegawai & Modul SIMRS
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar peran klinis serta modul-modul sistem informasi rumah sakit
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Segarkan Data
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
          Memuat konfigurasi role & modul...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Roles Section */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Peran Pegawai (Roles)
            </h2>
            <div className="space-y-3">
              {roles.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {r.nama_role}
                      </span>
                      <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-1.5 py-0.2 rounded font-semibold">
                        {r.kode_role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {r.deskripsi || 'Peran operasional sistem SIMRS'}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                    Aktif
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Modules Section */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-600" />
              Modul Pelayanan SIMRS
            </h2>
            <div className="space-y-3">
              {modules.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 flex items-center justify-center shrink-0">
                      <DynamicIcon name={m.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {m.nama_modul}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          {m.kode_modul}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {m.deskripsi}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-300 px-2 py-0.5 rounded-md">
                    {m.menus?.length || 0} Sub-Menu
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
