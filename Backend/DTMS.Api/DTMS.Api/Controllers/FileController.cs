using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers;

/// <summary>Upload/download file ở thư mục riêng, luôn qua JWT + phân quyền NCS.</summary>
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class FileController : ControllerBase
{
    private readonly DtmsDbContext _context;
    private readonly IConfiguration _config;
    private readonly ILogger<FileController> _logger;

    public FileController(DtmsDbContext context, IConfiguration config, ILogger<FileController> logger)
    {
        _context = context;
        _config = config;
        _logger = logger;
    }

    // POST /api/File/upload?purpose=baocao&maNcs=NCS01
    // IFormFile phải nằm trong multipart/form-data với key "file".
    [HttpPost("upload")]
    [RequestSizeLimit(StoredFileRules.MaxMultipart)]
    [RequestFormLimits(MultipartBodyLengthLimit = StoredFileRules.MaxMultipart)]
    public async Task<IActionResult> UploadFile(IFormFile file, [FromQuery] string purpose, [FromQuery] string? maNcs)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { Success = false, Message = "Vui lòng chọn một tệp hợp lệ." });

        if (!StoredFileRules.TryPurpose(purpose, out var normalizedPurpose, out var extensions, out var maxBytes))
            return BadRequest(new { Success = false, Message = "Mục đích tệp không hợp lệ (baocao, minhchung, luanan, bienban)." });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!extensions.Contains(ext, StringComparer.OrdinalIgnoreCase))
            return BadRequest(new { Success = false, Message = $"Định dạng không được phép. Chấp nhận: {string.Join(", ", extensions)}." });

        if (file.Length > maxBytes)
            return StatusCode(StatusCodes.Status413PayloadTooLarge, new
            {
                Success = false, Message = $"Dung lượng tệp vượt quá giới hạn {maxBytes / (1024 * 1024)}MB."
            });

        string? owner;
        // User có vai trò NCS nhưng kiêm vai trò khác vẫn chỉ upload cho NCS của chính mình
        // trừ khi user có quyền ghi NCS ở nghiệp vụ cán bộ.
        if (User.IsInRole("NCS") && !Access.LaQuanTri(User)
            && !User.IsInRole("NHD") && !Access.LaCanBoPhamVi(User))
        {
            owner = await Access.CurrentNcsAsync(_context, User);
            if (owner == null) return Forbid();
        }
        else
        {
            if (string.IsNullOrWhiteSpace(maNcs))
                return BadRequest(new { Success = false, Message = "Thiếu mã nghiên cứu sinh (maNcs)." });
            owner = maNcs.Trim();
            if (User.IsInRole("PBDL") && !Access.LaQuanTri(User)
                && !User.IsInRole("NHD") && !Access.LaCanBoPhamVi(User))
            {
                // Phản biện độc lập chỉ được upload biên bản của NCS được giao phản biện.
                if (normalizedPurpose != "bienban") return Forbid();
                var maGv = await Access.CurrentGvAsync(_context, User);
                if (maGv == null || !await _context.Phanbiendoclaps.AnyAsync(pb => pb.MaGv == maGv && pb.MaNcs == owner))
                    return Forbid();
            }
            else if (!await Access.CanWriteNcsAsync(_context, User, owner)) return Forbid();
        }

        if (!StoredFileRules.IsValidOwner(owner))
            return BadRequest(new { Success = false, Message = "Mã nghiên cứu sinh không hợp lệ." });

        if (!await _context.Nghiencuusinhs.AnyAsync(n => n.MaNcs == owner))
            return BadRequest(new { Success = false, Message = "Nghiên cứu sinh không tồn tại." });

        var name = $"{owner}_{normalizedPurpose}_{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(StoredFileRules.UploadRoot(_config), name);
        var committed = false;

        try
        {
            Directory.CreateDirectory(StoredFileRules.UploadRoot(_config));
            await using (var target = new FileStream(
                fullPath, FileMode.CreateNew, FileAccess.Write, FileShare.None, 81920, FileOptions.Asynchronous))
            {
                await file.CopyToAsync(target, HttpContext.RequestAborted);
            }

            if (!StoredFileRules.MatchesContent(fullPath, ext))
                return BadRequest(new { Success = false, Message = "Nội dung tệp không khớp với định dạng đã khai báo." });

            committed = true;
            var originalName = file.FileName.Replace('\\', '/').Split('/').LastOrDefault() ?? "file";
            originalName = new string(originalName.Where(c => !char.IsControl(c)).ToArray());
            if (originalName.Length > 255) originalName = originalName[^255..];
            return Ok(new
            {
                Success = true,
                Message = "Tải lên thành công",
                FileUrl = $"/api/File/{name}",
                FileName = originalName
            });
        }
        catch (OperationCanceledException) when (HttpContext.RequestAborted.IsCancellationRequested)
        {
            // Client đã ngắt kết nối; finally sẽ xóa tệp chưa hoàn tất.
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lưu tệp cho NCS {MaNcs}", owner);
            return StatusCode(StatusCodes.Status500InternalServerError,
                new { Success = false, Message = "Không thể lưu tệp. Vui lòng thử lại." });
        }
        finally
        {
            if (!committed && System.IO.File.Exists(fullPath))
            {
                try { System.IO.File.Delete(fullPath); }
                catch (Exception ex) { _logger.LogWarning(ex, "Không thể xóa tệp tải lên lỗi: {Name}", name); }
            }
        }
    }

    // GET /api/File/NCS01_luanan_<guid>.pdf (hỗ trợ cả tên cũ NCS01_<guid>.pdf)
    [HttpGet("{name}")]
    public async Task<IActionResult> DownloadFile(string name)
    {
        if (!StoredFileRules.TryParseStoredName(name, out var owner, out _, out var ext)) return NotFound();
        if (!await Access.CanReadNcsAsync(_context, User, owner)) return NotFound();

        var fullPath = Path.Combine(StoredFileRules.UploadRoot(_config), name);
        if (!System.IO.File.Exists(fullPath)) return NotFound();
        return PhysicalFile(fullPath, StoredFileRules.ContentTypes[ext], name, enableRangeProcessing: true);
    }

    // GET /api/File/legacy/NCS01/paper1.pdf
    // Chỉ bật khi cấu hình LegacyUploadPath. Tệp phải ở <LegacyUploadPath>/ncs01/paper1.pdf
    // Không cung cấp đường dẫn /uploads công khai và không bỏ qua kiểm tra JWT.
    [HttpGet("legacy/{maNcs}/{fileName}")]
    public async Task<IActionResult> DownloadLegacyFile(string maNcs, string fileName)
    {
        if (string.IsNullOrWhiteSpace(_config["LegacyUploadPath"])) return NotFound();
        if (!StoredFileRules.IsValidOwner(maNcs) || !StoredFileRules.IsSafeLegacyFileName(fileName)) return NotFound();
        if (!await Access.CanReadNcsAsync(_context, User, maNcs)) return NotFound();

        // NCS01 -> ncs01, đúng cấu trúc /uploads/ncs01/ trong SQL mẫu.
        var fullPath = Path.Combine(
            Path.GetFullPath(_config["LegacyUploadPath"]!), maNcs.ToLowerInvariant(), fileName);
        if (!System.IO.File.Exists(fullPath)) return NotFound();
        return PhysicalFile(fullPath, StoredFileRules.ContentTypes[Path.GetExtension(fileName)],
            fileName, enableRangeProcessing: true);
    }
}
