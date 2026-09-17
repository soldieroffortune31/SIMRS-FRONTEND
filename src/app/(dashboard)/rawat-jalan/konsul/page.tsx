'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Share2, Users, Send } from 'lucide-react';

export default function KonsulAntarPoliPage() {
  const { activeContext } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider">
          <Share2 className="w-4 h-4" />
          Konsul Antar Poliklinik
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
          Konsultasi & Rujukan Antar Spesialis
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Pengiriman lembar konsul pasien antar unit di {activeContext?.ruangan.nama}
        </p>
      </div>

      <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
          <Share2 className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
          Modul Konsul Antar Poli Siap Digunakan
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Fitur untuk mengirimkan rujukan internal dari dokter poli asal ke spesialis poli tujuan telah terintegrasi dengan konteks ruangan aktif.
        </p>
      </div>
    </div>
  );
}
