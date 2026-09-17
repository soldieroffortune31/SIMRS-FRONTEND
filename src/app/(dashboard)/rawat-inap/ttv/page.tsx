'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Activity, Heart, Thermometer } from 'lucide-react';

export default function TTVPage() {
  const { activeContext } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
          <Activity className="w-4 h-4" />
          Monitoring Tanda-Tanda Vital
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
          Observasi TTV Pasien Bangsal
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Monitoring berkala tensi, nadi, respirasi, suhu, dan SpO2 di {activeContext?.ruangan.nama}
        </p>
      </div>

      <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Activity className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
          Grafik & Riwayat Observasi Tanda Vital
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Mendukung pencatatan berkala per-shift oleh perawat jaga ruangan untuk deteksi dini perburukan kondisi pasien (Early Warning System / EWS).
        </p>
      </div>
    </div>
  );
}
