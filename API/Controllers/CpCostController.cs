using Microsoft.AspNetCore.Mvc;
using CpCostApi.Models;
using CpCostApi.Services;

// Controller untuk menangani prediksi biaya perawatan (CpCost)
[ApiController]
[Route("api/CpCost")]
public class CpCostController : ControllerBase
{
    private readonly CpCostService _cpCostService;

    public CpCostController(CpCostService cpCostService)
    {
        _cpCostService = cpCostService;
    }

    [HttpPost("predict")]
    public IActionResult Predict([FromBody] CpCostRequest request)
    {
        var prediction = _cpCostService.Predict(request);

        return Ok(new CpCostResponse
        {
            Non_Bedah = Math.Max(0, (int)Math.Round(prediction.Non_Bedah)),
            Bedah = Math.Max(0, (int)Math.Round(prediction.Bedah)),
            Konsul_Dokter = Math.Max(0, (int)Math.Round(prediction.KonsulDokter)),
            Konsul_Tenaga_Ahli = 0,
            Tind_Keperawatan = Math.Max(0, (int)Math.Round(prediction.TindKeperawatan)),
            Penunjang = 0,
            Radiologi = Math.Max(0, (int)Math.Round(prediction.Radiologi)),
            Laboratorium = Math.Max(0, (int)Math.Round(prediction.Laboratorium)),
            Pelayanan_Darah = Math.Max(0, (int)Math.Round(prediction.PelayananDarah)),
            Rehabilitasi = Math.Max(0, (int)Math.Round(prediction.Rehabilitasi)),
            Akomodasi = Math.Max(0, (int)Math.Round(prediction.Akomodasi)),
            Akomodasi_Intensif = Math.Max(0, (int)Math.Round(prediction.AkomodasiIntensif)),
            Bmhp = 0,
            Alat_Medis = 0,
            Obat = Math.Max(0, (int)Math.Round(prediction.Obat)),
            Obat_Kronis = 0,
            Obat_Kemoterapi = 0,
            Alkes = Math.Max(0, (int)Math.Round(prediction.Alkes)),
            Total_Cost = Math.Max(0, (int)Math.Round(prediction.TotalCost)),
        });
    }

    [HttpGet("test")]
    public IActionResult Test()
    {
        return Ok(new { message = "API is Working!" });
    }
}

// Controller untuk menangani prediksi klasifikasi perawatan (CpClasif)
[ApiController]
[Route("api/CpClasif")]
public class CpClasifController : ControllerBase
{
    private readonly CpClasifService _cpClasifService;

    public CpClasifController(CpClasifService cpClasifService)
    {
        _cpClasifService = cpClasifService;
    }

    [HttpPost("predict")]
    public IActionResult Predict([FromBody] CpClasifRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            // Ensure KodeRujukan has no invalid characters
            request.KodeRujukan = request.KodeRujukan.Trim();
            
            // Gunakan metode yang mengembalikan CpClasifResponse daripada string
            var prediction = _cpClasifService.PredictJson(request);
            return Ok(prediction);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error during prediction: {ex.Message}" });
        }
    }

    [HttpGet("test")]
    public IActionResult Test()
    {
        return Ok(new { message = "API is Working!" });
    }
}