'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AssignedRuangan } from '@/lib/types';
import { Building2, DoorOpen, Shield, CheckCircle, ArrowRight, X, Loader2 } from 'lucide-react';

interface NormalizedInstalasi {
  instalasi_id: number;
  kode_instalasi: string;
  nama_instalasi: string;
  daftar_ruangan: AssignedRuangan[];
}

export default function ContextModal() {
  const {
    isContextModalOpen,
    closeContextModal,
    availableContexts,
    activeContext,
    selectContext,
    switchContext,
    tempToken,
    user,
  } = useAuth();

  const [selectedInstalasiId, setSelectedInstalasiId] = useState<number | null>(null);
  const [selectedRuanganId, setSelectedRuanganId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Normalize available contexts: handles both grouped (with daftar_ruangan) and flat lists from backend
  const normalizedInstalasiList: NormalizedInstalasi[] = useMemo(() => {
    if (!availableContexts || availableContexts.length === 0) return [];

    // Check if items already have daftar_ruangan array
    const hasGrouped = availableContexts.some(
      (c: any) => Array.isArray(c.daftar_ruangan) && c.daftar_ruangan.length > 0
    );

    if (hasGrouped) {
      return availableContexts.map((inst: any) => ({
        instalasi_id: inst.instalasi_id ?? inst.id ?? 0,
        kode_instalasi: inst.kode_instalasi || '',
        nama_instalasi: inst.nama_instalasi || '',
        daftar_ruangan: (inst.daftar_ruangan || []).map((r: any) => ({
          ruangan_id: r.ruangan_id ?? r.id ?? 0,
          kode_ruangan: r.kode_ruangan || '',
          nama_ruangan: r.nama_ruangan || '',
          role_id: r.role_id ?? 0,
          kode_role: r.kode_role || '',
          nama_role: r.nama_role || '',
          is_default: Boolean(r.is_default),
        })),
      }));
    }

    // Flat list from backend: group by instalasi_id
    const map = new Map<number, NormalizedInstalasi>();

    for (const item of availableContexts) {
      const instId = item.instalasi_id ?? item.id ?? 0;
      if (!map.has(instId)) {
        map.set(instId, {
          instalasi_id: instId,
          kode_instalasi: item.kode_instalasi || '',
          nama_instalasi: item.nama_instalasi || '',
          daftar_ruangan: [],
        });
      }

      if (item.ruangan_id || item.nama_ruangan) {
        map.get(instId)!.daftar_ruangan.push({
          ruangan_id: item.ruangan_id ?? item.id ?? 0,
          kode_ruangan: item.kode_ruangan || '',
          nama_ruangan: item.nama_ruangan || '',
          role_id: item.role_id ?? 0,
          kode_role: item.kode_role || '',
          nama_role: item.nama_role || '',
          is_default: Boolean(item.is_default),
        });
      }
    }

    return Array.from(map.values());
  }, [availableContexts]);

  if (!isContextModalOpen) return null;

  const handleSelect = async (instalasiId: number, ruanganId: number) => {
    setSelectedInstalasiId(instalasiId);
    setSelectedRuanganId(ruanganId);
    setSubmitting(true);
    setErrorMsg(null);

    try {
      if (tempToken) {
        // Initial login step 2
        await selectContext(instalasiId, ruanganId);
      } else {
        // Switch context from active dashboard
        await switchContext(instalasiId, ruanganId);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal memilih ruangan kerja.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-sky-600 to-indigo-700 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sky-100 text-xs font-semibold uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              Sistem Informasi Manajemen Rumah Sakit
            </div>
            <h2 className="text-xl font-bold mt-1 text-white">
              Pilih Unit & Ruangan Tugas
            </h2>
            <p className="text-sm text-sky-100 mt-0.5">
              Halo, <span className="font-semibold text-white">{user?.nama_lengkap || 'Pengguna'}</span>. Tentukan ruangan kerja aktif Anda.
            </p>
          </div>
          {/* Allow close only if already authenticated and switching context */}
          {!tempToken && (
            <button
              onClick={closeContextModal}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-sm text-rose-700 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Daftar Penugasan Aktif Anda
          </div>

          <div className="space-y-4">
            {normalizedInstalasiList.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                Tidak ada penugasan ruangan yang tersedia untuk akun ini.
              </div>
            ) : (
              normalizedInstalasiList.map((instalasi) => (
                <div
                  key={instalasi.instalasi_id}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/30"
                >
                  <div className="px-4 py-3 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
                        {instalasi.kode_instalasi}
                      </span>
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                        {instalasi.nama_instalasi}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {(instalasi.daftar_ruangan || []).length} Ruangan
                    </span>
                  </div>

                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(instalasi.daftar_ruangan || []).map((ruangan) => {
                      const activeRuanganId = activeContext?.ruangan.ruangan_id ?? activeContext?.ruangan.id;
                      const activeInstalasiId = activeContext?.instalasi.instalasi_id ?? activeContext?.instalasi.id;
                      const isActive =
                        activeRuanganId === ruangan.ruangan_id &&
                        activeInstalasiId === instalasi.instalasi_id;
                      const isProcessing =
                        submitting &&
                        selectedRuanganId === ruangan.ruangan_id &&
                        selectedInstalasiId === instalasi.instalasi_id;

                      return (
                        <button
                          key={ruangan.ruangan_id}
                          disabled={submitting}
                          onClick={() => handleSelect(instalasi.instalasi_id, ruangan.ruangan_id)}
                          className={`flex flex-col text-left p-3.5 rounded-xl border transition-all relative ${
                            isActive
                              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm ring-2 ring-emerald-500/20'
                              : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:border-sky-400 hover:shadow-md hover:translate-y-[-1px]'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1.5">
                            <div className="flex items-center gap-2">
                              <DoorOpen className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-sky-600'}`} />
                              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                                {ruangan.nama_ruangan}
                              </span>
                            </div>
                            {isActive && (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/60 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3" /> Aktif
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-md">
                              <Shield className="w-3 h-3 text-slate-400" />
                              {ruangan.nama_role}
                            </span>
                            {ruangan.is_default && (
                              <span className="text-[10px] font-medium text-amber-700 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300 px-1.5 py-0.2 rounded">
                                Default
                              </span>
                            )}
                          </div>

                          <div className="mt-3 flex items-center justify-end text-xs font-medium text-sky-600 dark:text-sky-400">
                            {isProcessing ? (
                              <span className="flex items-center gap-1">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengaktifkan...
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 group-hover:underline">
                                {isActive ? 'Tetap di sini' : 'Masuk Ruangan'}{' '}
                                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>Konteks ruangan menentukan hak akses data pasien dan modul SIMRS.</span>
          {!tempToken && (
            <button
              onClick={closeContextModal}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium transition"
            >
              Batal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
