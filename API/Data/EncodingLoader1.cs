using System.Text.Json;

namespace CpCostApi.Data;

public static class EncodingLoader1
{
    public static Dictionary<string, float> Load(string filePath, string parentKey = null, string childKey = null)
    {
        if (!File.Exists(filePath)) 
        {
            Console.WriteLine($"File tidak ditemukan: {filePath}");
            return new Dictionary<string, float>();
        }

        try
        {
            var jsonContent = File.ReadAllText(filePath);
            var jsonData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(jsonContent);

            if (jsonData == null) 
            {
                Console.WriteLine($"File {filePath} kosong atau tidak valid.");
                return new Dictionary<string, float>();
            }

            if (parentKey != null && childKey != null)
            {
                if (jsonData.TryGetValue(parentKey, out JsonElement parentElement) &&
                    parentElement.TryGetProperty(childKey, out JsonElement childElement))
                {
                    var parsedData = JsonSerializer.Deserialize<Dictionary<string, float>>(childElement.GetRawText());
                    return parsedData ?? new Dictionary<string, float>();
                }
            }
            else
            {
                return jsonData.ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value.TryGetDouble(out double num) ? (float)num : 0f
                );
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error membaca file {filePath}: {ex.Message}");
        }

        // ✅ Tambahkan return default jika semua kondisi gagal
        return new Dictionary<string, float>();
    }
}
