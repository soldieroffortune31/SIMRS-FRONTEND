import axios from 'axios';
import {
  ApiResponse,
  LoginResult,
  MenuItem,
  AntreanPoliItem,
  SensusRawatInapItem,
  ResepFarmasiItem,
  TagihanKasirItem,
  Instalasi,
  Ruangan,
  Role,
  Pasien,
  JadwalDokter,
  PendaftaranRawatJalan,
} from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT Token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('simrs_token');
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const isLoginPath = window.location.pathname === '/login';
        // Only redirect if not on login page
        if (!isLoginPath) {
          localStorage.removeItem('simrs_token');
          localStorage.removeItem('simrs_user');
          localStorage.removeItem('simrs_context');
          localStorage.removeItem('simrs_menus');
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authApi = {
  login: async (username: string, password: string, explicitContext?: { instalasi_id: number; ruangan_id: number }) => {
    const payload = explicitContext
      ? { username, password, ...explicitContext }
      : { username, password };
    const res = await api.post<ApiResponse<LoginResult>>('/auth/login', payload);
    return res.data;
  },

  selectContext: async (instalasi_id: number, ruangan_id: number, tempToken?: string) => {
    const headers = tempToken ? { Authorization: `Bearer ${tempToken}` } : {};
    const res = await api.post<ApiResponse<LoginResult>>(
      '/auth/select-context',
      { instalasi_id, ruangan_id },
      { headers }
    );
    return res.data;
  },

  switchContext: async (instalasi_id: number, ruangan_id: number) => {
    const res = await api.post<ApiResponse<LoginResult>>('/auth/switch-context', {
      instalasi_id,
      ruangan_id,
    });
    return res.data;
  },

  getMe: async () => {
    const res = await api.get<ApiResponse<any>>('/auth/me');
    return res.data;
  },

  getMenus: async () => {
    const res = await api.get<ApiResponse<MenuItem[]>>('/auth/menus');
    return res.data;
  },
};

// Pelayanan Endpoints
export const pelayananApi = {
  getAntreanPoli: async () => {
    const res = await api.get<ApiResponse<AntreanPoliItem[]>>('/pelayanan/rawat-jalan/antrean');
    return res.data;
  },

  getSensusRawatInap: async () => {
    const res = await api.get<ApiResponse<SensusRawatInapItem[]>>('/pelayanan/rawat-inap/sensus');
    return res.data;
  },

  getAntreanResep: async () => {
    const res = await api.get<ApiResponse<ResepFarmasiItem[]>>('/pelayanan/farmasi/resep');
    return res.data;
  },

  getTagihanKasir: async () => {
    const res = await api.get<ApiResponse<TagihanKasirItem[]>>('/pelayanan/kasir/tagihan');
    return res.data;
  },
};

// Master Data Endpoints (Instalasi, Ruangan, Roles, Users, Modul)
export const masterApi = {
  // Instalasi Endpoints (/instalasi & /master/instalasi)
  getInstalasi: async (includeRuangan = false) => {
    const res = await api.get<ApiResponse<Instalasi[]>>(`/instalasi?include_ruangan=${includeRuangan}`);
    return res.data;
  },
  getInstalasiById: async (id: number) => {
    const res = await api.get<ApiResponse<Instalasi>>(`/instalasi/${id}`);
    return res.data;
  },
  createInstalasi: async (data: { kode_instalasi: string; nama_instalasi: string; is_active?: boolean }) => {
    const res = await api.post<ApiResponse<Instalasi>>('/instalasi', data);
    return res.data;
  },
  updateInstalasi: async (id: number, data: Partial<{ kode_instalasi: string; nama_instalasi: string; is_active: boolean }>) => {
    const res = await api.put<ApiResponse<Instalasi>>(`/instalasi/${id}`, data);
    return res.data;
  },
  deleteInstalasi: async (id: number) => {
    const res = await api.delete<ApiResponse<any>>(`/instalasi/${id}`);
    return res.data;
  },

  // Ruangan Endpoints (/ruangan & /master/ruangan)
  getRuangan: async (instalasiId?: number) => {
    const url = instalasiId ? `/ruangan?instalasi_id=${instalasiId}` : '/ruangan';
    const res = await api.get<ApiResponse<Ruangan[]>>(url);
    return res.data;
  },
  getRuanganById: async (id: number) => {
    const res = await api.get<ApiResponse<Ruangan>>(`/ruangan/${id}`);
    return res.data;
  },
  createRuangan: async (data: { instalasi_id: number; kode_ruangan: string; nama_ruangan: string; is_active?: boolean }) => {
    const res = await api.post<ApiResponse<Ruangan>>('/ruangan', data);
    return res.data;
  },
  updateRuangan: async (id: number, data: Partial<{ instalasi_id: number; kode_ruangan: string; nama_ruangan: string; is_active: boolean }>) => {
    const res = await api.put<ApiResponse<Ruangan>>(`/ruangan/${id}`, data);
    return res.data;
  },
  deleteRuangan: async (id: number) => {
    const res = await api.delete<ApiResponse<any>>(`/ruangan/${id}`);
    return res.data;
  },

  // Role Endpoints (/roles, /role & /master/roles)
  getRoles: async () => {
    const res = await api.get<ApiResponse<Role[]>>('/roles');
    return res.data;
  },
  getRoleById: async (id: number) => {
    const res = await api.get<ApiResponse<Role>>(`/roles/${id}`);
    return res.data;
  },
  createRole: async (data: { kode_role: string; nama_role: string; keterangan?: string }) => {
    const res = await api.post<ApiResponse<Role>>('/roles', data);
    return res.data;
  },
  updateRole: async (id: number, data: Partial<{ kode_role: string; nama_role: string; keterangan?: string }>) => {
    const res = await api.put<ApiResponse<Role>>(`/roles/${id}`, data);
    return res.data;
  },
  deleteRole: async (id: number) => {
    const res = await api.delete<ApiResponse<any>>(`/roles/${id}`);
    return res.data;
  },
  assignRolePermissions: async (id: number, permission_ids: number[]) => {
    const res = await api.post<ApiResponse<any>>(`/roles/${id}/permissions`, { permission_ids });
    return res.data;
  },
  assignRoleMenus: async (id: number, menu_ids: number[]) => {
    const res = await api.post<ApiResponse<any>>(`/roles/${id}/menus`, { menu_ids });
    return res.data;
  },

  // Users & Modules
  getUsers: async () => {
    const res = await api.get<ApiResponse<any[]>>('/users');
    return res.data;
  },

  getModul: async (includeMenus = false) => {
    const res = await api.get<ApiResponse<any[]>>(`/modul?include_menus=${includeMenus}`);
    return res.data;
  },

  getMyModules: async () => {
    const res = await api.get<ApiResponse<any[]>>('/modul/my-modules');
    return res.data;
  },
};

// Master Wilayah & Kode Pos Endpoints
export const wilayahApi = {
  // 1. Provinsi
  getProvinsi: async (params?: { search?: string; is_active?: boolean; include_kabupaten?: boolean; page?: number; limit?: number }) => {
    const res = await api.get<ApiResponse<any>>('/master/provinsi', { params });
    return res.data;
  },
  getProvinsiById: async (id: number) => {
    const res = await api.get<ApiResponse<any>>(`/master/provinsi/${id}`);
    return res.data;
  },
  createProvinsi: async (data: { kode_provinsi: string; nama_provinsi: string; is_active?: boolean }) => {
    const res = await api.post<ApiResponse<any>>('/master/provinsi', data);
    return res.data;
  },
  updateProvinsi: async (id: number, data: Partial<{ kode_provinsi: string; nama_provinsi: string; is_active: boolean }>) => {
    const res = await api.put<ApiResponse<any>>(`/master/provinsi/${id}`, data);
    return res.data;
  },
  deleteProvinsi: async (id: number) => {
    const res = await api.delete<ApiResponse<any>>(`/master/provinsi/${id}`);
    return res.data;
  },

  // 2. Kabupaten / Kota
  getKabupaten: async (params?: { provinsi_id?: number; tipe?: string; search?: string; is_active?: boolean; page?: number; limit?: number }) => {
    const res = await api.get<ApiResponse<any>>('/master/kabupaten', { params });
    return res.data;
  },
  getKabupatenById: async (id: number) => {
    const res = await api.get<ApiResponse<any>>(`/master/kabupaten/${id}`);
    return res.data;
  },
  createKabupaten: async (data: { provinsi_id: number; kode_kabupaten: string; nama_kabupaten: string; tipe?: 'KABUPATEN' | 'KOTA'; is_active?: boolean }) => {
    const res = await api.post<ApiResponse<any>>('/master/kabupaten', data);
    return res.data;
  },
  updateKabupaten: async (id: number, data: Partial<{ provinsi_id: number; kode_kabupaten: string; nama_kabupaten: string; tipe: 'KABUPATEN' | 'KOTA'; is_active: boolean }>) => {
    const res = await api.put<ApiResponse<any>>(`/master/kabupaten/${id}`, data);
    return res.data;
  },
  deleteKabupaten: async (id: number) => {
    const res = await api.delete<ApiResponse<any>>(`/master/kabupaten/${id}`);
    return res.data;
  },

  // 3. Kecamatan
  getKecamatan: async (params?: { kabupaten_id?: number; search?: string; is_active?: boolean; page?: number; limit?: number }) => {
    const res = await api.get<ApiResponse<any>>('/master/kecamatan', { params });
    return res.data;
  },
  getKecamatanById: async (id: number) => {
    const res = await api.get<ApiResponse<any>>(`/master/kecamatan/${id}`);
    return res.data;
  },
  createKecamatan: async (data: { kabupaten_id: number; kode_kecamatan: string; nama_kecamatan: string; is_active?: boolean }) => {
    const res = await api.post<ApiResponse<any>>('/master/kecamatan', data);
    return res.data;
  },
  updateKecamatan: async (id: number, data: Partial<{ kabupaten_id: number; kode_kecamatan: string; nama_kecamatan: string; is_active: boolean }>) => {
    const res = await api.put<ApiResponse<any>>(`/master/kecamatan/${id}`, data);
    return res.data;
  },
  deleteKecamatan: async (id: number) => {
    const res = await api.delete<ApiResponse<any>>(`/master/kecamatan/${id}`);
    return res.data;
  },

  // 4. Desa / Kelurahan
  getDesa: async (params?: { kecamatan_id?: number; tipe?: string; kode_pos?: string; search?: string; is_active?: boolean; page?: number; limit?: number }) => {
    const res = await api.get<ApiResponse<any>>('/master/desa', { params });
    return res.data;
  },
  getDesaById: async (id: number) => {
    const res = await api.get<ApiResponse<any>>(`/master/desa/${id}`);
    return res.data;
  },
  createDesa: async (data: { kecamatan_id: number; kode_desa: string; nama_desa: string; tipe?: 'DESA' | 'KELURAHAN'; kode_pos?: string; is_active?: boolean }) => {
    const res = await api.post<ApiResponse<any>>('/master/desa', data);
    return res.data;
  },
  updateDesa: async (id: number, data: Partial<{ kecamatan_id: number; kode_desa: string; nama_desa: string; tipe: 'DESA' | 'KELURAHAN'; kode_pos: string; is_active: boolean }>) => {
    const res = await api.put<ApiResponse<any>>(`/master/desa/${id}`, data);
    return res.data;
  },
  deleteDesa: async (id: number) => {
    const res = await api.delete<ApiResponse<any>>(`/master/desa/${id}`);
    return res.data;
  },

  // 5. Kode Pos
  getKodePos: async (params?: { kode_pos?: string; desa_id?: number; kecamatan_id?: number; kabupaten_id?: number; provinsi_id?: number; search?: string; page?: number; limit?: number }) => {
    const res = await api.get<ApiResponse<any>>('/master/kodepos', { params });
    return res.data;
  },
  searchKodePos: async (kodePos: string) => {
    const res = await api.get<ApiResponse<any>>(`/master/kodepos/search/${encodeURIComponent(kodePos)}`);
    return res.data;
  },
  createKodePos: async (data: { kode_pos: string; provinsi_id?: number; kabupaten_id?: number; kecamatan_id?: number; desa_id?: number; keterangan?: string; is_active?: boolean }) => {
    const res = await api.post<ApiResponse<any>>('/master/kodepos', data);
    return res.data;
  },
  updateKodePos: async (id: number, data: Partial<{ kode_pos: string; provinsi_id: number; kabupaten_id: number; kecamatan_id: number; desa_id: number; keterangan: string; is_active: boolean }>) => {
    const res = await api.put<ApiResponse<any>>(`/master/kodepos/${id}`, data);
    return res.data;
  },
  deleteKodePos: async (id: number) => {
    const res = await api.delete<ApiResponse<any>>(`/master/kodepos/${id}`);
    return res.data;
  },
};

// Pendaftaran Rawat Jalan & Pasien Endpoints
export const pendaftaranApi = {
  // Pasien Endpoints (/pasien)
  getAllPasien: async (params?: { search?: string; jenis_kelamin?: string; is_active?: boolean; page?: number; limit?: number }) => {
    const res = await api.get<ApiResponse<Pasien[]>>('/pasien', { params });
    return res.data;
  },
  getPasienById: async (id: number | string) => {
    const res = await api.get<ApiResponse<Pasien>>(`/pasien/${id}`);
    return res.data;
  },
  getPasienByNoRM: async (no_rm: string) => {
    const res = await api.get<ApiResponse<Pasien>>(`/pasien/no-rm/${encodeURIComponent(no_rm)}`);
    return res.data;
  },
  getPasienByNIK: async (nik: string) => {
    const res = await api.get<ApiResponse<Pasien>>(`/pasien/nik/${encodeURIComponent(nik)}`);
    return res.data;
  },
  createPasien: async (data: any) => {
    const res = await api.post<ApiResponse<Pasien>>('/pasien', data);
    return res.data;
  },
  updatePasien: async (id: number | string, data: any) => {
    const res = await api.put<ApiResponse<Pasien>>(`/pasien/${id}`, data);
    return res.data;
  },
  deletePasien: async (id: number | string) => {
    const res = await api.delete<ApiResponse<any>>(`/pasien/${id}`);
    return res.data;
  },

  // Jadwal Dokter Endpoints (/jadwal-dokter)
  getAllJadwalDokter: async (params?: { ruangan_id?: number; dokter_id?: number; hari?: string; is_active?: boolean }) => {
    const res = await api.get<ApiResponse<JadwalDokter[]>>('/jadwal-dokter', { params });
    return res.data;
  },
  getJadwalDokterById: async (id: number) => {
    const res = await api.get<ApiResponse<JadwalDokter>>(`/jadwal-dokter/${id}`);
    return res.data;
  },
  createJadwalDokter: async (data: any) => {
    const res = await api.post<ApiResponse<JadwalDokter>>('/jadwal-dokter', data);
    return res.data;
  },
  updateJadwalDokter: async (id: number, data: any) => {
    const res = await api.put<ApiResponse<JadwalDokter>>(`/jadwal-dokter/${id}`, data);
    return res.data;
  },
  deleteJadwalDokter: async (id: number) => {
    const res = await api.delete<ApiResponse<any>>(`/jadwal-dokter/${id}`);
    return res.data;
  },

  // Registrasi & Antrean Rawat Jalan (/pendaftaran/rawat-jalan)
  daftarRawatJalan: async (data: any) => {
    const res = await api.post<ApiResponse<PendaftaranRawatJalan>>('/pendaftaran/rawat-jalan', data);
    return res.data;
  },
  getAllPendaftaran: async (params?: {
    tanggal_kunjungan?: string;
    ruangan_id?: number;
    dokter_id?: number;
    status_antrean?: string;
    jenis_penjamin?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await api.get<ApiResponse<PendaftaranRawatJalan[]>>('/pendaftaran/rawat-jalan', { params });
    return res.data;
  },
  getPendaftaranById: async (id: number) => {
    const res = await api.get<ApiResponse<PendaftaranRawatJalan>>(`/pendaftaran/rawat-jalan/${id}`);
    return res.data;
  },
  updateStatusPendaftaran: async (id: number, status_antrean: string, catatan?: string) => {
    const res = await api.patch<ApiResponse<any>>(`/pendaftaran/rawat-jalan/${id}/status`, {
      status_antrean,
      catatan,
    });
    return res.data;
  },
};

export default api;
