import axios from 'axios';
import {
  ApiResponse,
  LoginResult,
  MenuItem,
  AntreanPoliItem,
  SensusRawatInapItem,
  ResepFarmasiItem,
  TagihanKasirItem,
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

// Master Data Endpoints
export const masterApi = {
  getInstalasi: async (includeRuangan = false) => {
    const res = await api.get<ApiResponse<any[]>>(`/master/instalasi?include_ruangan=${includeRuangan}`);
    return res.data;
  },

  getRuangan: async (instalasiId?: number) => {
    const url = instalasiId ? `/master/ruangan?instalasi_id=${instalasiId}` : '/master/ruangan';
    const res = await api.get<ApiResponse<any[]>>(url);
    return res.data;
  },

  getRoles: async () => {
    const res = await api.get<ApiResponse<any[]>>('/master/roles');
    return res.data;
  },

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

export default api;
