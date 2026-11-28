using System.IO.Compression;
using System.Text.RegularExpressions;

namespace DTMS.Api.Helpers;

/// <summary>
/// Quy ước lưu file DTMS. URL phải do api/File/upload sinh ra; tuyệt đối không lấy đường dẫn vật lý từ client.
/// Hỗ trợ đọc tên cũ NCS01_{guid}.pdf, nhưng URL mới phải có purpose.
/// </summary>
public static class StoredFileRules
{
    public const long MaxBaoCao = 10L * 1024 * 1024;
    public const long MaxLuanAn = 50L * 1024 * 1024;
    public const long MaxMultipart = MaxLuanAn + 1024L * 1024;

    private static readonly Dictionary<string, (string[] Extensions, long MaxBytes)> PurposeRules =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["baocao"] = (new[] { ".pdf", ".doc", ".docx" }, MaxBaoCao),
            ["minhchung"] = (new[] { ".pdf", ".jpg", ".jpeg", ".png" }, MaxBaoCao),
            ["luanan"] = (new[] { ".pdf", ".doc", ".docx" }, MaxLuanAn),
            ["bienban"] = (new[] { ".pdf", ".doc", ".docx" }, MaxBaoCao)
        };

    public static readonly IReadOnlyDictionary<string, string> ContentTypes =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            [".pdf"] = "application/pdf",
            [".doc"] = "application/msword",
            [".docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            [".jpg"] = "image/jpeg",
            [".jpeg"] = "image/jpeg",
            [".png"] = "image/png"
        };

    private static readonly Regex StoredNameRegex = new(
        @"^(?<owner>[A-Za-z0-9][A-Za-z0-9_]{0,19}?)_(?:(?<purpose>baocao|minhchung|luanan|bienban)_)?(?<guid>[a-fA-F0-9]{32})(?<ext>\.(?:pdf|doc|docx|jpg|jpeg|png))$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);

    private static readonly Regex OwnerRegex = new(@"^[A-Za-z0-9][A-Za-z0-9_]{0,19}$", RegexOptions.Compiled);
    private static readonly Regex LegacyNameRegex = new(@"^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$", RegexOptions.Compiled);

    private const string FileUrlPrefix = "/api/File/";

    public static string UploadRoot(IConfiguration config) =>
        Path.GetFullPath(config["UploadPath"] ?? Path.Combine(AppContext.BaseDirectory, "uploads"));

    public static bool IsValidOwner(string? maNcs) => !string.IsNullOrWhiteSpace(maNcs) && OwnerRegex.IsMatch(maNcs);

    public static bool TryPurpose(string? purpose, out string normalized, out string[] extensions, out long maxBytes)
    {
        normalized = purpose?.Trim().ToLowerInvariant() ?? string.Empty;
        if (PurposeRules.TryGetValue(normalized, out var rule))
        {
            extensions = rule.Extensions;
            maxBytes = rule.MaxBytes;
            return true;
        }
        extensions = Array.Empty<string>();
        maxBytes = 0;
        return false;
    }

    public static bool TryParseStoredName(string name, out string owner, out string? purpose, out string extension)
    {
        owner = string.Empty;
        purpose = null;
        extension = string.Empty;
        if (string.IsNullOrWhiteSpace(name) || Path.GetFileName(name) != name) return false;
        var match = StoredNameRegex.Match(name);
        if (!match.Success) return false;
        owner = match.Groups["owner"].Value;
        if (match.Groups["purpose"].Success) purpose = match.Groups["purpose"].Value.ToLowerInvariant();
        extension = match.Groups["ext"].Value.ToLowerInvariant();
        return true;
    }

    /// <summary>
    /// Dùng khi gắn URL mới vào hồ sơ: đúng NCS, đúng mục đích, đúng quy ước tên và file phải tồn tại.
    /// Tham số previous chỉ cho phép giữ nguyên URL cũ đã lưu trong CSDL khi sửa trường khác.
    /// </summary>
    public static bool ValidReference(
        string? url, string owner, string purpose, IConfiguration config,
        string? previous = null, bool required = false)
    {
        if (string.IsNullOrWhiteSpace(url)) return !required;
        if (previous != null && string.Equals(url, previous, StringComparison.Ordinal)) return true;
        if (!url.StartsWith(FileUrlPrefix, StringComparison.Ordinal)) return false;

        var name = url[FileUrlPrefix.Length..];
        if (!TryParseStoredName(name, out var parsedOwner, out var parsedPurpose, out var ext)) return false;
        // File upload trước đợt 5 vẫn tải được nhưng không được gắn làm URL mới.
        if (parsedPurpose == null || !string.Equals(parsedPurpose, purpose, StringComparison.Ordinal)) return false;
        if (!string.Equals(parsedOwner, owner, StringComparison.OrdinalIgnoreCase)) return false;
        if (!TryPurpose(purpose, out _, out var exts, out var max)) return false;
        if (!exts.Contains(ext, StringComparer.OrdinalIgnoreCase)) return false;

        var path = Path.Combine(UploadRoot(config), name);
        var info = new FileInfo(path);
        return info.Exists && info.Length > 0 && info.Length <= max;
    }

    public static bool IsSafeLegacyFileName(string? name)
    {
        return !string.IsNullOrWhiteSpace(name)
            && LegacyNameRegex.IsMatch(name)
            && !name.Contains("..", StringComparison.Ordinal)
            && ContentTypes.ContainsKey(Path.GetExtension(name));
    }

    public static bool MatchesContent(string path, string extension)
    {
        using var stream = System.IO.File.OpenRead(path);
        if (extension.Equals(".docx", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                using var package = new ZipArchive(stream, ZipArchiveMode.Read);
                return package.GetEntry("[Content_Types].xml") != null
                    && package.GetEntry("word/document.xml") != null;
            }
            catch (InvalidDataException) { return false; }
        }

        Span<byte> header = stackalloc byte[8];
        var count = stream.Read(header);
        return extension.ToLowerInvariant() switch
        {
            ".pdf" => count >= 5 && header[..5].SequenceEqual("%PDF-"u8),
            ".jpg" or ".jpeg" => count >= 3 && header[0] == 0xff && header[1] == 0xd8 && header[2] == 0xff,
            ".png" => count >= 8 && header.SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }),
            ".doc" => count >= 8 && header.SequenceEqual(new byte[] { 0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1 }),
            _ => false
        };
    }
}
