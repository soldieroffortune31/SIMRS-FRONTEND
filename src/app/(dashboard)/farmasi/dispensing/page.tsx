'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Package, Tag, CheckCircle } from 'lucide-react';

export default function DispensingPage() {
  const { activeContext } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider">
          <Package className="w-4 h-4" />
          Pelayanan Farmasi
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
          Dispensing & Pencetakan Etiket Obat
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Pengemasan sediaan obat, peracikan puyer, dan label etiket di {activeContext?.ruangan.nama}
        </p>
      </div>

      <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
          <Package className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
          Meja Dispensing & Antrean Penyerahan Obat
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Mendukung cetak etiket obat putih (oral) dan biru (luar) serta verifikasi barcode nomor resep farmasi.
        </p>
      </div>
    </div>
  );
}
