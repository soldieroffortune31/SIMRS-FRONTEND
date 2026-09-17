'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { pelayananApi } from '@/lib/api';
import { ResepFarmasiItem } from '@/lib/types';
import {
  Pill,
  RefreshCw,
  Clock,
  CheckCircle2,
  FileCheck,
  Package,
  AlertTriangle,
  DoorOpen,
} from 'lucide-react';

export default function AntreanResepPage() {
  const { activeContext, openContextModal } = useAuth();
  const [resepList, setResepList] = useState<ResepFarmasiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isFarmasi = activeContext?.instalasi.kode === 'FARMASI';

  const fetchResep = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await pelayananApi.getAntreanResep();
      if (res.data) {
        setResepList(res.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch resep:', err);
      setErrorMsg(
        err.response?.data?.message ||
          'Gagal memuat antrean resep. Pastikan Anda bertugas di Instalasi Farmasi.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResep();
  }, [activeContext]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            <Pill className="w-4 h-4" />
            Modul Pelayanan Farmasi
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Antrean Resep Masuk Depo
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar resep elektronik dari dokter poli & bangsal untuk {activeContext?.ruangan.nama || 'Depo Farmasi'}
          </p>
        </div>

        <button
          onClick={fetchResep}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Segarkan Data
        </button>
      </div>

      {/* Context Warning */}
      {!isFarmasi && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">Konteks Ruangan:</span> Anda sedang berada di{' '}
              <span className="font-semibold underline">{activeContext?.instalasi.nama} ({activeContext?.ruangan.nama})</span>. Antrean resep obat hanya dapat diproses oleh staf Instalasi Farmasi.
            </div>
          </div>
          <button
            onClick={openContextModal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shrink-0 transition"
          >
            <DoorOpen className="w-3.5 h-3.5" />
            Ganti ke Depo Farmasi
          </button>
        </div>
      )}

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-600 mb-2" />
            Memuat daftar resep farmasi...
          </div>
        ) : errorMsg ? (
          <div className="p-8 text-center text-xs text-rose-600">
            {errorMsg}
          </div>
        ) : resepList.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Tidak ada antrean resep masuk saat ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">No. Resep</th>
                  <th className="px-5 py-3.5">Asal Ruangan</th>
                  <th className="px-5 py-3.5">Nama Pasien</th>
                  <th className="px-5 py-3.5">Dokter Penulis</th>
                  <th className="px-5 py-3.5">Item R/</th>
                  <th className="px-5 py-3.5">Status Resep</th>
                  <th className="px-5 py-3.5 text-right">Aksi Farmasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {resepList.map((item) => (
                  <tr
                    key={item.no_resep}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="px-5 py-3.5 font-bold font-mono text-purple-600 dark:text-purple-400">
                      {item.no_resep}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700 dark:text-slate-300">
                      {item.asal_ruangan}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {item.nama_pasien}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                      {item.dokter_penulis}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-semibold">
                      {item.jumlah_r} R/
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        <Clock className="w-3 h-3" />
                        {item.status_resep}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition font-semibold">
                          <FileCheck className="w-3 h-3" />
                          <span>Telaah</span>
                        </button>
                        <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs transition">
                          <Package className="w-3 h-3" />
                          <span>Dispensing</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
