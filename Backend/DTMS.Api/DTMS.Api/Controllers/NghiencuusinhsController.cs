using Microsoft.AspNetCore.Authorization;
using DTMS.Api.DTOs;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
//[Authorize]
public class NghiencuusinhsController : ControllerBase
{
    private readonly DtmsDbContext _context;
    public NghiencuusinhsController(DtmsDbContext context)
    {
        _context = context;
    }

    // GET: api/Nghiencuusinh
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NghiencuusinhDto>>> GetNghiencuusinh()
    {
        var dsNghiencuusinh = await _context.Nghiencuusinhs
            .Select(ncs => new NghiencuusinhDto
            {
                MaNcs = ncs.MaNcs,
                HoTen = ncs.HoTen,
                NgaySinh = ncs.NgaySinh,
                GioiTinh = ncs.GioiTinh,
                MaNganh = ncs.MaNganh,
                DoiTuongDauVao = ncs.DoiTuongDauVao,
                SoQdtrungTuyen = ncs.SoQdtrungTuyen,
                NgayNhapHoc = ncs.NgayNhapHoc,
                TrangThaiHocVu = ncs.TrangThaiHocVu
            })
            .ToListAsync();

        return Ok(dsNghiencuusinh);
    }

    // GET: api/Nghiencuusinh/5
    [HttpGet("{mancs}")]
    public async Task<ActionResult<Nghiencuusinh>> GetNghiencuusinh(string mancs)
    {
        var nghiencuusinh = await _context.Nghiencuusinhs.FindAsync(mancs);

        if (nghiencuusinh == null)
        {
            return NotFound();
        }

        return nghiencuusinh;
    }

    // PUT: api/Nghiencuusinh/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{mancs}")]
    public async Task<IActionResult> PutNghiencuusinh(string? mancs, Nghiencuusinh nghiencuusinh)
    {
        if (mancs != nghiencuusinh.MaNcs)
        {
            return BadRequest();
        }

        _context.Entry(nghiencuusinh).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!NghiencuusinhExists(mancs))
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

    // POST: api/Nghiencuusinh
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Nghiencuusinh>> PostNghiencuusinh(Nghiencuusinh nghiencuusinh)
    {
        _context.Nghiencuusinhs.Add(nghiencuusinh);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetNghiencuusinh", new { mancs = nghiencuusinh.MaNcs }, nghiencuusinh);
    }

    // DELETE: api/Nghiencuusinh/5
    [HttpDelete("{mancs}")]
    public async Task<IActionResult> DeleteNghiencuusinh(string? mancs)
    {
        var nghiencuusinh = await _context.Nghiencuusinhs.FindAsync(mancs);
        if (nghiencuusinh == null)
        {
            return NotFound();
        }

        _context.Nghiencuusinhs.Remove(nghiencuusinh);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool NghiencuusinhExists(string? mancs)
    {
        return _context.Nghiencuusinhs.Any(e => e.MaNcs == mancs);
    }
}
