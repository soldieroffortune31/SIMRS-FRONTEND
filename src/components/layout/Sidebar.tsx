'use client';

import React, { useState } from 'react';
import Link from 'next/navigation';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import { useAuth } from '@/context/AuthContext';
import DynamicIcon from '@/components/common/DynamicIcon';
import { MenuItem } from '@/lib/types';
import {
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  Hospital,
  Activity,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { menus, activeContext, user } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<Record<number, boolean>>({
    1: true,
    10: true,
    20: true,
    30: true,
    40: true,
    50: true,
  });

  const toggleExpand = (id: number) => {
    setExpandedMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isCurrentActive = (path: string) => {
    if (!path) return false;
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-72 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800 bg-slate-950/40">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Hospital className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              SIMRS Next <span className="text-[10px] bg-sky-500/20 text-sky-400 font-semibold px-1.5 py-0.5 rounded">v2.0</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">Sistem Informasi RS</span>
          </div>
        </div>

        {/* Current Working Unit Card in Sidebar */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="text-[10px] uppercase font-bold text-sky-400 tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Ruangan Tugas Aktif
          </div>
          <div className="text-sm font-semibold text-white mt-1 truncate">
            {activeContext?.ruangan.nama || 'Belum Pilih Ruangan'}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between mt-1">
            <span className="truncate">{activeContext?.instalasi.nama || 'Instalasi'}</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-700 text-[10px] font-semibold text-slate-300">
              {activeContext?.role.kode || 'ROLE'}
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          {/* Dashboard Home Link */}
          <NextLink
            href="/dashboard"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
              pathname === '/dashboard'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-sky-400" />
            <span>Beranda Pelayanan</span>
          </NextLink>

          <div className="pt-3 pb-1.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Modul Pelayanan & Hak Akses
          </div>

          {/* Dynamic Menus from Backend */}
          {menus.length === 0 ? (
            <div className="p-3 text-xs text-slate-500 text-center">
              Memuat menu modul...
            </div>
          ) : (
            menus.map((menu) => {
              const hasChildren = menu.children && menu.children.length > 0;
              const isExpanded = expandedMenus[menu.id] ?? false;
              const isParentActive = isCurrentActive(menu.path);

              return (
                <div key={menu.id} className="space-y-1">
                  {hasChildren ? (
                    <div>
                      <button
                        onClick={() => toggleExpand(menu.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                          isParentActive
                            ? 'text-sky-300 bg-slate-800/70'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <DynamicIcon
                            name={menu.icon}
                            className={`w-4 h-4 ${isParentActive ? 'text-sky-400' : 'text-slate-400'}`}
                          />
                          <span className="text-left">{menu.nama_menu}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      {/* Submenu items */}
                      {isExpanded && (
                        <div className="pl-6 pr-1 py-1 space-y-1 border-l-2 border-slate-800 ml-4 my-1">
                          {menu.children?.map((child) => {
                            const isChildActive = pathname === child.path;
                            return (
                              <NextLink
                                key={child.id}
                                href={child.path}
                                onClick={onClose}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                  isChildActive
                                    ? 'bg-sky-600/90 text-white font-semibold shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                }`}
                              >
                                <DynamicIcon
                                  name={child.icon}
                                  className={`w-3.5 h-3.5 ${isChildActive ? 'text-white' : 'text-slate-400'}`}
                                />
                                <span>{child.nama_menu}</span>
                              </NextLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <NextLink
                      href={menu.path}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                        isCurrentActive(menu.path)
                          ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <DynamicIcon
                        name={menu.icon}
                        className={`w-4 h-4 ${isCurrentActive(menu.path) ? 'text-white' : 'text-slate-400'}`}
                      />
                      <span>{menu.nama_menu}</span>
                    </NextLink>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              {user?.nama_lengkap?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-white truncate">
                {user?.nama_lengkap || 'Pengguna'}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                @{user?.username || 'user'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
