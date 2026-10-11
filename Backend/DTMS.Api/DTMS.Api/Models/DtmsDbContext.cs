using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Scaffolding.Internal;

namespace DTMS.Api.Models;

public partial class DtmsDbContext : DbContext
{
    public DtmsDbContext()
    {
    }

    public DtmsDbContext(DbContextOptions<DtmsDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Baocaotiendo> Baocaotiendos { get; set; }

    public virtual DbSet<Biendonghocvu> Biendonghocvus { get; set; }

    public virtual DbSet<Chungchingoaingu> Chungchingoaingus { get; set; }

    public virtual DbSet<Congbokhoahoc> Congbokhoahocs { get; set; }

    public virtual DbSet<Danhgiahocthuat> Danhgiahocthuats { get; set; }

    public virtual DbSet<Detailuanan> Detailuanans { get; set; }

    public virtual DbSet<Giangvien> Giangviens { get; set; }

    public virtual DbSet<Hoanthienvatotnghiep> Hoanthienvatotnghieps { get; set; }

    public virtual DbSet<Hoidongdanhgium> Hoidongdanhgia { get; set; }

    public virtual DbSet<Kehoachhoctap> Kehoachhoctaps { get; set; }

    public virtual DbSet<Ketquahocphan> Ketquahocphans { get; set; }

    public virtual DbSet<Monhoc> Monhocs { get; set; }

    public virtual DbSet<Nganhdaotao> Nganhdaotaos { get; set; }

    public virtual DbSet<Nghiencuusinh> Nghiencuusinhs { get; set; }

    public virtual DbSet<Nguoidung> Nguoidungs { get; set; }

    public virtual DbSet<Phanbiendoclap> Phanbiendoclaps { get; set; }

    public virtual DbSet<Phanconghuongdan> Phanconghuongdans { get; set; }

    public virtual DbSet<Thanhvienhoidong> Thanhvienhoidongs { get; set; }

    public virtual DbSet<Vaitro> Vaitros { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseMySql("name=ConnectionStrings:DefaultConnection", Microsoft.EntityFrameworkCore.ServerVersion.Parse("11.4.13-mariadb"));

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_unicode_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<Baocaotiendo>(entity =>
        {
            entity.HasKey(e => e.MaBaoCao).HasName("PRIMARY");

            entity.Property(e => e.DanhGiaNhd).HasDefaultValueSql("'0'");
            entity.Property(e => e.TrangThaiKhoa).HasDefaultValueSql("'0'");

            entity.HasOne(d => d.MaNcsNavigation).WithMany(p => p.Baocaotiendos)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("baocaotiendo_ibfk_1");
        });

        modelBuilder.Entity<Biendonghocvu>(entity =>
        {
            entity.HasKey(e => e.MaBienDong).HasName("PRIMARY");

            entity.HasOne(d => d.MaNcsNavigation).WithMany(p => p.Biendonghocvus)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("biendonghocvu_ibfk_1");
        });

        modelBuilder.Entity<Chungchingoaingu>(entity =>
        {
            entity.HasKey(e => e.MaChungChi).HasName("PRIMARY");

            entity.Property(e => e.TrangThaiDuyet).HasDefaultValueSql("'0'");

            entity.HasOne(d => d.MaNcsNavigation).WithMany(p => p.Chungchingoaingus)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("chungchingoaingu_ibfk_1");
        });

        modelBuilder.Entity<Congbokhoahoc>(entity =>
        {
            entity.HasKey(e => e.MaCongBo).HasName("PRIMARY");

            entity.Property(e => e.TrangThaiDuyet).HasDefaultValueSql("'0'");

            entity.HasOne(d => d.MaNcsNavigation).WithMany(p => p.Congbokhoahocs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("congbokhoahoc_ibfk_1");
        });

        modelBuilder.Entity<Danhgiahocthuat>(entity =>
        {
            entity.HasKey(e => e.MaDanhGia).HasName("PRIMARY");

            entity.HasOne(d => d.MaHoiDongNavigation).WithMany(p => p.Danhgiahocthuats)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("danhgiahocthuat_ibfk_2");

            entity.HasOne(d => d.MaNcsNavigation).WithMany(p => p.Danhgiahocthuats)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("danhgiahocthuat_ibfk_1");
        });

        modelBuilder.Entity<Detailuanan>(entity =>
        {
            entity.HasKey(e => e.MaDeTai).HasName("PRIMARY");

            entity.Property(e => e.LanChinhSua).HasDefaultValueSql("'1'");
            entity.Property(e => e.TrangThaiKhoa).HasDefaultValueSql("'0'");

            entity.HasOne(d => d.MaNcsNavigation).WithMany(p => p.Detailuanans)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("detailuanan_ibfk_1");
        });

        modelBuilder.Entity<Giangvien>(entity =>
        {
            entity.HasKey(e => e.MaGv).HasName("PRIMARY");

            entity.Property(e => e.LaCanBoNgoaiTruong).HasDefaultValueSql("'0'");

            entity.HasOne(d => d.MaNguoiDungNavigation).WithOne(p => p.Giangvien)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("giangvien_ibfk_1");
        });

        modelBuilder.Entity<Hoanthienvatotnghiep>(entity =>
        {
            entity.HasKey(e => e.MaTotNghiep).HasName("PRIMARY");

            entity.HasOne(d => d.MaNcsNavigation).WithOne(p => p.Hoanthienvatotnghiep)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("hoanthienvatotnghiep_ibfk_1");
        });

        modelBuilder.Entity<Hoidongdanhgium>(entity =>
        {
            entity.HasKey(e => e.MaHoiDong).HasName("PRIMARY");

            entity.Property(e => e.KetLuan).HasDefaultValueSql("'0'");

            entity.HasOne(d => d.MaNcsNavigation).WithMany(p => p.Hoidongdanhgia)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("hoidongdanhgia_ibfk_1");
        });

        modelBuilder.Entity<Kehoachhoctap>(entity =>
        {
            entity.HasKey(e => e.MaKeHoach).HasName("PRIMARY");

            entity.Property(e => e.DuyetNhd).HasDefaultValueSql("'0'");
            entity.Property(e => e.DuyetPdt).HasDefaultValueSql("'0'");
            entity.Property(e => e.DuyetTbm).HasDefaultValueSql("'0'");
            entity.Property(e => e.NgayCapNhat)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("current_timestamp()");

            entity.HasOne(d => d.MaMonHocNavigation).WithMany(p => p.Kehoachhoctaps).HasConstraintName("kehoachhoctap_ibfk_2");

            entity.HasOne(d => d.MaNcsNavigation).WithMany(p => p.Kehoachhoctaps)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("kehoachhoctap_ibfk_1");
        });

        modelBuilder.Entity<Ketquahocphan>(entity =>
        {
            entity.HasKey(e => e.MaKetQua).HasName("PRIMARY");

            entity.HasOne(d => d.MaMonHocNavigation).WithMany(p => p.Ketquahocphans)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("ketquahocphan_ibfk_2");

            entity.HasOne(d => d.MaNcsNavigation).WithMany(p => p.Ketquahocphans)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("ketquahocphan_ibfk_1");
        });

        modelBuilder.Entity<Monhoc>(entity =>
        {
            entity.HasKey(e => e.MaMonHoc).HasName("PRIMARY");
        });

        modelBuilder.Entity<Nganhdaotao>(entity =>
        {
            entity.HasKey(e => e.MaNganh).HasName("PRIMARY");
        });

        modelBuilder.Entity<Nghiencuusinh>(entity =>
        {
            entity.HasKey(e => e.MaNcs).HasName("PRIMARY");

            entity.Property(e => e.TrangThaiHocVu).HasDefaultValueSql("'1'");

            entity.HasOne(d => d.MaNganhNavigation).WithMany(p => p.Nghiencuusinhs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("nghiencuusinh_ibfk_2");

            entity.HasOne(d => d.MaNguoiDungNavigation).WithOne(p => p.Nghiencuusinh)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("nghiencuusinh_ibfk_1");
        });

        modelBuilder.Entity<Nguoidung>(entity =>
        {
            entity.HasKey(e => e.MaNguoiDung).HasName("PRIMARY");

            entity.Property(e => e.LaHoatDong).HasDefaultValueSql("'1'");
            entity.Property(e => e.NgayTao).HasDefaultValueSql("current_timestamp()");

            entity.HasMany(d => d.MaVaiTros).WithMany(p => p.MaNguoiDungs)
                .UsingEntity<Dictionary<string, object>>(
                    "NguoidungVaitro",
                    r => r.HasOne<Vaitro>().WithMany()
                        .HasForeignKey("MaVaiTro")
                        .HasConstraintName("nguoidung_vaitro_ibfk_2"),
                    l => l.HasOne<Nguoidung>().WithMany()
                        .HasForeignKey("MaNguoiDung")
                        .HasConstraintName("nguoidung_vaitro_ibfk_1"),
                    j =>
                    {
                        j.HasKey("MaNguoiDung", "MaVaiTro")
                            .HasName("PRIMARY")
                            .HasAnnotation("MySql:IndexPrefixLength", new[] { 0, 0 });
                        j.ToTable("nguoidung_vaitro");
                        j.HasIndex(new[] { "MaVaiTro" }, "MaVaiTro");
                        j.IndexerProperty<int>("MaNguoiDung").HasColumnType("int(11)");
                        j.IndexerProperty<string>("MaVaiTro").HasMaxLength(20);
                    });
        });

        modelBuilder.Entity<Phanbiendoclap>(entity =>
        {
            entity.HasKey(e => e.MaPhanBien).HasName("PRIMARY");

            entity.HasOne(d => d.MaGvNavigation).WithMany(p => p.Phanbiendoclaps)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("phanbiendoclap_ibfk_2");

            entity.HasOne(d => d.MaNcsNavigation).WithMany(p => p.Phanbiendoclaps)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("phanbiendoclap_ibfk_1");
        });

        modelBuilder.Entity<Phanconghuongdan>(entity =>
        {
            entity.HasKey(e => e.MaPhanCong).HasName("PRIMARY");

            entity.Property(e => e.TrangThai).HasDefaultValueSql("'1'");

            entity.HasOne(d => d.MaGvNavigation).WithMany(p => p.Phanconghuongdans)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("phanconghuongdan_ibfk_2");

            entity.HasOne(d => d.MaNcsNavigation).WithMany(p => p.Phanconghuongdans)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("phanconghuongdan_ibfk_1");
        });

        modelBuilder.Entity<Thanhvienhoidong>(entity =>
        {
            entity.HasKey(e => new { e.MaHoiDong, e.MaGv })
                .HasName("PRIMARY")
                .HasAnnotation("MySql:IndexPrefixLength", new[] { 0, 0 });

            entity.Property(e => e.CoMat).HasDefaultValueSql("'1'");

            entity.HasOne(d => d.MaGvNavigation).WithMany(p => p.Thanhvienhoidongs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("thanhvienhoidong_ibfk_2");

            entity.HasOne(d => d.MaHoiDongNavigation).WithMany(p => p.Thanhvienhoidongs).HasConstraintName("thanhvienhoidong_ibfk_1");
        });

        modelBuilder.Entity<Vaitro>(entity =>
        {
            entity.HasKey(e => e.MaVaiTro).HasName("PRIMARY");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
