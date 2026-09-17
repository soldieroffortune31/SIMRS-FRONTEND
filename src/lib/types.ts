export interface User {
  id: string;
  username: string;
  nama_lengkap: string;
  nip_nik?: string;
  email?: string;
}

export interface ContextInstalasi {
  id: number;
  kode: string;
  nama: string;
}

export interface ContextRuangan {
  id: number;
  kode: string;
  nama: string;
}

export interface ContextRole {
  id: number;
  kode: string;
  nama: string;
}

export interface ActiveContext {
  instalasi: ContextInstalasi;
  ruangan: ContextRuangan;
  role: ContextRole;
}

export interface AssignedRuangan {
  ruangan_id: number;
  kode_ruangan: string;
  nama_ruangan: string;
  role_id: number;
  kode_role: string;
  nama_role: string;
  is_default: boolean;
}

export interface AvailableContext {
  instalasi_id: number;
  kode_instalasi: string;
  nama_instalasi: string;
  daftar_ruangan: AssignedRuangan[];
}

export interface MenuItem {
  id: number;
  parent_id: number | null;
  modul_id: number | null;
  kode_menu: string;
  nama_menu: string;
  icon: string;
  path: string;
  order_index: number;
  is_active: boolean;
  children?: MenuItem[];
}

export interface ModuleItem {
  id: number;
  kode_modul: string;
  nama_modul: string;
  deskripsi: string;
  icon: string;
  order_index: number;
  is_active: boolean;
}

export interface LoginResult {
  status: 'AUTHENTICATED' | 'REQUIRE_CONTEXT_SELECTION';
  message?: string;
  user: User;
  temp_token?: string;
  token?: string;
  available_contexts?: AvailableContext[];
  active_context?: ActiveContext;
  modules?: ModuleItem[];
  menus?: MenuItem[];
  permissions?: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: any;
}

// Pelayanan Types
export interface AntreanPoliItem {
  no_antrean: string;
  no_rm: string;
  nama_pasien: string;
  jaminan: string;
  status: 'MENUNGGU' | 'DIPERIKSA' | 'SELESAI' | 'BATAL';
  waktu_daftar: string;
}

export interface SensusRawatInapItem {
  no_bed: string;
  no_rm: string;
  nama_pasien: string;
  diagnosa_masuk: string;
  dpjp: string;
  hari_rawat_ke: number;
}

export interface ResepFarmasiItem {
  no_resep: string;
  asal_ruangan: string;
  nama_pasien: string;
  dokter_penulis: string;
  status_resep: 'MENUNGGU_TELAAH' | 'DISPENSING' | 'SELESAI';
  jumlah_r: number;
}

export interface TagihanKasirItem {
  no_billing: string;
  no_rm: string;
  nama_pasien: string;
  total_tagihan: number;
  status_pembayaran: 'BELUM_LUNAS' | 'LUNAS';
}
