'use client';

import React, { useEffect, useState } from 'react';
import { masterApi } from '@/lib/api';
import { Instalasi, Ruangan } from '@/lib/types';
import {
  Building2,
  DoorOpen,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';

export default function PengaturanRuanganPage() {
  const [instalasiList, setInstalasiList] = useState<Instalasi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal Instalasi States
  const [isInstalasiModalOpen, setIsInstalasiModalOpen] = useState(false);
  const [editingInstalasi, setEditingInstalasi] = useState<Instalasi | null>(null);
  const [instalasiForm, setInstalasiForm] = useState({
    kode_instalasi: '',
    nama_instalasi: '',
    is_active: true,
  });

  // Modal Ruangan States
  const [isRuanganModalOpen, setIsRuanganModalOpen] = useState(false);
  const [editingRuangan, setEditingRuangan] = useState<Ruangan | null>(null);
  const [ruanganForm, setRuanganForm] = useState({
    instalasi_id: 0,
    kode_ruangan: '',
    nama_ruangan: '',
    is_active: true,
  });

  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'instalasi' | 'ruangan';
    id: number;
    name: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchInstalasi = async () => {
    setIsLoading(true);
    try {
      const res = await masterApi.getInstalasi(true);
      if (res.data) {
        setInstalasiList(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Failed to fetch instalasi:', err);
      showToast('Gagal memuat daftar instalasi dan ruangan.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstalasi();
  }, []);

  // Open Add/Edit Instalasi Modal
  const openInstalasiModal = (inst?: Instalasi) => {
    if (inst) {
      setEditingInstalasi(inst);
      setInstalasiForm({
        kode_instalasi: inst.kode_instalasi,
        nama_instalasi: inst.nama_instalasi,
        is_active: inst.is_active,
      });
    } else {
      setEditingInstalasi(null);
      setInstalasiForm({
        kode_instalasi: '',
        nama_instalasi: '',
        is_active: true,
      });
    }
    setIsInstalasiModalOpen(true);
  };

  const handleSaveInstalasi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instalasiForm.kode_instalasi.trim() || !instalasiForm.nama_instalasi.trim()) {
      showToast('Harap lengkapi kode dan nama instalasi.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingInstalasi) {
        await masterApi.updateInstalasi(editingInstalasi.id, {
          kode_instalasi: instalasiForm.kode_instalasi.trim().toUpperCase(),
          nama_instalasi: instalasiForm.nama_instalasi.trim(),
          is_active: instalasiForm.is_active,
        });
        showToast('Instalasi berhasil diperbarui.');
      } else {
        await masterApi.createInstalasi({
          kode_instalasi: instalasiForm.kode_instalasi.trim().toUpperCase(),
          nama_instalasi: instalasiForm.nama_instalasi.trim(),
          is_active: instalasiForm.is_active,
        });
        showToast('Instalasi baru berhasil ditambahkan.');
      }
      setIsInstalasiModalOpen(false);
      fetchInstalasi();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan instalasi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Add/Edit Ruangan Modal
  const openRuanganModal = (instalasiId: number, ruangan?: Ruangan) => {
    if (ruangan) {
      setEditingRuangan(ruangan);
      setRuanganForm({
        instalasi_id: ruangan.instalasi_id,
        kode_ruangan: ruangan.kode_ruangan,
        nama_ruangan: ruangan.nama_ruangan,
        is_active: ruangan.is_active,
      });
    } else {
      setEditingRuangan(null);
      setRuanganForm({
        instalasi_id: instalasiId,
        kode_ruangan: '',
        nama_ruangan: '',
        is_active: true,
      });
    }
    setIsRuanganModalOpen(true);
  };

  const handleSaveRuangan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruanganForm.kode_ruangan.trim() || !ruanganForm.nama_ruangan.trim()) {
      showToast('Harap lengkapi kode dan nama ruangan.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingRuangan) {
        await masterApi.updateRuangan(editingRuangan.id, {
          instalasi_id: Number(ruanganForm.instalasi_id),
          kode_ruangan: ruanganForm.kode_ruangan.trim().toUpperCase(),
          nama_ruangan: ruanganForm.nama_ruangan.trim(),
          is_active: ruanganForm.is_active,
        });
        showToast('Ruangan berhasil diperbarui.');
      } else {
        await masterApi.createRuangan({
          instalasi_id: Number(ruanganForm.instalasi_id),
          kode_ruangan: ruanganForm.kode_ruangan.trim().toUpperCase(),
          nama_ruangan: ruanganForm.nama_ruangan.trim(),
          is_active: ruanganForm.is_active,
        });
        showToast('Ruangan baru berhasil ditambahkan.');
      }
      setIsRuanganModalOpen(false);
      fetchInstalasi();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan ruangan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirmation Execution
  const handleExecuteDelete = async () => {
    if (!deleteConfirm) return;
    setIsSubmitting(true);
    try {
      if (deleteConfirm.type === 'instalasi') {
        await masterApi.deleteInstalasi(deleteConfirm.id);
        showToast(`Instalasi "${deleteConfirm.name}" berhasil dihapus.`);
      } else {
        await masterApi.deleteRuangan(deleteConfirm.id);
        showToast(`Ruangan "${deleteConfirm.name}" berhasil dihapus.`);
      }
      setDeleteConfirm(null);
      fetchInstalasi();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menghapus data.', 'error');
    } finally {
      setIsSubmitting(false);
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
            <Building2 className="w-4 h-4" />
            Master Data & Pengaturan SIMRS
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Instalasi & Ruangan Rumah Sakit
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Struktur hierarki unit instalasi, poliklinik, bangsal, dan depo pelayanan (ID Auto-Increment)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openInstalasiModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Instalasi
          </button>

          <button
            onClick={fetchInstalasi}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Segarkan
          </button>
        </div>
      </div>

      {/* Body List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
          Memuat struktur instalasi dan ruangan...
        </div>
      ) : (
        <div className="space-y-4">
          {instalasiList.map((inst) => {
            const roomList = inst.ruangan || inst.ruangans || [];
            return (
              <div
                key={inst.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
              >
                {/* Instalasi Header */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                      {inst.kode_instalasi}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                          {inst.nama_instalasi}
                        </h2>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          ID: #{inst.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Kode: {inst.kode_instalasi} • Status:{' '}
                        <span className={inst.is_active ? 'text-emerald-600 font-semibold' : 'text-slate-400 font-semibold'}>
                          {inst.is_active ? 'Aktif' : 'Non-Aktif'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 mr-1">
                      {roomList.length} Ruangan
                    </span>

                    <button
                      onClick={() => openRuanganModal(inst.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 hover:bg-sky-100 text-xs font-semibold transition"
                      title="Tambah Ruangan ke Instalasi Ini"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ruangan</span>
                    </button>

                    <button
                      onClick={() => openInstalasiModal(inst)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Edit Instalasi"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          type: 'instalasi',
                          id: inst.id,
                          name: inst.nama_instalasi,
                        })
                      }
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Hapus Instalasi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Ruangan List Grid */}
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {roomList.length > 0 ? (
                    roomList.map((r: Ruangan) => (
                      <div
                        key={r.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between group hover:border-sky-500/40 transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <DoorOpen className="w-4 h-4 text-sky-600 shrink-0" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-slate-900 dark:text-white">
                                {r.nama_ruangan}
                              </p>
                              <span className="text-[9px] font-mono text-slate-400">
                                #{r.id}
                              </span>
                            </div>
                            <p className="text-[10px] font-mono text-slate-500">
                              {r.kode_ruangan}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openRuanganModal(inst.id, r)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                            title="Edit Ruangan"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'ruangan',
                                id: r.id,
                                name: r.nama_ruangan,
                              })
                            }
                            className="p-1 rounded text-rose-400 hover:text-rose-600 transition"
                            title="Hapus Ruangan"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-4 text-xs text-slate-400">
                      Belum ada sub-ruangan pada instalasi ini. Klik <strong>+ Ruangan</strong> untuk menambahkan.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL TAMBAH / EDIT INSTALASI */}
      {isInstalasiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-600" />
                {editingInstalasi ? `Edit Instalasi #${editingInstalasi.id}` : 'Tambah Instalasi Baru'}
              </h3>
              <button
                onClick={() => setIsInstalasiModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInstalasi} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kode Instalasi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: IRJ, IRI, IGD, LAB"
                  value={instalasiForm.kode_instalasi}
                  onChange={(e) =>
                    setInstalasiForm({ ...instalasiForm, kode_instalasi: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white uppercase focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Instalasi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Instalasi Rawat Jalan"
                  value={instalasiForm.nama_instalasi}
                  onChange={(e) =>
                    setInstalasiForm({ ...instalasiForm, nama_instalasi: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="inst_active"
                  checked={instalasiForm.is_active}
                  onChange={(e) =>
                    setInstalasiForm({ ...instalasiForm, is_active: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="inst_active" className="text-slate-700 dark:text-slate-300 font-medium">
                  Status Aktif
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInstalasiModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 shadow-md shadow-sky-600/20 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Instalasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT RUANGAN */}
      {isRuanganModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-sky-600" />
                {editingRuangan ? `Edit Ruangan #${editingRuangan.id}` : 'Tambah Ruangan Baru'}
              </h3>
              <button
                onClick={() => setIsRuanganModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRuangan} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Unit Instalasi Induk *
                </label>
                <select
                  required
                  value={ruanganForm.instalasi_id}
                  onChange={(e) =>
                    setRuanganForm({ ...ruanganForm, instalasi_id: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-medium"
                >
                  {instalasiList.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.nama_instalasi} ({inst.kode_instalasi}) - #{inst.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kode Ruangan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: POLI-UMUM, POLI-GIGI, VK-01"
                  value={ruanganForm.kode_ruangan}
                  onChange={(e) =>
                    setRuanganForm({ ...ruanganForm, kode_ruangan: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white uppercase focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Ruangan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Poliklinik Umum & Penyakit Dalam"
                  value={ruanganForm.nama_ruangan}
                  onChange={(e) =>
                    setRuanganForm({ ...ruanganForm, nama_ruangan: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="rng_active"
                  checked={ruanganForm.is_active}
                  onChange={(e) =>
                    setRuanganForm({ ...ruanganForm, is_active: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="rng_active" className="text-slate-700 dark:text-slate-300 font-medium">
                  Status Aktif
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRuanganModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 shadow-md shadow-sky-600/20 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Ruangan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 text-xs animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Konfirmasi Hapus
                </h4>
                <p className="text-slate-500 text-[11px]">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Apakah Anda yakin ingin menghapus {deleteConfirm.type === 'instalasi' ? 'instalasi' : 'ruangan'}{' '}
              <strong className="text-slate-900 dark:text-white">"{deleteConfirm.name}"</strong> (ID: #{deleteConfirm.id})?
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
                disabled={isSubmitting}
                onClick={handleExecuteDelete}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
