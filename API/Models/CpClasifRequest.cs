using System.ComponentModel.DataAnnotations;

namespace CpCostApi.Models
{
    public class CpClasifRequest
    {
        public required string ICDPrimer { get; set; }

        public required string ICDSekunder1 { get; set; }

        public required string ICDSekunder2 { get; set; }

        public required string ICDSekunder3 { get; set; }

        [Required]
        [Range(0, float.MaxValue, ErrorMessage = "LamaRawat must be non-negative")]
        public float LamaRawat { get; set; }

        public required string TipePasien { get; set; }

        public required string KodeRujukan { get; set; }
    }
}