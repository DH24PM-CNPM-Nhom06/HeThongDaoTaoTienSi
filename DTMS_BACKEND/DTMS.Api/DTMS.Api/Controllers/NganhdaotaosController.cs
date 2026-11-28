using Microsoft.AspNetCore.Authorization;
using DTMS.Api.DTOs;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class NganhdaotaosController : ControllerBase
{
    private readonly DtmsDbContext _context;
    public NganhdaotaosController(DtmsDbContext context)
    {
        _context = context;
    }

    // GET: api/Nganhdaotao
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NganhdaotaoDto>>> GetNganhdaotaos()
    {
        var dsNganh = await _context.Nganhdaotaos
            .Select(n => new NganhdaotaoDto
            {
                MaNganh = n.MaNganh,
                TenNganh = n.TenNganh,
                KhoaQuanLy = n.KhoaQuanLy
            })
            .ToListAsync();
        return Ok(dsNganh);
    }

    // GET: api/Nganhdaotao/5
    [HttpGet("{manganh}")]
    public async Task<ActionResult<Nganhdaotao>> GetNganhdaotao(string manganh)
    {
        var nganhdaotao = await _context.Nganhdaotaos.FindAsync(manganh);

        if (nganhdaotao == null)
        {
            return NotFound();
        }

        return nganhdaotao;
    }

    // PUT: api/Nganhdaotao/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [Authorize(Roles = "ADMIN,PDT")]
    [HttpPut("{manganh}")]
    public async Task<IActionResult> PutNganhdaotao(string? manganh, Nganhdaotao nganhdaotao)
    {
        if (manganh != nganhdaotao.MaNganh)
        {
            return BadRequest();
        }

        _context.Entry(nganhdaotao).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!NganhdaotaoExists(manganh))
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

    // POST: api/Nganhdaotao
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [Authorize(Roles = "ADMIN,PDT")]
    [HttpPost]
    public async Task<ActionResult<Nganhdaotao>> PostNganhdaotao(Nganhdaotao nganhdaotao)
    {
        _context.Nganhdaotaos.Add(nganhdaotao);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetNganhdaotao", new { manganh = nganhdaotao.MaNganh }, nganhdaotao);
    }

    // DELETE: api/Nganhdaotao/5
    [Authorize(Roles = "ADMIN,PDT")]
    [HttpDelete("{manganh}")]
    public async Task<IActionResult> DeleteNganhdaotao(string? manganh)
    {
        var nganhdaotao = await _context.Nganhdaotaos.FindAsync(manganh);
        if (nganhdaotao == null)
        {
            return NotFound();
        }

        _context.Nganhdaotaos.Remove(nganhdaotao);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool NganhdaotaoExists(string? manganh)
    {
        return _context.Nganhdaotaos.Any(e => e.MaNganh == manganh);
    }
}
