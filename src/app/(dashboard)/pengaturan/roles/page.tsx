'use client';

import React, { useEffect, useState } from 'react';
import { masterApi } from '@/lib/api';
import { Role } from '@/lib/types';
import DynamicIcon from '@/components/common/DynamicIcon';
import {
  Shield,
  Layers,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';

export default function PengaturanRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal Role States
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({
    kode_role: '',
    nama_role: '',
    keterangan: '',
  });

  // Delete Confirm State
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [roleRes, modRes] = await Promise.all([
        masterApi.getRoles(),
        masterApi.getModul(true),
      ]);
      if (roleRes.data) setRoles(Array.isArray(roleRes.data) ? roleRes.data : []);
      if (modRes.data) setModules(Array.isArray(modRes.data) ? modRes.data : []);
    } catch (err) {
      console.error('Failed to fetch roles & modules:', err);
      showToast('Gagal memuat konfigurasi role & modul.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openRoleModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setRoleForm({
        kode_role: role.kode_role,
        nama_role: role.nama_role,
        keterangan: role.keterangan || role.deskripsi || '',
      });
    } else {
      setEditingRole(null);
      setRoleForm({
        kode_role: '',
        nama_role: '',
        keterangan: '',
      });
    }
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.kode_role.trim() || !roleForm.nama_role.trim()) {
      showToast('Harap isi kode dan nama role.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingRole) {
        const roleId = editingRole.role_id ?? editingRole.id ?? 0;
        await masterApi.updateRole(roleId, {
          kode_role: roleForm.kode_role.trim().toUpperCase(),
          nama_role: roleForm.nama_role.trim(),
          keterangan: roleForm.keterangan.trim() || undefined,
        });
        showToast('Role berhasil diperbarui.');
      } else {
        await masterApi.createRole({
          kode_role: roleForm.kode_role.trim().toUpperCase(),
          nama_role: roleForm.nama_role.trim(),
          keterangan: roleForm.keterangan.trim() || undefined,
        });
        showToast('Role baru berhasil ditambahkan.');
      }
      setIsRoleModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan data role.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteDelete = async () => {
    if (!deleteConfirm) return;
    setIsSubmitting(true);
    try {
      await masterApi.deleteRole(deleteConfirm.id);
      showToast(`Role "${deleteConfirm.name}" berhasil dihapus.`);
      setDeleteConfirm(null);
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menghapus role.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
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
            <Shield className="w-4 h-4" />
            Master Data & Hak Akses
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Role Pegawai & Modul SIMRS
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar peran klinis serta modul-modul sistem informasi rumah sakit (ID Auto-Increment)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openRoleModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Role
          </button>

          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Segarkan
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
          Memuat konfigurasi role & modul...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Roles Section */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                Peran Pegawai (Roles)
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                {roles.length} Roles
              </span>
            </div>

            <div className="space-y-3">
              {roles.map((r) => {
                const rId = r.role_id ?? r.id ?? 0;
                return (
                <div
                  key={rId}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between group hover:border-indigo-500/40 transition"
                >
                  <div className="flex-1 mr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {r.nama_role}
                      </span>
                      <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-1.5 py-0.2 rounded font-semibold">
                        {r.kode_role}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        #{rId}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {r.keterangan || r.deskripsi || 'Peran operasional sistem SIMRS'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openRoleModal(r)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition"
                      title="Edit Role"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ id: rId, name: r.nama_role })}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Hapus Role"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
              })}
            </div>
          </div>

          {/* Modules Section */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-600" />
                Modul Pelayanan SIMRS
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
                {modules.length} Modul
              </span>
            </div>

            <div className="space-y-3">
              {modules.map((m) => {
                const mId = m.modul_id ?? m.id ?? 0;
                return (
                <div
                  key={mId}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 flex items-center justify-center shrink-0">
                      <DynamicIcon name={m.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {m.nama_modul}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          {m.kode_modul}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          #{mId}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {m.deskripsi}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-300 px-2 py-0.5 rounded-md shrink-0">
                    {m.menus?.length || 0} Sub-Menu
                  </span>
                </div>
              );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT ROLE */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                {editingRole ? `Edit Role #${editingRole.role_id ?? editingRole.id}` : 'Tambah Role Baru'}
              </h3>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kode Role *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: DOKTER, PERAWAT, APOTEKER, KASIR"
                  value={roleForm.kode_role}
                  onChange={(e) =>
                    setRoleForm({ ...roleForm, kode_role: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white uppercase focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Role *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dokter Penanggung Jawab Pelayanan"
                  value={roleForm.nama_role}
                  onChange={(e) =>
                    setRoleForm({ ...roleForm, nama_role: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Keterangan / Deskripsi
                </label>
                <textarea
                  rows={3}
                  placeholder="Deskripsi tugas dan tanggung jawab peran ini..."
                  value={roleForm.keterangan}
                  onChange={(e) =>
                    setRoleForm({ ...roleForm, keterangan: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS ROLE */}
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
              Apakah Anda yakin ingin menghapus role <strong className="text-slate-900 dark:text-white">"{deleteConfirm.name}"</strong> (ID: #{deleteConfirm.id})?
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
