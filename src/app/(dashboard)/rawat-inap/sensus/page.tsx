'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { pelayananApi } from '@/lib/api';
import { SensusRawatInapItem } from '@/lib/types';
import {
  Bed,
  Users,
  Search,
  RefreshCw,
  Activity,
  UserCheck,
  Clipboard,
  AlertTriangle,
  DoorOpen,
} from 'lucide-react';

export default function SensusRawatInapPage() {
  const { activeContext, openContextModal } = useAuth();
  const [sensusList, setSensusList] = useState<SensusRawatInapItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isIRNA = activeContext?.instalasi.kode === 'IRNA';

  const fetchSensus = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await pelayananApi.getSensusRawatInap();
      if (res.data) {
        setSensusList(res.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch sensus:', err);
      setErrorMsg(
        err.response?.data?.message ||
          'Gagal memuat sensus rawat inap. Pastikan Anda bertugas di Instalasi Rawat Inap (IRNA).'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSensus();
  }, [activeContext]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Bed className="w-4 h-4" />
            Modul Pelayanan Rawat Inap (IRNA)
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Sensus Pasien Rawat Inap Bangsal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar keterisian tempat tidur & pasien dirawat di {activeContext?.ruangan.nama || 'Bangsal'}
          </p>
        </div>

        <button
          onClick={fetchSensus}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Segarkan Data
        </button>
      </div>

      {/* Context Notice */}
      {!isIRNA && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">Konteks Ruangan:</span> Anda sedang berada di{' '}
              <span className="font-semibold underline">{activeContext?.instalasi.nama} ({activeContext?.ruangan.nama})</span>. Sensus bangsal rawat inap membutuhkan konteks Instalasi Rawat Inap (IRNA).
            </div>
          </div>
          <button
            onClick={openContextModal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 transition"
          >
            <DoorOpen className="w-3.5 h-3.5" />
            Ganti ke Rawat Inap
          </button>
        </div>
      )}

      {/* Bed Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
            Memuat sensus pasien rawat inap...
          </div>
        ) : errorMsg ? (
          <div className="col-span-full p-8 text-center text-xs text-rose-600">
            {errorMsg}
          </div>
        ) : sensusList.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-400">
            Seluruh tempat tidur di bangsal ini sedang kosong.
          </div>
        ) : (
          sensusList.map((item) => (
            <div
              key={item.no_bed}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold font-mono text-xs">
                      {item.no_bed}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {item.no_rm}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Hari Ke-{item.hari_rawat_ke}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {item.nama_pasien}
                </h3>
                <div className="mt-2 space-y-1 text-xs">
                  <p className="text-slate-600 dark:text-slate-400">
                    <span className="text-slate-400 font-medium">Diagnosa Masuk:</span>{' '}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.diagnosa_masuk}
                    </span>
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    <span className="text-slate-400 font-medium">DPJP:</span>{' '}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.dpjp}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition">
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Catatan CPPT</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs">
                  <Activity className="w-3.5 h-3.5" />
                  <span>TTV & Visite</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
