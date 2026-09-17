'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ContextModal from '@/components/layout/ContextModal';
import {
  Hospital,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Stethoscope,
  Pill,
  CreditCard,
  Building,
} from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Mohon isi username dan kata sandi.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await login(username, password);
    } catch (err: any) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.message ||
        'Gagal masuk. Pastikan backend aktif dan kredensial benar.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDemoAccount = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg z-10">
        {/* Hospital Brand Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-xl shadow-sky-500/30 mb-3 border border-white/10">
            <Hospital className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            SIMRS Next Enterprise
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Sistem Informasi Manajemen Rumah Sakit Terintegrasi
          </p>
        </div>

        {/* Login Form Box */}
        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Masuk ke Sistem
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Gunakan akun pegawai RS untuk mengakses ruangan & modul tugas
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Username Pegawai
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: dr.budi atau admin"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-70 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Kredensial...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke SIMRS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Akun Demo Bawaan (1-Klik Isi)
              </span>
              <span className="text-[11px] text-sky-600 font-medium">Auto-Seeded</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => setDemoAccount('dr.budi', 'dokter123')}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-sky-400 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-sky-50/50 transition flex items-center gap-2 group"
              >
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 truncate">
                    dr. Budi, Sp.PD
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">Multi-Unit Dokter</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('perawat.siti', 'perawat123')}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-emerald-400 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-emerald-50/50 transition flex items-center gap-2 group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 truncate">
                    Ns. Siti Rahmawati
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">Perawat Poli/Bangsal</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('apt.rani', 'apotek123')}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-purple-400 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-purple-50/50 transition flex items-center gap-2 group"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Pill className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 truncate">
                    apt. Rani Kusuma
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">Apoteker Farmasi</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('kasir.doni', 'kasir123')}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-amber-400 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-amber-50/50 transition flex items-center gap-2 group"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 truncate">
                    Doni Pratama
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">Kasir Sentral RS</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('admin', 'admin123')}
                className="col-span-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-indigo-50/50 transition flex items-center justify-center gap-2 group"
              >
                <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Building className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600">
                  Super Administrator (admin / admin123)
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* System footer note */}
        <div className="mt-6 text-center text-xs text-slate-400">
          SIMRS Modern Architecture &copy; 2026 • Terhubung ke PostgreSQL & Express API
        </div>
      </div>

      {/* Context Selection Modal (Handles step 2 if required) */}
      <ContextModal />
    </div>
  );
}
