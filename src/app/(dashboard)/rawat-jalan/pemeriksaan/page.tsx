'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  FileText,
  User,
  Heart,
  Save,
  CheckCircle2,
  Stethoscope,
  Activity,
  AlertCircle,
} from 'lucide-react';

export default function PemeriksaanEMRPage() {
  const { activeContext } = useAuth();
  const [keluhan, setKeluhan] = useState('');
  const [diagnosa, setDiagnosa] = useState('');
  const [tensi, setTensi] = useState('120/80');
  const [nadi, setNadi] = useState('80');
  const [suhu, setSuhu] = useState('36.5');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
          <Stethoscope className="w-4 h-4" />
          Rekam Medis Elektronik (EMR)
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
          Form Pemeriksaan Klinis Dokter
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Pencatatan Anamnesa, Vital Sign, dan Diagnosa ICD-10 di {activeContext?.ruangan.nama}
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-600 text-white flex items-center gap-2 text-xs font-semibold shadow-md animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Hasil pemeriksaan klinis pasien berhasil disimpan ke dalam rekam medis elektronik!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Anamnesa & Diagnosa */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600" />
              Anamnesa Pasien (Subjective)
            </h2>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Keluhan Utama Pasien
              </label>
              <textarea
                rows={3}
                value={keluhan}
                onChange={(e) => setKeluhan(e.target.value)}
                placeholder="Contoh: Pasien mengeluh pusing dan demam sejak 3 hari yang lalu..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" />
              Diagnosa Kerja & Terapi (Assessment & Plan)
            </h2>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Diagnosa ICD-10 / Klinis
              </label>
              <input
                type="text"
                value={diagnosa}
                onChange={(e) => setDiagnosa(e.target.value)}
                placeholder="Contoh: A01.0 - Typhoid fever"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Vital Signs & Save */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              Tanda-Tanda Vital (Objective)
            </h2>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Tekanan Darah (mmHg)
              </label>
              <input
                type="text"
                value={tensi}
                onChange={(e) => setTensi(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Denyut Nadi (x/menit)
              </label>
              <input
                type="text"
                value={nadi}
                onChange={(e) => setNadi(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Suhu Tubuh (°C)
              </label>
              <input
                type="text"
                value={suhu}
                onChange={(e) => setSuhu(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-sky-600/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Pemeriksaan
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
