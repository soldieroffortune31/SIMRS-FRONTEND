'use client';

import React, { useEffect, useState, useCallback } from 'react';
import NextLink from 'next/link';
import { pendaftaranApi, masterApi } from '@/lib/api';
import { JadwalDokter } from '@/lib/types';
import {
  Clock,
  Calendar,
  Search,
  RefreshCw,
  Stethoscope,
  Building,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Filter,
} from 'lucide-react';

export default function JadwalDokterPage() {
  const [jadwalList, setJadwalList] = useState<JadwalDokter[]>([]);
  const [ruanganList, setRuanganList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedRuanganId, setSelectedRuanganId] = useState<number | ''>('');
  const [selectedHari, setSelectedHari] = useState<string>('ALL');

  // 1. Fetch Ruangan Poliklinik
  useEffect(() => {
    const loadRuangan = async () => {
      try {
        const res = await masterApi.getRuangan(1); // IRJ
        if (res.data) setRuanganList(res.data);
      } catch (err) {
        console.error('Failed to load ruangan:', err);
      }
    };
    loadRuangan();
  }, []);

  // 2. Fetch Jadwal Dokter
  const fetchJadwal = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (selectedRuanganId) params.ruangan_id = Number(selectedRuanganId);
      if (selectedHari !== 'ALL') params.hari = selectedHari;
      const res = await pendaftaranApi.getAllJadwalDokter(params);
      if (res.data) {
        setJadwalList(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Error fetching jadwal dokter:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRuanganId, selectedHari]);

  useEffect(() => {
    fetchJadwal();
  }, [fetchJadwal]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            Modul Pendaftaran & Admisi Pasien
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Jadwal Praktik Dokter Poliklinik
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Informasi jadwal praktik dokter spesialis, poliklinik, jam operasional, dan kuota pasien
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NextLink
            href="/pendaftaran/rawat-jalan"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            + Pendaftaran Rawat Jalan
          </NextLink>

          <button
            onClick={fetchJadwal}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Segarkan
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Poliklinik:</span>
            <select
              value={selectedRuanganId}
              onChange={(e) => setSelectedRuanganId(e.target.value ? Number(e.target.value) : '')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="">Semua Poliklinik</option>
              {ruanganList.map((r) => {
                const rId = r.ruangan_id ?? r.id;
                return (
                  <option key={rId} value={rId}>
                    {r.nama_ruangan} ({r.kode_ruangan})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Hari:</span>
            <select
              value={selectedHari}
              onChange={(e) => setSelectedHari(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">Semua Hari</option>
              {['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU'].map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Ditemukan <strong>{jadwalList.length}</strong> jadwal dokter aktif
        </span>
      </div>

      {/* Grid of Doctor Schedules */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
          Memuat jadwal praktik dokter...
        </div>
      ) : jadwalList.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          Tidak ada jadwal praktik dokter yang cocok dengan filter ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jadwalList.map((j) => {
            const jId = j.jadwaldokter_id ?? j.jadwal_dokter_id ?? j.id;
            return (
            <div
              key={jId}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-sky-500/50 hover:shadow-md transition space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 font-bold flex items-center justify-center">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {j.dokter?.nama_lengkap || 'Dokter'}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      NIP: {j.dokter?.nip_nik || '-'}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
                  {j.hari}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Poliklinik:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {j.ruangan?.nama_ruangan}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Jam Praktik:</span>
                  <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                    {j.jam_mulai} - {j.jam_selesai} WIB
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Kuota Pasien:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Maks {j.kuota_pasien} Pasien / Hari
                  </span>
                </div>
                {j.keterangan && (
                  <p className="text-[11px] text-slate-400 italic pt-1">
                    {j.keterangan}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <NextLink
                  href="/pendaftaran/rawat-jalan"
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold transition"
                >
                  <span>Daftarkan Pasien ke Jadwal Ini</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </NextLink>
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}
