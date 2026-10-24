using DTMS.Api.DTOs;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class CongbokhoahocsController : ControllerBase
{
    private readonly DtmsDbContext _context;
    public CongbokhoahocsController(DtmsDbContext context)
    {
        _context = context;
    }

    // GET: api/Congbokhoahoc
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CongbokhoahocDto>>> GetCongbokhoahocs()
    {
        var dsCongBo = await _context.Congbokhoahocs
            .Select(cb => new CongbokhoahocDto
            {
                MaCongBo = cb.MaCongBo,
                MaNcs = cb.MaNcs,
                TenBaiBao = cb.TenBaiBao,
                TenTapChi = cb.TenTapChi,
                PhanLoai = cb.PhanLoai,
                DiemTapChi = cb.DiemTapChi,
                VaiTroTacGia = cb.VaiTroTacGia,
                CoTenNhd = cb.CoTenNhd,
                DiaChiTruong = cb.DiaChiTruong,
                LinkDoi = cb.LinkDoi,
                FileMinhChung = cb.FileMinhChung,
                TrangThaiDuyet = cb.TrangThaiDuyet
            })
            .ToListAsync();
        return Ok(dsCongBo);
    }

    // GET: api/Congbokhoahoc/5
    [HttpGet("{macongbo}")]
    public async Task<ActionResult<Congbokhoahoc>> GetCongbokhoahoc(int macongbo)
    {
        var congbokhoahoc = await _context.Congbokhoahocs.FindAsync(macongbo);

        if (congbokhoahoc == null)
        {
            return NotFound();
        }

        return congbokhoahoc;
    }

    // PUT: api/Congbokhoahoc/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{macongbo}")]
    public async Task<IActionResult> PutCongbokhoahoc(int? macongbo, Congbokhoahoc congbokhoahoc)
    {
        if (macongbo != congbokhoahoc.MaCongBo)
        {
            return BadRequest();
        }

        _context.Entry(congbokhoahoc).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CongbokhoahocExists(macongbo))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // POST: api/Congbokhoahoc
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Congbokhoahoc>> PostCongbokhoahoc(Congbokhoahoc congbokhoahoc)
    {
        _context.Congbokhoahocs.Add(congbokhoahoc);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetCongbokhoahoc", new { macongbo = congbokhoahoc.MaCongBo }, congbokhoahoc);
    }

    // DELETE: api/Congbokhoahoc/5
    [HttpDelete("{macongbo}")]
    public async Task<IActionResult> DeleteCongbokhoahoc(int? macongbo)
    {
        var congbokhoahoc = await _context.Congbokhoahocs.FindAsync(macongbo);
        if (congbokhoahoc == null)
        {
            return NotFound();
        }

        _context.Congbokhoahocs.Remove(congbokhoahoc);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool CongbokhoahocExists(int? macongbo)
    {
        return _context.Congbokhoahocs.Any(e => e.MaCongBo == macongbo);
    }
}
