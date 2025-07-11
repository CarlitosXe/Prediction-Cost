"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "react-hot-toast";

interface HistoryItem {
  id: number;
  icd_primer: string;
  icd_sekunder1: string | null;
  icd_sekunder2: string | null;
  icd_sekunder3: string | null;
  lama_rawat: number;
  tipe_pasien: string;
  kode_rujukan: string;
  created_at: string;
  type?: string;
  total_cost?: number;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      // Fetch prediction history
      const predictionResponse = await fetch("/api/prediction/history");

      if (!predictionResponse.ok) {
        throw new Error("Gagal mengambil data history prediksi");
      }

      const predictionData = await predictionResponse.json();
      const predictions = predictionData.predictions.map((item: any) => ({
        ...item,
        type: "prediction",
      }));

      // Fetch classification history
      const classificationResponse = await fetch("/api/classification/history");

      if (!classificationResponse.ok) {
        throw new Error("Gagal mengambil data history klasifikasi");
      }

      const classificationData = await classificationResponse.json();
      const classifications = classificationData.classifications.map(
        (item: any) => ({
          ...item,
          type: "classification",
        })
      );

      // Combine and sort by date (newest first)
      const combinedHistory = [...predictions, ...classifications].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setHistory(combinedHistory);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Gagal memuat data history");
    } finally {
      setLoading(false);
    }
  };

  const toggleDetails = async (id: number, type: string) => {
    if (expandedItem === id) {
      setExpandedItem(null);
      setDetailData(null);
      return;
    }

    try {
      let response;

      if (type === "prediction") {
        response = await fetch(`/api/prediction/detail/${id}`);
      } else {
        response = await fetch(`/api/classification/detail/${id}`);
      }

      if (!response.ok) {
        throw new Error(
          `Gagal mengambil detail ${
            type === "prediction" ? "prediksi" : "klasifikasi"
          }`
        );
      }

      const data = await response.json();
      console.log("Detail data:", data); // Debug log to see the structure

      setDetailData({
        ...data[type === "prediction" ? "prediction" : "classification"],
        type,
      });
      setExpandedItem(id);
    } catch (error) {
      console.error("Error fetching detail:", error);
      toast.error(
        `Gagal memuat detail ${
          type === "prediction" ? "prediksi" : "klasifikasi"
        }`
      );
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMMM yyyy, HH:mm", { locale: id });
    } catch (error) {
      return dateString;
    }
  };

  const filterHistory = (tab: string) => {
    setActiveTab(tab);
  };

  const filteredHistory = history.filter((item) => {
    if (activeTab === "all") return true;
    return item.type === activeTab;
  });

  // Improved function to render classification results properly
  const renderClassificationResults = (resultsData: any) => {
    if (!resultsData) {
      return <p className="text-sm text-gray-600">Tidak ada data</p>;
    }

    console.log("Rendering results:", resultsData);

    // Handle case where we have topCategories structure
    if (resultsData.topCategories) {
      const categories = resultsData.topCategories;

      // If it's an array, map through it
      if (Array.isArray(categories)) {
        return categories.map((category: any, index: number) => {
          // Handle the nested procedures array if it exists
          if (category.procedures && Array.isArray(category.procedures)) {
            // Filter procedures dengan probability > 0
            const relevantProcedures = category.procedures.filter(
              (procedure: any) => procedure.probability > 0
            );
            
            // Jika tidak ada procedures yang relevan, skip kategori ini
            if (relevantProcedures.length === 0) {
              return null;
            }

            return (
              <div key={`category-${index}`} className="mb-2">
                <p className="text-sm font-medium text-gray-700">
                  {category.categoryName || "Unnamed Category"}
                </p>
                {relevantProcedures.map(
                  (procedure: any, procIndex: number) => (
                    <p
                      key={`procedure-${procIndex}`}
                      className="text-sm text-gray-600 ml-2"
                    >
                      {procedure.name}
                      {/* Optional: tampilkan probability jika perlu */}
                      {procedure.probability !== undefined && (
                        <span className="text-xs text-gray-400 ml-2">
                          ({(procedure.probability * 100).toFixed(0)}%)
                        </span>
                      )}
                    </p>
                  )
                )}
              </div>
            );
          }

          // Standard category display (jika tidak ada procedures)
          return (
            <p key={`category-${index}`} className="text-sm text-gray-600">
              {category.categoryName || category.name || "Unnamed"}:{" "}
              {category.probability !== undefined
                ? `${(category.probability * 100).toFixed(2)}%`
                : "N/A"}
            </p>
          );
        }).filter(Boolean); // Remove null values
      }

      // If it's an object with keys
      if (typeof categories === "object" && categories !== null) {
        return Object.entries(categories).map(
          ([key, value]: [string, any], index) => (
            <p key={`category-${index}`} className="text-sm text-gray-600">
              {key}:{" "}
              {typeof value === "number"
                ? `${(value * 100).toFixed(2)}%`
                : typeof value === "object" && value?.probability
                ? `${(value.probability * 100).toFixed(2)}%`
                : "N/A"}
            </p>
          )
        );
      }
    }

    // If it's a direct array of results
    if (Array.isArray(resultsData)) {
      return resultsData.map((item: any, index: number) => (
        <p key={`item-${index}`} className="text-sm text-gray-600">
          {item.name || "Unnamed"}:{" "}
          {item.probability ? `${(item.probability * 100).toFixed(2)}%` : "N/A"}
        </p>
      ));
    }

    // If it's an object but not with the expected structure
    if (typeof resultsData === "object" && resultsData !== null) {
      return Object.entries(resultsData).map(
        ([key, value]: [string, any], index) => (
          <p key={`result-${index}`} className="text-sm text-gray-600">
            {key}:{" "}
            {typeof value === "number"
              ? `${(value * 100).toFixed(2)}%`
              : typeof value === "object"
              ? JSON.stringify(value)
              : String(value)}
          </p>
        )
      );
    }

    // Fallback: just display as string
    return <p className="text-sm text-gray-600">{String(resultsData)}</p>;
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b">
        <h1 className="text-2xl font-bold text-gray-800">Riwayat</h1>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          Kembali ke Dashboard
        </Link>
      </div>

      <div className="p-4 border-b">
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === "all"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-800"
            }`}
            onClick={() => filterHistory("all")}
          >
            Semua
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === "prediction"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-800"
            }`}
            onClick={() => filterHistory("prediction")}
          >
            Prediksi
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === "classification"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-800"
            }`}
            onClick={() => filterHistory("classification")}
          >
            Klasifikasi
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center">
          <p className="text-gray-600">Memuat data history...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-gray-600">Belum ada data history.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ICD Primer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lama Rawat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe Pasien
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.map((item, index) => (
                <React.Fragment key={`${item.type}-${item.id}`}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.type === "prediction"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {item.type === "prediction"
                          ? "Prediksi"
                          : "Klasifikasi"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.icd_primer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.lama_rawat} hari
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.tipe_pasien}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() =>
                          toggleDetails(item.id, item.type || "prediction")
                        }
                        className="text-indigo-600 hover:cursor-pointer hover:text-indigo-900"
                      >
                        {expandedItem === item.id ? "Tutup" : "Detail"}
                      </button>
                    </td>
                  </tr>
                  {expandedItem === item.id && detailData && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        {detailData.type === "prediction" ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                Data ICD
                              </h3>
                              <p className="text-sm text-gray-600">
                                Primer: {detailData.icd_primer}
                              </p>
                              {detailData.icd_sekunder1 && (
                                <p className="text-sm text-gray-600">
                                  Sekunder 1: {detailData.icd_sekunder1}
                                </p>
                              )}
                              {detailData.icd_sekunder2 && (
                                <p className="text-sm text-gray-600">
                                  Sekunder 2: {detailData.icd_sekunder2}
                                </p>
                              )}
                              {detailData.icd_sekunder3 && (
                                <p className="text-sm text-gray-600">
                                  Sekunder 3: {detailData.icd_sekunder3}
                                </p>
                              )}
                            </div>

                            <div>
                              <h3 className="font-medium text-gray-900">
                                Data Pasien
                              </h3>
                              <p className="text-sm text-gray-600">
                                Lama Rawat: {detailData.lama_rawat} hari
                              </p>
                              <p className="text-sm text-gray-600">
                                Tipe Pasien: {detailData.tipe_pasien}
                              </p>
                              <p className="text-sm text-gray-600">
                                Kode Rujukan: {detailData.kode_rujukan}
                              </p>
                            </div>

                            <div>
                              <h3 className="font-medium text-gray-900">
                                Total Biaya
                              </h3>
                              <p className="text-sm text-gray-600">
                                Rp {formatNumber(detailData.total_cost)}
                              </p>
                            </div>

                            <div className="md:col-span-2 lg:col-span-3">
                              <h3 className="font-medium text-gray-900 mb-2">
                                Rincian Biaya
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                <p className="text-sm text-gray-600">
                                  Non Bedah: Rp{" "}
                                  {formatNumber(detailData.non_bedah)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Bedah: Rp {formatNumber(detailData.bedah)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Konsul Dokter: Rp{" "}
                                  {formatNumber(detailData.konsul_dokter)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Konsul Ahli: Rp{" "}
                                  {formatNumber(detailData.konsul_tenaga_ahli)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Keperawatan: Rp{" "}
                                  {formatNumber(detailData.tind_keperawatan)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Penunjang: Rp{" "}
                                  {formatNumber(detailData.penunjang)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Radiologi: Rp{" "}
                                  {formatNumber(detailData.radiologi)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Lab: Rp{" "}
                                  {formatNumber(detailData.laboratorium)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Pelayanan Darah: Rp{" "}
                                  {formatNumber(detailData.pelayanan_darah)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Rehab: Rp{" "}
                                  {formatNumber(detailData.rehabilitasi)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Akomodasi: Rp{" "}
                                  {formatNumber(detailData.akomodasi)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Akomodasi Intensif: Rp{" "}
                                  {formatNumber(detailData.akomodasi_intensif)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  BMHP: Rp {formatNumber(detailData.bmhp)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Alat Medis: Rp{" "}
                                  {formatNumber(detailData.alat_medis)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Obat: Rp {formatNumber(detailData.obat)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Obat Kronis: Rp{" "}
                                  {formatNumber(detailData.obat_kronis)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Obat Kemoterapi: Rp{" "}
                                  {formatNumber(detailData.obat_kemoterapi)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Alkes: Rp {formatNumber(detailData.alkes)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                Data ICD
                              </h3>
                              <p className="text-sm text-gray-600">
                                Primer: {detailData.icd_primer}
                              </p>
                              {detailData.icd_sekunder1 && (
                                <p className="text-sm text-gray-600">
                                  Sekunder 1: {detailData.icd_sekunder1}
                                </p>
                              )}
                              {detailData.icd_sekunder2 && (
                                <p className="text-sm text-gray-600">
                                  Sekunder 2: {detailData.icd_sekunder2}
                                </p>
                              )}
                              {detailData.icd_sekunder3 && (
                                <p className="text-sm text-gray-600">
                                  Sekunder 3: {detailData.icd_sekunder3}
                                </p>
                              )}
                            </div>

                            <div>
                              <h3 className="font-medium text-gray-900">
                                Data Pasien
                              </h3>
                              <p className="text-sm text-gray-600">
                                Lama Rawat: {detailData.lama_rawat} hari
                              </p>
                              <p className="text-sm text-gray-600">
                                Tipe Pasien: {detailData.tipe_pasien}
                              </p>
                              <p className="text-sm text-gray-600">
                                Kode Rujukan: {detailData.kode_rujukan}
                              </p>
                            </div>

                            <div className="md:col-span-2">
                              <h3 className="font-medium text-gray-900 mb-2">
                                Hasil Klasifikasi Obat
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {detailData.drug_results ? (
                                  renderClassificationResults(
                                    detailData.drug_results
                                  )
                                ) : (
                                  <p className="text-sm text-gray-600">
                                    Tidak ada data
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="md:col-span-2">
                              <h3 className="font-medium text-gray-900 mb-2">
                                Hasil Klasifikasi Radiologi
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {detailData.radio_results ? (
                                  renderClassificationResults(
                                    detailData.radio_results
                                  )
                                ) : (
                                  <p className="text-sm text-gray-600">
                                    Tidak ada data
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="md:col-span-2">
                              <h3 className="font-medium text-gray-900 mb-2">
                                Hasil Klasifikasi Laboratorium
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {detailData.laborat_results ? (
                                  renderClassificationResults(
                                    detailData.laborat_results
                                  )
                                ) : (
                                  <p className="text-sm text-gray-600">
                                    Tidak ada data
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}