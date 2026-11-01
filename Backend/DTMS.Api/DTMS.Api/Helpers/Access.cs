using System.Security.Claims;
using DTMS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Helpers
{
    // Tập trung logic "ai được xem / ghi dữ liệu của NCS nào".
    // Đọc vai trò từ token (User.IsInRole), nên người có nhiều vai trò vẫn đúng.
    public static class Access
    {
        // ADMIN, PDT, TBM xem và quản lý toàn bộ NCS
        public static bool LaToanQuyen(ClaimsPrincipal user)
        {
            return user.IsInRole("ADMIN") || user.IsInRole("PDT") || user.IsInRole("TBM");
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

        // null = xem được tất cả; ngược lại là danh sách MaNcs được phép xem.
        // NCS: hồ sơ của mình. NHD: NCS đang hướng dẫn. PBDL: NCS được phân công phản biện.
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
            return ds.Distinct().ToList();
        }

        public static async Task<bool> CanReadNcsAsync(DtmsDbContext db, ClaimsPrincipal user, string maNcs)
        {
            var ds = await ReadableNcsAsync(db, user);
            return ds == null || ds.Contains(maNcs);
        }

        // Ghi điểm, đánh giá: ADMIN/PDT/TBM toàn quyền; NHD chỉ với NCS mình hướng dẫn
        public static async Task<bool> CanWriteNcsAsync(DtmsDbContext db, ClaimsPrincipal user, string maNcs)
        {
            if (LaToanQuyen(user)) return true;
            return await SupervisesAsync(db, user, maNcs);
        }

        // Danh sách mã hội đồng người dùng được xem. null = xem tất cả.
        // Hội đồng của các NCS mình có quyền xem, cộng với hội đồng mình là thành viên (PBDL).
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