'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Menu,
  Building2,
  DoorOpen,
  RefreshCw,
  LogOut,
  User,
  Shield,
  ChevronDown,
  Bell,
  Stethoscope,
} from 'lucide-react';

export default function Header({
  onMenuToggle,
}: {
  onMenuToggle: () => void;
}) {
  const { user, activeContext, logout, openContextModal } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left section: Hamburger (mobile) + Active Context Badges */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Active Context Unit Card */}
        {activeContext ? (
          <div className="flex items-center gap-2 sm:gap-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 px-3 py-1.5 rounded-xl shadow-xs">
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-sky-900 dark:text-sky-200">
                  {activeContext.ruangan.nama}
                </span>
                <span className="text-[10px] bg-sky-200/80 dark:bg-sky-800 text-sky-800 dark:text-sky-200 px-1.5 py-0.2 rounded font-semibold uppercase">
                  {activeContext.instalasi.kode}
                </span>
              </div>
              <span className="text-[11px] text-sky-700 dark:text-sky-400 font-medium">
                Peran: <span className="font-semibold">{activeContext.role.nama}</span>
              </span>
            </div>

            {/* Switch Room Button */}
            <button
              onClick={openContextModal}
              title="Ganti Ruangan / Instalasi Tugas"
              className="ml-2 flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700 rounded-lg hover:bg-sky-600 hover:text-white hover:border-transparent transition-all shadow-xs"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden md:inline">Ganti Ruangan</span>
            </button>
          </div>
        ) : (
          <button
            onClick={openContextModal}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 rounded-xl hover:bg-amber-100 transition"
          >
            <DoorOpen className="w-4 h-4 text-amber-600" />
            <span>Pilih Ruangan Tugas</span>
          </button>
        )}
      </div>

      {/* Right section: Quick actions + User menu */}
      <div className="flex items-center gap-3">
        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {user?.nama_lengkap ? user.nama_lengkap.charAt(0) : 'U'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                {user?.nama_lengkap || 'Pengguna'}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {user?.nip_nik || `@${user?.username}`}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <>
              <div
                onClick={() => setProfileDropdownOpen(false)}
                className="fixed inset-0 z-20"
              />
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {user?.nama_lengkap}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {user?.email || `${user?.username}@simrs.local`}
                  </p>
                  {user?.nip_nik && (
                    <p className="text-[10px] text-sky-600 dark:text-sky-400 mt-0.5">
                      NIP/NIK: {user.nip_nik}
                    </p>
                  )}
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      openContextModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-sky-500" />
                    <span>Ganti Ruangan Tugas</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
