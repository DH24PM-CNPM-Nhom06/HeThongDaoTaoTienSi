using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Tải lên và tải xuống tệp.
    // Tệp lưu ngoài thư mục web, không còn truy cập công khai qua đường dẫn /uploads.
    // Tên tệp có dạng: {MaNCS}_{mã ngẫu nhiên}{đuôi}. Quyền tải xuống kiểm tra theo MaNCS trong tên tệp.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FileController : ControllerBase
    {
        private const long MaxBaoCao = 10L * 1024 * 1024;   // 10MB (đặc tả: báo cáo tiến độ)
        private const long MaxLuanAn = 50L * 1024 * 1024;   // 50MB (luận án, theo lựa chọn của bạn)

        // Loại tệp theo mục đích: đuôi cho phép và dung lượng tối đa
        private static readonly Dictionary<string, (string[] Ext, long MaxBytes)> Purposes =
            new Dictionary<string, (string[] Ext, long MaxBytes)>(StringComparer.OrdinalIgnoreCase)
            {
                ["baocao"] = (new[] { ".pdf", ".doc", ".docx" }, MaxBaoCao),
                ["minhchung"] = (new[] { ".pdf", ".jpg", ".jpeg", ".png" }, MaxBaoCao),
                ["luanan"] = (new[] { ".pdf", ".doc", ".docx" }, MaxLuanAn),
            };

        private static readonly Dictionary<string, string> ContentTypes =
            new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                [".pdf"] = "application/pdf",
                [".doc"] = "application/msword",
                [".docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                [".jpg"] = "image/jpeg",
                [".jpeg"] = "image/jpeg",
                [".png"] = "image/png",
            };

        private readonly DtmsDbContext _context;
        private readonly string _uploadPath;
        private readonly ILogger<FileController> _logger;

        public FileController(DtmsDbContext context, IConfiguration config, ILogger<FileController> logger)
        {
            _context = context;
            _logger = logger;
            _uploadPath = config["UploadPath"] ?? Path.Combine(AppContext.BaseDirectory, "uploads");
        }

        // POST: api/File/upload?purpose=baocao&maNcs=NCS01
        // purpose: baocao | minhchung | luanan
        // maNcs: bắt buộc với ADMIN, PDT, TBM, NHD; NCS tự động dùng mã của chính mình.
        [HttpPost("upload")]
        [RequestSizeLimit(MaxLuanAn)]
        [RequestFormLimits(MultipartBodyLengthLimit = MaxLuanAn)]
        public async Task<IActionResult> UploadFile(IFormFile file, [FromQuery] string purpose, [FromQuery] string? maNcs)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { Success = false, Message = "Vui lòng chọn một tệp hợp lệ." });
            }

            if (string.IsNullOrWhiteSpace(purpose) || !Purposes.TryGetValue(purpose.Trim(), out var rule))
            {
                return BadRequest(new { Success = false, Message = "Mục đích tệp không hợp lệ (baocao, minhchung, luanan)." });
            }

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!rule.Ext.Contains(ext))
            {
                return BadRequest(new { Success = false, Message = $"Định dạng không được phép. Chấp nhận: {string.Join(", ", rule.Ext)}." });
            }

            if (file.Length > rule.MaxBytes)
            {
                var mb = rule.MaxBytes / (1024 * 1024);
                return BadRequest(new { Success = false, Message = $"Dung lượng tệp vượt quá giới hạn {mb}MB." });
            }

            // Xác định NCS sở hữu tệp
            string? owner;
            var laNcsThuanTuy = User.IsInRole("NCS") && !Access.LaToanQuyen(User) && !User.IsInRole("NHD") && !User.IsInRole("PBDL");
            if (laNcsThuanTuy)
            {
                owner = await Access.CurrentNcsAsync(_context, User);
                if (owner == null) return Forbid();
            }
            else
            {
                if (string.IsNullOrWhiteSpace(maNcs)) return BadRequest(new { Success = false, Message = "Thiếu mã nghiên cứu sinh (maNcs)." });
                if (!await Access.CanWriteNcsAsync(_context, User, maNcs)) return Forbid();
                if (!await _context.Nghiencuusinhs.AnyAsync(n => n.MaNcs == maNcs))
                {
                    return BadRequest(new { Success = false, Message = "Nghiên cứu sinh không tồn tại." });
                }
                owner = maNcs;
            }

            // Mã NCS dùng trong tên tệp chỉ gồm chữ và số, tránh ký tự đặc biệt và dấu gạch dưới
            if (!owner.All(c => char.IsLetterOrDigit(c)))
            {
                return BadRequest(new { Success = false, Message = "Mã nghiên cứu sinh không hợp lệ." });
            }

            try
            {
                Directory.CreateDirectory(_uploadPath);

                var storedName = $"{owner}_{Guid.NewGuid():N}{ext}";
                var fullPath = Path.Combine(_uploadPath, storedName);

                await using (var stream = new FileStream(fullPath, FileMode.CreateNew))
                {
                    await file.CopyToAsync(stream);
                }

                return Ok(new
                {
                    Success = true,
                    Message = "Tải lên thành công",
                    FileUrl = $"/api/File/{storedName}",
                    FileName = Path.GetFileName(file.FileName)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lưu tệp cho NCS {MaNcs}", owner);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { Success = false, Message = "Có lỗi xảy ra khi lưu tệp. Vui lòng thử lại." });
            }
        }

        // GET: api/File/NCS01_abc123.pdf
        // Ai được xem thông tin của NCS đó thì được tải tệp của NCS đó.
        [HttpGet("{name}")]
        public async Task<IActionResult> DownloadFile(string name)
        {
            // Chặn đường dẫn lạ (../, ký tự thư mục)
            if (string.IsNullOrWhiteSpace(name) || Path.GetFileName(name) != name) return NotFound();

            var idx = name.IndexOf('_');
            if (idx <= 0) return NotFound();

            var owner = name.Substring(0, idx);
            var ext = Path.GetExtension(name).ToLowerInvariant();
            if (!ContentTypes.TryGetValue(ext, out var contentType)) return NotFound();

            if (!await Access.CanReadNcsAsync(_context, User, owner)) return NotFound();

            var fullPath = Path.Combine(_uploadPath, name);
            if (!System.IO.File.Exists(fullPath)) return NotFound();

            return PhysicalFile(fullPath, contentType, name);
        }
    }
}