'use client';

import React from 'react';
import NextLink from 'next/link';
import {
  Users,
  Building2,
  Shield,
  MapPin,
  Settings,
  ArrowRight,
  Database,
} from 'lucide-react';

export default function PengaturanHubPage() {
  const masterMenus = [
    {
      title: 'Manajemen Pengguna & Staf RS',
      description: 'Atur akun dokter, perawat, apoteker, kasir, dan penugasan ruangan tugas aktif.',
      icon: Users,
      href: '/pengaturan/users',
      badge: 'Akun & Kredensial',
      color: 'from-blue-600 to-indigo-600',
    },
    {
      title: 'Instalasi & Ruangan',
      description: 'Struktur hirarki unit rumah sakit: Poliklinik IRJ, Bangsal IRNA, Depo Farmasi, Loket Kasir.',
      icon: Building2,
      href: '/pengaturan/ruangan',
      badge: 'Unit Pelayanan',
      color: 'from-emerald-600 to-teal-600',
    },
    {
      title: 'Role & Hak Akses Menu',
      description: 'Konfigurasi peran otorisasi ADMIN, DOKTER, PERAWAT, APOTEKER, KASIR dan modul aktif.',
      icon: Shield,
      href: '/pengaturan/roles',
      badge: 'Keamanan & RBAC',
      color: 'from-purple-600 to-pink-600',
    },
    {
      title: 'Master Wilayah & Kodepos Indonesia',
      description: 'Hierarki administratif Provinsi, Kabupaten/Kota, Kecamatan, Desa/Kelurahan, dan Kodepos untuk pendaftaran pasien.',
      icon: MapPin,
      href: '/pengaturan/wilayah',
      badge: 'Data Administratif RI',
      color: 'from-sky-600 to-cyan-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          Pusat Konfigurasi Sistem
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
          Master Data & Pengaturan SIMRS
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Kelola parameter sistem, struktur unit, keamanan peran, serta master wilayah administratif
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {masterMenus.map((item) => {
          const Icon = item.icon;
          return (
            <NextLink
              key={item.href}
              href={item.href}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-500/50 hover:shadow-lg transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-md`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {item.badge}
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-600 transition flex items-center gap-1.5">
                  {item.title}
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </NextLink>
          );
        })}
      </div>
    </div>
  );
}
