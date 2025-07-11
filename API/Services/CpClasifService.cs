using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;
using CpCostApi.Models;
using CpCostApi.Data;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;

namespace CpCostApi.Services
{
    public class CpClasifService
    {
        private readonly InferenceSession _drugCategoryModel;
        private readonly InferenceSession _drugProcedureModel;
        private readonly InferenceSession _radioCategoryModel;
        private readonly InferenceSession _radioProcedureModel;
        private readonly InferenceSession _laboratCategoryModel;
        private readonly InferenceSession _laboratProcedureModel;

        private readonly Dictionary<string, float> _icdEncoding;
        private readonly Dictionary<string, float> _icdSekunder1Encoding;
        private readonly Dictionary<string, float> _icdSekunder2Encoding;
        private readonly Dictionary<string, float> _icdSekunder3Encoding;
        private readonly Dictionary<string, float> _tipePasienEncoding;
        private readonly Dictionary<string, float> _kodeRujukanEncoding;
        private readonly float _lamaRawatMean;
        private readonly float _lamaRawatScale;

        private readonly Dictionary<float, string> _drugCategoryMapping;
        private readonly Dictionary<float, string> _drugProcedureMapping;
        private readonly Dictionary<string, List<string>> _drugCategoryToProcedures;
        private readonly Dictionary<float, string> _radioCategoryMapping;
        private readonly Dictionary<float, string> _radioProcedureMapping;
        private readonly Dictionary<string, List<string>> _radioCategoryToProcedures;
        private readonly Dictionary<float, string> _laboratCategoryMapping;
        private readonly Dictionary<float, string> _laboratProcedureMapping;
        private readonly Dictionary<string, List<string>> _laboratCategoryToProcedures;

        public CpClasifService()
        {
            try
            {
                Console.WriteLine("Initializing CpClasifService...");

                _drugCategoryModel = new InferenceSession("wwwroot/drug_catg_model.onnx");
                _drugProcedureModel = new InferenceSession("wwwroot/drug_proced_model.onnx");
                _radioCategoryModel = new InferenceSession("wwwroot/radio_catg_model.onnx");
                _radioProcedureModel = new InferenceSession("wwwroot/radio_proced_model.onnx");
                _laboratCategoryModel = new InferenceSession("wwwroot/laborat_catg_model.onnx");
                _laboratProcedureModel = new InferenceSession("wwwroot/laborat_proced_model.onnx");

                _icdEncoding = EncodingLoader.Load("wwwroot/clasif_icd_encode.json", "ICD_Primer", "after_encoding");
                _icdSekunder1Encoding = EncodingLoader.Load("wwwroot/clasif_icd_encode.json", "ICD_Sekunder1", "after_encoding");
                _icdSekunder2Encoding = EncodingLoader.Load("wwwroot/clasif_icd_encode.json", "ICD_Sekunder2", "after_encoding");
                _icdSekunder3Encoding = EncodingLoader.Load("wwwroot/clasif_icd_encode.json", "ICD_Sekunder3", "after_encoding");
                
                var tipePasienJson = JsonDocument.Parse(File.ReadAllText("wwwroot/clasif_tipe_pasien&kode_rujukan.json"));
                _tipePasienEncoding = LoadEncoding(tipePasienJson, "tipe_pasien");
                _kodeRujukanEncoding = LoadEncoding(tipePasienJson, "kode_rujukan");

                var scalerJson = JsonDocument.Parse(File.ReadAllText("wwwroot/clasif_scaler_params.json"));
                _lamaRawatMean = (float)scalerJson.RootElement.GetProperty("mean")[0].GetDouble();
                _lamaRawatScale = (float)scalerJson.RootElement.GetProperty("scale")[0].GetDouble();

                _drugCategoryMapping = LoadMapping("wwwroot/drug_cat_encoded_mapping.json", "category", "after_encoding");
                _drugProcedureMapping = LoadMapping("wwwroot/drug_encoded_mapping.json", "drug", "after_encoding");
                _radioCategoryMapping = LoadMapping("wwwroot/radio_cat_encoded_mapping.json", "category", "after_encoding");
                _radioProcedureMapping = LoadMapping("wwwroot/radio_encoded_mapping.json", "procedure", "after_encoding");
                _laboratCategoryMapping = LoadMapping("wwwroot/laborat_cat_encoded_mapping.json", "category", "after_encoding");
                _laboratProcedureMapping = LoadMapping("wwwroot/laborat_encoded_mapping.json", "test", "after_encoding");

                _drugCategoryToProcedures = LoadCategoryMapping("wwwroot/drug_category_mapping.json");
                _radioCategoryToProcedures = LoadCategoryMapping("wwwroot/radio_category_mapping.json");
                _laboratCategoryToProcedures = LoadCategoryMapping("wwwroot/laborat_category_mapping.json");

                Console.WriteLine("CpClasifService initialized successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CpClasifService constructor: {ex.Message}");
                throw;
            }
        }

        public string Predict(CpClasifRequest request)
        {
            var response = new StringBuilder();
            var predictions = GetPredictions(request);

            FormatSection(response, "Drug", predictions.Drug);
            FormatSection(response, "Radiology", predictions.Radio);
            FormatSection(response, "Laboratory", predictions.Laborat);

            response.AppendLine($"\nGenerated at: {DateTime.UtcNow:yyyy-MM-ddTHH:mm:ssZ}");
            return response.ToString();
        }

        private CpClasifResponse GetPredictions(CpClasifRequest request)
        {
            try
            {
                float icdPrimer = EncodingLoader.GetEncodedValue(_icdEncoding, request.ICDPrimer);
                float icdSekunder1 = EncodingLoader.GetEncodedValue(_icdSekunder1Encoding, request.ICDSekunder1);
                float icdSekunder2 = EncodingLoader.GetEncodedValue(_icdSekunder2Encoding, request.ICDSekunder2);
                float icdSekunder3 = EncodingLoader.GetEncodedValue(_icdSekunder3Encoding, request.ICDSekunder3);
                float tipePasien = EncodingLoader.GetEncodedValue(_tipePasienEncoding, request.TipePasien);
                float kodeRujukan = EncodingLoader.GetEncodedValue(_kodeRujukanEncoding, request.KodeRujukan ?? "A");
                float lamaRawat = (request.LamaRawat - _lamaRawatMean) / _lamaRawatScale;

                var inputTensor = new DenseTensor<float>(new float[]
                {
                    icdPrimer, icdSekunder1, icdSekunder2, icdSekunder3,
                    lamaRawat, tipePasien, kodeRujukan
                }, new[] { 1, 7 });

                var inputs = new List<NamedOnnxValue>
                {
                    NamedOnnxValue.CreateFromTensor("input", inputTensor)
                };

                var drugPrediction = PredictType(_drugCategoryModel, _drugProcedureModel, _drugCategoryMapping,
                    _drugProcedureMapping, _drugCategoryToProcedures, inputs);

                var radioPrediction = PredictType(_radioCategoryModel, _radioProcedureModel, _radioCategoryMapping,
                    _radioProcedureMapping, _radioCategoryToProcedures, inputs);

                var laboratPrediction = PredictType(_laboratCategoryModel, _laboratProcedureModel, _laboratCategoryMapping,
                    _laboratProcedureMapping, _laboratCategoryToProcedures, inputs);

                return new CpClasifResponse
                {
                    Drug = drugPrediction,
                    Radio = radioPrediction,
                    Laborat = laboratPrediction,
                    Timestamp = DateTime.UtcNow.ToString("o")
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Prediction failed: {ex.Message}");
                throw new Exception($"Prediction failed: {ex.Message}", ex);
            }
        }

        // Tambahkan metode baru PredictJson ke class CpClasifService
        public CpClasifResponse PredictJson(CpClasifRequest request)
        {
            try
            {
                // Gunakan metode GetPredictions yang sudah ada untuk menghasilkan respons
                // dalam format CpClasifResponse
                var result = GetPredictions(request);
                
                // Pastikan hanya menampilkan top 4 kategori dan top 2 prosedur per kategori
                // (sesuai dengan implementasi sebelumnya di FormatSection)
                result.Drug.TopCategories = result.Drug.TopCategories.Take(4).ToList();
                result.Radio.TopCategories = result.Radio.TopCategories.Take(4).ToList();
                result.Laborat.TopCategories = result.Laborat.TopCategories.Take(4).ToList();
                
                foreach (var category in result.Drug.TopCategories.Concat(
                                        result.Radio.TopCategories).Concat(
                                        result.Laborat.TopCategories))
                {
                    category.Procedures = category.Procedures.Take(2).ToList();
                }
                
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"JSON Prediction failed: {ex.Message}");
                throw new Exception($"JSON Prediction failed: {ex.Message}", ex);
            }
        }

        private void FormatSection(StringBuilder sb, string sectionName, PredictionResult prediction)
        {
            sb.AppendLine($"\nPrediction {sectionName} Clusters:");
            foreach (var category in prediction.TopCategories.Take(4))
            {
                sb.AppendLine($"Cluster {category.CategoryName}: {category.Probability:F3}");
            }

            sb.AppendLine($"\nPrediction {sectionName} Procedures per Cluster:");
            foreach (var category in prediction.TopCategories.Take(4))
            {
                sb.AppendLine($"Cluster {category.CategoryName}:");
                foreach (var procedure in category.Procedures.Take(2))
                {
                    sb.AppendLine($"  {procedure.Name}: {procedure.Probability:F3}");
                }
            }
        }

        private PredictionResult PredictType(InferenceSession categoryModel, InferenceSession procedureModel,
            Dictionary<float, string> categoryMapping, Dictionary<float, string> procedureMapping,
            Dictionary<string, List<string>> categoryToProcedures, List<NamedOnnxValue> inputs)
        {
            try
            {
                Console.WriteLine("Running category model...");
                using var categoryRunResult = categoryModel.Run(inputs);
                var categoryOutput = categoryRunResult.First();

                List<CategoryPrediction> topCategories;
                if (categoryOutput.AsTensor<long>().Dimensions.Length == 1)
                {
                    var categoryIndex = categoryOutput.AsTensor<long>()[0];
                    string categoryName = categoryMapping.TryGetValue(categoryIndex, out string? name) ? name : "Unknown";
                    topCategories = new List<CategoryPrediction>
                    {
                        new CategoryPrediction
                        {
                            CategoryName = categoryName,
                            Probability = 1.0f
                        }
                    };
                }
                else
                {
                    var categoryProbs = categoryOutput.AsTensor<float>().ToArray();
                    topCategories = categoryProbs
                        .Select((prob, index) => new { Index = (float)index, Probability = prob })
                        .OrderByDescending(x => x.Probability)
                        .Take(4)
                        .Select(x => new CategoryPrediction
                        {
                            CategoryName = categoryMapping.TryGetValue(x.Index, out string? name) ? name : "Unknown",
                            Probability = x.Probability
                        })
                        .ToList();
                }

                Console.WriteLine("Running procedure model...");
                using var procedureRunResult = procedureModel.Run(inputs);
                var procedureOutputTensor = procedureRunResult.First();
                float[] procedureOutput;

                try
                {
                    procedureOutput = procedureOutputTensor.AsTensor<float>().ToArray();
                }
                catch
                {
                    var intOutput = procedureOutputTensor.AsTensor<long>();
                    procedureOutput = new float[procedureMapping.Count];
                    if (intOutput.Length > 0 && intOutput[0] >= 0 && intOutput[0] < procedureOutput.Length)
                    {
                        procedureOutput[(int)intOutput[0]] = 1.0f;
                    }
                }

                foreach (var category in topCategories)
                {
                    if (categoryToProcedures.TryGetValue(category.CategoryName, out var procedures) && procedures != null && procedures.Any())
                    {
                        var procedureProbs = procedures
                            .Select(p =>
                            {
                                var mapping = procedureMapping.FirstOrDefault(x => x.Value == p);
                                return new
                                {
                                    Name = p,
                                    Index = mapping.Key,
                                    Probability = mapping.Key != 0 && mapping.Key < procedureOutput.Length ? procedureOutput[(int)mapping.Key] : 0f
                                };
                            })
                            .Where(p => p.Index != 0)
                            .OrderByDescending(p => p.Probability)
                            .Take(2)
                            .Select(p => new ProcedurePrediction
                            {
                                Name = p.Name,
                                Probability = p.Probability
                            })
                            .ToList();

                        category.Procedures = procedureProbs.Count > 0
                            ? procedureProbs
                            : new List<ProcedurePrediction>
                            {
                                new ProcedurePrediction { Name = "None", Probability = 0f }
                            };
                    }
                    else
                    {
                        category.Procedures = new List<ProcedurePrediction>
                        {
                            new ProcedurePrediction { Name = "None", Probability = 0f }
                        };
                    }
                }

                return new PredictionResult { TopCategories = topCategories };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"PredictType failed: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        private Dictionary<float, string> LoadMapping(string filePath, string rootKey, string subKey)
        {
            var encoding = EncodingLoader.Load(filePath, rootKey, subKey);
            return encoding.ToDictionary(kvp => kvp.Value, kvp => kvp.Key);
        }

        private Dictionary<string, List<string>> LoadCategoryMapping(string filePath)
        {
            try
            {
                var json = JsonDocument.Parse(File.ReadAllText(filePath));
                return json.RootElement.EnumerateObject()
                    .ToDictionary(
                        p => p.Name,
                        p => p.Value.EnumerateArray()
                            .Select(v => v.GetString() ?? string.Empty)
                            .Where(s => !string.IsNullOrEmpty(s))
                            .ToList());
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to load category mapping from {filePath}: {ex.Message}");
                return new Dictionary<string, List<string>>();
            }
        }

        private Dictionary<string, float> LoadEncoding(JsonDocument json, string propertyName)
        {
            var encoded = new Dictionary<string, float>();
            var original = json.RootElement.GetProperty(propertyName).GetProperty("original").EnumerateArray();
            var encodedArray = json.RootElement.GetProperty(propertyName).GetProperty("encoded").EnumerateArray();
            
            int index = 0;
            foreach (var value in encodedArray)
            {
                var key = original.ElementAt(index).GetString() ?? string.Empty;
                if (!encoded.ContainsKey(key))
                {
                    encoded[key] = value.GetInt32();
                }
                index++;
            }
            return encoded;
        }
    }
}