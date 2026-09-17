'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { pelayananApi } from '@/lib/api';
import NextLink from 'next/link';
import {
  Building2,
  DoorOpen,
  Users,
  Activity,
  Calendar,
  Clock,
  ArrowRight,
  Shield,
  Stethoscope,
  Bed,
  Pill,
  CreditCard,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, activeContext, availableContexts, openContextModal } = useAuth();
  const [antreanCount, setAntreanCount] = useState<number>(0);
  const [sensusCount, setSensusCount] = useState<number>(0);
  const [resepCount, setResepCount] = useState<number>(0);
  const [tagihanCount, setTagihanCount] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!activeContext) return;
      setLoadingStats(true);

      const kode = activeContext.instalasi.kode;

      try {
        if (kode === 'IRJ') {
          const res = await pelayananApi.getAntreanPoli();
          if (res.data) setAntreanCount(res.data.length);
        } else if (kode === 'IRNA') {
          const res = await pelayananApi.getSensusRawatInap();
          if (res.data) setSensusCount(res.data.length);
        } else if (kode === 'FARMASI') {
          const res = await pelayananApi.getAntreanResep();
          if (res.data) setResepCount(res.data.length);
        } else if (kode === 'KASIR') {
          const res = await pelayananApi.getTagihanKasir();
          if (res.data) setTagihanCount(res.data.length);
        }
      } catch (e) {
        console.error('Failed to load contextual stats:', e);
      } finally {
        setLoadingStats(false);
      }
    }

    loadStats();
  }, [activeContext]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-700 via-sky-600 to-indigo-700 text-white p-6 sm:p-8 shadow-xl shadow-sky-600/15">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Sesi Pelayanan Aktif • {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {user?.nama_lengkap || 'Tenaga Medis'}!
          </h1>
          <p className="text-sky-100 text-sm sm:text-base mt-2">
            Anda saat ini bertugas di <span className="font-bold underline decoration-sky-300">{activeContext?.ruangan.nama}</span> ({activeContext?.instalasi.nama}) sebagai <span className="font-bold">{activeContext?.role.nama}</span>.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={openContextModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-sky-800 font-bold text-xs shadow-md hover:bg-sky-50 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Pindah Ruangan / Instalasi
            </button>

            {availableContexts.length > 1 && (
              <span className="text-xs text-sky-100">
                Tersedia {availableContexts.length} unit instalasi kerja terdaftar.
              </span>
            )}
          </div>
        </div>

        {/* Decorative Watermark */}
        <Building2 className="absolute -right-6 -bottom-10 w-64 h-64 text-white/10 pointer-events-none" />
      </div>

      {/* Contextual Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ruangan Aktif */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ruangan Bertugas
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
              <DoorOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-slate-900 dark:text-white truncate">
              {activeContext?.ruangan.nama || '-'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Kode: <span className="font-mono font-semibold">{activeContext?.ruangan.kode}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Instalasi Induk */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Unit Instalasi
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-slate-900 dark:text-white truncate">
              {activeContext?.instalasi.nama || '-'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              ID Unit: <span className="font-semibold">{activeContext?.instalasi.kode}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Peran Klinis */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hak Akses Peran
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-slate-900 dark:text-white truncate">
              {activeContext?.role.nama || '-'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Tingkat: <span className="font-semibold">{activeContext?.role.kode}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Live Service Metrics */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {activeContext?.instalasi.kode === 'IRJ'
                ? 'Antrean Poli Hari Ini'
                : activeContext?.instalasi.kode === 'IRNA'
                ? 'Sensus Kamar Aktif'
                : activeContext?.instalasi.kode === 'FARMASI'
                ? 'Resep Masuk'
                : 'Data Layanan'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {loadingStats ? (
                '...'
              ) : activeContext?.instalasi.kode === 'IRJ' ? (
                antreanCount
              ) : activeContext?.instalasi.kode === 'IRNA' ? (
                sensusCount
              ) : activeContext?.instalasi.kode === 'FARMASI' ? (
                resepCount
              ) : (
                tagihanCount
              )}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Terhubung Real-Time Backend
            </div>
          </div>
        </div>
      </div>

      {/* Module Shortcuts Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Akses Cepat Modul Pelayanan Ruangan
          </h2>
          <span className="text-xs text-slate-500">
            Menu disesuaikan otomatis dengan penugasan unit
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Rawat Jalan Shortcut */}
          <NextLink
            href="/rawat-jalan/antrean"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-sky-500 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 flex items-center justify-center group-hover:scale-105 transition">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 transition">
                  Pelayanan Rawat Jalan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Antrean poli, registrasi, dan pemeriksaan klinis EMR
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition" />
            </div>
          </NextLink>

          {/* Rawat Inap Shortcut */}
          <NextLink
            href="/rawat-inap/sensus"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 flex items-center justify-center group-hover:scale-105 transition">
                <Bed className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                  Pelayanan Rawat Inap
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sensus bangsal, CPPT visite dokter, dan monitoring TTV
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition" />
            </div>
          </NextLink>

          {/* Farmasi Shortcut */}
          <NextLink
            href="/farmasi/antrean-resep"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 flex items-center justify-center group-hover:scale-105 transition">
                <Pill className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition">
                  Pelayanan Farmasi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Antrean resep dokter, telaah obat, dispensing & stok
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition" />
            </div>
          </NextLink>

          {/* Kasir Shortcut */}
          <NextLink
            href="/kasir/tagihan"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 flex items-center justify-center group-hover:scale-105 transition">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition">
                  Kasir & Tagihan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Billing pembayaran pasien, cetak kwitansi & kas shift
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition" />
            </div>
          </NextLink>

          {/* Master Users Shortcut */}
          <NextLink
            href="/pengaturan/users"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-500 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 flex items-center justify-center group-hover:scale-105 transition">
                <Users className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition">
                  Manajemen Pengguna
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pengaturan akun tenaga medis, dokter, perawat, dan role
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition" />
            </div>
          </NextLink>

          {/* Master Ruangan Shortcut */}
          <NextLink
            href="/pengaturan/ruangan"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-500 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center group-hover:scale-105 transition">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-slate-600 transition">
                  Instalasi & Ruangan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar instalasi rumah sakit, bangsal, poliklinik & depo
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition" />
            </div>
          </NextLink>
        </div>
      </div>
    </div>
  );
}
