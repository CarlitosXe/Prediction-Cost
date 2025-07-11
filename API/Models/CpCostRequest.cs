namespace CpCostApi.Models;

public class CpCostRequest
{
    public required string ICDPrimer { get; set; }
    public required string ICDSekunder1 { get; set; }
    public required string ICDSekunder2 { get; set; }
    public required string ICDSekunder3 { get; set; }
    public required string LamaRawat { get; set; }
    public required string TipePasien { get; set; }
}
