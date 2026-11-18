using System;
using System.Text.RegularExpressions;
using DTMS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace DTMS.Api.Helpers
{
    public static class HocPhanRules
    {
        // Quy ước năm học của CSDL DTMS: 2026-2027.
        public static bool NamHocHopLe(string? namHoc)
        {
            if (string.IsNullOrWhiteSpace(namHoc) || !Regex.IsMatch(namHoc, @"^\d{4}-\d{4}$"))
                return false;
            return int.TryParse(namHoc[..4], out var dau) &&
                   int.TryParse(namHoc[5..], out var cuoi) &&
                   dau >= 2000 && cuoi == dau + 1;
        }

        public static bool HocKyHopLe(sbyte hocKy) => hocKy is >= 1 and <= 3;

        // Trong transaction, khóa bản ghi NCS để tuần tự hóa các đăng ký/nhập điểm
        // cùng một NCS khi nhiều yêu cầu đến đồng thời. Dùng parameter, không nối SQL.
        public static async Task<bool> KhoaNcsAsync(
            DtmsDbContext db, IDbContextTransaction transaction,
            string maNcs, CancellationToken ct = default)
        {
            var connection = db.Database.GetDbConnection();
            await using var command = connection.CreateCommand();
            command.Transaction = transaction.GetDbTransaction();
            command.CommandText = "SELECT MaNCS FROM nghiencuusinh WHERE MaNCS = @maNcs FOR UPDATE";
            var parameter = command.CreateParameter();
            parameter.ParameterName = "@maNcs";
            parameter.Value = maNcs;
            command.Parameters.Add(parameter);
            var result = await command.ExecuteScalarAsync(ct);
            return result is not null && result is not DBNull;
        }
    }
}
