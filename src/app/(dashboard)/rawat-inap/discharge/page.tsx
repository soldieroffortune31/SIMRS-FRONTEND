'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { CheckSquare, FileText, Printer } from 'lucide-react';

export default function DischargePage() {
  const { activeContext } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
          <CheckSquare className="w-4 h-4" />
          Resume Medis Pasien Pulang
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
          Discharge Summary & Pemulangan Pasien
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Pembuatan ringkasan klinis saat pasien pulang dari {activeContext?.ruangan.nama}
        </p>
      </div>

      <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <CheckSquare className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
          Form Resume Medis Pasien Pulang (Discharge Summary)
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Menampilkan riwayat diagnosis akhir, ringkasan tindakan operasi/prosedur, obat yang dibawa pulang, dan jadwal kontrol poliklinik rawat jalan.
        </p>
      </div>
    </div>
  );
}
