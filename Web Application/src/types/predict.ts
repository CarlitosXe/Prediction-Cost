export interface CpCostRequest {
  ICDPrimer: string;
  ICDSekunder1: string;
  ICDSekunder2: string;
  ICDSekunder3: string;
  LamaRawat: string;
  TipePasien: "IN" | "EMG";
}

export interface CpCostResult {
  nonBedah: number;
  bedah: number;
  konsulDokter: number;
  tindKeperawatan: number;
  radiologi: number;
  laboratorium: number;
  pelayananDarah: number;
  rehabilitasi: number;
  akomodasi: number;
  akomodasiIntensif: number;
  obat: number;
  alkes: number;
  totalCost: number;
}

// Tipe data response asli dari API
export interface PredictResults {
  non_Bedah: number;
  bedah: number;
  konsul_Dokter: number;
  konsul_Tenaga_Ahli: number;
  tind_Keperawatan: number;
  penunjang: number;
  radiologi: number;
  laboratorium: number;
  pelayanan_Darah: number;
  rehabilitasi: number;
  akomodasi: number;
  akomodasi_Intensif: number;
  bmhp: number;
  alat_Medis: number;
  obat: number;
  obat_Kronis: number;
  obat_Kemoterapi: number;
  alkes: number;
  total_Cost: number;
}


export interface FormData {
  icdPrimer: string;
  icdSekunder1: string;
  icdSekunder2: string;
  icdSekunder3: string;
  lamaRawat: string;
  tipePasien: string;
  kodeRujukan: string;
}
