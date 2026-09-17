'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Pill,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
} from 'lucide-react';

export default function ResepElektronikPage() {
  const { activeContext } = useAuth();
  const [obatList, setObatList] = useState([
    { id: 1, nama: 'Paracetamol 500mg Tab', aturan: '3 x 1 Tablet sesudah makan', jumlah: 10 },
    { id: 2, nama: 'Amoxicillin 500mg Kapsul', aturan: '3 x 1 Kapsul habiskan', jumlah: 15 },
  ]);
  const [namaObat, setNamaObat] = useState('');
  const [aturan, setAturan] = useState('');
  const [jumlah, setJumlah] = useState('10');
  const [sent, setSent] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaObat) return;
    setObatList([
      ...obatList,
      { id: Date.now(), nama: namaObat, aturan, jumlah: parseInt(jumlah) || 1 },
    ]);
    setNamaObat('');
    setAturan('');
  };

  const handleRemove = (id: number) => {
    setObatList(obatList.filter((o) => o.id !== id));
  };

  const handleSend = () => {
    setSent(true);
    setTimeout(() => setSent(false), 3500);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
          <Pill className="w-4 h-4" />
          Resep Elektronik (e-Prescription)
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
          Penulisan Resep Dokter Poliklinik
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Kirim resep digital langsung ke Depo Farmasi dari {activeContext?.ruangan.nama}
        </p>
      </div>

      {sent && (
        <div className="p-3.5 rounded-xl bg-emerald-600 text-white flex items-center gap-2 text-xs font-semibold shadow-md">
          <CheckCircle2 className="w-4 h-4" />
          <span>Resep elektronik berhasil dikirim ke antrean Depo Farmasi Rawat Jalan!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Add Medication */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-sky-600" />
            Tambah Obat ke Resep
          </h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Nama Obat & Sediaan
              </label>
              <input
                type="text"
                value={namaObat}
                onChange={(e) => setNamaObat(e.target.value)}
                placeholder="Contoh: Cetirizine 10mg Tab"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Aturan Pakai (Signa)
              </label>
              <input
                type="text"
                value={aturan}
                onChange={(e) => setAturan(e.target.value)}
                placeholder="Contoh: 1 x 1 Tablet malam hari"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Jumlah Obat
              </label>
              <input
                type="number"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                min="1"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 rounded-xl bg-slate-900 text-white dark:bg-sky-600 hover:bg-sky-700 text-xs font-bold transition cursor-pointer"
            >
              + Tambah ke Daftar
            </button>
          </form>
        </div>

        {/* List of Medications */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Daftar Resep untuk Pasien
            </h2>
            <div className="space-y-2">
              {obatList.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {item.nama}
                      </span>
                      <span className="text-[10px] font-mono bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded font-bold">
                        {item.jumlah} Unit
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Signa: {item.aturan}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 flex justify-end">
            <button
              onClick={handleSend}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Kirim ke Farmasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
