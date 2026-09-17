'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Database, AlertTriangle, ArrowUpRight } from 'lucide-react';

export default function StokObatPage() {
  const { activeContext } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider">
          <Database className="w-4 h-4" />
          Pelayanan Farmasi
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
          Inventori Stok Obat & BMHP Depo
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Kartu stok, mutasi obat, dan peringatan batas minimum di {activeContext?.ruangan.nama}
        </p>
      </div>

      <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
          <Database className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
          Kartu Stok Depo Farmasi Terhubung
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Setiap peresepan dan dispensing obat dari dokter secara otomatis memotong stok fisik pada depo farmasi ruangan aktif.
        </p>
      </div>
    </div>
  );
}
