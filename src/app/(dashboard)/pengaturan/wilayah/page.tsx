'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { wilayahApi } from '@/lib/api';
import {
  Provinsi,
  KabupatenKota,
  Kecamatan,
  DesaKelurahan,
  KodePos,
} from '@/lib/types';
import {
  MapPin,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Compass,
  ArrowRight,
  Filter,
  Check,
  X,
  Layers,
  Map,
} from 'lucide-react';

type TabType = 'provinsi' | 'kabupaten' | 'kecamatan' | 'desa' | 'kodepos';

export default function PengaturanWilayahPage() {
  const [activeTab, setActiveTab] = useState<TabType>('provinsi');

  // Main Data States
  const [provinsiList, setProvinsiList] = useState<Provinsi[]>([]);
  const [kabupatenList, setKabupatenList] = useState<KabupatenKota[]>([]);
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
  const [desaList, setDesaList] = useState<DesaKelurahan[]>([]);
  const [kodePosList, setKodePosList] = useState<KodePos[]>([]);

  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvinsiId, setSelectedProvinsiId] = useState<number | ''>('');
  const [selectedKabupatenId, setSelectedKabupatenId] = useState<number | ''>('');
  const [selectedKecamatanId, setSelectedKecamatanId] = useState<number | ''>('');
  const [filterTipeKab, setFilterTipeKab] = useState<'ALL' | 'KABUPATEN' | 'KOTA'>('ALL');
  const [filterTipeDesa, setFilterTipeDesa] = useState<'ALL' | 'DESA' | 'KELURAHAN'>('ALL');

  // Instant Postal Code Lookup Feature
  const [postalSearchInput, setPostalSearchInput] = useState('');
  const [postalLookupLoading, setPostalLookupLoading] = useState(false);
  const [postalLookupResult, setPostalLookupResult] = useState<any[] | null>(null);
  const [postalLookupError, setPostalLookupError] = useState<string | null>(null);

  // Toast message
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [modalTarget, setModalTarget] = useState<TabType>('provinsi');
  const [formData, setFormData] = useState<any>({});

  // Delete Confirmation Modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    tab: TabType;
    id: number;
    title: string;
  }>({
    isOpen: false,
    tab: 'provinsi',
    id: 0,
    title: '',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Fetch Provinsi List
  const fetchProvinsi = async () => {
    try {
      const res = await wilayahApi.getProvinsi({ include_kabupaten: true });
      if (res.data) {
        setProvinsiList(Array.isArray(res.data) ? res.data : res.data.rows || []);
      }
    } catch (err) {
      console.error('Error fetching provinsi:', err);
    }
  };

  // 2. Fetch Kabupaten List
  const fetchKabupaten = async () => {
    try {
      const params: any = {};
      if (selectedProvinsiId) params.provinsi_id = selectedProvinsiId;
      if (filterTipeKab !== 'ALL') params.tipe = filterTipeKab;
      const res = await wilayahApi.getKabupaten(params);
      if (res.data) {
        setKabupatenList(Array.isArray(res.data) ? res.data : res.data.rows || []);
      }
    } catch (err) {
      console.error('Error fetching kabupaten:', err);
    }
  };

  // 3. Fetch Kecamatan List
  const fetchKecamatan = async () => {
    try {
      const params: any = {};
      if (selectedKabupatenId) params.kabupaten_id = selectedKabupatenId;
      const res = await wilayahApi.getKecamatan(params);
      if (res.data) {
        setKecamatanList(Array.isArray(res.data) ? res.data : res.data.rows || []);
      }
    } catch (err) {
      console.error('Error fetching kecamatan:', err);
    }
  };

  // 4. Fetch Desa List
  const fetchDesa = async () => {
    try {
      const params: any = {};
      if (selectedKecamatanId) params.kecamatan_id = selectedKecamatanId;
      if (filterTipeDesa !== 'ALL') params.tipe = filterTipeDesa;
      const res = await wilayahApi.getDesa(params);
      if (res.data) {
        setDesaList(Array.isArray(res.data) ? res.data : res.data.rows || []);
      }
    } catch (err) {
      console.error('Error fetching desa:', err);
    }
  };

  // 5. Fetch Kode Pos List
  const fetchKodePos = async () => {
    try {
      const params: any = {};
      if (selectedProvinsiId) params.provinsi_id = selectedProvinsiId;
      if (selectedKabupatenId) params.kabupaten_id = selectedKabupatenId;
      const res = await wilayahApi.getKodePos(params);
      if (res.data) {
        setKodePosList(Array.isArray(res.data) ? res.data : res.data.rows || []);
      }
    } catch (err) {
      console.error('Error fetching kodepos:', err);
    }
  };

  // Main refresh handler based on active tab
  const refreshActiveTabData = async () => {
    setIsLoading(true);
    try {
      await fetchProvinsi();
      if (activeTab === 'kabupaten') await fetchKabupaten();
      if (activeTab === 'kecamatan') await fetchKecamatan();
      if (activeTab === 'desa') await fetchDesa();
      if (activeTab === 'kodepos') await fetchKodePos();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshActiveTabData();
  }, [activeTab, selectedProvinsiId, selectedKabupatenId, selectedKecamatanId, filterTipeKab, filterTipeDesa]);

  // Handle Instant Postal Code Lookup
  const handlePostalLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = postalSearchInput.trim();
    if (!query) return;

    setPostalLookupLoading(true);
    setPostalLookupError(null);
    setPostalLookupResult(null);

    try {
      const res = await wilayahApi.searchKodePos(query);
      if (res.data && res.data.length > 0) {
        setPostalLookupResult(res.data);
      } else {
        setPostalLookupError(`Tidak ditemukan data wilayah untuk kode pos "${query}".`);
      }
    } catch (err: any) {
      setPostalLookupError(err.response?.data?.message || 'Gagal mencari kode pos.');
    } finally {
      setPostalLookupLoading(false);
    }
  };

  // Modal Open Handlers
  const openCreateModal = (tab: TabType) => {
    setModalTarget(tab);
    setModalMode('create');
    setFormData({
      is_active: true,
      provinsi_id: selectedProvinsiId || '',
      kabupaten_id: selectedKabupatenId || '',
      kecamatan_id: selectedKecamatanId || '',
      tipe: tab === 'kabupaten' ? 'KABUPATEN' : tab === 'desa' ? 'DESA' : undefined,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tab: TabType, item: any) => {
    setModalTarget(tab);
    setModalMode('edit');
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  // Submit Modal (Create / Update)
  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      if (modalTarget === 'provinsi') {
        if (modalMode === 'create') {
          await wilayahApi.createProvinsi(formData);
          showToast('Data Provinsi berhasil ditambahkan');
        } else {
          await wilayahApi.updateProvinsi(formData.id, formData);
          showToast('Data Provinsi berhasil diperbarui');
        }
        await fetchProvinsi();
      } else if (modalTarget === 'kabupaten') {
        if (modalMode === 'create') {
          await wilayahApi.createKabupaten(formData);
          showToast('Data Kabupaten/Kota berhasil ditambahkan');
        } else {
          await wilayahApi.updateKabupaten(formData.id, formData);
          showToast('Data Kabupaten/Kota berhasil diperbarui');
        }
        await fetchKabupaten();
      } else if (modalTarget === 'kecamatan') {
        if (modalMode === 'create') {
          await wilayahApi.createKecamatan(formData);
          showToast('Data Kecamatan berhasil ditambahkan');
        } else {
          await wilayahApi.updateKecamatan(formData.id, formData);
          showToast('Data Kecamatan berhasil diperbarui');
        }
        await fetchKecamatan();
      } else if (modalTarget === 'desa') {
        if (modalMode === 'create') {
          await wilayahApi.createDesa(formData);
          showToast('Data Desa/Kelurahan berhasil ditambahkan');
        } else {
          await wilayahApi.updateDesa(formData.id, formData);
          showToast('Data Desa/Kelurahan berhasil diperbarui');
        }
        await fetchDesa();
      } else if (modalTarget === 'kodepos') {
        if (modalMode === 'create') {
          await wilayahApi.createKodePos(formData);
          showToast('Data Kode Pos berhasil ditambahkan');
        } else {
          await wilayahApi.updateKodePos(formData.id, formData);
          showToast('Data Kode Pos berhasil diperbarui');
        }
        await fetchKodePos();
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving data:', err);
      showToast(err.response?.data?.message || 'Gagal menyimpan data.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Execute Delete
  const handleExecuteDelete = async () => {
    if (!deleteConfirm.id) return;
    setActionLoading(true);
    try {
      const { tab, id } = deleteConfirm;
      if (tab === 'provinsi') {
        await wilayahApi.deleteProvinsi(id);
        await fetchProvinsi();
      } else if (tab === 'kabupaten') {
        await wilayahApi.deleteKabupaten(id);
        await fetchKabupaten();
      } else if (tab === 'kecamatan') {
        await wilayahApi.deleteKecamatan(id);
        await fetchKecamatan();
      } else if (tab === 'desa') {
        await wilayahApi.deleteDesa(id);
        await fetchDesa();
      } else if (tab === 'kodepos') {
        await wilayahApi.deleteKodePos(id);
        await fetchKodePos();
      }
      showToast(`${deleteConfirm.title} berhasil dihapus`);
      setDeleteConfirm({ isOpen: false, tab: 'provinsi', id: 0, title: '' });
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menghapus data.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Lists for Searching
  const filteredProvinsi = useMemo(() => {
    return provinsiList.filter(
      (p) =>
        p.nama_provinsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.kode_provinsi.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [provinsiList, searchQuery]);

  const filteredKabupaten = useMemo(() => {
    return kabupatenList.filter(
      (k) =>
        k.nama_kabupaten.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.kode_kabupaten.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [kabupatenList, searchQuery]);

  const filteredKecamatan = useMemo(() => {
    return kecamatanList.filter(
      (kc) =>
        kc.nama_kecamatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kc.kode_kecamatan.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [kecamatanList, searchQuery]);

  const filteredDesa = useMemo(() => {
    return desaList.filter(
      (d) =>
        d.nama_desa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.kode_desa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.kode_pos && d.kode_pos.includes(searchQuery))
    );
  }, [desaList, searchQuery]);

  const filteredKodePos = useMemo(() => {
    return kodePosList.filter(
      (kp) =>
        kp.kode_pos.includes(searchQuery) ||
        (kp.keterangan && kp.keterangan.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (kp.desa?.nama_desa && kp.desa.nama_desa.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [kodePosList, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold text-white transition-all transform animate-in slide-in-from-top-2 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            Master Data & Pengaturan SIMRS
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Master Wilayah & Kode Pos Indonesia
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen hierarki administratif: Provinsi, Kabupaten/Kota, Kecamatan, Desa/Kelurahan, dan Kode Pos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshActiveTabData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Segarkan
          </button>
          <button
            onClick={() => openCreateModal(activeTab)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah{' '}
            {activeTab === 'provinsi'
              ? 'Provinsi'
              : activeTab === 'kabupaten'
              ? 'Kab/Kota'
              : activeTab === 'kecamatan'
              ? 'Kecamatan'
              : activeTab === 'desa'
              ? 'Desa/Kel'
              : 'Kode Pos'}
          </button>
        </div>
      </div>

      {/* Instant Postal Code Lookup Hero Widget */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-700 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
              <Compass className="w-3.5 h-3.5" />
              Fitur Cepat
            </span>
            <h2 className="text-base font-bold">Pencarian Instan Wilayah Lewat Kode Pos</h2>
            <p className="text-xs text-sky-100 max-w-xl">
              Ketik 5 digit kode pos untuk langsung melacak rantai administrasi (Provinsi, Kabupaten, Kecamatan, hingga Desa)
            </p>
          </div>

          <form onSubmit={handlePostalLookup} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                maxLength={5}
                value={postalSearchInput}
                onChange={(e) => setPostalSearchInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Contoh: 55281 / 10110"
                className="w-full pl-3.5 pr-9 py-2 rounded-xl bg-white/10 placeholder-sky-200 border border-white/20 text-white text-xs font-mono focus:outline-none focus:bg-white/20 focus:border-white transition"
              />
              <Search className="w-3.5 h-3.5 text-sky-200 absolute right-3 top-3" />
            </div>
            <button
              type="submit"
              disabled={postalLookupLoading || !postalSearchInput}
              className="px-4 py-2 rounded-xl bg-white text-sky-700 hover:bg-sky-50 text-xs font-bold transition shadow-xs shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {postalLookupLoading ? 'Mencari...' : 'Lacak Wilayah'}
            </button>
          </form>
        </div>

        {/* Lookup Error Message */}
        {postalLookupError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/20 border border-rose-300/30 text-rose-100 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-300" />
            <span>{postalLookupError}</span>
          </div>
        )}

        {/* Lookup Results Card */}
        {postalLookupResult && (
          <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
            <div className="text-[11px] font-bold text-sky-200 uppercase tracking-wider">
              Ditemukan {postalLookupResult.length} Hasil Pemetaan untuk Kode Pos {postalSearchInput}:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {postalLookupResult.map((res: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">
                      {res.desa?.nama_desa || 'Semua Desa'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/20 text-white">
                      {res.desa?.tipe || 'DESA'}
                    </span>
                  </div>
                  <div className="text-sky-100 flex items-center gap-1.5 flex-wrap">
                    <span>Kec. {res.kecamatan?.nama_kecamatan}</span>
                    <ArrowRight className="w-3 h-3 opacity-60" />
                    <span>{res.kabupaten?.nama_kabupaten}</span>
                    <ArrowRight className="w-3 h-3 opacity-60" />
                    <span className="font-semibold text-white">{res.provinsi?.nama_provinsi}</span>
                  </div>
                  {res.keterangan && (
                    <p className="text-[11px] text-sky-200/80 italic mt-0.5">
                      Catatan: {res.keterangan}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 overflow-x-auto">
        {[
          { key: 'provinsi', label: '1. Provinsi', count: provinsiList.length },
          { key: 'kabupaten', label: '2. Kabupaten / Kota', count: kabupatenList.length },
          { key: 'kecamatan', label: '3. Kecamatan', count: kecamatanList.length },
          { key: 'desa', label: '4. Desa / Kelurahan', count: desaList.length },
          { key: 'kodepos', label: '5. Master Kode Pos', count: kodePosList.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key as TabType);
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
                activeTab === tab.key
                  ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Cascading Filter Bar for Sub-units */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Provinsi filter */}
          {activeTab !== 'provinsi' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Provinsi:</span>
              <select
                value={selectedProvinsiId}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : '';
                  setSelectedProvinsiId(val);
                  setSelectedKabupatenId('');
                  setSelectedKecamatanId('');
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="">Semua Provinsi</option>
                {provinsiList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.kode_provinsi} - {p.nama_provinsi}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Kabupaten filter */}
          {(activeTab === 'kecamatan' || activeTab === 'desa' || activeTab === 'kodepos') && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Kabupaten/Kota:</span>
              <select
                value={selectedKabupatenId}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : '';
                  setSelectedKabupatenId(val);
                  setSelectedKecamatanId('');
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="">Semua Kab/Kota</option>
                {kabupatenList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.tipe} {k.nama_kabupaten}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Kecamatan filter */}
          {activeTab === 'desa' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Kecamatan:</span>
              <select
                value={selectedKecamatanId}
                onChange={(e) => setSelectedKecamatanId(e.target.value ? Number(e.target.value) : '')}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="">Semua Kecamatan</option>
                {kecamatanList.map((kc) => (
                  <option key={kc.id} value={kc.id}>
                    {kc.nama_kecamatan}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tipe Kabupaten filter */}
          {activeTab === 'kabupaten' && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['ALL', 'KABUPATEN', 'KOTA'] as const).map((tipe) => (
                <button
                  key={tipe}
                  onClick={() => setFilterTipeKab(tipe)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    filterTipeKab === tipe
                      ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tipe === 'ALL' ? 'Semua' : tipe}
                </button>
              ))}
            </div>
          )}

          {/* Tipe Desa filter */}
          {activeTab === 'desa' && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['ALL', 'DESA', 'KELURAHAN'] as const).map((tipe) => (
                <button
                  key={tipe}
                  onClick={() => setFilterTipeDesa(tipe)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    filterTipeDesa === tipe
                      ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tipe === 'ALL' ? 'Semua' : tipe}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search input in table */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Cari dalam tab ${activeTab}...`}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
            Memuat data wilayah...
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* 1. TAB PROVINSI */}
            {activeTab === 'provinsi' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Kode</th>
                    <th className="px-5 py-3.5">Nama Provinsi</th>
                    <th className="px-5 py-3.5">Kabupaten / Kota Terkait</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredProvinsi.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                        Tidak ada data provinsi.
                      </td>
                    </tr>
                  ) : (
                    filteredProvinsi.map((prov) => (
                      <tr key={prov.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                        <td className="px-5 py-3.5 font-mono font-bold text-sky-600 dark:text-sky-400">
                          {prov.kode_provinsi}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                          {prov.nama_provinsi}
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => {
                              setSelectedProvinsiId(prov.id);
                              setActiveTab('kabupaten');
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition font-semibold"
                          >
                            <span>{prov.kabupaten_kota?.length || 0} Kab/Kota</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              prov.is_active
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {prov.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal('provinsi', prov)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-slate-100 transition"
                              title="Edit Provinsi"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  isOpen: true,
                                  tab: 'provinsi',
                                  id: prov.id,
                                  title: `Provinsi ${prov.nama_provinsi}`,
                                })
                              }
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Hapus Provinsi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* 2. TAB KABUPATEN / KOTA */}
            {activeTab === 'kabupaten' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Kode</th>
                    <th className="px-5 py-3.5">Tipe</th>
                    <th className="px-5 py-3.5">Nama Kabupaten/Kota</th>
                    <th className="px-5 py-3.5">Provinsi Induk</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredKabupaten.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                        Tidak ada data kabupaten/kota.
                      </td>
                    </tr>
                  ) : (
                    filteredKabupaten.map((kab) => (
                      <tr key={kab.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                        <td className="px-5 py-3.5 font-mono font-bold text-sky-600 dark:text-sky-400">
                          {kab.kode_kabupaten}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              kab.tipe === 'KOTA'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            }`}
                          >
                            {kab.tipe}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                          {kab.nama_kabupaten}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                          {kab.provinsi?.nama_provinsi || '-'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              kab.is_active
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {kab.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedKabupatenId(kab.id);
                                setActiveTab('kecamatan');
                              }}
                              className="px-2 py-1 rounded-lg text-[11px] font-semibold text-sky-600 hover:bg-sky-50 transition"
                              title="Lihat Kecamatan"
                            >
                              Kecamatan &rarr;
                            </button>
                            <button
                              onClick={() => openEditModal('kabupaten', kab)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-slate-100 transition"
                              title="Edit Kabupaten"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  isOpen: true,
                                  tab: 'kabupaten',
                                  id: kab.id,
                                  title: `${kab.tipe} ${kab.nama_kabupaten}`,
                                })
                              }
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Hapus Kabupaten"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* 3. TAB KECAMATAN */}
            {activeTab === 'kecamatan' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Kode</th>
                    <th className="px-5 py-3.5">Nama Kecamatan</th>
                    <th className="px-5 py-3.5">Kabupaten / Kota Induk</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredKecamatan.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                        Tidak ada data kecamatan.
                      </td>
                    </tr>
                  ) : (
                    filteredKecamatan.map((kec) => (
                      <tr key={kec.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                        <td className="px-5 py-3.5 font-mono font-bold text-sky-600 dark:text-sky-400">
                          {kec.kode_kecamatan}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                          {kec.nama_kecamatan}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                          {kec.kabupaten ? `${kec.kabupaten.tipe} ${kec.kabupaten.nama_kabupaten}` : '-'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              kec.is_active
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {kec.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedKecamatanId(kec.id);
                                setActiveTab('desa');
                              }}
                              className="px-2 py-1 rounded-lg text-[11px] font-semibold text-sky-600 hover:bg-sky-50 transition"
                              title="Lihat Desa/Kelurahan"
                            >
                              Desa &rarr;
                            </button>
                            <button
                              onClick={() => openEditModal('kecamatan', kec)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-slate-100 transition"
                              title="Edit Kecamatan"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  isOpen: true,
                                  tab: 'kecamatan',
                                  id: kec.id,
                                  title: `Kecamatan ${kec.nama_kecamatan}`,
                                })
                              }
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Hapus Kecamatan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* 4. TAB DESA / KELURAHAN */}
            {activeTab === 'desa' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Kode</th>
                    <th className="px-5 py-3.5">Tipe</th>
                    <th className="px-5 py-3.5">Nama Desa/Kelurahan</th>
                    <th className="px-5 py-3.5">Kecamatan Induk</th>
                    <th className="px-5 py-3.5">Kode Pos</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredDesa.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                        Tidak ada data desa/kelurahan.
                      </td>
                    </tr>
                  ) : (
                    filteredDesa.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                        <td className="px-5 py-3.5 font-mono font-bold text-sky-600 dark:text-sky-400">
                          {d.kode_desa}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              d.tipe === 'KELURAHAN'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            }`}
                          >
                            {d.tipe}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                          {d.nama_desa}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                          Kec. {d.kecamatan?.nama_kecamatan || '-'}
                        </td>
                        <td className="px-5 py-3.5 font-mono font-semibold text-slate-700 dark:text-slate-200">
                          {d.kode_pos || '-'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              d.is_active
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {d.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal('desa', d)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-slate-100 transition"
                              title="Edit Desa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  isOpen: true,
                                  tab: 'desa',
                                  id: d.id,
                                  title: `${d.tipe} ${d.nama_desa}`,
                                })
                              }
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Hapus Desa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* 5. TAB KODE POS */}
            {activeTab === 'kodepos' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Kode Pos</th>
                    <th className="px-5 py-3.5">Desa / Kelurahan</th>
                    <th className="px-5 py-3.5">Kecamatan</th>
                    <th className="px-5 py-3.5">Kabupaten / Kota</th>
                    <th className="px-5 py-3.5">Provinsi</th>
                    <th className="px-5 py-3.5">Keterangan</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredKodePos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                        Tidak ada data kode pos.
                      </td>
                    </tr>
                  ) : (
                    filteredKodePos.map((kp) => (
                      <tr key={kp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                        <td className="px-5 py-3.5 font-mono font-bold text-base text-sky-600 dark:text-sky-400">
                          {kp.kode_pos}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                          {kp.desa?.nama_desa || '-'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                          {kp.kecamatan?.nama_kecamatan || '-'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                          {kp.kabupaten ? `${kp.kabupaten.tipe} ${kp.kabupaten.nama_kabupaten}` : '-'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                          {kp.provinsi?.nama_provinsi || '-'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 italic">
                          {kp.keterangan || '-'}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal('kodepos', kp)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-slate-100 transition"
                              title="Edit Kode Pos"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  isOpen: true,
                                  tab: 'kodepos',
                                  id: kp.id,
                                  title: `Kode Pos ${kp.kode_pos}`,
                                })
                              }
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Hapus Kode Pos"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* MODAL TAMBAH / EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {modalMode === 'create' ? 'Tambah Data' : 'Ubah Data'}{' '}
                  {modalTarget === 'provinsi'
                    ? 'Provinsi'
                    : modalTarget === 'kabupaten'
                    ? 'Kabupaten / Kota'
                    : modalTarget === 'kecamatan'
                    ? 'Kecamatan'
                    : modalTarget === 'desa'
                    ? 'Desa / Kelurahan'
                    : 'Kode Pos'}
                </h3>
                <p className="text-xs text-slate-500">
                  Lengkapi isian formulir di bawah ini dengan valid
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="p-5 space-y-4">
              {/* FORM FIELDS PROVINSI */}
              {modalTarget === 'provinsi' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kode Provinsi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.kode_provinsi || ''}
                      onChange={(e) => setFormData({ ...formData, kode_provinsi: e.target.value })}
                      placeholder="Contoh: 31 (DKI Jakarta), 32 (Jawa Barat)"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Provinsi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nama_provinsi || ''}
                      onChange={(e) => setFormData({ ...formData, nama_provinsi: e.target.value })}
                      placeholder="Contoh: JAWA BARAT"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs uppercase focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </>
              )}

              {/* FORM FIELDS KABUPATEN */}
              {modalTarget === 'kabupaten' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Provinsi Induk <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.provinsi_id || ''}
                      onChange={(e) => setFormData({ ...formData, provinsi_id: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
                    >
                      <option value="">Pilih Provinsi Induk</option>
                      {provinsiList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.kode_provinsi} - {p.nama_provinsi}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tipe Wilayah
                      </label>
                      <select
                        value={formData.tipe || 'KABUPATEN'}
                        onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
                      >
                        <option value="KABUPATEN">KABUPATEN</option>
                        <option value="KOTA">KOTA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Kode Kab/Kota <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.kode_kabupaten || ''}
                        onChange={(e) => setFormData({ ...formData, kode_kabupaten: e.target.value })}
                        placeholder="Contoh: 32.01"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Kabupaten/Kota <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nama_kabupaten || ''}
                      onChange={(e) => setFormData({ ...formData, nama_kabupaten: e.target.value })}
                      placeholder="Contoh: KABUPATEN BOGOR / KOTA BANDUNG"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs uppercase focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </>
              )}

              {/* FORM FIELDS KECAMATAN */}
              {modalTarget === 'kecamatan' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kabupaten / Kota Induk <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.kabupaten_id || ''}
                      onChange={(e) => setFormData({ ...formData, kabupaten_id: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
                    >
                      <option value="">Pilih Kabupaten/Kota</option>
                      {kabupatenList.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.tipe} {k.nama_kabupaten} ({k.provinsi?.nama_provinsi})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kode Kecamatan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.kode_kecamatan || ''}
                      onChange={(e) => setFormData({ ...formData, kode_kecamatan: e.target.value })}
                      placeholder="Contoh: 32.01.01"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Kecamatan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nama_kecamatan || ''}
                      onChange={(e) => setFormData({ ...formData, nama_kecamatan: e.target.value })}
                      placeholder="Contoh: CIBINONG"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs uppercase focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </>
              )}

              {/* FORM FIELDS DESA / KELURAHAN */}
              {modalTarget === 'desa' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kecamatan Induk <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.kecamatan_id || ''}
                      onChange={(e) => setFormData({ ...formData, kecamatan_id: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
                    >
                      <option value="">Pilih Kecamatan</option>
                      {kecamatanList.map((kc) => (
                        <option key={kc.id} value={kc.id}>
                          Kec. {kc.nama_kecamatan}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tipe
                      </label>
                      <select
                        value={formData.tipe || 'DESA'}
                        onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
                      >
                        <option value="DESA">DESA</option>
                        <option value="KELURAHAN">KELURAHAN</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Kode Desa/Kelurahan <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.kode_desa || ''}
                        onChange={(e) => setFormData({ ...formData, kode_desa: e.target.value })}
                        placeholder="Contoh: 32.01.01.2001"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Desa / Kelurahan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nama_desa || ''}
                      onChange={(e) => setFormData({ ...formData, nama_desa: e.target.value })}
                      placeholder="Contoh: PABUARAN"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs uppercase focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kode Pos Default
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={formData.kode_pos || ''}
                      onChange={(e) => setFormData({ ...formData, kode_pos: e.target.value.replace(/\D/g, '') })}
                      placeholder="Contoh: 16916"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </>
              )}

              {/* FORM FIELDS KODE POS */}
              {modalTarget === 'kodepos' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      5-Digit Kode Pos <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={formData.kode_pos || ''}
                      onChange={(e) => setFormData({ ...formData, kode_pos: e.target.value.replace(/\D/g, '') })}
                      placeholder="Contoh: 55281"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-bold focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Provinsi
                      </label>
                      <select
                        value={formData.provinsi_id || ''}
                        onChange={(e) => setFormData({ ...formData, provinsi_id: e.target.value ? Number(e.target.value) : null })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
                      >
                        <option value="">Pilih Provinsi</option>
                        {provinsiList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nama_provinsi}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Kabupaten / Kota
                      </label>
                      <select
                        value={formData.kabupaten_id || ''}
                        onChange={(e) => setFormData({ ...formData, kabupaten_id: e.target.value ? Number(e.target.value) : null })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
                      >
                        <option value="">Pilih Kab/Kota</option>
                        {kabupatenList.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.tipe} {k.nama_kabupaten}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Keterangan / Wilayah Cakupan
                    </label>
                    <input
                      type="text"
                      value={formData.keterangan || ''}
                      onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                      placeholder="Contoh: Area Kampus UGM & Caturtunggal"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </>
              )}

              {/* Status Aktif Switch */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active_toggle"
                  checked={formData.is_active ?? true}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="is_active_toggle" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Data Wilayah Aktif untuk Pendaftaran Pasien
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 mx-auto flex items-center justify-center shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Konfirmasi Hapus
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus <span className="font-bold text-slate-700 dark:text-slate-300">{deleteConfirm.title}</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ isOpen: false, tab: 'provinsi', id: 0, title: '' })}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
