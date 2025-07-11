using System.Text.Json;

namespace CpCostApi.Data;

public static class EncodingLoader
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
                else
                {
                    Console.WriteLine($"Key {parentKey}/{childKey} tidak ditemukan dalam file {filePath}");
                    return new Dictionary<string, float>();
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

        return new Dictionary<string, float>();
    }

    public static float GetEncodedValue(Dictionary<string, float> encodingDict, string key)
    {
        if (string.IsNullOrEmpty(key))
        {
            Console.WriteLine("Warning: Empty key provided for encoding.");
            return 0f; // Default value for empty key
        }

        // Trim and clean the key
        key = key.Trim();

        if (encodingDict == null)
        {
            Console.WriteLine("Warning: Encoding dictionary is null.");
            return 0f;
        }

        if (encodingDict.TryGetValue(key, out float value))
        {
            return value;
        }

        Console.WriteLine($"Key '{key}' not found in encoding dictionary. Using default value 0.");
        return 0f; // Default value for unknown keys
    }
}