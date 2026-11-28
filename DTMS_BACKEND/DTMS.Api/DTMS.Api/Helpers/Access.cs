using System.Security.Claims;
using DTMS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Helpers
{
    // Phân quyền theo phạm vi dữ liệu (tài liệu phân tích thiết kế):
    // ADMIN, PDT, BGH: xem toàn bộ (BGH chỉ xem, không ghi).
    // TBM, KHOA: chỉ xem và ghi NCS thuộc các ngành trong bảng phamvi_don_vi của giảng viên đó.
    // NHD: NCS đang hướng dẫn. PBDL: NCS được phân công phản biện. NCS: hồ sơ của mình.
    public static class Access
    {
        // Xem toàn bộ dữ liệu NCS
        public static bool LaToanQuyen(ClaimsPrincipal user)
        {
            return user.IsInRole("ADMIN") || user.IsInRole("PDT") || user.IsInRole("BGH");
        }

        // Được ghi dữ liệu học vụ của mọi NCS
        public static bool LaQuanTri(ClaimsPrincipal user)
        {
            return user.IsInRole("ADMIN") || user.IsInRole("PDT");
        }

        // Chỉ xem và ghi trong phạm vi ngành được giao
        public static bool LaCanBoPhamVi(ClaimsPrincipal user)
        {
            return user.IsInRole("TBM") || user.IsInRole("KHOA");
        }

        private static int? UserId(ClaimsPrincipal user)
        {
            if (!int.TryParse(user.FindFirst("UserId")?.Value, out int id)) return null;
            return id;
        }

        public static async Task<string?> CurrentNcsAsync(DtmsDbContext db, ClaimsPrincipal user)
        {
            var uid = UserId(user);
            if (uid == null) return null;

            return await db.Nghiencuusinhs
                .Where(n => n.MaNguoiDung == uid.Value)
                .Select(n => n.MaNcs)
                .FirstOrDefaultAsync();
        }

        public static async Task<string?> CurrentGvAsync(DtmsDbContext db, ClaimsPrincipal user)
        {
            var uid = UserId(user);
            if (uid == null) return null;

            return await db.Giangviens
                .Where(g => g.MaNguoiDung == uid.Value)
                .Select(g => g.MaGv)
                .FirstOrDefaultAsync();
        }

        // Các ngành mà giảng viên hiện tại được giao phụ trách (bảng phamvi_don_vi)
        public static async Task<List<string>> PhamViNganhAsync(DtmsDbContext db, ClaimsPrincipal user)
        {
            var maGv = await CurrentGvAsync(db, user);
            if (maGv == null) return new List<string>();

            return await db.Database
                .SqlQuery<string>($"SELECT MaNganh FROM phamvi_don_vi WHERE MaGV = {maGv}")
                .ToListAsync();
        }

        // NCS thuộc phạm vi ngành của TBM/KHOA
        public static async Task<List<string>> NcsTrongPhamViAsync(DtmsDbContext db, ClaimsPrincipal user)
        {
            var nganhs = await PhamViNganhAsync(db, user);
            if (nganhs.Count == 0) return new List<string>();

            return await db.Nghiencuusinhs
                .Where(n => nganhs.Contains(n.MaNganh))
                .Select(n => n.MaNcs)
                .ToListAsync();
        }

        // Danh sách NCS mà giảng viên hiện tại đang hướng dẫn
        public static async Task<List<string>> SupervisedNcsAsync(DtmsDbContext db, ClaimsPrincipal user)
        {
            var maGv = await CurrentGvAsync(db, user);
            if (maGv == null) return new List<string>();

            return await db.Phanconghuongdans
                .Where(pc => pc.MaGv == maGv && pc.TrangThai != false)
                .Select(pc => pc.MaNcs)
                .Distinct()
                .ToListAsync();
        }

        // Danh sách NCS mà người dùng PBDL được phân công phản biện
        public static async Task<List<string>> AssignedNcsForReviewerAsync(DtmsDbContext db, ClaimsPrincipal user)
        {
            var maGv = await CurrentGvAsync(db, user);
            if (maGv == null) return new List<string>();

            return await db.Phanbiendoclaps
                .Where(pb => pb.MaGv == maGv)
                .Select(pb => pb.MaNcs)
                .Distinct()
                .ToListAsync();
        }

        // Người dùng có phải NHD đang hướng dẫn NCS này không
        public static async Task<bool> SupervisesAsync(DtmsDbContext db, ClaimsPrincipal user, string maNcs)
        {
            if (!user.IsInRole("NHD")) return false;
            var ds = await SupervisedNcsAsync(db, user);
            return ds.Contains(maNcs);
        }

        // null = xem được tất cả; ngược lại là danh sách MaNcs được phép xem
        public static async Task<List<string>?> ReadableNcsAsync(DtmsDbContext db, ClaimsPrincipal user)
        {
            if (LaToanQuyen(user)) return null;

            var ds = new List<string>();
            if (user.IsInRole("NCS"))
            {
                var own = await CurrentNcsAsync(db, user);
                if (own != null) ds.Add(own);
            }
            if (user.IsInRole("NHD"))
            {
                ds.AddRange(await SupervisedNcsAsync(db, user));
            }
            if (user.IsInRole("PBDL"))
            {
                ds.AddRange(await AssignedNcsForReviewerAsync(db, user));
            }
            if (LaCanBoPhamVi(user))
            {
                ds.AddRange(await NcsTrongPhamViAsync(db, user));
            }
            return ds.Distinct().ToList();
        }

        public static async Task<bool> CanReadNcsAsync(DtmsDbContext db, ClaimsPrincipal user, string maNcs)
        {
            var ds = await ReadableNcsAsync(db, user);
            return ds == null || ds.Contains(maNcs);
        }

        // Ghi dữ liệu học vụ: ADMIN/PDT mọi NCS; TBM/KHOA trong phạm vi ngành; NHD NCS mình hướng dẫn.
        // BGH chỉ xem, không ghi.
        public static async Task<bool> CanWriteNcsAsync(DtmsDbContext db, ClaimsPrincipal user, string maNcs)
        {
            if (LaQuanTri(user)) return true;

            if (LaCanBoPhamVi(user))
            {
                var trongPhamVi = await NcsTrongPhamViAsync(db, user);
                if (trongPhamVi.Contains(maNcs)) return true;
            }

            return await SupervisesAsync(db, user, maNcs);
        }

        // Danh sách mã hội đồng người dùng được xem. null = xem tất cả.
        public static async Task<List<int>?> VisibleHoiDongIdsAsync(DtmsDbContext db, ClaimsPrincipal user)
        {
            if (LaToanQuyen(user)) return null;

            var ids = new List<int>();

            var ncs = await ReadableNcsAsync(db, user) ?? new List<string>();
            if (ncs.Count > 0)
            {
                ids.AddRange(await db.Hoidongdanhgia
                    .Where(h => ncs.Contains(h.MaNcs))
                    .Select(h => h.MaHoiDong)
                    .ToListAsync());
            }

            if (user.IsInRole("PBDL"))
            {
                var maGv = await CurrentGvAsync(db, user);
                if (maGv != null)
                {
                    ids.AddRange(await db.Thanhvienhoidongs
                        .Where(tv => tv.MaGv == maGv)
                        .Select(tv => tv.MaHoiDong)
                        .ToListAsync());
                }
            }

            return ids.Distinct().ToList();
        }
    }
}