'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { pelayananApi } from '@/lib/api';
import { TagihanKasirItem } from '@/lib/types';
import {
  CreditCard,
  RefreshCw,
  Printer,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  DoorOpen,
  Receipt,
} from 'lucide-react';

export default function KasirTagihanPage() {
  const { activeContext, openContextModal } = useAuth();
  const [tagihanList, setTagihanList] = useState<TagihanKasirItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paidBilling, setPaidBilling] = useState<string | null>(null);

  const isKasir = activeContext?.instalasi.kode === 'KASIR';

  const fetchTagihan = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await pelayananApi.getTagihanKasir();
      if (res.data) {
        setTagihanList(res.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch tagihan:', err);
      setErrorMsg(
        err.response?.data?.message ||
          'Gagal memuat tagihan kasir. Pastikan Anda bertugas di Instalasi Kasir.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTagihan();
  }, [activeContext]);

  const handlePay = (billing: TagihanKasirItem) => {
    setTagihanList((prev) =>
      prev.map((item) =>
        item.no_billing === billing.no_billing
          ? { ...item, status_pembayaran: 'LUNAS' }
          : item
      )
    );
    setPaidBilling(billing.no_billing);
    setTimeout(() => {
      setPaidBilling(null);
    }, 4000);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            <CreditCard className="w-4 h-4" />
            Modul Kasir & Keuangan RS
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Tagihan & Pembayaran Pasien
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar penagihan billing rawat jalan, rawat inap, dan farmasi di {activeContext?.ruangan.nama || 'Loket Kasir'}
          </p>
        </div>

        <button
          onClick={fetchTagihan}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Segarkan Data
        </button>
      </div>

      {/* Context Notice */}
      {!isKasir && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">Konteks Ruangan:</span> Anda sedang berada di{' '}
              <span className="font-semibold underline">{activeContext?.instalasi.nama} ({activeContext?.ruangan.nama})</span>. Modul Billing Kasir hanya dapat diakses pada loket Instalasi Kasir.
            </div>
          </div>
          <button
            onClick={openContextModal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition"
          >
            <DoorOpen className="w-3.5 h-3.5" />
            Ganti ke Loket Kasir
          </button>
        </div>
      )}

      {/* Paid Notification */}
      {paidBilling && (
        <div className="p-3.5 rounded-xl bg-emerald-600 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              Pembayaran tagihan <span className="font-mono font-bold">{paidBilling}</span> berhasil diverifikasi dan disetor ke kasir!
            </span>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-600 mb-2" />
            Memuat daftar tagihan kasir...
          </div>
        ) : errorMsg ? (
          <div className="p-8 text-center text-xs text-rose-600">
            {errorMsg}
          </div>
        ) : tagihanList.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Tidak ada data tagihan tertunda di loket ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">No. Billing</th>
                  <th className="px-5 py-3.5">No. RM</th>
                  <th className="px-5 py-3.5">Nama Pasien</th>
                  <th className="px-5 py-3.5">Total Tagihan</th>
                  <th className="px-5 py-3.5">Status Pembayaran</th>
                  <th className="px-5 py-3.5 text-right">Aksi Kasir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {tagihanList.map((item) => (
                  <tr
                    key={item.no_billing}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="px-5 py-3.5 font-bold font-mono text-amber-600 dark:text-amber-400">
                      {item.no_billing}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700 dark:text-slate-300">
                      {item.no_rm}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {item.nama_pasien}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-sm text-slate-900 dark:text-white">
                      {formatRupiah(item.total_tagihan)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status_pembayaran === 'LUNAS'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {item.status_pembayaran}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status_pembayaran === 'BELUM_LUNAS' ? (
                          <button
                            onClick={() => handlePay(item)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs transition"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Terima Pembayaran</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => window.print()}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak Kwitansi</span>
                          </button>
                        )}
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
