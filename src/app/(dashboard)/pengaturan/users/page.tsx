'use client';

import React, { useEffect, useState } from 'react';
import { masterApi } from '@/lib/api';
import {
  Users,
  Shield,
  Building2,
  DoorOpen,
  RefreshCw,
  Search,
  UserCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function PengaturanUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await masterApi.getUsers();
      if (res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.nama_lengkap?.toLowerCase().includes(term) ||
      u.username?.toLowerCase().includes(term) ||
      u.nip_nik?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            <Users className="w-4 h-4" />
            Master Data & Pengaturan SIMRS
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Manajemen Pengguna & Pegawai
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar akun tenaga medis, dokter, apoteker, kasir, dan penugasan ruangan
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Segarkan Data
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari berdasarkan nama, username, atau NIP..."
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
            Memuat daftar pengguna...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Tidak ditemukan data pengguna.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Nama & Username</th>
                  <th className="px-5 py-3.5">NIP / NIK</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Penugasan Ruangan & Role</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {u.nama_lengkap}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          #{u.id}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        @{u.username}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-400">
                      {u.nip_nik || '-'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                      {u.email || '-'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {((u.assignments || u.user_ruangan_roles) && (u.assignments || u.user_ruangan_roles).length > 0) ? (
                          (u.assignments || u.user_ruangan_roles).map((assignment: any, idx: number) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700"
                            >
                              <DoorOpen className="w-3 h-3 text-sky-600" />
                              <span>{assignment.ruangan?.nama_ruangan}</span>
                              <span className="font-bold text-sky-600">
                                ({assignment.role?.kode_role})
                              </span>
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Belum ada penugasan
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {u.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" /> Nonaktif
                        </span>
                      )}
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
