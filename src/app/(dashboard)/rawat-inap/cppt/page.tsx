'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Clipboard, User, Clock, CheckCircle2 } from 'lucide-react';

export default function CPPTPage() {
  const { activeContext, user } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
          <Clipboard className="w-4 h-4" />
          CPPT Terintegrasi
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
          Catatan Perkembangan Pasien Terintegrasi
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Pencatatan SOAP harian dokter spesialis dan perawat di {activeContext?.ruangan.nama}
        </p>
      </div>

      <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Clipboard className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
          Lembar Catatan CPPT Pasien Rawat Inap
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          PPA (Profesional Pemberi Asuhan) seperti Dokter Penanggung Jawab Pasien (DPJP), Perawat, dan Farmasi Klinis dapat menginputkan evaluasi perkembangan pasien terintegrasi.
        </p>
      </div>
    </div>
  );
}
