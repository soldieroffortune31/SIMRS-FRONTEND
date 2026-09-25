'use client';

import React, { useEffect, useState, useCallback } from 'react';
import NextLink from 'next/link';
import { pendaftaranApi } from '@/lib/api';
import { Pasien } from '@/lib/types';
import {
  Users,
  Search,
  RefreshCw,
  UserPlus,
  Eye,
  Trash2,
  FileText,
  MapPin,
  Phone,
  CreditCard,
  Calendar,
  X,
  Shield,
  AlertTriangle,
} from 'lucide-react';

export default function DataPasienPage() {
  const [pasienList, setPasienList] = useState<Pasien[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJk, setFilterJk] = useState<'ALL' | 'L' | 'P'>('ALL');
  const [inspectedPasien, setInspectedPasien] = useState<Pasien | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; no_rm: string; nama_lengkap: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPasien = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { limit: 50 };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (filterJk !== 'ALL') params.jenis_kelamin = filterJk;
      const res: any = await pendaftaranApi.getAllPasien(params);
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.rows)
        ? res.rows
        : Array.isArray(res)
        ? res
        : [];
      setPasienList(list);
    } catch (err) {
      console.error('Error fetching pasien:', err);
      showToast('Gagal memuat data master pasien.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filterJk]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPasien();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchPasien]);

  const handleDeletePasien = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      await pendaftaranApi.deletePasien(deleteConfirm.id);
      showToast(`Data pasien ${deleteConfirm.nama_lengkap} (${deleteConfirm.no_rm}) berhasil dinonaktifkan/dihapus.`);
      setDeleteConfirm(null);
      if (inspectedPasien?.id === deleteConfirm.id) {
        setInspectedPasien(null);
      }
      fetchPasien();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menghapus data pasien.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-5 ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-white border-emerald-600'
              : 'bg-rose-500 text-white border-rose-600'
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            <Users className="w-4 h-4" />
            Modul Pendaftaran & Admisi Pasien
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Data Pasien Rekam Medis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Database seluruh pasien rumah sakit dengan penomoran ID Auto-Increment dan No. RM
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NextLink
            href="/pendaftaran/rawat-jalan"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            + Pendaftaran Pasien Baru
          </NextLink>

          <button
            onClick={fetchPasien}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Segarkan
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan NIK, No RM (RM-000001), atau Nama Pasien..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500 text-slate-900 dark:text-white placeholder-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
          {(['ALL', 'L', 'P'] as const).map((jk) => (
            <button
              key={jk}
              onClick={() => setFilterJk(jk)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterJk === jk
                  ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {jk === 'ALL' ? 'Semua JK' : jk === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
            Memuat data master pasien...
          </div>
        ) : pasienList.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Tidak ada pasien yang cocok dengan kriteria pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">No. RM / ID</th>
                  <th className="px-5 py-3.5">NIK</th>
                  <th className="px-5 py-3.5">Nama Pasien</th>
                  <th className="px-5 py-3.5">JK / Lahir</th>
                  <th className="px-5 py-3.5">Alamat Domisili</th>
                  <th className="px-5 py-3.5">Wilayah & Kodepos</th>
                  <th className="px-5 py-3.5">Penjamin Default</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {pasienList.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-black text-sky-600 dark:text-sky-400 text-sm">
                        {p.no_rm}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        ID: #{p.id}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-400">
                      {p.nik || '-'}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {p.nama_lengkap}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                      <span className="font-semibold">{p.jenis_kelamin === 'L' ? 'L' : 'P'}</span>
                      <span className="text-slate-400 ml-1.5">• {p.tanggal_lahir}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {p.alamat_lengkap}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                      {p.desa?.nama_desa ? `${p.desa.nama_desa}, ` : ''}
                      {p.kabupaten?.nama_kabupaten || '-'} ({p.kode_pos || '-'})
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          p.jenis_penjamin_default === 'BPJS'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {p.jenis_penjamin_default || 'UMUM'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectedPasien(p)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/60 dark:text-sky-300 transition font-semibold"
                          title="Lihat Profil Pasien"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Profil</span>
                        </button>
                        <NextLink
                          href="/pendaftaran/rawat-jalan"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition font-semibold"
                          title="Daftarkan Pasien ke Poliklinik"
                        >
                          Daftar RJ
                        </NextLink>
                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              id: p.id,
                              no_rm: p.no_rm,
                              nama_lengkap: p.nama_lengkap,
                            })
                          }
                          className="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Hapus / Nonaktifkan Pasien"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETAIL PROFIL PASIEN */}
      {inspectedPasien && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-bold flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {inspectedPasien.nama_lengkap}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                      No. RM: {inspectedPasien.no_rm}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      (ID: #{inspectedPasien.id})
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectedPasien(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block">NIK</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {inspectedPasien.nik || '-'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block">Jenis Kelamin</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {inspectedPasien.jenis_kelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block">Tempat & Tanggal Lahir</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {inspectedPasien.tempat_lahir}, {inspectedPasien.tanggal_lahir}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block">Golongan Darah</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {inspectedPasien.golongan_darah || 'TIDAK TAHU'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold block">Alamat Domisili Lengkap</span>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {inspectedPasien.alamat_lengkap} (RT {inspectedPasien.rt || '-'}/RW {inspectedPasien.rw || '-'})
                </p>
                <p className="text-[11px] text-slate-500">
                  {inspectedPasien.desa?.nama_desa ? `Desa ${inspectedPasien.desa.nama_desa}, ` : ''}
                  {inspectedPasien.kecamatan?.nama_kecamatan ? `Kec. ${inspectedPasien.kecamatan.nama_kecamatan}, ` : ''}
                  {inspectedPasien.kabupaten?.nama_kabupaten ? `${inspectedPasien.kabupaten.nama_kabupaten}, ` : ''}
                  {inspectedPasien.provinsi?.nama_provinsi ? `Prov. ${inspectedPasien.provinsi.nama_provinsi} ` : ''}
                  ({inspectedPasien.kode_pos || '-'})
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold block">Kontak & Penanggung Jawab</span>
                <div className="flex items-center justify-between">
                  <span>No. Telepon: <strong>{inspectedPasien.no_telepon || '-'}</strong></span>
                  <span>Penanggung Jawab: <strong>{inspectedPasien.nama_penanggung_jawab || '-'} ({inspectedPasien.hubungan_penanggung_jawab || '-'})</strong></span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-end gap-2">
              <button
                onClick={() => setInspectedPasien(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS PASIEN */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 text-xs animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Hapus Data Pasien
                </h4>
                <p className="text-slate-500 text-[11px]">
                  Tindakan ini akan menonaktifkan data pasien (soft delete)
                </p>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Apakah Anda yakin ingin menghapus data pasien{' '}
              <strong className="text-slate-900 dark:text-white">"{deleteConfirm.nama_lengkap}"</strong> ({deleteConfirm.no_rm} - ID: #{deleteConfirm.id})?
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeletePasien}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20 transition disabled:opacity-50"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Pasien'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
