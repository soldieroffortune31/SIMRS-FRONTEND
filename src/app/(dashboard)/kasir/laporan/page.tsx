'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { BarChart2, DollarSign, Calendar, Printer } from 'lucide-react';

export default function LaporanKasirPage() {
  const { activeContext } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider">
          <BarChart2 className="w-4 h-4" />
          Pelayanan Kasir & Keuangan
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
          Laporan Penerimaan Kas Shift
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Rekapitulasi penerimaan tunai, QRIS, dan jaminan asuransi di {activeContext?.ruangan.nama}
        </p>
      </div>

      <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <BarChart2 className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
          Tutup Shift & Rekapitulasi Kasir
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Laporan penerimaan loket kasir siap dicetak saat serah terima pergantian shift kasir sentral rumah sakit.
        </p>
      </div>
    </div>
  );
}
