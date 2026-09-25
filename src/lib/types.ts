export interface User {
  id: number;
  username: string;
  nama_lengkap: string;
  nip_nik?: string;
  email?: string;
  is_active?: boolean;
}

// Master Data Models (Auto Increment)
export interface Instalasi {
  id: number;
  kode_instalasi: string;
  nama_instalasi: string;
  is_active: boolean;
  ruangan?: Ruangan[];
  ruangans?: Ruangan[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Ruangan {
  id: number;
  instalasi_id: number;
  kode_ruangan: string;
  nama_ruangan: string;
  is_active: boolean;
  instalasi?: Instalasi;
  createdAt?: string;
  updatedAt?: string;
}

export interface Permission {
  id: number;
  menu_id: number;
  kode_permission: string;
  nama_permission: string;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  id: number;
  kode_role: string;
  nama_role: string;
  keterangan?: string;
  deskripsi?: string;
  permissions?: Permission[];
  menus?: MenuItem[];
  createdAt?: string;
  updatedAt?: string;
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

// Wilayah Types
export interface Provinsi {
  id: number;
  kode_provinsi: string;
  nama_provinsi: string;
  is_active: boolean;
  kabupaten_kota?: KabupatenKota[];
  createdAt?: string;
  updatedAt?: string;
}

export interface KabupatenKota {
  id: number;
  provinsi_id: number;
  kode_kabupaten: string;
  nama_kabupaten: string;
  tipe: 'KABUPATEN' | 'KOTA';
  is_active: boolean;
  provinsi?: Provinsi;
  kecamatan?: Kecamatan[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Kecamatan {
  id: number;
  kabupaten_id: number;
  kode_kecamatan: string;
  nama_kecamatan: string;
  is_active: boolean;
  kabupaten?: KabupatenKota;
  desa_kelurahan?: DesaKelurahan[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DesaKelurahan {
  id: number;
  kecamatan_id: number;
  kode_desa: string;
  nama_desa: string;
  tipe: 'DESA' | 'KELURAHAN';
  kode_pos?: string;
  is_active: boolean;
  kecamatan?: Kecamatan;
  createdAt?: string;
  updatedAt?: string;
}

export interface KodePos {
  id: number;
  kode_pos: string;
  provinsi_id?: number | null;
  kabupaten_id?: number | null;
  kecamatan_id?: number | null;
  desa_id?: number | null;
  keterangan?: string | null;
  is_active: boolean;
  provinsi?: Provinsi;
  kabupaten?: KabupatenKota;
  kecamatan?: Kecamatan;
  desa?: DesaKelurahan;
  createdAt?: string;
  updatedAt?: string;
}

// Pasien Types
export interface Pasien {
  id: number;
  no_rm: string;
  nik?: string;
  nama_lengkap: string;
  jenis_kelamin: 'L' | 'P';
  tempat_lahir: string;
  tanggal_lahir: string;
  golongan_darah?: 'A' | 'B' | 'AB' | 'O' | 'TIDAK_TAHU';
  agama?: string;
  status_pernikahan?: 'BELUM_MENIKAH' | 'MENIKAH' | 'CERAI_HIDUP' | 'CERAI_MATI';
  pendidikan?: string;
  pekerjaan?: string;
  no_telepon?: string;
  email?: string;
  alamat_lengkap: string;
  rt?: string;
  rw?: string;
  provinsi_id?: number | null;
  kabupaten_id?: number | null;
  kecamatan_id?: number | null;
  desa_id?: number | null;
  kode_pos?: string;
  nama_penanggung_jawab?: string;
  hubungan_penanggung_jawab?: string;
  telepon_penanggung_jawab?: string;
  jenis_penjamin_default?: 'UMUM' | 'BPJS' | 'ASURANSI_SWASTA' | 'PERUSAHAAN';
  no_kartu_penjamin_default?: string;
  is_active: boolean;
  provinsi?: Provinsi;
  kabupaten?: KabupatenKota;
  kecamatan?: Kecamatan;
  desa?: DesaKelurahan;
  kunjungan_rawat_jalan?: PendaftaranRawatJalan[];
  createdAt?: string;
  updatedAt?: string;
}

// Jadwal Dokter Types
export interface JadwalDokter {
  id: number;
  dokter_id: number;
  ruangan_id: number;
  hari: 'SENIN' | 'SELASA' | 'RABU' | 'KAMIS' | 'JUMAT' | 'SABTU' | 'MINGGU';
  jam_mulai: string;
  jam_selesai: string;
  kuota_pasien: number;
  keterangan?: string;
  is_active: boolean;
  dokter?: {
    id: number;
    username: string;
    nama_lengkap: string;
    nip_nik?: string;
  };
  ruangan?: {
    id: number;
    kode_ruangan: string;
    nama_ruangan: string;
  };
}

// Pendaftaran Rawat Jalan Types
export type StatusAntrean = 'MENUNGGU' | 'DIPANGGIL' | 'SEDANG_DILAYANI' | 'SELESAI' | 'BATAL';
export type JenisPenjamin = 'UMUM' | 'BPJS' | 'ASURANSI_SWASTA' | 'PERUSAHAAN';

export interface PendaftaranRawatJalan {
  id: number;
  no_registrasi: string;
  no_antrean: string;
  angka_antrean: number;
  pasien_id: number;
  tipe_pasien: 'BARU' | 'LAMA';
  jadwal_dokter_id: number;
  dokter_id: number;
  ruangan_id: number;
  tanggal_kunjungan: string;
  jenis_penjamin: JenisPenjamin;
  no_kartu_penjamin?: string | null;
  keluhan_utama?: string | null;
  catatan?: string | null;
  status_antrean: StatusAntrean;
  created_by?: number | null;
  pasien?: Pasien;
  dokter?: {
    id: number;
    nama_lengkap: string;
    nip_nik?: string;
  };
  ruangan?: {
    id: number;
    kode_ruangan: string;
    nama_ruangan: string;
  };
  jadwal_dokter?: JadwalDokter;
  createdAt?: string;
  updatedAt?: string;
}

export interface PendaftaranRawatJalanPayload {
  tipe_pasien: 'BARU' | 'LAMA';
  pasien_id?: number;
  pasien_baru?: {
    nik?: string;
    nama_lengkap: string;
    jenis_kelamin: 'L' | 'P';
    tempat_lahir: string;
    tanggal_lahir: string;
    golongan_darah?: string;
    agama?: string;
    status_pernikahan?: string;
    pendidikan?: string;
    pekerjaan?: string;
    no_telepon?: string;
    email?: string;
    alamat_lengkap: string;
    rt?: string;
    rw?: string;
    provinsi_id?: number | null;
    kabupaten_id?: number | null;
    kecamatan_id?: number | null;
    desa_id?: number | null;
    kode_pos?: string;
    nama_penanggung_jawab?: string;
    hubungan_penanggung_jawab?: string;
    telepon_penanggung_jawab?: string;
  };
  jadwal_dokter_id: number;
  tanggal_kunjungan: string;
  jenis_penjamin: JenisPenjamin;
  no_kartu_penjamin?: string;
  keluhan_utama?: string;
  catatan?: string;
}
