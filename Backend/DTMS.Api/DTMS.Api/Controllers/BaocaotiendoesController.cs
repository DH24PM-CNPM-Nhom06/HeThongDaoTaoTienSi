using Microsoft.AspNetCore.Authorization;
using DTMS.Api.DTOs;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
//[Authorize]
public class BaocaotiendoesController : ControllerBase
{
    private readonly DtmsDbContext _context;
    public BaocaotiendoesController(DtmsDbContext context)
    {
        _context = context;
    }

    // GET: api/Baocaotiendo
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BaocaotiendoDto>>> GetBaocaotiendo()
    {
        var dsBaoCao = await _context.Baocaotiendos
            .Select(bc => new BaocaotiendoDto
            {
                MaBaoCao = bc.MaBaoCao,
                MaNcs = bc.MaNcs,
                KyBaoCao = bc.KyBaoCao,
                HanNop = bc.HanNop,
                NgayNop = bc.NgayNop,
                FileBaoCao = bc.FileBaoCao,
                FileMinhChung = bc.FileMinhChung,
                DanhGiaNhd = bc.DanhGiaNhd,
                NhanXetNhd = bc.NhanXetNhd,
                TrangThaiKhoa = bc.TrangThaiKhoa
            })
            .ToListAsync();

        return Ok(dsBaoCao);
    }

    // GET: api/Baocaotiendo/5
    [HttpGet("{mabaocao}")]
    public async Task<ActionResult<Baocaotiendo>> GetBaocaotiendo(int mabaocao)
    {
        var baocaotiendo = await _context.Baocaotiendos.FindAsync(mabaocao);

        if (baocaotiendo == null)
        {
            return NotFound();
        }

        return baocaotiendo;
    }

    // PUT: api/Baocaotiendo/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{mabaocao}")]
    public async Task<IActionResult> PutBaocaotiendo(int? mabaocao, Baocaotiendo baocaotiendo)
    {
        if (mabaocao != baocaotiendo.MaBaoCao)
        {
            return BadRequest();
        }

        _context.Entry(baocaotiendo).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!BaocaotiendoExists(mabaocao))
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

    // POST: api/Baocaotiendo
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Baocaotiendo>> PostBaocaotiendo(Baocaotiendo baocaotiendo)
    {
        _context.Baocaotiendos.Add(baocaotiendo);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetBaocaotiendo", new { mabaocao = baocaotiendo.MaBaoCao }, baocaotiendo);
    }

    // DELETE: api/Baocaotiendo/5
    [HttpDelete("{mabaocao}")]
    public async Task<IActionResult> DeleteBaocaotiendo(int? mabaocao)
    {
        var baocaotiendo = await _context.Baocaotiendos.FindAsync(mabaocao);
        if (baocaotiendo == null)
        {
            return NotFound();
        }

        _context.Baocaotiendos.Remove(baocaotiendo);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool BaocaotiendoExists(int? mabaocao)
    {
        return _context.Baocaotiendos.Any(e => e.MaBaoCao == mabaocao);
    }
}
