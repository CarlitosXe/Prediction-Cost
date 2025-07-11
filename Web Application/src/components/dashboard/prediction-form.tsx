// components/dashboard/prediction-form.tsx
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { FormData } from "@/types/predict";

interface PredictionFormProps {
  onPredict: (formData: FormData) => void;
  isLoading?: boolean; // 🔥 TAMBAHAN: Prop untuk sync loading dengan parent
  loadingMessage?: string; // 🔥 TAMBAHAN: Prop untuk loading message dari parent
}

interface OptionType {
  value: string;
  label: string;
}

interface ICDData {
  code: string;
  description: string;
}

export default function PredictionForm({ 
  onPredict, 
  isLoading: externalLoading = false, // 🔥 TAMBAHAN: External loading state
  loadingMessage = "Processing..." // 🔥 TAMBAHAN: Default loading message
}: PredictionFormProps) {
  const [formData, setFormData] = useState<FormData>({
    icdPrimer: "",
    icdSekunder1: "",
    icdSekunder2: "",
    icdSekunder3: "",
    lamaRawat: "",
    tipePasien: "",
    kodeRujukan: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );
  const [icdOptions, setIcdOptions] = useState<OptionType[]>([]);
  const [icdSekunderOptions, setIcdSekunderOptions] = useState<OptionType[]>(
    []
  );
  const [isLoadingICD, setIsLoadingICD] = useState(true);

  // Fetch ICD data from API
  useEffect(() => {
    const fetchICDData = async () => {
      try {
        setIsLoadingICD(true);
        const response = await fetch("/api/icd");
        const result = await response.json();

        if (result.success) {
          // Transform ICD data to dropdown options format
          const options = result.data.map((icd: ICDData) => ({
            value: icd.code,
            label: `${icd.code} - ${icd.description}`,
          }));

          setIcdOptions(options);
          setIcdSekunderOptions(options);
        } else {
          console.error("Failed to fetch ICD data");
        }
      } catch (error) {
        console.error("Error fetching ICD data:", error);
      } finally {
        setIsLoadingICD(false);
      }
    };

    fetchICDData();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Clear error for this field if it exists
    if (errors[id as keyof FormData]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id as keyof FormData];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Only ICD Primer and Lama Rawat are required
    if (!formData.icdPrimer) {
      newErrors.icdPrimer = "ICD Primer harus dipilih";
    }

    if (!formData.lamaRawat) {
      newErrors.lamaRawat = "Lama rawat harus dipilih";
    }

    if (!formData.tipePasien) {
      newErrors.tipePasien = "Tipe pasien harus dipilih";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      onPredict(formData); // 🔥 PERUBAHAN: Tidak ada setTimeout lagi, langsung call parent
    }
  };

  // Data untuk dropdown tipe pasien
  const tipePasienOptions: OptionType[] = [
    { value: "IN", label: "IN" },
    { value: "EMG", label: "EMG" },
  ];

  //Data untuk dropdown kode rujukan
  const kodeRujukanOptions: OptionType[] = [
    { value: "A", label: "A" },
    { value: "AR", label: "AR" },
    { value: "AS", label: "AS" },
    { value: "B", label: "B" },
    { value: "C", label: "C" },
    { value: "D", label: "D" },
    { value: "DK", label: "DK" },
    { value: "DU", label: "DU" },
    { value: "E", label: "E" },
    { value: "F", label: "F" },
    { value: "G", label: "G" },
    { value: "H", label: "H" },
    { value: "X", label: "X" },
  ];

  // 🔥 TAMBAHAN: Determine loading state - either from ICD loading or external prediction loading
  const isAnyLoading = isLoadingICD || externalLoading;

  return (
    <div className="bg-white rounded-lg shadow-sm mb-8 p-6">
      <h2 className="text-xl font-semibold text-blue-600 mb-6">
        Prediksi Biaya Medis
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="icdPrimer"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ICD Primer <span className="text-red-500">*</span>
            </label>
            <select
              id="icdPrimer"
              className={`w-full rounded-md text-black p-2 border ${
                errors.icdPrimer ? "border-red-500" : "border-gray-300"
              } shadow-sm focus:border-blue-500 focus:ring-blue-500`}
              value={formData.icdPrimer}
              onChange={handleChange}
              disabled={isAnyLoading} // 🔥 PERUBAHAN: Disable saat any loading
            >
              <option value="">Pilih ICD Primer</option>
              {isLoadingICD ? (
                <option>Loading...</option>
              ) : (
                icdOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              )}
            </select>
            {errors.icdPrimer && (
              <p className="mt-1 text-sm text-red-500">{errors.icdPrimer}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="icdSekunder1"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ICD Sekunder 1
            </label>
            <select
              id="icdSekunder1"
              className="w-full text-black p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.icdSekunder1}
              onChange={handleChange}
              disabled={isAnyLoading} // 🔥 PERUBAHAN: Disable saat any loading
            >
              <option value="">Pilih ICD Sekunder 1</option>
              {isLoadingICD ? (
                <option>Loading...</option>
              ) : (
                icdSekunderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="icdSekunder2"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ICD Sekunder 2
            </label>
            <select
              id="icdSekunder2"
              className="w-full rounded-md text-black p-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.icdSekunder2}
              onChange={handleChange}
              disabled={isAnyLoading} // 🔥 PERUBAHAN: Disable saat any loading
            >
              <option value="">Pilih ICD Sekunder 2</option>
              {isLoadingICD ? (
                <option>Loading...</option>
              ) : (
                icdSekunderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="icdSekunder3"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ICD Sekunder 3
            </label>
            <select
              id="icdSekunder3"
              className="w-full text-black p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.icdSekunder3}
              onChange={handleChange}
              disabled={isAnyLoading} // 🔥 PERUBAHAN: Disable saat any loading
            >
              <option value="">Pilih ICD Sekunder 3</option>
              {isLoadingICD ? (
                <option>Loading...</option>
              ) : (
                icdSekunderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="lamaRawat"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Lama Rawat <span className="text-red-500">*</span>
            </label>
            <input
              className={`w-full text-black p-2 rounded-md border ${
                errors.lamaRawat ? "border-red-500" : "border-gray-300"
              } shadow-sm focus:border-blue-500 focus:ring-blue-500`}
              id="lamaRawat"
              type="number"
              min="0"
              value={formData.lamaRawat} // 🔥 PERUBAHAN: Tambah value
              onChange={handleChange}
              placeholder="Masukkan lama rawat"
              disabled={isAnyLoading} // 🔥 PERUBAHAN: Disable saat any loading
            />
            {errors.lamaRawat && (
              <p className="mt-1 text-sm text-red-500">{errors.lamaRawat}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="tipePasien"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tipe Pasien <span className="text-red-500">*</span>
            </label>
            <select
              id="tipePasien"
              className={`w-full text-black p-2 rounded-md border ${
                errors.tipePasien ? "border-red-500" : "border-gray-300"
              } shadow-sm focus:border-blue-500 focus:ring-blue-500`}
              value={formData.tipePasien}
              onChange={handleChange}
              disabled={isAnyLoading} // 🔥 PERUBAHAN: Disable saat any loading
            >
              <option value="">Pilih Tipe Pasien</option>
              {tipePasienOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.tipePasien && (
              <p className="mt-1 text-sm text-red-500">{errors.tipePasien}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="kodeRujukan"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Kode Rujukan
            </label>
            <select
              id="kodeRujukan"
              className={`w-full text-black p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
              value={formData.kodeRujukan}
              onChange={handleChange}
              disabled={isAnyLoading} // 🔥 PERUBAHAN: Disable saat any loading
            >
              <option value="">Pilih Kode Rujukan</option>
              {kodeRujukanOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.kodeRujukan && (
              <p className="mt-1 text-sm text-red-500">{errors.kodeRujukan}</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="submit"
            disabled={isAnyLoading} // 🔥 PERUBAHAN: Disable condition yang lebih baik
            className={`px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
              isAnyLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {/* 🔥 PERUBAHAN: Button content yang lebih smart */}
            {externalLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {loadingMessage}
              </div>
            ) : isLoadingICD ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading ICD Data...
              </div>
            ) : (
              "Predict"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}