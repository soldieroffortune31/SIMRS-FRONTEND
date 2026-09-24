'use client';

import React, { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { pelayananApi, pendaftaranApi } from '@/lib/api';
import {
  Stethoscope,
  Users,
  Search,
  RefreshCw,
  PhoneCall,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  DoorOpen,
  UserPlus,
  ArrowRight,
} from 'lucide-react';

export default function AntreanPoliPage() {
  const { activeContext, openContextModal } = useAuth();
  const [antreanList, setAntreanList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'SEMUA' | 'MENUNGGU' | 'DIPANGGIL' | 'SEDANG_DILAYANI' | 'SELESAI'>('SEMUA');
  const [calledPatient, setCalledPatient] = useState<string | null>(null);

  const isIRJ = activeContext?.instalasi.kode === 'IRJ';

  const fetchAntrean = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // 1. Attempt to fetch real registrations from pendaftaran rawat jalan
      const today = new Date().toISOString().split('T')[0];
      const params: any = { tanggal_kunjungan: today };
      if (activeContext?.ruangan?.id) {
        params.ruangan_id = activeContext.ruangan.id;
      }
      const res = await pendaftaranApi.getAllPendaftaran(params);

      if (res.data) {
        const rows = Array.isArray(res.data) ? res.data : res.data.rows || [];
        if (rows.length > 0) {
          // Normalize to common format
          const formatted = rows.map((r: any) => ({
            id: r.id,
            no_antrean: r.no_antrean,
            no_rm: r.pasien?.no_rm || '-',
            nama_pasien: r.pasien?.nama_lengkap || 'Pasien',
            tipe_pasien: r.tipe_pasien,
            jaminan: r.jenis_penjamin || 'UMUM',
            status: r.status_antrean || 'MENUNGGU',
            waktu_daftar: r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
            ruangan_nama: r.ruangan?.nama_ruangan,
            dokter_nama: r.dokter?.nama_lengkap,
          }));
          setAntreanList(formatted);
          return;
        }
      }

      // Fallback to legacy dummy service if empty
      const legacyRes = await pelayananApi.getAntreanPoli();
      if (legacyRes.data) {
        setAntreanList(legacyRes.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch antrean:', err);
      // Fallback
      try {
        const legacyRes = await pelayananApi.getAntreanPoli();
        if (legacyRes.data) setAntreanList(legacyRes.data);
      } catch (_) {
        setErrorMsg(
          err.response?.data?.message ||
            'Gagal memuat antrean poli. Pastikan Anda bertugas di Instalasi Rawat Jalan (IRJ).'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAntrean();
  }, [activeContext]);

  const handleCall = async (pasien: any) => {
    setCalledPatient(pasien.no_antrean);
    if (pasien.id) {
      try {
        await pendaftaranApi.updateStatusPendaftaran(pasien.id, 'DIPANGGIL');
        fetchAntrean();
      } catch (_) {}
    }
    // Audio call announcement simulation
    setTimeout(() => {
      setCalledPatient(null);
    }, 4000);
  };

  const handleLayani = async (pasien: any) => {
    if (pasien.id) {
      try {
        await pendaftaranApi.updateStatusPendaftaran(pasien.id, 'SEDANG_DILAYANI');
        fetchAntrean();
      } catch (_) {}
    }
  };

  const handleSelesai = async (pasien: any) => {
    if (pasien.id) {
      try {
        await pendaftaranApi.updateStatusPendaftaran(pasien.id, 'SELESAI');
        fetchAntrean();
      } catch (_) {}
    }
  };

  const filteredList = antreanList.filter((item) => {
    if (activeTab === 'SEMUA') return true;
    return item.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header and Context notification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            <Stethoscope className="w-4 h-4" />
            Modul Pelayanan Rawat Jalan
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Antrean Pasien Poliklinik
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar antrean pasien terdaftar di {activeContext?.ruangan.nama || 'Poli'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(activeContext?.role?.kode === 'ADMIN' || activeContext?.role?.kode === 'PENDAFTARAN') && (
            <NextLink
              href="/pendaftaran/rawat-jalan"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              + Pendaftaran Pasien Baru / Lama
            </NextLink>
          )}

          <button
            onClick={fetchAntrean}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Segarkan
          </button>
        </div>
      </div>

      {/* Warning if current context is not IRJ */}
      {!isIRJ && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">Pemberitahuan Konteks Pelayanan:</span> Saat ini Anda sedang bertugas di unit{' '}
              <span className="font-semibold underline">{activeContext?.instalasi.nama} ({activeContext?.ruangan.nama})</span>. Modul Antrean Poliklinik hanya berlaku di Instalasi Rawat Jalan (IRJ).
            </div>
          </div>
          <button
            onClick={openContextModal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition cursor-pointer"
          >
            <DoorOpen className="w-3.5 h-3.5" />
            Ganti ke Rawat Jalan
          </button>
        </div>
      )}

      {/* Audio Announcement Toast simulation */}
      {calledPatient && (
        <div className="p-3.5 rounded-xl bg-emerald-600 text-white flex items-center justify-between shadow-lg animate-bounce">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <PhoneCall className="w-4 h-4 animate-pulse" />
            <span>
              Memanggil antrean <span className="font-mono text-sm underline">{calledPatient}</span> menuju ruang pemeriksaan {activeContext?.ruangan.nama}...
            </span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {(['SEMUA', 'MENUNGGU', 'DIPANGGIL', 'SEDANG_DILAYANI', 'SELESAI'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab === 'SEMUA' ? 'Semua Pasien' : tab}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
            Memuat daftar antrean dari server SIMRS...
          </div>
        ) : errorMsg ? (
          <div className="p-8 text-center text-xs text-rose-600">
            {errorMsg}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Tidak ada antrean pasien untuk kriteria ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">No. Antrean</th>
                  <th className="px-5 py-3.5">No. RM</th>
                  <th className="px-5 py-3.5">Nama Pasien</th>
                  <th className="px-5 py-3.5">Penjamin</th>
                  <th className="px-5 py-3.5">Waktu Daftar</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi Layanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredList.map((item, idx) => (
                  <tr
                    key={item.id || item.no_antrean || idx}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="px-5 py-3.5 font-bold font-mono text-sky-600 dark:text-sky-400 text-sm">
                      {item.no_antrean}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700 dark:text-slate-300">
                      {item.no_rm}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {item.nama_pasien}
                      {item.tipe_pasien === 'BARU' && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          BARU
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.jaminan.includes('BPJS')
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {item.jaminan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {item.waktu_daftar}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'MENUNGGU'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : item.status === 'DIPANGGIL'
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 animate-pulse'
                            : item.status === 'SEDANG_DILAYANI'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                            : item.status === 'SELESAI'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCall(item)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800 transition font-semibold cursor-pointer"
                          title="Panggil Pasien Melalui Speaker"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Panggil</span>
                        </button>
                        {item.status !== 'SEDANG_DILAYANI' && item.status !== 'SELESAI' && (
                          <button
                            onClick={() => handleLayani(item)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs transition cursor-pointer"
                            title="Mulai Pemeriksaan Dokter"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Periksa</span>
                          </button>
                        )}
                        {item.status === 'SEDANG_DILAYANI' && (
                          <button
                            onClick={() => handleSelesai(item)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs transition cursor-pointer"
                            title="Selesai Pelayanan"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Selesai</span>
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
