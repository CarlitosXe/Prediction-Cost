using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;
using CpCostApi.Data;
using CpCostApi.Models;

namespace CpCostApi.Services;

public class CpCostService
{
    // InferenceSession untuk masing-masing kategori biaya
    private readonly InferenceSession _nonbedah;
    private readonly InferenceSession _bedah;
    private readonly InferenceSession _konsuldokter;
    private readonly InferenceSession _tindkeperawatan;
    private readonly InferenceSession _radiologi;
    private readonly InferenceSession _laboratorium;
    private readonly InferenceSession _pelayanandarah;
    private readonly InferenceSession _rehabilitasi;
    private readonly InferenceSession _akomodasi;
    private readonly InferenceSession _akomodasiintensif;
    private readonly InferenceSession _obat;
    private readonly InferenceSession _alkes;
    private readonly InferenceSession _totalcost;

    // Encoding ICD
    private readonly Dictionary<string, float> _icdPrimerEncoding;
    private readonly Dictionary<string, float> _icdSekunder1Encoding;
    private readonly Dictionary<string, float> _icdSekunder2Encoding;
    private readonly Dictionary<string, float> _icdSekunder3Encoding;

    public CpCostService()
    {
        // Load model ONNX untuk prediksi biaya
        _nonbedah = new InferenceSession("wwwroot/xgb_non_bedah.onnx");
        _bedah = new InferenceSession("wwwroot/lightgbm_bedah.onnx");
        _konsuldokter = new InferenceSession("wwwroot/lightgbm_konsul_dokter.onnx");
        _tindkeperawatan = new InferenceSession("wwwroot/lightgbm_tind_kep.onnx");
        _radiologi = new InferenceSession("wwwroot/lightgbm_radiologi.onnx");
        _laboratorium = new InferenceSession("wwwroot/lightgbm_laboratorium.onnx");
        _pelayanandarah = new InferenceSession("wwwroot/lightgbm_pelayanan_darah.onnx");
        _rehabilitasi = new InferenceSession("wwwroot/lightgbm_rehabilitasi.onnx");
        _akomodasi = new InferenceSession("wwwroot/lightgbm_akomodasi.onnx");
        _akomodasiintensif = new InferenceSession("wwwroot/lightgbm_akomodasiintensif.onnx");
        _obat = new InferenceSession("wwwroot/xgb_obat.onnx");
        _alkes = new InferenceSession("wwwroot/lightgbm_alkes.onnx");
        _totalcost = new InferenceSession("wwwroot/lightgbm_total_cost.onnx");
        
        // Load encoding ICD
        _icdPrimerEncoding = EncodingLoader.Load("wwwroot/ICD_TargetEncode.json", "ICD_Primer", "after_encoding");
        _icdSekunder1Encoding = EncodingLoader.Load("wwwroot/ICD_TargetEncode.json", "ICD_Sekunder1", "after_encoding");
        _icdSekunder2Encoding = EncodingLoader.Load("wwwroot/ICD_TargetEncode.json", "ICD_Sekunder2", "after_encoding");
        _icdSekunder3Encoding = EncodingLoader.Load("wwwroot/ICD_TargetEncode.json", "ICD_Sekunder3", "after_encoding");
    }

    public (float Non_Bedah, float Bedah, float KonsulDokter, float TindKeperawatan, float Radiologi, float Laboratorium,
            float PelayananDarah, float Rehabilitasi, float Akomodasi, float AkomodasiIntensif, float Obat, float Alkes, float TotalCost)
    Predict(CpCostRequest request)
    {
        try
        {
            // Konversi ICD ke encoding
            float icdPrimer = EncodeICDPrimer(request.ICDPrimer);
            float icdSekunder1 = EncodeICDSekunder1(request.ICDSekunder1);
            float icdSekunder2 = EncodeICDSekunder2(request.ICDSekunder2);
            float icdSekunder3 = EncodeICDSekunder3(request.ICDSekunder3);

            // Parsing input angka
            if (!float.TryParse(request.LamaRawat, out float lamaRawat)) lamaRawat = 0;
            float tipePasien = request.TipePasien == "IN" ? 1 : request.TipePasien == "EMG" ? 0 : 0;

            // Membuat tensor input
            var inputTensor = new DenseTensor<float>(new float[]
            {
                icdPrimer, icdSekunder1, icdSekunder2, icdSekunder3,
                lamaRawat, tipePasien
            }, new[] { 1, 6 });

            var inputs = new List<NamedOnnxValue>
            {
                NamedOnnxValue.CreateFromTensor("input", inputTensor)
            };

            // Jalankan prediksi untuk masing-masing kategori biaya
            return (
                _nonbedah.Run(inputs).First().AsEnumerable<float>().First(),
                _bedah.Run(inputs).First().AsEnumerable<float>().First(),
                _konsuldokter.Run(inputs).First().AsEnumerable<float>().First(),
                _tindkeperawatan.Run(inputs).First().AsEnumerable<float>().First(),
                _radiologi.Run(inputs).First().AsEnumerable<float>().First(),
                _laboratorium.Run(inputs).First().AsEnumerable<float>().First(),
                _pelayanandarah.Run(inputs).First().AsEnumerable<float>().First(),
                _rehabilitasi.Run(inputs).First().AsEnumerable<float>().First(),
                _akomodasi.Run(inputs).First().AsEnumerable<float>().First(),
                _akomodasiintensif.Run(inputs).First().AsEnumerable<float>().First(),
                _obat.Run(inputs).First().AsEnumerable<float>().First(),
                _alkes.Run(inputs).First().AsEnumerable<float>().First(),
                _totalcost.Run(inputs).First().AsEnumerable<float>().First()
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error saat memproses prediksi: {ex.Message}");
            return (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0); // Nilai default jika terjadi error
        }
    }

    // Fungsi encoding ICD
    private float EncodeICDPrimer(string icd) => _icdPrimerEncoding.TryGetValue(icd, out float value) ? value : 0;
    private float EncodeICDSekunder1(string icd) => _icdSekunder1Encoding.TryGetValue(icd, out float value) ? value : 0;
    private float EncodeICDSekunder2(string icd) => _icdSekunder2Encoding.TryGetValue(icd, out float value) ? value : 0;
    private float EncodeICDSekunder3(string icd) => _icdSekunder3Encoding.TryGetValue(icd, out float value) ? value : 0;
}
