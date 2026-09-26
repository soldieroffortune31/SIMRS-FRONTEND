'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { wilayahApi, pendaftaranApi, masterApi } from '@/lib/api';
import {
  Pasien,
  JadwalDokter,
  PendaftaranRawatJalan,
  Provinsi,
  KabupatenKota,
  Kecamatan,
  DesaKelurahan,
  StatusAntrean,
  JenisPenjamin,
} from '@/lib/types';
import {
  UserPlus,
  Users,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Printer,
  ChevronRight,
  Shield,
  FileText,
  MapPin,
  Phone,
  CreditCard,
  Stethoscope,
  Building,
  UserCheck,
  Check,
  X,
  Volume2,
  Eye,
  Filter,
} from 'lucide-react';

export default function PendaftaranRawatJalanPage() {
  const { activeContext } = useAuth();

  // Active top-level Tab: 'registrasi' | 'antrean-hari-ini' | 'master-pasien'
  const [activeMainTab, setActiveMainTab] = useState<'registrasi' | 'antrean-hari-ini' | 'master-pasien'>('registrasi');

  // Mode Pendaftaran: 'LAMA' | 'BARU'
  const [tipePasien, setTipePasien] = useState<'LAMA' | 'BARU'>('LAMA');

  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPasienSearch, setIsLoadingPasienSearch] = useState(false);
  const [isLoadingJadwal, setIsLoadingJadwal] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // =========================================================
  // PASIEN LAMA SEARCH & SELECTION
  // =========================================================
  const [searchPasienQuery, setSearchPasienQuery] = useState('');
  const [pasienSearchResults, setPasienSearchResults] = useState<Pasien[]>([]);
  const [selectedPasienLama, setSelectedPasienLama] = useState<Pasien | null>(null);

  // Search existing patients with debounce
  useEffect(() => {
    if (!searchPasienQuery || searchPasienQuery.trim().length < 2) {
      setPasienSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingPasienSearch(true);
      try {
        const res: any = await pendaftaranApi.getAllPasien({ search: searchPasienQuery.trim(), limit: 10 });
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.rows)
          ? res.rows
          : Array.isArray(res)
          ? res
          : [];
        setPasienSearchResults(list);
      } catch (err) {
        console.error('Error searching pasien:', err);
      } finally {
        setIsLoadingPasienSearch(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchPasienQuery]);

  // =========================================================
  // PASIEN BARU FORM & WILAYAH INTEGRATION
  // =========================================================
  const [pasienBaruForm, setPasienBaruForm] = useState({
    nik: '',
    nama_lengkap: '',
    jenis_kelamin: 'L' as 'L' | 'P',
    tempat_lahir: '',
    tanggal_lahir: '',
    golongan_darah: 'TIDAK_TAHU',
    agama: 'ISLAM',
    status_pernikahan: 'BELUM_MENIKAH',
    pendidikan: 'SMA',
    pekerjaan: 'Swasta',
    no_telepon: '',
    email: '',
    alamat_lengkap: '',
    rt: '',
    rw: '',
    provinsi_id: '' as number | '',
    kabupaten_id: '' as number | '',
    kecamatan_id: '' as number | '',
    desa_id: '' as number | '',
    kode_pos: '',
    nama_penanggung_jawab: '',
    hubungan_penanggung_jawab: 'ORANG_TUA',
    telepon_penanggung_jawab: '',
  });

  // Master Wilayah Data Options for Cascading Dropdowns
  const [provinsiOptions, setProvinsiOptions] = useState<Provinsi[]>([]);
  const [kabupatenOptions, setKabupatenOptions] = useState<KabupatenKota[]>([]);
  const [kecamatanOptions, setKecamatanOptions] = useState<Kecamatan[]>([]);
  const [desaOptions, setDesaOptions] = useState<DesaKelurahan[]>([]);

  // Instant Kodepos Lookup in Pasien Baru
  const [kodeposLookupLoading, setKodeposLookupLoading] = useState(false);
  const [kodeposLookupMessage, setKodeposLookupMessage] = useState<string | null>(null);

  // 1. Fetch Provinsi List on mount
  useEffect(() => {
    const loadProvinsi = async () => {
      try {
        const res = await wilayahApi.getProvinsi();
        if (res.data) {
          setProvinsiOptions(Array.isArray(res.data) ? res.data : res.data.rows || []);
        }
      } catch (err) {
        console.error('Failed to load provinsi:', err);
      }
    };
    loadProvinsi();
  }, []);

  // 2. Fetch Kabupaten when provinsi_id changes
  useEffect(() => {
    if (!pasienBaruForm.provinsi_id) {
      setKabupatenOptions([]);
      return;
    }
    const loadKabupaten = async () => {
      try {
        const res = await wilayahApi.getKabupaten({ provinsi_id: Number(pasienBaruForm.provinsi_id) });
        if (res.data) {
          setKabupatenOptions(Array.isArray(res.data) ? res.data : res.data.rows || []);
        }
      } catch (err) {
        console.error('Failed to load kabupaten:', err);
      }
    };
    loadKabupaten();
  }, [pasienBaruForm.provinsi_id]);

  // 3. Fetch Kecamatan when kabupaten_id changes
  useEffect(() => {
    if (!pasienBaruForm.kabupaten_id) {
      setKecamatanOptions([]);
      return;
    }
    const loadKecamatan = async () => {
      try {
        const res = await wilayahApi.getKecamatan({ kabupaten_id: Number(pasienBaruForm.kabupaten_id) });
        if (res.data) {
          setKecamatanOptions(Array.isArray(res.data) ? res.data : res.data.rows || []);
        }
      } catch (err) {
        console.error('Failed to load kecamatan:', err);
      }
    };
    loadKecamatan();
  }, [pasienBaruForm.kabupaten_id]);

  // 4. Fetch Desa when kecamatan_id changes
  useEffect(() => {
    if (!pasienBaruForm.kecamatan_id) {
      setDesaOptions([]);
      return;
    }
    const loadDesa = async () => {
      try {
        const res = await wilayahApi.getDesa({ kecamatan_id: Number(pasienBaruForm.kecamatan_id) });
        if (res.data) {
          setDesaOptions(Array.isArray(res.data) ? res.data : res.data.rows || []);
        }
      } catch (err) {
        console.error('Failed to load desa:', err);
      }
    };
    loadDesa();
  }, [pasienBaruForm.kecamatan_id]);

  // Quick Kodepos Lookup Handler: auto-fill Provinsi, Kabupaten, Kecamatan, Desa
  const handleQuickKodeposLookup = async () => {
    const code = pasienBaruForm.kode_pos.trim();
    if (code.length < 5) {
      setKodeposLookupMessage('Masukkan 5 digit kode pos terlebih dahulu.');
      return;
    }
    setKodeposLookupLoading(true);
    setKodeposLookupMessage(null);

    try {
      const res = await wilayahApi.searchKodePos(code);
      if (res.data && res.data.length > 0) {
        const matched = res.data[0];
        // Populate form with matched administrative hierarchy
        setPasienBaruForm((prev) => ({
          ...prev,
          provinsi_id: matched.provinsi_id || prev.provinsi_id,
          kabupaten_id: matched.kabupaten_id || prev.kabupaten_id,
          kecamatan_id: matched.kecamatan_id || prev.kecamatan_id,
          desa_id: matched.desa_id || prev.desa_id,
        }));
        setKodeposLookupMessage(
          `Wilayah ditemukan: ${matched.desa?.nama_desa || ''}, Kec. ${matched.kecamatan?.nama_kecamatan || ''}, ${matched.kabupaten?.nama_kabupaten || ''}`
        );
      } else {
        setKodeposLookupMessage(`Kode pos ${code} belum terdaftar di master database.`);
      }
    } catch (err: any) {
      setKodeposLookupMessage('Gagal mencari kode pos.');
    } finally {
      setKodeposLookupLoading(false);
    }
  };

  // =========================================================
  // KUNJUNGAN, POLIKLINIK & JADWAL DOKTER SELECTION
  // =========================================================
  const [tanggalKunjungan, setTanggalKunjungan] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [ruanganPoliklinikList, setRuanganPoliklinikList] = useState<any[]>([]);
  const [selectedRuanganId, setSelectedRuanganId] = useState<number | ''>(() => {
    // If active context is IRJ, default to active ruangan
    const activeRId = activeContext?.ruangan?.ruangan_id ?? activeContext?.ruangan?.id;
    if (activeContext?.instalasi.kode === 'IRJ' && activeRId) {
      return activeRId;
    }
    return 101; // default Poli Penyakit Dalam
  });

  const [jadwalList, setJadwalList] = useState<JadwalDokter[]>([]);
  const [selectedJadwalId, setSelectedJadwalId] = useState<number | ''>('');

  // Penjamin & Detail Kunjungan
  const [jenisPenjamin, setJenisPenjamin] = useState<JenisPenjamin>('UMUM');
  const [noKartuPenjamin, setNoKartuPenjamin] = useState('');
  const [keluhanUtama, setKeluhanUtama] = useState('');
  const [catatanKunjungan, setCatatanKunjungan] = useState('');

  // 1. Fetch Daftar Poliklinik (Ruangan under IRJ)
  useEffect(() => {
    const loadPoliRuangan = async () => {
      try {
        const res = await masterApi.getRuangan(1); // 1 = Instalasi Rawat Jalan
        if (res.data) {
          setRuanganPoliklinikList(res.data);
        }
      } catch (err) {
        console.error('Failed to load ruangan poli:', err);
      }
    };
    loadPoliRuangan();
  }, []);

  // 2. Fetch Jadwal Dokter based on selectedRuanganId and hari from tanggalKunjungan
  const fetchJadwalDokter = useCallback(async () => {
    if (!selectedRuanganId) return;
    setIsLoadingJadwal(true);

    try {
      // Calculate day of week in Indonesian
      const dateObj = new Date(tanggalKunjungan);
      const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
      const dayName = days[dateObj.getDay()];

      const res = await pendaftaranApi.getAllJadwalDokter({
        ruangan_id: Number(selectedRuanganId),
        hari: dayName,
        is_active: true,
      });

      if (res.data && res.data.length > 0) {
        setJadwalList(res.data);
        const jId = res.data[0].jadwaldokter_id ?? res.data[0].jadwal_dokter_id ?? res.data[0].id ?? '';
        setSelectedJadwalId(jId);
      } else {
        // Fallback: fetch any active schedule for this room
        const fallbackRes = await pendaftaranApi.getAllJadwalDokter({
          ruangan_id: Number(selectedRuanganId),
          is_active: true,
        });
        if (fallbackRes.data && fallbackRes.data.length > 0) {
          setJadwalList(fallbackRes.data);
          const fId = fallbackRes.data[0].jadwaldokter_id ?? fallbackRes.data[0].jadwal_dokter_id ?? fallbackRes.data[0].id ?? '';
          setSelectedJadwalId(fId);
        } else {
          setJadwalList([]);
          setSelectedJadwalId('');
        }
      }
    } catch (err) {
      console.error('Failed to load jadwal dokter:', err);
    } finally {
      setIsLoadingJadwal(false);
    }
  }, [selectedRuanganId, tanggalKunjungan]);

  useEffect(() => {
    fetchJadwalDokter();
  }, [fetchJadwalDokter]);

  // Update penjamin if pasien lama has default
  useEffect(() => {
    if (tipePasien === 'LAMA' && selectedPasienLama) {
      if (selectedPasienLama.jenis_penjamin_default) {
        setJenisPenjamin(selectedPasienLama.jenis_penjamin_default);
      }
      if (selectedPasienLama.no_kartu_penjamin_default) {
        setNoKartuPenjamin(selectedPasienLama.no_kartu_penjamin_default);
      }
    }
  }, [selectedPasienLama, tipePasien]);

  // =========================================================
  // SUBMISSION & SUCCESS TICKET MODAL
  // =========================================================
  const [successModalData, setSuccessModalData] = useState<PendaftaranRawatJalan | null>(null);

  const handleSubmitPendaftaran = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedJadwalId) {
      showToast('Harap pilih jadwal dokter poliklinik.', 'error');
      return;
    }

    if (tipePasien === 'LAMA' && !selectedPasienLama) {
      showToast('Harap cari dan pilih pasien lama yang terdaftar.', 'error');
      return;
    }

    if (tipePasien === 'BARU') {
      if (!pasienBaruForm.nama_lengkap || !pasienBaruForm.tempat_lahir || !pasienBaruForm.tanggal_lahir || !pasienBaruForm.alamat_lengkap) {
        showToast('Lengkapi data wajib identitas pasien baru.', 'error');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        tipe_pasien: tipePasien,
        jadwal_dokter_id: Number(selectedJadwalId),
        jadwaldokter_id: Number(selectedJadwalId),
        tanggal_kunjungan: tanggalKunjungan,
        jenis_penjamin: jenisPenjamin,
        no_kartu_penjamin: noKartuPenjamin || null,
        keluhan_utama: keluhanUtama || null,
        catatan: catatanKunjungan || null,
      };

      if (tipePasien === 'LAMA') {
        payload.pasien_id = Number(selectedPasienLama!.pasien_id ?? selectedPasienLama!.id);
      } else {
        payload.pasien_baru = {
          ...pasienBaruForm,
          nik: pasienBaruForm.nik?.trim() || null,
          email: pasienBaruForm.email?.trim() || null,
          no_telepon: pasienBaruForm.no_telepon?.trim() || null,
          rt: pasienBaruForm.rt?.trim() || null,
          rw: pasienBaruForm.rw?.trim() || null,
          kode_pos: pasienBaruForm.kode_pos?.trim() || null,
          nama_penanggung_jawab: pasienBaruForm.nama_penanggung_jawab?.trim() || null,
          telepon_penanggung_jawab: pasienBaruForm.telepon_penanggung_jawab?.trim() || null,
          provinsi_id: pasienBaruForm.provinsi_id ? Number(pasienBaruForm.provinsi_id) : null,
          kabupaten_id: pasienBaruForm.kabupaten_id ? Number(pasienBaruForm.kabupaten_id) : null,
          kecamatan_id: pasienBaruForm.kecamatan_id ? Number(pasienBaruForm.kecamatan_id) : null,
          desa_id: pasienBaruForm.desa_id ? Number(pasienBaruForm.desa_id) : null,
        };
      }

      const res = await pendaftaranApi.daftarRawatJalan(payload);

      if (res.data) {
        setSuccessModalData(res.data);
        showToast('Pendaftaran Rawat Jalan berhasil dibuat!');
        // Refresh today's queue list
        fetchTodayQueue();
      }
    } catch (err: any) {
      console.error('Error pendaftaran rawat jalan:', err);
      showToast(err.response?.data?.message || 'Gagal melakukan pendaftaran rawat jalan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form for next patient
  const handleResetForNext = () => {
    setSuccessModalData(null);
    setSelectedPasienLama(null);
    setSearchPasienQuery('');
    setKeluhanUtama('');
    setCatatanKunjungan('');
    setPasienBaruForm({
      nik: '',
      nama_lengkap: '',
      jenis_kelamin: 'L',
      tempat_lahir: '',
      tanggal_lahir: '',
      golongan_darah: 'TIDAK_TAHU',
      agama: 'ISLAM',
      status_pernikahan: 'BELUM_MENIKAH',
      pendidikan: 'SMA',
      pekerjaan: 'Swasta',
      no_telepon: '',
      email: '',
      alamat_lengkap: '',
      rt: '',
      rw: '',
      provinsi_id: '',
      kabupaten_id: '',
      kecamatan_id: '',
      desa_id: '',
      kode_pos: '',
      nama_penanggung_jawab: '',
      hubungan_penanggung_jawab: 'ORANG_TUA',
      telepon_penanggung_jawab: '',
    });
  };

  // =========================================================
  // TAB 2: DAFTAR KUNJUNGAN HARI INI
  // =========================================================
  const [todayQueueList, setTodayQueueList] = useState<PendaftaranRawatJalan[]>([]);
  const [filterQueueStatus, setFilterQueueStatus] = useState<string>('ALL');
  const [queueLoading, setQueueLoading] = useState(false);
  const [calledAudioPatient, setCalledAudioPatient] = useState<string | null>(null);

  const fetchTodayQueue = useCallback(async () => {
    setQueueLoading(true);
    try {
      const params: any = { tanggal_kunjungan: tanggalKunjungan };
      if (selectedRuanganId) params.ruangan_id = Number(selectedRuanganId);
      if (filterQueueStatus !== 'ALL') params.status_antrean = filterQueueStatus;
      const res: any = await pendaftaranApi.getAllPendaftaran(params);
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.rows)
        ? res.rows
        : Array.isArray(res)
        ? res
        : [];
      setTodayQueueList(list);
    } catch (err) {
      console.error('Error fetching today queue:', err);
    } finally {
      setQueueLoading(false);
    }
  }, [tanggalKunjungan, selectedRuanganId, filterQueueStatus]);

  useEffect(() => {
    if (activeMainTab === 'antrean-hari-ini') {
      fetchTodayQueue();
    }
  }, [activeMainTab, fetchTodayQueue]);

  // Update queue status handler (e.g. MENUNGGU -> DIPANGGIL -> SEDANG_DILAYANI -> SELESAI)
  const handleUpdateStatus = async (id: number, nextStatus: StatusAntrean) => {
    try {
      await pendaftaranApi.updateStatusPendaftaran(id, nextStatus);
      showToast(`Status pasien diperbarui menjadi ${nextStatus}`);
      fetchTodayQueue();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal mengubah status antrean.', 'error');
    }
  };

  const handleSpeakerCall = (item: PendaftaranRawatJalan) => {
    setCalledAudioPatient(item.no_antrean);
    const pendId = item.pendaftaran_id ?? item.id ?? 0;
    handleUpdateStatus(pendId, 'DIPANGGIL');
    setTimeout(() => {
      setCalledAudioPatient(null);
    }, 4500);
  };

  // =========================================================
  // TAB 3: DATABASE MASTER PASIEN
  // =========================================================
  const [allPasienList, setAllPasienList] = useState<Pasien[]>([]);
  const [masterPasienSearch, setMasterPasienSearch] = useState('');
  const [masterPasienLoading, setMasterPasienLoading] = useState(false);
  const [inspectedPasien, setInspectedPasien] = useState<Pasien | null>(null);

  const fetchAllPasien = useCallback(async () => {
    setMasterPasienLoading(true);
    try {
      const params: any = { limit: 30 };
      if (masterPasienSearch) params.search = masterPasienSearch;
      const res: any = await pendaftaranApi.getAllPasien(params);
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.rows)
        ? res.rows
        : Array.isArray(res)
        ? res
        : [];
      setAllPasienList(list);
    } catch (err) {
      console.error('Error fetching master pasien:', err);
    } finally {
      setMasterPasienLoading(false);
    }
  }, [masterPasienSearch]);

  useEffect(() => {
    if (activeMainTab === 'master-pasien') {
      fetchAllPasien();
    }
  }, [activeMainTab, fetchAllPasien]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
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
            <UserPlus className="w-4 h-4" />
            Modul Pendaftaran & Admisi Pasien
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Pendaftaran & Registrasi Pasien RJ
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pendaftaran kunjungan poliklinik untuk Pasien Baru (Master Wilayah Indonesia) & Pasien Lama
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveMainTab('registrasi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeMainTab === 'registrasi'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Registrasi Pasien
            </button>
            <button
              onClick={() => setActiveMainTab('antrean-hari-ini')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeMainTab === 'antrean-hari-ini'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Antrean Kunjungan ({todayQueueList.length})
            </button>
            <button
              onClick={() => setActiveMainTab('master-pasien')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeMainTab === 'master-pasien'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Master Data Pasien
            </button>
          </div>
        </div>
      </div>

      {/* Speaker Call Audio Notification */}
      {calledAudioPatient && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white flex items-center justify-between shadow-xl animate-bounce">
          <div className="flex items-center gap-3">
            <Volume2 className="w-6 h-6 animate-pulse" />
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-200">
                Panggilan Pasien Rawat Jalan:
              </span>
              <p className="text-sm font-black">
                Nomor Antrean <span className="font-mono underline text-base">{calledAudioPatient}</span> menuju Poliklinik Penyakit Dalam
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. TAB REGISTRASI PASIEN RAWAT JALAN                      */}
      {/* ========================================================= */}
      {activeMainTab === 'registrasi' && (
        <form onSubmit={handleSubmitPendaftaran} className="space-y-6">
          {/* Tipe Pasien Selector (PASIEN LAMA vs PASIEN BARU) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setTipePasien('LAMA')}
              className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center gap-4 ${
                tipePasien === 'LAMA'
                  ? 'border-sky-600 bg-sky-50/60 dark:bg-sky-950/40 text-slate-900 dark:text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
                  tipePasien === 'LAMA'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm">Pasien Lama (Terdaftar)</h3>
                  {tipePasien === 'LAMA' && (
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pasien sudah memiliki Nomor Rekam Medis (No RM). Cukup cari nama, NIK, atau No RM.
                </p>
              </div>
            </div>

            <div
              onClick={() => setTipePasien('BARU')}
              className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center gap-4 ${
                tipePasien === 'BARU'
                  ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-slate-900 dark:text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
                  tipePasien === 'BARU'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                <UserPlus className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm">Pasien Baru (Registrasi Pertama)</h3>
                  {tipePasien === 'BARU' && (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registrasi identitas baru dengan integrasi Master Desa, Kecamatan, Kab/Kota, dan Kode Pos.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION A: PASIEN LAMA SEARCH */}
          {tipePasien === 'LAMA' && (
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <Search className="w-4 h-4 text-sky-600" />
                Cari Data Pasien Terdaftar
              </div>

              {!selectedPasienLama ? (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchPasienQuery}
                      onChange={(e) => setSearchPasienQuery(e.target.value)}
                      placeholder="Ketik Nama Pasien (misal: Siti Aminah / Ahmad), No RM (RM-000001), atau NIK 16 digit..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-sky-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    {isLoadingPasienSearch && (
                      <RefreshCw className="w-4 h-4 animate-spin text-sky-600 absolute right-3.5 top-3.5" />
                    )}
                  </div>

                  {/* Search Results Dropdown List */}
                  {pasienSearchResults.length > 0 && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700 shadow-md">
                      {pasienSearchResults.map((p) => {
                        const pId = p.pasien_id ?? p.id ?? 0;
                        return (
                          <div
                            key={pId}
                            onClick={() => setSelectedPasienLama(p)}
                            className="p-3.5 hover:bg-sky-50/70 dark:hover:bg-slate-700/50 cursor-pointer flex items-center justify-between transition"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 px-2 py-0.5 rounded">
                                  {p.no_rm}
                                </span>
                                <span className="font-bold text-sm text-slate-900 dark:text-white">
                                  {p.nama_lengkap}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-500">
                                  ({p.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'})
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-3">
                                <span>NIK: {p.nik || '-'}</span>
                                <span>•</span>
                                <span>Alamat: {p.alamat_lengkap}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition"
                            >
                              Pilih Pasien
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {searchPasienQuery.length >= 2 && pasienSearchResults.length === 0 && !isLoadingPasienSearch && (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                      Tidak ditemukan pasien dengan kata kunci "{searchPasienQuery}". Pasien belum terdaftar? Beralih ke <strong>Pasien Baru</strong> di atas.
                    </div>
                  )}
                </div>
              ) : (
                /* Selected Patient Card */
                <div className="p-4 rounded-xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-lg bg-sky-600 text-white font-mono font-black text-sm shadow-xs">
                        {selectedPasienLama.no_rm}
                      </span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white">
                        {selectedPasienLama.nama_lengkap}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white/80 dark:bg-slate-800 text-sky-700 dark:text-sky-300">
                        {selectedPasienLama.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                      <div>
                        <span className="text-slate-400">NIK:</span> {selectedPasienLama.nik || '-'}
                      </div>
                      <div>
                        <span className="text-slate-400">Lahir:</span> {selectedPasienLama.tempat_lahir}, {selectedPasienLama.tanggal_lahir}
                      </div>
                      <div>
                        <span className="text-slate-400">Telepon:</span> {selectedPasienLama.no_telepon || '-'}
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-400">Alamat:</span> {selectedPasienLama.alamat_lengkap}
                      </div>
                      <div>
                        <span className="text-slate-400">Penjamin Default:</span>{' '}
                        <span className="font-bold text-sky-700 dark:text-sky-300">
                          {selectedPasienLama.jenis_penjamin_default || 'UMUM'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedPasienLama(null)}
                    className="px-3.5 py-1.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition shrink-0 cursor-pointer"
                  >
                    Ganti Pasien
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SECTION B: PASIEN BARU COMPREHENSIVE FORM */}
          {tipePasien === 'BARU' && (
            <div className="space-y-4">
              {/* 1. IDENTITAS UTAMA */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  1. Identitas Utama Pasien Baru (No RM Otomatis Digenerate)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      NIK (16 Digit KTP)
                    </label>
                    <input
                      type="text"
                      maxLength={16}
                      value={pasienBaruForm.nik}
                      onChange={(e) =>
                        setPasienBaruForm({ ...pasienBaruForm, nik: e.target.value.replace(/\D/g, '') })
                      }
                      placeholder="Contoh: 3201011205900001"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Lengkap Pasien <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={pasienBaruForm.nama_lengkap}
                      onChange={(e) =>
                        setPasienBaruForm({ ...pasienBaruForm, nama_lengkap: e.target.value })
                      }
                      placeholder="Nama lengkap sesuai KTP / Akta Lahir"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Jenis Kelamin <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPasienBaruForm({ ...pasienBaruForm, jenis_kelamin: 'L' })}
                        className={`py-2 rounded-xl text-xs font-bold transition border ${
                          pasienBaruForm.jenis_kelamin === 'L'
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        Laki-laki (L)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPasienBaruForm({ ...pasienBaruForm, jenis_kelamin: 'P' })}
                        className={`py-2 rounded-xl text-xs font-bold transition border ${
                          pasienBaruForm.jenis_kelamin === 'P'
                            ? 'bg-pink-600 text-white border-pink-600'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        Perempuan (P)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tempat Lahir <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={pasienBaruForm.tempat_lahir}
                      onChange={(e) =>
                        setPasienBaruForm({ ...pasienBaruForm, tempat_lahir: e.target.value })
                      }
                      placeholder="Kota / Kabupaten Lahir"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tanggal Lahir <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={pasienBaruForm.tanggal_lahir}
                      onChange={(e) =>
                        setPasienBaruForm({ ...pasienBaruForm, tanggal_lahir: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Golongan Darah
                    </label>
                    <select
                      value={pasienBaruForm.golongan_darah}
                      onChange={(e) =>
                        setPasienBaruForm({ ...pasienBaruForm, golongan_darah: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
                    >
                      <option value="TIDAK_TAHU">TIDAK TAHU</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Status Pernikahan
                    </label>
                    <select
                      value={pasienBaruForm.status_pernikahan}
                      onChange={(e) =>
                        setPasienBaruForm({ ...pasienBaruForm, status_pernikahan: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
                    >
                      <option value="BELUM_MENIKAH">BELUM MENIKAH</option>
                      <option value="MENIKAH">MENIKAH</option>
                      <option value="CERAI_HIDUP">CERAI HIDUP</option>
                      <option value="CERAI_MATI">CERAI MATI</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      No. Telepon / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={pasienBaruForm.no_telepon}
                      onChange={(e) =>
                        setPasienBaruForm({ ...pasienBaruForm, no_telepon: e.target.value })
                      }
                      placeholder="0812xxxx"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Pasien <span className="text-slate-400 font-normal">(Opsional)</span>
                    </label>
                    <input
                      type="email"
                      value={pasienBaruForm.email}
                      onChange={(e) =>
                        setPasienBaruForm({ ...pasienBaruForm, email: e.target.value })
                      }
                      placeholder="pasien@email.com (opsional)"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. ALAMAT & INTEGRASI MASTER WILAYAH INDONESIA */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    2. Alamat Domisili & Master Wilayah Indonesia
                  </div>
                  <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                    Otomatis sinkron dengan Master Provinsi, Kab/Kota, Kec, Desa & Kodepos
                  </span>
                </div>

                {/* Instant Kodepos Helper Box */}
                <div className="p-3.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <div className="text-xs font-bold text-sky-900 dark:text-sky-200">
                      Punya 5 Digit Kode Pos?
                    </div>
                    <div className="text-[11px] text-sky-700 dark:text-sky-300">
                      Ketik kode pos lalu klik "Lookup" untuk otomatis memilih Provinsi, Kabupaten, dan Kecamatan
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={5}
                      value={pasienBaruForm.kode_pos}
                      onChange={(e) =>
                        setPasienBaruForm({ ...pasienBaruForm, kode_pos: e.target.value.replace(/\D/g, '') })
                      }
                      placeholder="Kode Pos (55281)"
                      className="w-32 px-3 py-1.5 rounded-xl border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleQuickKodeposLookup}
                      disabled={kodeposLookupLoading}
                      className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
                    >
                      {kodeposLookupLoading ? 'Cari...' : 'Lookup'}
                    </button>
                  </div>
                </div>

                {kodeposLookupMessage && (
                  <p className="text-xs font-semibold text-sky-700 dark:text-sky-300">
                    {kodeposLookupMessage}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Dropdown 1: Provinsi */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Provinsi
                    </label>
                    <select
                      value={pasienBaruForm.provinsi_id}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : '';
                        setPasienBaruForm({
                          ...pasienBaruForm,
                          provinsi_id: val,
                          kabupaten_id: '',
                          kecamatan_id: '',
                          desa_id: '',
                        });
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
                    >
                      <option value="">Pilih Provinsi</option>
                      {provinsiOptions.map((p) => {
                        const pId = p.provinsi_id ?? p.id;
                        return (
                          <option key={pId} value={pId}>
                            {p.nama_provinsi}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Dropdown 2: Kabupaten / Kota */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kabupaten / Kota
                    </label>
                    <select
                      value={pasienBaruForm.kabupaten_id}
                      disabled={!pasienBaruForm.provinsi_id}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : '';
                        setPasienBaruForm({
                          ...pasienBaruForm,
                          kabupaten_id: val,
                          kecamatan_id: '',
                          desa_id: '',
                        });
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500 disabled:opacity-50"
                    >
                      <option value="">Pilih Kab/Kota</option>
                      {kabupatenOptions.map((k) => {
                        const kId = k.kabupaten_id ?? k.id;
                        return (
                          <option key={kId} value={kId}>
                            {k.tipe} {k.nama_kabupaten}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Dropdown 3: Kecamatan */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kecamatan
                    </label>
                    <select
                      value={pasienBaruForm.kecamatan_id}
                      disabled={!pasienBaruForm.kabupaten_id}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : '';
                        setPasienBaruForm({
                          ...pasienBaruForm,
                          kecamatan_id: val,
                          desa_id: '',
                        });
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500 disabled:opacity-50"
                    >
                      <option value="">Pilih Kecamatan</option>
                      {kecamatanOptions.map((kc) => {
                        const kcId = kc.kecamatan_id ?? kc.id;
                        return (
                          <option key={kcId} value={kcId}>
                            {kc.nama_kecamatan}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Dropdown 4: Desa / Kelurahan */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Desa / Kelurahan
                    </label>
                    <select
                      value={pasienBaruForm.desa_id}
                      disabled={!pasienBaruForm.kecamatan_id}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : '';
                        const selectedDesa = desaOptions.find((d) => (d.desa_id ?? d.id) === val);
                        setPasienBaruForm({
                          ...pasienBaruForm,
                          desa_id: val,
                          kode_pos: selectedDesa?.kode_pos || pasienBaruForm.kode_pos,
                        });
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500 disabled:opacity-50"
                    >
                      <option value="">Pilih Desa/Kelurahan</option>
                      {desaOptions.map((d) => {
                        const dId = d.desa_id ?? d.id;
                        return (
                          <option key={dId} value={dId}>
                            {d.tipe} {d.nama_desa}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Alamat Lengkap */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Alamat Lengkap (Jalan, No Rumah, Dusun) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={pasienBaruForm.alamat_lengkap}
                      onChange={(e) =>
                        setPasienBaruForm({ ...pasienBaruForm, alamat_lengkap: e.target.value })
                      }
                      placeholder="Contoh: Jl. Kaliurang KM 5, Gang Pandega Marta No. 12"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* RT / RW */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        RT
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={pasienBaruForm.rt}
                        onChange={(e) => setPasienBaruForm({ ...pasienBaruForm, rt: e.target.value })}
                        placeholder="02"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-center focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        RW
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={pasienBaruForm.rw}
                        onChange={(e) => setPasienBaruForm({ ...pasienBaruForm, rw: e.target.value })}
                        placeholder="04"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-center focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. PENANGGUNG JAWAB PASIEN */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Phone className="w-4 h-4 text-indigo-600" />
                  3. Kontak Penanggung Jawab Pasien
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Penanggung Jawab
                    </label>
                    <input
                      type="text"
                      value={pasienBaruForm.nama_penanggung_jawab}
                      onChange={(e) =>
                        setPasienBaruForm({ ...pasienBaruForm, nama_penanggung_jawab: e.target.value })
                      }
                      placeholder="Nama keluarga penanggung jawab"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Hubungan Keluarga
                    </label>
                    <select
                      value={pasienBaruForm.hubungan_penanggung_jawab}
                      onChange={(e) =>
                        setPasienBaruForm({ ...pasienBaruForm, hubungan_penanggung_jawab: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
                    >
                      <option value="SUAMI">SUAMI</option>
                      <option value="ISTRI">ISTRI</option>
                      <option value="ORANG_TUA">ORANG TUA</option>
                      <option value="ANAK">ANAK</option>
                      <option value="SAUDARA_KANDUNG">SAUDARA KANDUNG</option>
                      <option value="WALI">WALI / LAINNYA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Telepon Penanggung Jawab
                    </label>
                    <input
                      type="text"
                      value={pasienBaruForm.telepon_penanggung_jawab}
                      onChange={(e) =>
                        setPasienBaruForm({ ...pasienBaruForm, telepon_penanggung_jawab: e.target.value })
                      }
                      placeholder="0813xxxx"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION C: KUNJUNGAN, POLIKLINIK & DOKTER */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
              <Stethoscope className="w-4 h-4 text-sky-600" />
              Kunjungan Poliklinik, Jadwal Dokter & Penjamin Biaya
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Tanggal Kunjungan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Kunjungan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={tanggalKunjungan}
                  onChange={(e) => setTanggalKunjungan(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Poliklinik */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Poliklinik Tujuan <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedRuanganId}
                  onChange={(e) => setSelectedRuanganId(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
                >
                  {ruanganPoliklinikList.map((r) => {
                    const rId = r.ruangan_id ?? r.id;
                    return (
                      <option key={rId} value={rId}>
                        {r.nama_ruangan} ({r.kode_ruangan})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Jadwal Praktik Dokter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Jadwal Praktik Dokter <span className="text-rose-500">*</span>
                </label>
                {isLoadingJadwal ? (
                  <div className="py-2 text-xs text-slate-400 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Memuat jadwal dokter...
                  </div>
                ) : jadwalList.length === 0 ? (
                  <div className="py-2 text-xs text-rose-500 font-semibold">
                    Tidak ada jadwal dokter aktif di poli ini.
                  </div>
                ) : (
                  <select
                    required
                    value={selectedJadwalId}
                    onChange={(e) => setSelectedJadwalId(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  >
                    {jadwalList.map((j) => {
                      const jId = j.jadwaldokter_id ?? j.jadwal_dokter_id ?? j.id;
                      return (
                        <option key={jId} value={jId}>
                          {j.dokter?.nama_lengkap || 'Dokter'} ({j.hari}, {j.jam_mulai} - {j.jam_selesai}) [Kuota: {j.kuota_pasien}]
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              {/* Jenis Penjamin */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jenis Penjamin Biaya <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={jenisPenjamin}
                  onChange={(e) => setJenisPenjamin(e.target.value as JenisPenjamin)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:border-sky-500"
                >
                  <option value="UMUM">UMUM / BAYAR SENDIRI</option>
                  <option value="BPJS">BPJS KESEHATAN</option>
                  <option value="ASURANSI_SWASTA">ASURANSI SWASTA</option>
                  <option value="PERUSAHAAN">KERJASAMA PERUSAHAAN</option>
                </select>
              </div>

              {/* Nomor Kartu BPJS / Asuransi */}
              {jenisPenjamin !== 'UMUM' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    No. Kartu BPJS / Polis Asuransi
                  </label>
                  <input
                    type="text"
                    value={noKartuPenjamin}
                    onChange={(e) => setNoKartuPenjamin(e.target.value)}
                    placeholder="Contoh: 0001234567890"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              )}

              {/* Keluhan Utama */}
              <div className={jenisPenjamin === 'UMUM' ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Keluhan Utama / Alasan Kunjungan
                </label>
                <input
                  type="text"
                  value={keluhanUtama}
                  onChange={(e) => setKeluhanUtama(e.target.value)}
                  placeholder="Misal: Nyeri perut sejak 2 hari, mual, demam..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetForNext}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Reset Formulir
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Mendaftarkan Pasien...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Daftarkan Pasien Rawat Jalan & Terbitkan Antrean
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* 2. TAB DAFTAR KUNJUNGAN HARI INI                          */}
      {/* ========================================================= */}
      {activeMainTab === 'antrean-hari-ini' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filter Status:</span>
              {(['ALL', 'MENUNGGU', 'DIPANGGIL', 'SEDANG_DILAYANI', 'SELESAI', 'BATAL'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterQueueStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                    filterQueueStatus === st
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {st === 'ALL' ? 'Semua Status' : st}
                </button>
              ))}
            </div>

            <button
              onClick={fetchTodayQueue}
              disabled={queueLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${queueLoading ? 'animate-spin' : ''}`} />
              Segarkan Antrean
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            {queueLoading ? (
              <div className="p-12 text-center text-xs text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
                Memuat antrean rawat jalan...
              </div>
            ) : todayQueueList.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Belum ada pendaftaran rawat jalan untuk kriteria ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-5 py-3.5">No. Antrean</th>
                      <th className="px-5 py-3.5">No. Registrasi</th>
                      <th className="px-5 py-3.5">No. RM</th>
                      <th className="px-5 py-3.5">Nama Pasien</th>
                      <th className="px-5 py-3.5">Dokter & Poli</th>
                      <th className="px-5 py-3.5">Penjamin</th>
                      <th className="px-5 py-3.5">Status Antrean</th>
                      <th className="px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {todayQueueList.map((item) => {
                      const pendId = item.pendaftaran_id ?? item.id ?? 0;
                      return (
                      <tr key={pendId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                        <td className="px-5 py-3.5 font-mono font-black text-sm text-sky-600 dark:text-sky-400">
                          {item.no_antrean}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-400">
                          {item.no_registrasi}
                        </td>
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {item.pasien?.no_rm || '-'}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                          {item.pasien?.nama_lengkap || '-'}
                          {item.tipe_pasien === 'BARU' && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                              BARU
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                          <p className="font-semibold">{item.dokter?.nama_lengkap || 'Dokter'}</p>
                          <p className="text-[10px] text-slate-400">{item.ruangan?.nama_ruangan}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              item.jenis_penjamin === 'BPJS'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {item.jenis_penjamin}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              item.status_antrean === 'MENUNGGU'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : item.status_antrean === 'DIPANGGIL'
                                ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 animate-pulse'
                                : item.status_antrean === 'SEDANG_DILAYANI'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                                : item.status_antrean === 'SELESAI'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {item.status_antrean}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Panggil Speaker Button */}
                            <button
                              onClick={() => handleSpeakerCall(item)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800 transition font-semibold"
                              title="Panggil Antrean ke Speaker"
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>Panggil</span>
                            </button>

                            {/* Status changer */}
                            {item.status_antrean !== 'SELESAI' && item.status_antrean !== 'BATAL' && (
                              <button
                                onClick={() => handleUpdateStatus(pendId, 'SEDANG_DILAYANI')}
                                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition"
                                title="Mulai Layani"
                              >
                                Layani
                              </button>
                            )}

                            {item.status_antrean === 'SEDANG_DILAYANI' && (
                              <button
                                onClick={() => handleUpdateStatus(pendId, 'SELESAI')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
                                title="Selesai Pelayanan"
                              >
                                Selesai
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. TAB MASTER DATA PASIEN                                 */}
      {/* ========================================================= */}
      {activeMainTab === 'master-pasien' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={masterPasienSearch}
                onChange={(e) => setMasterPasienSearch(e.target.value)}
                placeholder="Cari NIK, No RM, atau Nama Pasien..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-sky-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <button
              onClick={fetchAllPasien}
              disabled={masterPasienLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${masterPasienLoading ? 'animate-spin' : ''}`} />
              Segarkan Data
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            {masterPasienLoading ? (
              <div className="p-12 text-center text-xs text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
                Memuat data master pasien...
              </div>
            ) : allPasienList.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Tidak ada data pasien yang cocok.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-5 py-3.5">No. RM</th>
                      <th className="px-5 py-3.5">NIK</th>
                      <th className="px-5 py-3.5">Nama Pasien</th>
                      <th className="px-5 py-3.5">JK / Umur</th>
                      <th className="px-5 py-3.5">Alamat Domisili</th>
                      <th className="px-5 py-3.5">Wilayah & Kodepos</th>
                      <th className="px-5 py-3.5">Penjamin</th>
                      <th className="px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {allPasienList.map((p) => {
                      const pId = p.pasien_id ?? p.id;
                      return (
                        <tr key={pId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                          <td className="px-5 py-3.5 font-mono font-black text-sky-600 dark:text-sky-400">
                            {p.no_rm}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-400">
                            {p.nik || '-'}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                            {p.nama_lengkap}
                          </td>
                          <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                            {p.jenis_kelamin === 'L' ? 'L' : 'P'} / {p.tanggal_lahir}
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                            {p.alamat_lengkap}
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                            {p.desa?.nama_desa ? `${p.desa.nama_desa}, ` : ''}
                            {p.kabupaten?.nama_kabupaten || '-'} ({p.kode_pos || '-'})
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {p.jenis_penjamin_default || 'UMUM'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => {
                                setSelectedPasienLama(p);
                                setTipePasien('LAMA');
                                setActiveMainTab('registrasi');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition"
                              title="Daftarkan Kunjungan untuk Pasien Ini"
                            >
                              Daftarkan Kunjungan
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUCCESS MODAL: BUKTI PENDAFTARAN & STRUK ANTREAN           */}
      {/* ========================================================= */}
      {successModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Header / Ticket Top */}
            <div className="p-6 bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-center space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Registrasi Rawat Jalan Berhasil
              </span>
              <h3 className="text-xl font-black tracking-tight mt-1">KARCIS ANTREAN POLIKLINIK</h3>
              <p className="text-xs text-sky-100 font-mono">
                {successModalData.no_registrasi}
              </p>
            </div>

            {/* Ticket Body with Big Queue Number */}
            <div className="p-6 space-y-5 text-center">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Nomor Antrean Anda
                </span>
                <div className="text-5xl font-black text-sky-600 dark:text-sky-400 font-mono tracking-wider mt-1">
                  {successModalData.no_antrean}
                </div>
              </div>

              {/* Patient and Doctor Info Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                  <span className="text-slate-400">Nama Pasien:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {successModalData.pasien?.nama_lengkap}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                  <span className="text-slate-400">No. Rekam Medis:</span>
                  <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                    {successModalData.pasien?.no_rm}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                  <span className="text-slate-400">Poliklinik Tujuan:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {successModalData.ruangan?.nama_ruangan}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                  <span className="text-slate-400">Dokter Spesialis:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {successModalData.dokter?.nama_lengkap}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-slate-400">Penjamin Biaya:</span>
                  <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
                    {successModalData.jenis_penjamin}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-md transition hover:opacity-90 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Struk / Karcis Antrean
                </button>
                <button
                  type="button"
                  onClick={handleResetForNext}
                  className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Selesai & Daftarkan Pasien Berikutnya
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
