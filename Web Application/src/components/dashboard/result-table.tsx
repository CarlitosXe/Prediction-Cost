// components/dashboard/result-table.tsx
import { PredictResults, FormData } from "@/types/predict";

interface ResultTableProps {
  results: PredictResults;
  formData: FormData;
}

interface CostCategory {
  id: keyof PredictResults;
  label: string;
}

export default function ResultTable({ results, formData }: ResultTableProps) {
  // Format number to IDR
  const formatIDR = (number: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Data mapping for the table
  const costCategories: CostCategory[] = [
    { id: "non_Bedah", label: "Non Bedah" },
    { id: "bedah", label: "Bedah" },
    { id: "konsul_Dokter", label: "Konsultasi Dokter" },
    { id: "konsul_Tenaga_Ahli", label: "Konsultasi Tenaga Ahli" },
    { id: "tind_Keperawatan", label: "Tindakan Keperawatan" },
    { id: "penunjang", label: "Penunjang" },
    { id: "radiologi", label: "Radiologi" },
    { id: "laboratorium", label: "Laboratorium" },
    { id: "pelayanan_Darah", label: "Pelayanan Darah" },
    { id: "rehabilitasi", label: "Rehabilitasi" },
    { id: "akomodasi", label: "Akomodasi" },
    { id: "akomodasi_Intensif", label: "Akomodasi Intensif" },
    { id: "bmhp", label: "BMHP" },
    { id: "alat_Medis", label: "Alat Medis" },
    { id: "obat", label: "Obat" },
    { id: "obat_Kronis", label: "Obat Kronis" },
    { id: "obat_Kemoterapi", label: "Obat Kemoterapi" },
    { id: "alkes", label: "Alkes" },
    { id: "total_Cost", label: "Total Biaya" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Hasil Prediksi Biaya
        </h3>
      </div>

      {/* Input Parameter Summary */}
      <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Parameter Input:
        </h4>
        <div className="grid grid-cols-1 text-black md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">ICD Primer:</span>{" "}
            <span className="text-gray-700">{formData.icdPrimer}</span>
          </div>
          {formData.icdSekunder1 && (
            <div>
              <span className="font-medium">ICD Sekunder 1:</span>{" "}
              <span className="text-gray-700">{formData.icdSekunder1}</span>
            </div>
          )}
          {formData.icdSekunder2 && (
            <div>
              <span className="font-medium">ICD Sekunder 2:</span>{" "}
              <span className="text-gray-700">{formData.icdSekunder2}</span>
            </div>
          )}
          {formData.icdSekunder3 && (
            <div>
              <span className="font-medium">ICD Sekunder 3:</span>{" "}
              <span className="text-gray-700">{formData.icdSekunder3}</span>
            </div>
          )}
          <div>
            <span className="font-medium">Lama Rawat:</span>{" "}
            {formData.lamaRawat} hari
          </div>
          <div>
            <span className="font-medium">Tipe Pasien:</span>{" "}
            {formData.tipePasien}
          </div>
          <div>
            <span className="font-medium">Kode Rujukan:</span>{" "}
            {formData.kodeRujukan}
          </div>
        </div>
      </div>

      {/* Tabel hasil prediksi */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kategori Biaya
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nilai Prediksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {costCategories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {category.label}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatIDR(results[category.id])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
