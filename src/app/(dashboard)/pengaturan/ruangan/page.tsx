'use client';

import React, { useEffect, useState } from 'react';
import { masterApi } from '@/lib/api';
import {
  Building2,
  DoorOpen,
  RefreshCw,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function PengaturanRuanganPage() {
  const [instalasiList, setInstalasiList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInstalasi = async () => {
    setIsLoading(true);
    try {
      const res = await masterApi.getInstalasi(true);
      if (res.data) {
        setInstalasiList(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch instalasi:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstalasi();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            Master Data & Pengaturan SIMRS
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Instalasi & Ruangan Rumah Sakit
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Struktur hirarki unit instalasi, poliklinik, bangsal, dan depo pelayanan
          </p>
        </div>

        <button
          onClick={fetchInstalasi}
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
          Memuat struktur instalasi dan ruangan...
        </div>
      ) : (
        <div className="space-y-4">
          {instalasiList.map((inst) => (
            <div
              key={inst.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
            >
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    {inst.kode_instalasi}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      {inst.nama_instalasi}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      ID Instalasi: #{inst.id}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
                  {inst.ruangans?.length || 0} Ruangan Terdaftar
                </span>
              </div>

              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {inst.ruangans && inst.ruangans.length > 0 ? (
                  inst.ruangans.map((r: any) => (
                    <div
                      key={r.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <DoorOpen className="w-4 h-4 text-sky-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {r.nama_ruangan}
                          </p>
                          <p className="text-[10px] font-mono text-slate-500">
                            {r.kode_ruangan}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                        Aktif
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-4 text-xs text-slate-400">
                    Belum ada sub-ruangan pada instalasi ini.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
