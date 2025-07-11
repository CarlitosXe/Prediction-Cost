using System.Collections.Generic;

namespace  CpCostApi.Models
{
    public class CpClasifResponse
    {
        public PredictionResult Drug { get; set; } = new PredictionResult();
        public PredictionResult Radio { get; set; } = new PredictionResult();
        public PredictionResult Laborat { get; set; } = new PredictionResult();
        public string Timestamp { get; set; } = string.Empty;
    }

    public class PredictionResult
    {
        public List<CategoryPrediction> TopCategories { get; set; } = new List<CategoryPrediction>();
    }

    public class CategoryPrediction
    {
        public string CategoryName { get; set; } = string.Empty;
        public float Probability { get; set; }
        public List<ProcedurePrediction> Procedures { get; set; } = new List<ProcedurePrediction>();
    }

    public class ProcedurePrediction
    {
        public string Name { get; set; } = string.Empty;
        public float Probability { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}