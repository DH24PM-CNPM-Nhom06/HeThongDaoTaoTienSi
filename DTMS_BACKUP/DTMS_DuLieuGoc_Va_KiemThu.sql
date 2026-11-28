/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.4.13-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: dtms_db
-- ------------------------------------------------------
-- Server version	11.4.13-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Current Database: `dtms_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `dtms_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `dtms_db`;

--
-- Table structure for table `baocaotiendo`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `baocaotiendo` (
  `MaBaoCao` int(11) NOT NULL AUTO_INCREMENT,
  `MaNCS` varchar(20) NOT NULL,
  `KyBaoCao` varchar(50) NOT NULL,
  `HanNop` date NOT NULL,
  `NgayNop` datetime DEFAULT NULL,
  `FileBaoCao` varchar(500) DEFAULT NULL,
  `FileMinhChung` varchar(500) DEFAULT NULL,
  `DanhGiaNHD` tinyint(4) DEFAULT 0,
  `NhanXetNHD` varchar(1000) DEFAULT NULL,
  `TrangThaiKhoa` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`MaBaoCao`),
  KEY `MaNCS` (`MaNCS`),
  CONSTRAINT `baocaotiendo_ibfk_1` FOREIGN KEY (`MaNCS`) REFERENCES `nghiencuusinh` (`MaNCS`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `baocaotiendo`
--
-- ORDER BY:  `MaBaoCao`

/*!40000 ALTER TABLE `baocaotiendo` DISABLE KEYS */;
INSERT INTO `baocaotiendo` VALUES
(1,'NCS01','Kỳ 1 - 2024','2024-03-31','2024-03-20 00:00:00',NULL,NULL,1,'Hoàn thành tốt đề cương, đúng tiến độ',0),
(2,'NCS02','Kỳ 1 - 2024','2024-03-31','2024-04-05 00:00:00',NULL,NULL,1,'Nộp trễ hạn nhưng chất lượng báo cáo đạt yêu cầu',0),
(3,'NCS05','Kỳ 2 - 2025','2025-09-30','2025-09-28 00:00:00',NULL,NULL,1,'Tiến độ thu thập dữ liệu rất tốt',0),
(4,'TEST_NCS01','[DTMS-SEED] Kỳ 1 - 2026','2027-03-17',NULL,NULL,NULL,0,NULL,0),
(5,'TEST_NCS02','[DTMS-SEED] Kỳ 2 - 2025','2025-11-30','2025-11-25 09:00:00',NULL,NULL,1,'Đã nộp đúng hạn',1);
/*!40000 ALTER TABLE `baocaotiendo` ENABLE KEYS */;

--
-- Table structure for table `biendonghocvu`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `biendonghocvu` (
  `MaBienDong` int(11) NOT NULL AUTO_INCREMENT,
  `MaNCS` varchar(20) NOT NULL,
  `LoaiBienDong` tinyint(4) NOT NULL,
  `SoThang` int(11) DEFAULT NULL,
  `SoQuyetDinh` varchar(50) NOT NULL,
  `NgayHieuLuc` date NOT NULL,
  `NgayHetHanMoi` date DEFAULT NULL,
  `LyDo` varchar(500) DEFAULT NULL,
  `FileQuyetDinh` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`MaBienDong`),
  KEY `MaNCS` (`MaNCS`),
  CONSTRAINT `biendonghocvu_ibfk_1` FOREIGN KEY (`MaNCS`) REFERENCES `nghiencuusinh` (`MaNCS`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `biendonghocvu`
--
-- ORDER BY:  `MaBienDong`

/*!40000 ALTER TABLE `biendonghocvu` DISABLE KEYS */;
INSERT INTO `biendonghocvu` VALUES
(1,'TEST_NCS02',1,6,'[DTMS-SEED] BD-01','2025-09-01','2029-03-01','Bổ sung quyết định gia hạn demo',NULL);
/*!40000 ALTER TABLE `biendonghocvu` ENABLE KEYS */;

--
-- Table structure for table `chungchingoaingu`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `chungchingoaingu` (
  `MaChungChi` int(11) NOT NULL AUTO_INCREMENT,
  `MaNCS` varchar(20) NOT NULL,
  `TenChungChi` varchar(100) NOT NULL,
  `DiemSo` varchar(20) NOT NULL,
  `NgayCap` date NOT NULL,
  `NgayHetHan` date DEFAULT NULL,
  `NoiCap` varchar(200) NOT NULL,
  `FileMinhChung` varchar(500) NOT NULL,
  `TrangThaiDuyet` tinyint(4) DEFAULT 0,
  PRIMARY KEY (`MaChungChi`),
  KEY `MaNCS` (`MaNCS`),
  CONSTRAINT `chungchingoaingu_ibfk_1` FOREIGN KEY (`MaNCS`) REFERENCES `nghiencuusinh` (`MaNCS`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chungchingoaingu`
--
-- ORDER BY:  `MaChungChi`

/*!40000 ALTER TABLE `chungchingoaingu` DISABLE KEYS */;
INSERT INTO `chungchingoaingu` VALUES
(1,'NCS01','IELTS Academic','6.5','2023-01-10',NULL,'British Council','/uploads/ncs01/ielts.pdf',1),
(2,'NCS02','VSTEP Bậc 4 (B2)','7.0','2022-12-15',NULL,'Đại học Cần Thơ','/uploads/ncs02/vstep.pdf',1),
(3,'TEST_NCS01','IELTS Demo','6.5','2025-05-10','2027-05-10','Đơn vị thử nghiệm','/api/File/TEST_SAMPLE_NOT_UPLOADED.pdf',1),
(4,'TEST_NCS02','VSTEP Demo','B2','2025-07-12',NULL,'Đơn vị thử nghiệm','/api/File/TEST_SAMPLE_NOT_UPLOADED.pdf',0);
/*!40000 ALTER TABLE `chungchingoaingu` ENABLE KEYS */;

--
-- Table structure for table `congbokhoahoc`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `congbokhoahoc` (
  `MaCongBo` int(11) NOT NULL AUTO_INCREMENT,
  `MaNCS` varchar(20) NOT NULL,
  `TenBaiBao` varchar(500) NOT NULL,
  `TenTapChi` varchar(300) NOT NULL,
  `PhanLoai` varchar(50) NOT NULL,
  `DiemTapChi` float DEFAULT NULL,
  `VaiTroTacGia` tinyint(4) NOT NULL,
  `CoTenNHD` tinyint(1) NOT NULL,
  `DiaChiTruong` tinyint(1) NOT NULL,
  `LinkDOI` varchar(255) DEFAULT NULL,
  `FileMinhChung` varchar(500) NOT NULL,
  `TrangThaiDuyet` tinyint(4) DEFAULT 0,
  PRIMARY KEY (`MaCongBo`),
  KEY `MaNCS` (`MaNCS`),
  CONSTRAINT `congbokhoahoc_ibfk_1` FOREIGN KEY (`MaNCS`) REFERENCES `nghiencuusinh` (`MaNCS`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `congbokhoahoc`
--
-- ORDER BY:  `MaCongBo`

/*!40000 ALTER TABLE `congbokhoahoc` DISABLE KEYS */;
INSERT INTO `congbokhoahoc` VALUES
(1,'NCS01','Nhận diện bệnh hạt giống bằng mạng Neural Tích chập','Tạp chí Khoa học ĐHAG','HDGSNN',NULL,1,1,1,NULL,'/uploads/ncs01/paper1.pdf',1),
(2,'NCS02','Tối ưu hóa chỉ mục đa chiều trong cơ sở dữ liệu đồ thị','IEEE Access','WoS',NULL,1,1,1,NULL,'/uploads/ncs02/paper2.pdf',1),
(3,'NCS05','Hệ thống gợi ý học tập dựa trên tri thức (Knowledge-based)','Tạp chí CNTT','HDGSNN',NULL,2,1,1,NULL,'/uploads/ncs05/paper3.pdf',0),
(4,'NCS01','string','string','string',0,0,1,1,'string','string',0),
(5,'TEST_NCS01','[DTMS-SEED] Đánh giá dữ liệu ảnh dùng mạng sâu','Tạp chí khoa học thử nghiệm','HDGSNN',0.5,1,1,1,NULL,'/api/File/TEST_SAMPLE_NOT_UPLOADED.pdf',1);
/*!40000 ALTER TABLE `congbokhoahoc` ENABLE KEYS */;

--
-- Table structure for table `ctdt_hocphan`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ctdt_hocphan` (
  `MaCtdt` int(11) NOT NULL AUTO_INCREMENT,
  `MaNganh` varchar(20) NOT NULL,
  `DoiTuongDauVao` tinyint(4) NOT NULL,
  `MaMonHoc` varchar(20) NOT NULL,
  `LoaiHocPhan` varchar(20) NOT NULL,
  PRIMARY KEY (`MaCtdt`),
  UNIQUE KEY `uk_ctdt` (`MaNganh`,`DoiTuongDauVao`,`MaMonHoc`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ctdt_hocphan`
--
-- ORDER BY:  `MaCtdt`

/*!40000 ALTER TABLE `ctdt_hocphan` DISABLE KEYS */;
INSERT INTO `ctdt_hocphan` VALUES
(1,'KTPM',1,'TEST_MH01','BAT_BUOC'),
(2,'KTPM',1,'TEST_MH02','BAT_BUOC'),
(3,'KTPM',1,'TEST_MH03','TU_CHON'),
(4,'KHMT',2,'TEST_MH01','BAT_BUOC'),
(5,'KHMT',2,'TEST_MH04','TU_CHON');
/*!40000 ALTER TABLE `ctdt_hocphan` ENABLE KEYS */;

--
-- Table structure for table `dangky_hocphan`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dangky_hocphan` (
  `MaDangKy` int(11) NOT NULL AUTO_INCREMENT,
  `MaNCS` varchar(20) NOT NULL,
  `MaMonHoc` varchar(20) NOT NULL,
  `NamHoc` varchar(20) NOT NULL,
  `HocKy` tinyint(4) NOT NULL,
  `LoaiHocPhan` varchar(20) NOT NULL,
  `NgayDangKy` datetime NOT NULL,
  `TrangThai` varchar(20) NOT NULL DEFAULT 'DA_DANG_KY',
  PRIMARY KEY (`MaDangKy`),
  UNIQUE KEY `uk_dangky` (`MaNCS`,`MaMonHoc`,`NamHoc`,`HocKy`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dangky_hocphan`
--
-- ORDER BY:  `MaDangKy`

/*!40000 ALTER TABLE `dangky_hocphan` DISABLE KEYS */;
INSERT INTO `dangky_hocphan` VALUES
(1,'TEST_NCS01','TEST_MH03','2026-2027',1,'TU_CHON','2026-11-16 14:40:05','DA_DANG_KY'),
(2,'TEST_NCS02','TEST_MH04','2024-2025',2,'TU_CHON','2025-01-15 08:00:00','DA_DANG_KY');
/*!40000 ALTER TABLE `dangky_hocphan` ENABLE KEYS */;

--
-- Table structure for table `danhgiahocthuat`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `danhgiahocthuat` (
  `MaDanhGia` int(11) NOT NULL AUTO_INCREMENT,
  `MaNCS` varchar(20) NOT NULL,
  `LoaiDanhGia` tinyint(4) NOT NULL,
  `TenNoiDung` varchar(500) NOT NULL,
  `MaHoiDong` int(11) DEFAULT NULL,
  `DiemTrungBinh` float DEFAULT NULL,
  `KetLuan` tinyint(4) NOT NULL,
  `FileBaoCao` varchar(500) DEFAULT NULL,
  `FileBienBan` varchar(500) DEFAULT NULL,
  `FileGiaiTrinh` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`MaDanhGia`),
  KEY `MaNCS` (`MaNCS`),
  KEY `MaHoiDong` (`MaHoiDong`),
  CONSTRAINT `danhgiahocthuat_ibfk_1` FOREIGN KEY (`MaNCS`) REFERENCES `nghiencuusinh` (`MaNCS`),
  CONSTRAINT `danhgiahocthuat_ibfk_2` FOREIGN KEY (`MaHoiDong`) REFERENCES `hoidongdanhgia` (`MaHoiDong`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `danhgiahocthuat`
--
-- ORDER BY:  `MaDanhGia`

/*!40000 ALTER TABLE `danhgiahocthuat` DISABLE KEYS */;
INSERT INTO `danhgiahocthuat` VALUES
(1,'TEST_NCS01',1,'[DTMS-SEED] Tiểu luận tổng quan thử nghiệm',1,8.2,1,NULL,NULL,NULL),
(2,'GOCM05NCS',1,'Tieu luan mau',NULL,8,1,NULL,'/api/File/GOCM05NCS_bienban_b9ee681bc65d4fc582c46cfd15446aeb.pdf',NULL),
(3,'GOCM05NCS',2,'De cuong mau',NULL,NULL,2,NULL,NULL,'/uploads/gocm05ncs/giai-trinh-mau.pdf');
/*!40000 ALTER TABLE `danhgiahocthuat` ENABLE KEYS */;

--
-- Table structure for table `detailuanan`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `detailuanan` (
  `MaDeTai` int(11) NOT NULL AUTO_INCREMENT,
  `MaNCS` varchar(20) NOT NULL,
  `TenDeTaiVN` varchar(500) NOT NULL,
  `TenDeTaiEN` varchar(500) NOT NULL,
  `LanChinhSua` int(11) DEFAULT 1,
  `SoQDDieuChinh` varchar(50) DEFAULT NULL,
  `FileToanVan` varchar(500) DEFAULT NULL,
  `FileTomTat` varchar(500) DEFAULT NULL,
  `TrangThaiKhoa` tinyint(1) DEFAULT 0,
  `FileTieuLuan` varchar(500) DEFAULT NULL,
  `FileDeCuong` varchar(500) DEFAULT NULL,
  `TrangThaiDuyet` tinyint(4) NOT NULL DEFAULT 0,
  `NgayDuyet` datetime DEFAULT NULL,
  `GhiChuDuyet` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`MaDeTai`),
  KEY `MaNCS` (`MaNCS`),
  CONSTRAINT `detailuanan_ibfk_1` FOREIGN KEY (`MaNCS`) REFERENCES `nghiencuusinh` (`MaNCS`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detailuanan`
--
-- ORDER BY:  `MaDeTai`

/*!40000 ALTER TABLE `detailuanan` DISABLE KEYS */;
INSERT INTO `detailuanan` VALUES
(1,'NCS01','Ứng dụng trí tuệ nhân tạo trong nhận diện mầm bệnh hạt giống','AI application in seed pathogen recognition',1,NULL,NULL,NULL,0,NULL,NULL,0,NULL,NULL),
(2,'NCS02','Tối ưu hóa truy vấn cơ sở dữ liệu phân tán NoSQL','Optimization of NoSQL distributed database queries',1,NULL,NULL,NULL,0,NULL,NULL,0,NULL,NULL),
(3,'NCS03','Kiến trúc phần mềm phân tán cho các hệ thống IoT','Distributed software architecture for IoT systems',1,NULL,NULL,NULL,0,NULL,NULL,0,NULL,NULL),
(4,'NCS04','Mô hình học sâu kết hợp trong xử lý ngôn ngữ tự nhiên','Hybrid deep learning model in NLP',1,NULL,NULL,NULL,0,NULL,NULL,0,NULL,NULL),
(5,'NCS05','Hệ thống gợi ý học tập thông minh đa tác tử','Multi-agent smart learning recommendation system',1,NULL,NULL,NULL,0,NULL,NULL,0,NULL,NULL),
(6,'TEST_NCS01','[DTMS-SEED] Ứng dụng AI trong nông nghiệp','[DTMS-SEED] AI in agriculture',1,NULL,NULL,NULL,0,NULL,NULL,0,NULL,NULL),
(7,'TEST_NCS02','[DTMS-SEED] Mô hình phân tích dữ liệu lớn','[DTMS-SEED] Big data analysis',1,NULL,NULL,NULL,0,NULL,NULL,0,NULL,NULL),
(8,'GOCM05NCS','De tai kiem thu M05','M05 download fixture',1,NULL,NULL,NULL,0,'/uploads/gocm05ncs/tieu-luan-mau.pdf','/uploads/gocm05ncs/de-cuong-mau.pdf',0,NULL,NULL);
/*!40000 ALTER TABLE `detailuanan` ENABLE KEYS */;

--
-- Table structure for table `dot_dangky_hocphan`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dot_dangky_hocphan` (
  `MaDot` int(11) NOT NULL AUTO_INCREMENT,
  `NamHoc` varchar(20) NOT NULL,
  `HocKy` tinyint(4) NOT NULL,
  `TuNgay` date NOT NULL,
  `DenNgay` date NOT NULL,
  `MaNganh` varchar(20) DEFAULT NULL,
  `GhiChu` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`MaDot`),
  KEY `idx_dot_kyhoc` (`NamHoc`,`HocKy`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dot_dangky_hocphan`
--
-- ORDER BY:  `MaDot`

/*!40000 ALTER TABLE `dot_dangky_hocphan` DISABLE KEYS */;
INSERT INTO `dot_dangky_hocphan` VALUES
(1,'2026-2027',1,'2026-11-10','2026-12-17','KTPM','[DTMS-SEED] Đợt đang mở ngành KTPM'),
(2,'2024-2025',2,'2025-01-01','2025-01-31','KHMT','[DTMS-SEED] Đợt đã đóng ngành KHMT');
/*!40000 ALTER TABLE `dot_dangky_hocphan` ENABLE KEYS */;

--
-- Table structure for table `giangvien`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `giangvien` (
  `MaGV` varchar(20) NOT NULL,
  `MaNguoiDung` int(11) DEFAULT NULL,
  `HoTen` varchar(100) NOT NULL,
  `HocHam` varchar(20) DEFAULT NULL,
  `HocVi` varchar(20) NOT NULL,
  `DonViCongTac` varchar(200) NOT NULL,
  `LaCanBoNgoaiTruong` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`MaGV`),
  UNIQUE KEY `MaNguoiDung` (`MaNguoiDung`),
  CONSTRAINT `giangvien_ibfk_1` FOREIGN KEY (`MaNguoiDung`) REFERENCES `nguoidung` (`MaNguoiDung`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `giangvien`
--
-- ORDER BY:  `MaGV`

/*!40000 ALTER TABLE `giangvien` DISABLE KEYS */;
INSERT INTO `giangvien` VALUES
('GOCM05NHD',31,'Người hướng dẫn kiểm thử',NULL,'TS','Công nghệ Thông tin',0),
('GOCM05TBM',32,'Trưởng bộ môn kiểm thử',NULL,'TS','Công nghệ Thông tin',0),
('GV01',3,'PGS.TS. Trần Văn A','PGS','TS','Đại học An Giang',0),
('GV02',4,'TS. Nguyễn Thị B',NULL,'TS','Đại học An Giang',0),
('GV03',5,'GS.TS. Lê Văn C','GS','TS','Đại học An Giang',0),
('GV04',6,'TS. Phạm Văn D',NULL,'TS','Đại học Bách Khoa',1),
('GV05',7,'PGS.TS. Hoàng Thị E','PGS','TS','Đại học Cần Thơ',1),
('TEST_GV_KHOA',16,'PGS.TS. Võ Thị Hương (demo)','PGS','TS','Đại học An Giang (demo)',0),
('TEST_GV_NHD1',18,'TS. Đỗ Minh Thử',NULL,'TS','Đại học An Giang (demo)',0),
('TEST_GV_NHD2',19,'TS. Bùi Lan Thử',NULL,'TS','Đại học An Giang (demo)',0),
('TEST_GV_NHD3',20,'TS. Nguyễn An Thử',NULL,'TS','Đại học An Giang (demo)',0),
('TEST_GV_PBDL1',21,'PGS.TS. Phạm Văn Phản Biện (demo)','PGS','TS','Đại học Cần Thơ (demo)',1),
('TEST_GV_PBDL2',22,'TS. Trần Thị Phản Biện (demo)',NULL,'TS','Đại học Bách khoa (demo)',1),
('TEST_GV_TBM',17,'TS. Lê Hoàng Quân (demo)',NULL,'TS','Đại học An Giang (demo)',0);
/*!40000 ALTER TABLE `giangvien` ENABLE KEYS */;

--
-- Table structure for table `hoanthienvatotnghiep`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `hoanthienvatotnghiep` (
  `MaTotNghiep` int(11) NOT NULL AUTO_INCREMENT,
  `MaNCS` varchar(20) NOT NULL,
  `NgayCongKhaiWeb` date DEFAULT NULL,
  `FileGiaiTrinhSauBV` varchar(500) DEFAULT NULL,
  `BienNhanTVQG` varchar(500) DEFAULT NULL,
  `BienNhanTVTruong` varchar(500) DEFAULT NULL,
  `SoQDCapBang` varchar(50) DEFAULT NULL,
  `NgayCapBang` date DEFAULT NULL,
  `SoHieuBang` varchar(50) DEFAULT NULL,
  `SoVaoSoGoc` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`MaTotNghiep`),
  UNIQUE KEY `MaNCS` (`MaNCS`),
  CONSTRAINT `hoanthienvatotnghiep_ibfk_1` FOREIGN KEY (`MaNCS`) REFERENCES `nghiencuusinh` (`MaNCS`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hoanthienvatotnghiep`
--
-- ORDER BY:  `MaTotNghiep`

/*!40000 ALTER TABLE `hoanthienvatotnghiep` DISABLE KEYS */;
INSERT INTO `hoanthienvatotnghiep` VALUES
(1,'TEST_NCS01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(2,'TEST_NCS02','2026-11-12',NULL,'[DTMS-SEED] BN-TVQG-01','[DTMS-SEED] BN-TV-TRUONG-01',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `hoanthienvatotnghiep` ENABLE KEYS */;

--
-- Table structure for table `hoidongdanhgia`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `hoidongdanhgia` (
  `MaHoiDong` int(11) NOT NULL AUTO_INCREMENT,
  `MaNCS` varchar(20) NOT NULL,
  `LoaiHoiDong` tinyint(4) NOT NULL,
  `SoQuyetDinh` varchar(50) NOT NULL,
  `NgayThanhLap` date NOT NULL,
  `NgayBaoVe` datetime DEFAULT NULL,
  `DiaDiem` varchar(200) DEFAULT NULL,
  `SoPhieuTanThanh` int(11) DEFAULT NULL,
  `TongSoPhieu` int(11) DEFAULT NULL,
  `KetLuan` tinyint(4) DEFAULT 0,
  `FileQuyetDinh` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`MaHoiDong`),
  KEY `MaNCS` (`MaNCS`),
  CONSTRAINT `hoidongdanhgia_ibfk_1` FOREIGN KEY (`MaNCS`) REFERENCES `nghiencuusinh` (`MaNCS`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hoidongdanhgia`
--
-- ORDER BY:  `MaHoiDong`

/*!40000 ALTER TABLE `hoidongdanhgia` DISABLE KEYS */;
INSERT INTO `hoidongdanhgia` VALUES
(1,'TEST_NCS01',1,'TEST-HD-TL-01','2026-09-01','2026-09-15 09:00:00','Phòng họp demo A',NULL,NULL,0,NULL),
(2,'TEST_NCS01',2,'TEST-HD-DC-01','2026-09-15','2026-09-30 09:00:00','Phòng họp demo B',NULL,NULL,0,NULL),
(3,'TEST_NCS01',4,'TEST-HD-TRUONG-OPEN','2026-10-01','2026-12-27 14:40:05','Phòng họp demo C',NULL,NULL,0,NULL),
(4,'TEST_NCS02',4,'TEST-HD-TRUONG-DONE','2026-10-01','2026-10-08 14:40:05','Phòng họp demo D',4,5,1,NULL);
/*!40000 ALTER TABLE `hoidongdanhgia` ENABLE KEYS */;

--
-- Table structure for table `kehoach_lichsu`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kehoach_lichsu` (
  `MaLichSu` int(11) NOT NULL AUTO_INCREMENT,
  `MaKeHoach` int(11) NOT NULL,
  `NamHoc` varchar(20) NOT NULL,
  `HocKy` tinyint(4) NOT NULL,
  `MaMonHoc` varchar(20) DEFAULT NULL,
  `NoiDungKeHoach` varchar(500) NOT NULL,
  `NgayLuu` datetime NOT NULL,
  `NguoiLuu` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`MaLichSu`),
  KEY `idx_lichsu_kh` (`MaKeHoach`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kehoach_lichsu`
--
-- ORDER BY:  `MaLichSu`

/*!40000 ALTER TABLE `kehoach_lichsu` DISABLE KEYS */;
INSERT INTO `kehoach_lichsu` VALUES
(1,6,'2026-2027',1,'TEST_MH02','[DTMS-SEED] Lịch sử kế hoạch ban đầu','2026-11-15 14:40:05','dtms_test_ncs01');
/*!40000 ALTER TABLE `kehoach_lichsu` ENABLE KEYS */;

--
-- Table structure for table `kehoachhoctap`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kehoachhoctap` (
  `MaKeHoach` int(11) NOT NULL AUTO_INCREMENT,
  `MaNCS` varchar(20) NOT NULL,
  `NamHoc` varchar(20) NOT NULL,
  `HocKy` tinyint(4) NOT NULL,
  `MaMonHoc` varchar(20) DEFAULT NULL,
  `NoiDungKeHoach` varchar(500) NOT NULL,
  `DuyetNHD` tinyint(4) DEFAULT 0,
  `YKienNHD` varchar(500) DEFAULT NULL,
  `DuyetTBM` tinyint(4) DEFAULT 0,
  `DuyetPDT` tinyint(4) DEFAULT 0,
  `NgayCapNhat` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`MaKeHoach`),
  KEY `MaNCS` (`MaNCS`),
  KEY `MaMonHoc` (`MaMonHoc`),
  CONSTRAINT `kehoachhoctap_ibfk_1` FOREIGN KEY (`MaNCS`) REFERENCES `nghiencuusinh` (`MaNCS`),
  CONSTRAINT `kehoachhoctap_ibfk_2` FOREIGN KEY (`MaMonHoc`) REFERENCES `monhoc` (`MaMonHoc`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kehoachhoctap`
--
-- ORDER BY:  `MaKeHoach`

/*!40000 ALTER TABLE `kehoachhoctap` DISABLE KEYS */;
INSERT INTO `kehoachhoctap` VALUES
(1,'NCS01','2023-2024',1,'TS01','Đăng ký học phần bắt buộc',1,NULL,1,1,'2026-10-10 01:09:44'),
(2,'NCS01','2023-2024',1,'TS02','Đăng ký học phần chuyên ngành',1,NULL,1,1,'2026-10-10 01:09:44'),
(3,'NCS02','2023-2024',1,'TS01','Đăng ký học phần bắt buộc',1,NULL,1,1,'2026-10-10 01:09:44'),
(4,'NCS02','2023-2024',2,'TS04','Đăng ký học phần chuyên ngành',1,NULL,1,1,'2026-10-10 01:09:44'),
(5,'NCS03','2024-2025',1,'TS03','Đăng ký học phần chuyên ngành',1,NULL,0,0,'2026-10-10 01:09:44'),
(6,'TEST_NCS01','2026-2027',1,'TEST_MH02','[DTMS-SEED] Học phương pháp AI sau môn cơ sở',1,'Phù hợp tiến độ thử nghiệm',0,0,'2026-11-17 14:40:05'),
(7,'GOCM05NCS','2026-2027',1,NULL,'Kiem thu DTMS tren ban khoi phuc',1,NULL,1,1,'2026-11-24 01:23:12');
/*!40000 ALTER TABLE `kehoachhoctap` ENABLE KEYS */;

--
-- Table structure for table `ketquahocphan`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ketquahocphan` (
  `MaKetQua` int(11) NOT NULL AUTO_INCREMENT,
  `MaNCS` varchar(20) NOT NULL,
  `MaMonHoc` varchar(20) NOT NULL,
  `DiemThi` float DEFAULT NULL,
  `TrangThaiDat` tinyint(1) DEFAULT NULL,
  `DiemChuyenCan` float DEFAULT NULL,
  `DiemGiuaKy` float DEFAULT NULL,
  `DiemThiCuoiKy` float DEFAULT NULL,
  `DiemTongKet` float DEFAULT NULL,
  `DiemChu` varchar(2) DEFAULT NULL,
  `DiemHe4` float DEFAULT NULL,
  `TrangThaiKhoa` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`MaKetQua`),
  KEY `MaNCS` (`MaNCS`),
  KEY `MaMonHoc` (`MaMonHoc`),
  CONSTRAINT `ketquahocphan_ibfk_1` FOREIGN KEY (`MaNCS`) REFERENCES `nghiencuusinh` (`MaNCS`),
  CONSTRAINT `ketquahocphan_ibfk_2` FOREIGN KEY (`MaMonHoc`) REFERENCES `monhoc` (`MaMonHoc`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ketquahocphan`
--
-- ORDER BY:  `MaKetQua`

/*!40000 ALTER TABLE `ketquahocphan` DISABLE KEYS */;
INSERT INTO `ketquahocphan` VALUES
(1,'NCS01','TS01',8.5,1,NULL,NULL,NULL,NULL,NULL,NULL,0),
(2,'NCS01','TS02',7,1,NULL,NULL,NULL,NULL,NULL,NULL,0),
(3,'NCS02','TS01',9,1,NULL,NULL,NULL,NULL,NULL,NULL,0),
(4,'NCS02','TS04',6.5,0,NULL,NULL,NULL,NULL,NULL,NULL,0),
(5,'TEST_NCS01','TEST_MH01',8.2,1,8,8,8.5,8.2,'B',3,1),
(6,'TEST_NCS02','TEST_MH01',3.5,0,5,4,3,3.5,'F',0,1);
/*!40000 ALTER TABLE `ketquahocphan` ENABLE KEYS */;

--
-- Table structure for table `lylich_khoahoc`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `lylich_khoahoc` (
  `MaLyLich` int(11) NOT NULL AUTO_INCREMENT,
  `MaNguoi` varchar(20) NOT NULL,
  `VaiTro` varchar(10) NOT NULL,
  `LoaiMuc` varchar(30) NOT NULL,
  `NoiDung` varchar(1000) NOT NULL,
  `NamThucHien` int(11) DEFAULT NULL,
  `NgayTao` datetime NOT NULL,
  PRIMARY KEY (`MaLyLich`),
  KEY `idx_lylich_nguoi` (`MaNguoi`,`VaiTro`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lylich_khoahoc`
--
-- ORDER BY:  `MaLyLich`

/*!40000 ALTER TABLE `lylich_khoahoc` DISABLE KEYS */;
INSERT INTO `lylich_khoahoc` VALUES
(1,'TEST_NCS01','NCS','BAI_BAO','[DTMS-SEED] Kinh nghiệm nghiên cứu học máy',2025,'2026-11-02 14:40:05'),
(2,'TEST_GV_NHD1','GV','DE_TAI','[DTMS-SEED] Đề tài quản lý hướng dẫn NCS',2025,'2026-11-05 14:40:05');
/*!40000 ALTER TABLE `lylich_khoahoc` ENABLE KEYS */;

--
-- Table structure for table `monhoc`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `monhoc` (
  `MaMonHoc` varchar(20) NOT NULL,
  `TenMonHoc` varchar(150) NOT NULL,
  `SoTinChi` int(11) NOT NULL,
  `LoaiMon` tinyint(4) NOT NULL,
  PRIMARY KEY (`MaMonHoc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `monhoc`
--
-- ORDER BY:  `MaMonHoc`

/*!40000 ALTER TABLE `monhoc` DISABLE KEYS */;
INSERT INTO `monhoc` VALUES
('TEST_MH01','Cơ sở nghiên cứu khoa học - thử nghiệm',3,1),
('TEST_MH02','Phương pháp AI chuyên sâu - thử nghiệm',3,1),
('TEST_MH03','Seminar chuyên ngành - thử nghiệm',2,1),
('TEST_MH04','Tự chọn phân tích dữ liệu - thử nghiệm',2,2),
('TS01','Phương pháp NCKH nâng cao',3,1),
('TS02','Trí tuệ nhân tạo nâng cao',3,1),
('TS03','Kiến trúc phần mềm hiện đại',3,1),
('TS04','Cơ sở dữ liệu tiên tiến',3,1),
('TS05','Toán học rời rạc bổ sung',2,2);
/*!40000 ALTER TABLE `monhoc` ENABLE KEYS */;

--
-- Table structure for table `monhoc_tienquyet`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `monhoc_tienquyet` (
  `MaMonHoc` varchar(20) NOT NULL,
  `MaTienQuyet` varchar(20) NOT NULL,
  PRIMARY KEY (`MaMonHoc`,`MaTienQuyet`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `monhoc_tienquyet`
--
-- ORDER BY:  `MaMonHoc`,`MaTienQuyet`

/*!40000 ALTER TABLE `monhoc_tienquyet` DISABLE KEYS */;
INSERT INTO `monhoc_tienquyet` VALUES
('TEST_MH02','TEST_MH01');
/*!40000 ALTER TABLE `monhoc_tienquyet` ENABLE KEYS */;

--
-- Table structure for table `nganhdaotao`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `nganhdaotao` (
  `MaNganh` varchar(20) NOT NULL,
  `TenNganh` varchar(150) NOT NULL,
  `KhoaQuanLy` varchar(150) NOT NULL,
  PRIMARY KEY (`MaNganh`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nganhdaotao`
--
-- ORDER BY:  `MaNganh`

/*!40000 ALTER TABLE `nganhdaotao` DISABLE KEYS */;
INSERT INTO `nganhdaotao` VALUES
('HTTT','Hệ thống thông tin','Công nghệ Thông tin'),
('KHMT','Khoa học máy tính','Công nghệ Thông tin'),
('KTPM','Kỹ thuật phần mềm','Công nghệ Thông tin'),
('TEST_TIN','Ngành Công nghệ thông tin (dữ liệu thử nghiệm)','Khoa CNTT - DEMO');
/*!40000 ALTER TABLE `nganhdaotao` ENABLE KEYS */;

--
-- Table structure for table `nghiencuusinh`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `nghiencuusinh` (
  `MaNCS` varchar(20) NOT NULL,
  `MaNguoiDung` int(11) NOT NULL,
  `HoTen` varchar(100) NOT NULL,
  `NgaySinh` date NOT NULL,
  `GioiTinh` tinyint(1) NOT NULL,
  `MaNganh` varchar(20) NOT NULL,
  `DoiTuongDauVao` tinyint(4) NOT NULL,
  `SoQDTrungTuyen` varchar(50) NOT NULL,
  `NgayNhapHoc` date NOT NULL,
  `NgayHetHanChuan` date NOT NULL,
  `NgayHetHanToiDa` date NOT NULL,
  `TrangThaiHocVu` tinyint(4) DEFAULT 1,
  PRIMARY KEY (`MaNCS`),
  UNIQUE KEY `MaNguoiDung` (`MaNguoiDung`),
  KEY `MaNganh` (`MaNganh`),
  CONSTRAINT `nghiencuusinh_ibfk_1` FOREIGN KEY (`MaNguoiDung`) REFERENCES `nguoidung` (`MaNguoiDung`),
  CONSTRAINT `nghiencuusinh_ibfk_2` FOREIGN KEY (`MaNganh`) REFERENCES `nganhdaotao` (`MaNganh`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nghiencuusinh`
--
-- ORDER BY:  `MaNCS`

/*!40000 ALTER TABLE `nghiencuusinh` DISABLE KEYS */;
INSERT INTO `nghiencuusinh` VALUES
('GOCM05NCS',30,'Hồ sơ kiểm thử trên bản sao gốc','1996-09-01',0,'KTPM',1,'TEST-GOC-QD','2026-09-01','2029-09-01','2031-09-01',1),
('NCS01',8,'Nguyễn Văn Đạt','1995-05-15',1,'KTPM',1,'123/QĐ-ĐHAG','2023-09-01','2026-09-01','2028-09-01',1),
('NCS02',9,'Trần Thu Hà','1996-08-20',0,'KHMT',1,'124/QĐ-ĐHAG','2023-09-01','2026-09-01','2028-09-01',1),
('NCS03',10,'Lê Minh Hùng','1994-02-10',1,'HTTT',2,'205/QĐ-ĐHAG','2024-09-01','2028-09-01','2030-09-01',1),
('NCS04',11,'Phạm Yến Nhi','1998-11-25',0,'KTPM',1,'306/QĐ-ĐHAG','2025-09-01','2028-09-01','2030-09-01',1),
('NCS05',12,'Vũ Đức Mạnh','1993-07-30',1,'KHMT',2,'407/QĐ-ĐHAG','2022-09-01','2026-09-01','2028-09-01',2),
('TEST_NCS01',23,'Nguyễn Minh Kiểm Thử','1998-06-15',1,'KTPM',1,'TEST-QD-01','2025-09-01','2028-09-01','2030-09-01',1),
('TEST_NCS02',24,'Trần Thị Dữ Liệu','1997-11-20',0,'KHMT',2,'TEST-QD-02','2024-09-01','2028-09-01','2030-09-01',1);
/*!40000 ALTER TABLE `nghiencuusinh` ENABLE KEYS */;

--
-- Table structure for table `nguoidung`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `nguoidung` (
  `MaNguoiDung` int(11) NOT NULL AUTO_INCREMENT,
  `TenDangNhap` varchar(50) NOT NULL,
  `MatKhauHash` varchar(255) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `SoDienThoai` varchar(20) DEFAULT NULL,
  `LaHoatDong` tinyint(1) DEFAULT 1,
  `NgayTao` datetime DEFAULT current_timestamp(),
  `SoLanSaiDangNhap` int(11) NOT NULL DEFAULT 0,
  `KhoaDenThoiDiem` datetime DEFAULT NULL,
  `ResetTokenHash` varchar(64) DEFAULT NULL,
  `ResetTokenHetHan` datetime DEFAULT NULL,
  `CoQuanCongTac` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`MaNguoiDung`),
  UNIQUE KEY `TenDangNhap` (`TenDangNhap`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nguoidung`
--
-- ORDER BY:  `MaNguoiDung`

/*!40000 ALTER TABLE `nguoidung` DISABLE KEYS */;
INSERT INTO `nguoidung` VALUES
(1,'admin','$2a$11$30AlJK.Dmiy.Zo57IRqeIO/d0ErIQ3TOLeZPsaGf31CLfav9G0S7C','admin@agu.edu.vn','0901234567',1,'2026-10-10 01:09:44',0,NULL,NULL,NULL,NULL),
(2,'pdt01','$2a$11$s1YhmI/Z9UKLV6exnUxETugdTVlCLcoy0yRQ.G89XmaQofotcvbD2','pdt01@agu.edu.vn','0911234567',1,'2026-10-10 01:09:44',0,NULL,NULL,NULL,NULL),
(3,'GV01','$2a$11$34FMTSq6G5H84ESJ/iWd.ukGDWfE5MkxjmNg74IMXn59jnc7y.ceu','gv01@agu.edu.vn','0921234567',1,'2026-10-10 01:09:44',0,NULL,NULL,NULL,NULL),
(4,'GV02','$2a$11$GMJ0wFMybydRVQqIsJNMluNoOtBH82BvNKRC3.aVzEJJ4g1UBSQ5q','gv02@agu.edu.vn','0931234567',1,'2026-10-10 01:09:44',0,NULL,NULL,NULL,NULL),
(5,'GV03','$2a$11$XQ90bBmodgpspva.bSnZKOlHYYeV7dqlvbXk2Xs3dSxOkmYnlEj1C','gv03@agu.edu.vn','0941234567',1,'2026-10-10 01:09:44',0,NULL,NULL,NULL,NULL),
(6,'GV04','$2a$11$ktqbqbAL.784BwN09oC2tuBm.DtqYOymusn3hVIGvud8kL/H.IwPC','gv04@gmail.com','0951234567',1,'2026-10-10 01:09:44',0,NULL,NULL,NULL,NULL),
(7,'GV05','$2a$11$GIQvhCPoaAjnh3pc2HS7le1EfLmWYQl04VJS.siGA9qYunCGvrPdq','gv05@gmail.com','0961234567',1,'2026-10-10 01:09:44',0,NULL,NULL,NULL,NULL),
(8,'NCS01','$2a$11$DOo1DIGC7UFLHUD5MkdZqu7bf5rBrqzkSJbKVdaxWEAVFafvKN20C','ncs01@student.agu.edu.vn','0971234567',1,'2026-10-10 01:09:44',0,NULL,'e4293a3887c8b1f830e8f9af324e3dcb30eb0bad0fce8ca0449bda84447170fa','2026-11-19 23:27:57','Trường Đại học An Giang'),
(9,'NCS02','$2a$11$AQbl6/9uEXJBh1v7/KIF8.TOetPpedfTZYQNg3/BFiMTZKyoIvDf.','ncs02@student.agu.edu.vn','0981234567',1,'2026-10-10 01:09:44',0,NULL,NULL,NULL,NULL),
(10,'NCS03','$2a$11$X3LL.kc/ZwJqrrNGHAAm3uZP5qzbN9ClZrxIMFNjEw84YD3KDxL8K','ncs03@student.agu.edu.vn','0991234567',1,'2026-10-10 01:09:44',0,NULL,NULL,NULL,NULL),
(11,'NCS04','$2a$11$X9XchPClayJOh0LfEFLdleEDgfpembttSEDUOSs2i3SVGVp8jsNSu','ncs04@student.agu.edu.vn','0909876543',1,'2026-10-10 01:09:44',0,NULL,NULL,NULL,NULL),
(12,'NCS05','$2a$11$ElU/k/fbgPn/0HTH..6Z6eXa90/YaXsSPvvFTo22eyU/EPSERm.qq','ncs05@student.agu.edu.vn','0919876543',1,'2026-10-10 01:09:44',0,NULL,NULL,NULL,NULL),
(13,'dtms_test_admin','$2a$11$ZL43T.LBLkgPZHffFWQh9Onb/DbIi1Npuh4kTmTrSd0OEpxReJSA.','dtms_test_admin@example.test',NULL,1,'2026-11-17 14:40:05',0,NULL,NULL,NULL,'Dữ liệu thử nghiệm DTMS'),
(14,'dtms_test_pdt','$2a$11$ZL43T.LBLkgPZHffFWQh9Onb/DbIi1Npuh4kTmTrSd0OEpxReJSA.','dtms_test_pdt@example.test',NULL,1,'2026-11-17 14:40:05',0,NULL,NULL,NULL,'Dữ liệu thử nghiệm DTMS'),
(15,'dtms_test_bgh','$2a$11$ZL43T.LBLkgPZHffFWQh9Onb/DbIi1Npuh4kTmTrSd0OEpxReJSA.','dtms_test_bgh@example.test',NULL,1,'2026-11-17 14:40:05',0,NULL,NULL,NULL,'Dữ liệu thử nghiệm DTMS'),
(16,'dtms_test_khoa','$2a$11$ZL43T.LBLkgPZHffFWQh9Onb/DbIi1Npuh4kTmTrSd0OEpxReJSA.','dtms_test_khoa@example.test',NULL,1,'2026-11-17 14:40:05',0,NULL,NULL,NULL,'Dữ liệu thử nghiệm DTMS'),
(17,'dtms_test_tbm','$2a$11$ZL43T.LBLkgPZHffFWQh9Onb/DbIi1Npuh4kTmTrSd0OEpxReJSA.','dtms_test_tbm@example.test',NULL,1,'2026-11-17 14:40:05',0,NULL,NULL,NULL,'Dữ liệu thử nghiệm DTMS'),
(18,'dtms_test_nhd1','$2a$11$ZL43T.LBLkgPZHffFWQh9Onb/DbIi1Npuh4kTmTrSd0OEpxReJSA.','dtms_test_nhd1@example.test',NULL,1,'2026-11-17 14:40:05',0,NULL,NULL,NULL,'Dữ liệu thử nghiệm DTMS'),
(19,'dtms_test_nhd2','$2a$11$ZL43T.LBLkgPZHffFWQh9Onb/DbIi1Npuh4kTmTrSd0OEpxReJSA.','dtms_test_nhd2@example.test',NULL,1,'2026-11-17 14:40:05',0,NULL,NULL,NULL,'Dữ liệu thử nghiệm DTMS'),
(20,'dtms_test_nhd3','$2a$11$ZL43T.LBLkgPZHffFWQh9Onb/DbIi1Npuh4kTmTrSd0OEpxReJSA.','dtms_test_nhd3@example.test',NULL,1,'2026-11-17 14:40:05',0,NULL,NULL,NULL,'Dữ liệu thử nghiệm DTMS'),
(21,'dtms_test_pbdl1','$2a$11$ZL43T.LBLkgPZHffFWQh9Onb/DbIi1Npuh4kTmTrSd0OEpxReJSA.','dtms_test_pbdl1@example.test',NULL,1,'2026-11-17 14:40:05',0,NULL,NULL,NULL,'Dữ liệu thử nghiệm DTMS'),
(22,'dtms_test_pbdl2','$2a$11$ZL43T.LBLkgPZHffFWQh9Onb/DbIi1Npuh4kTmTrSd0OEpxReJSA.','dtms_test_pbdl2@example.test',NULL,1,'2026-11-17 14:40:05',0,NULL,NULL,NULL,'Dữ liệu thử nghiệm DTMS'),
(23,'dtms_test_ncs01','$2a$11$ZL43T.LBLkgPZHffFWQh9Onb/DbIi1Npuh4kTmTrSd0OEpxReJSA.','dtms_test_ncs01@example.test',NULL,1,'2026-11-17 14:40:05',0,NULL,NULL,NULL,'Dữ liệu thử nghiệm DTMS'),
(24,'dtms_test_ncs02','$2a$11$ZL43T.LBLkgPZHffFWQh9Onb/DbIi1Npuh4kTmTrSd0OEpxReJSA.','dtms_test_ncs02@example.test',NULL,1,'2026-11-17 14:40:05',0,NULL,NULL,NULL,'Dữ liệu thử nghiệm DTMS'),
(30,'goc-ncs','$2a$11$yv2W4bF1IQey4D3pS7Hvle3TeXDhK03FQU/YjZHVeErprXXI.H9OK','goc-ncs@example.test',NULL,1,'2026-11-24 01:21:49',0,NULL,NULL,NULL,NULL),
(31,'goc-nhd','$2a$11$yv2W4bF1IQey4D3pS7Hvle3TeXDhK03FQU/YjZHVeErprXXI.H9OK','goc-nhd@example.test',NULL,1,'2026-11-24 01:21:49',0,NULL,NULL,NULL,NULL),
(32,'goc-bm','$2a$11$yv2W4bF1IQey4D3pS7Hvle3TeXDhK03FQU/YjZHVeErprXXI.H9OK','goc-bm@example.test',NULL,1,'2026-11-24 01:21:49',0,NULL,NULL,NULL,NULL),
(33,'goc-pdt','$2a$11$yv2W4bF1IQey4D3pS7Hvle3TeXDhK03FQU/YjZHVeErprXXI.H9OK','goc-pdt@example.test',NULL,1,'2026-11-24 01:21:49',0,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `nguoidung` ENABLE KEYS */;

--
-- Table structure for table `nguoidung_vaitro`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `nguoidung_vaitro` (
  `MaNguoiDung` int(11) NOT NULL,
  `MaVaiTro` varchar(20) NOT NULL,
  PRIMARY KEY (`MaNguoiDung`,`MaVaiTro`),
  KEY `MaVaiTro` (`MaVaiTro`),
  CONSTRAINT `nguoidung_vaitro_ibfk_1` FOREIGN KEY (`MaNguoiDung`) REFERENCES `nguoidung` (`MaNguoiDung`) ON DELETE CASCADE,
  CONSTRAINT `nguoidung_vaitro_ibfk_2` FOREIGN KEY (`MaVaiTro`) REFERENCES `vaitro` (`MaVaiTro`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nguoidung_vaitro`
--
-- ORDER BY:  `MaNguoiDung`,`MaVaiTro`

/*!40000 ALTER TABLE `nguoidung_vaitro` DISABLE KEYS */;
INSERT INTO `nguoidung_vaitro` VALUES
(1,'ADMIN'),
(2,'PDT'),
(3,'NHD'),
(3,'TBM'),
(4,'NHD'),
(5,'NHD'),
(6,'PBDL'),
(7,'PBDL'),
(8,'NCS'),
(9,'NCS'),
(10,'NCS'),
(11,'NCS'),
(12,'NCS'),
(13,'ADMIN'),
(14,'PDT'),
(15,'BGH'),
(16,'KHOA'),
(17,'TBM'),
(18,'NHD'),
(19,'NHD'),
(20,'NHD'),
(21,'PBDL'),
(22,'PBDL'),
(23,'NCS'),
(24,'NCS'),
(30,'NCS'),
(31,'NHD'),
(32,'TBM'),
(33,'PDT');
/*!40000 ALTER TABLE `nguoidung_vaitro` ENABLE KEYS */;

--
-- Table structure for table `nhatky_thaotac`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `nhatky_thaotac` (
  `MaNhatKy` bigint(20) NOT NULL AUTO_INCREMENT,
  `ThoiDiem` datetime NOT NULL,
  `MaNguoiDung` int(11) DEFAULT NULL,
  `TenDangNhap` varchar(50) DEFAULT NULL,
  `HanhDong` varchar(10) NOT NULL,
  `DuongDan` varchar(255) NOT NULL,
  `MaTrangThai` int(11) NOT NULL,
  `DiaChi` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`MaNhatKy`),
  KEY `idx_nhatky_thoidiem` (`ThoiDiem`)
) ENGINE=InnoDB AUTO_INCREMENT=218 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhatky_thaotac`
--
-- ORDER BY:  `MaNhatKy`

/*!40000 ALTER TABLE `nhatky_thaotac` DISABLE KEYS */;
INSERT INTO `nhatky_thaotac` VALUES
(1,'2026-11-07 17:17:02',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(2,'2026-11-07 17:17:37',NULL,NULL,'POST','/api/Auth/login',401,'::1'),
(3,'2026-11-07 17:17:41',NULL,NULL,'POST','/api/Auth/login',401,'::1'),
(4,'2026-11-07 17:17:42',NULL,NULL,'POST','/api/Auth/login',401,'::1'),
(5,'2026-11-07 17:17:45',NULL,NULL,'POST','/api/Auth/login',401,'::1'),
(6,'2026-11-07 17:17:47',NULL,NULL,'POST','/api/Auth/login',423,'::1'),
(7,'2026-11-08 09:40:48',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(8,'2026-11-08 09:57:44',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(9,'2026-11-08 09:59:17',8,'NCS01','PUT','/api/Profile/me',200,'::1'),
(10,'2026-11-08 10:13:24',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(11,'2026-11-11 09:54:04',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(12,'2026-11-16 14:36:31',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(13,'2026-11-16 14:37:24',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(14,'2026-11-16 14:40:46',NULL,NULL,'POST','/api/Auth/login',401,'::1'),
(15,'2026-11-16 14:41:07',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(16,'2026-11-16 14:46:07',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(17,'2026-11-17 14:32:53',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(18,'2026-11-17 14:40:06',13,'dtms_test_admin','TEST','/__seed__/dtms_all_31_tables_v1',200,'127.0.0.1'),
(19,'2026-11-17 15:01:17',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(20,'2026-11-17 15:21:15',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(21,'2026-11-17 15:21:59',8,'NCS01','POST','/api/Dangkyhocphan',400,'::1'),
(22,'2026-11-17 15:43:25',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(23,'2026-11-17 15:43:26',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(24,'2026-11-17 15:43:26',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(25,'2026-11-17 15:43:26',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(26,'2026-11-17 15:43:27',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(27,'2026-11-17 15:43:27',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(28,'2026-11-17 15:43:27',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(29,'2026-11-17 15:43:27',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(30,'2026-11-17 15:43:28',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(31,'2026-11-17 16:02:26',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(32,'2026-11-17 16:02:27',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(33,'2026-11-17 16:02:27',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(34,'2026-11-17 16:02:27',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(35,'2026-11-17 16:02:27',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(36,'2026-11-17 16:02:27',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(37,'2026-11-17 16:02:27',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(38,'2026-11-17 16:02:27',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(39,'2026-11-17 16:02:28',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(40,'2026-11-17 23:27:29',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(41,'2026-11-17 23:27:29',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(42,'2026-11-17 23:27:29',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(43,'2026-11-17 23:27:30',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(44,'2026-11-17 23:27:30',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(45,'2026-11-17 23:27:30',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(46,'2026-11-17 23:27:30',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(47,'2026-11-17 23:27:31',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(48,'2026-11-17 23:27:31',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(49,'2026-11-17 23:36:36',NULL,NULL,'POST','/api/Auth/login',401,'::1'),
(50,'2026-11-17 23:36:46',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(51,'2026-11-18 00:04:14',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(52,'2026-11-18 00:04:14',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(53,'2026-11-18 00:04:14',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(54,'2026-11-18 00:04:15',13,'dtms_test_admin','POST','/api/Monhocs',201,'::1'),
(55,'2026-11-18 00:27:19',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(56,'2026-11-18 00:27:19',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(57,'2026-11-18 00:27:20',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(58,'2026-11-18 00:27:20',13,'dtms_test_admin','POST','/api/Monhocs',201,'::1'),
(59,'2026-11-18 00:27:20',13,'dtms_test_admin','POST','/api/Monhocs',409,'::1'),
(60,'2026-11-18 00:27:20',13,'dtms_test_admin','PUT','/api/Monhocs/TA2F89FAAB5B',400,'::1'),
(61,'2026-11-18 00:27:20',13,'dtms_test_admin','PUT','/api/Monhocs/TA2F89FAAB5B',204,'::1'),
(62,'2026-11-18 00:27:20',13,'dtms_test_admin','POST','/api/Nganhdaotaos',201,'::1'),
(63,'2026-11-18 00:27:20',13,'dtms_test_admin','PUT','/api/Nganhdaotaos/TB2F89FAAB5B',400,'::1'),
(64,'2026-11-18 00:27:20',13,'dtms_test_admin','PUT','/api/Nganhdaotaos/TB2F89FAAB5B',204,'::1'),
(65,'2026-11-18 00:27:20',13,'dtms_test_admin','POST','/api/Ctdt',400,'::1'),
(66,'2026-11-18 00:27:21',13,'dtms_test_admin','POST','/api/Ctdt',200,'::1'),
(67,'2026-11-18 00:27:21',13,'dtms_test_admin','POST','/api/Ctdt',409,'::1'),
(68,'2026-11-18 00:27:21',13,'dtms_test_admin','POST','/api/Nguoidungs',201,'::1'),
(69,'2026-11-18 00:27:21',13,'dtms_test_admin','POST','/api/Nguoidungs',409,'::1'),
(70,'2026-11-18 00:27:21',13,'dtms_test_admin','POST','/api/Nguoidungs',409,'::1'),
(71,'2026-11-18 00:27:21',13,'dtms_test_admin','PUT','/api/Nguoidungs/25',204,'::1'),
(72,'2026-11-18 00:27:21',13,'dtms_test_admin','DELETE','/api/Monhocs/TZ2F89FAAB5B',404,'::1'),
(73,'2026-11-18 00:27:21',13,'dtms_test_admin','DELETE','/api/Nguoidungs/2147483647',404,'::1'),
(74,'2026-11-18 00:27:21',13,'dtms_test_admin','DELETE','/api/Ctdt/6',204,'::1'),
(75,'2026-11-18 00:27:21',13,'dtms_test_admin','DELETE','/api/Monhocs/TA2F89FAAB5B',204,'::1'),
(76,'2026-11-18 00:27:21',13,'dtms_test_admin','DELETE','/api/Nganhdaotaos/TB2F89FAAB5B',204,'::1'),
(77,'2026-11-18 00:27:21',13,'dtms_test_admin','DELETE','/api/Nguoidungs/25',204,'::1'),
(78,'2026-11-18 00:46:29',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(79,'2026-11-18 00:46:29',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(80,'2026-11-18 00:46:30',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(81,'2026-11-18 00:46:30',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(82,'2026-11-18 00:46:30',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(83,'2026-11-18 00:46:31',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(84,'2026-11-18 00:46:31',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(85,'2026-11-18 00:46:31',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(86,'2026-11-18 00:46:31',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(87,'2026-11-18 00:55:50',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(88,'2026-11-18 00:55:51',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(89,'2026-11-18 00:55:51',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(90,'2026-11-18 00:55:51',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(91,'2026-11-18 00:55:52',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(92,'2026-11-18 00:55:52',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(93,'2026-11-18 00:55:52',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(94,'2026-11-18 00:55:52',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(95,'2026-11-18 00:55:53',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(96,'2026-11-18 00:55:55',14,'dtms_test_pdt','POST','/api/NcsImport',200,'::1'),
(97,'2026-11-18 00:55:55',14,'dtms_test_pdt','POST','/api/NcsImport',400,'::1'),
(98,'2026-11-18 00:55:55',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(99,'2026-11-18 00:55:55',14,'dtms_test_pdt','PUT','/api/Nghiencuusinhs/TAEE65C9A94E',204,'::1'),
(100,'2026-11-18 00:55:55',14,'dtms_test_pdt','PUT','/api/Nghiencuusinhs/TAEE65C9A94E',400,'::1'),
(101,'2026-11-18 00:55:56',13,'dtms_test_admin','DELETE','/api/Nghiencuusinhs/TAEE65C9A94E',204,'::1'),
(102,'2026-11-18 00:55:56',13,'dtms_test_admin','DELETE','/api/Nguoidungs/26',204,'::1'),
(103,'2026-11-18 01:14:42',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(104,'2026-11-18 01:14:43',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(105,'2026-11-18 01:14:43',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(106,'2026-11-18 01:14:43',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(107,'2026-11-18 01:14:44',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(108,'2026-11-18 01:14:44',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(109,'2026-11-18 01:14:44',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(110,'2026-11-18 01:14:44',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(111,'2026-11-18 01:14:45',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(112,'2026-11-18 01:15:37',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(113,'2026-11-18 01:15:37',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(114,'2026-11-18 01:15:37',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(115,'2026-11-18 01:15:37',14,'dtms_test_pdt','POST','/api/NcsImport',200,'::1'),
(116,'2026-11-18 01:15:38',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(117,'2026-11-18 01:15:38',13,'dtms_test_admin','POST','/api/Monhocs',201,'::1'),
(118,'2026-11-18 01:15:38',14,'dtms_test_pdt','POST','/api/Ketquahocphans',201,'::1'),
(119,'2026-11-18 01:15:38',14,'dtms_test_pdt','POST','/api/Ketquahocphans',409,'::1'),
(120,'2026-11-18 01:15:38',14,'dtms_test_pdt','PUT','/api/Ketquahocphans/7',400,'::1'),
(121,'2026-11-18 01:15:38',14,'dtms_test_pdt','PUT','/api/Ketquahocphans/7',200,'::1'),
(122,'2026-11-18 01:15:38',14,'dtms_test_pdt','PUT','/api/Ketquahocphans/7/khoa',200,'::1'),
(123,'2026-11-18 01:15:38',14,'dtms_test_pdt','PUT','/api/Ketquahocphans/7',409,'::1'),
(124,'2026-11-18 01:15:38',14,'dtms_test_pdt','DELETE','/api/Ketquahocphans/7',409,'::1'),
(125,'2026-11-18 01:15:38',14,'dtms_test_pdt','PUT','/api/Ketquahocphans/7/mo-khoa',200,'::1'),
(126,'2026-11-18 01:15:38',14,'dtms_test_pdt','DELETE','/api/Ketquahocphans/7',204,'::1'),
(127,'2026-11-18 01:15:38',13,'dtms_test_admin','DELETE','/api/Monhocs/P3M1ABE808262',204,'::1'),
(128,'2026-11-18 01:15:38',13,'dtms_test_admin','DELETE','/api/Nghiencuusinhs/T31ABE808262',204,'::1'),
(129,'2026-11-18 01:15:38',13,'dtms_test_admin','DELETE','/api/Nguoidungs/27',204,'::1'),
(130,'2026-11-18 01:37:41',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(131,'2026-11-18 01:37:42',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(132,'2026-11-18 01:37:42',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(133,'2026-11-18 01:37:42',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(134,'2026-11-18 01:37:43',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(135,'2026-11-18 01:37:43',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(136,'2026-11-18 01:37:43',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(137,'2026-11-18 01:37:44',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(138,'2026-11-18 01:37:44',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(139,'2026-11-18 01:38:37',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(140,'2026-11-18 01:38:38',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(141,'2026-11-18 01:38:38',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(142,'2026-11-18 01:38:38',14,'dtms_test_pdt','POST','/api/NcsImport',200,'::1'),
(143,'2026-11-18 01:38:38',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(144,'2026-11-18 01:38:38',28,'dtms_p4_abaf5a3692','POST','/api/Dangkyhocphan',400,'::1'),
(145,'2026-11-18 01:38:38',28,'dtms_p4_abaf5a3692','POST','/api/Dangkyhocphan',409,'::1'),
(146,'2026-11-18 01:38:38',28,'dtms_p4_abaf5a3692','POST','/api/Dangkyhocphan',409,'::1'),
(147,'2026-11-18 01:38:38',28,'dtms_p4_abaf5a3692','POST','/api/Dangkyhocphan',409,'::1'),
(148,'2026-11-18 01:38:39',28,'dtms_p4_abaf5a3692','POST','/api/Dangkyhocphan',200,'::1'),
(149,'2026-11-18 01:38:39',28,'dtms_p4_abaf5a3692','DELETE','/api/Dangkyhocphan/3',204,'::1'),
(150,'2026-11-18 01:38:39',14,'dtms_test_pdt','DELETE','/api/Nghiencuusinhs/T4ABAF5A3692',204,'::1'),
(151,'2026-11-18 01:38:39',13,'dtms_test_admin','DELETE','/api/Nguoidungs/28',204,'::1'),
(152,'2026-11-18 01:39:13',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(153,'2026-11-18 01:39:13',23,'dtms_test_ncs01','POST','/api/File/upload',400,'::1'),
(154,'2026-11-18 01:39:13',23,'dtms_test_ncs01','POST','/api/File/upload',400,'::1'),
(155,'2026-11-18 01:49:20',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(156,'2026-11-18 01:49:20',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(157,'2026-11-18 01:49:20',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(158,'2026-11-18 01:49:21',14,'dtms_test_pdt','POST','/api/NcsImport',200,'::1'),
(159,'2026-11-18 01:49:21',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(160,'2026-11-18 01:49:21',29,'dtms_p4_1df9f0df2f','POST','/api/Dangkyhocphan',400,'::1'),
(161,'2026-11-18 01:49:21',29,'dtms_p4_1df9f0df2f','POST','/api/Dangkyhocphan',409,'::1'),
(162,'2026-11-18 01:49:21',29,'dtms_p4_1df9f0df2f','POST','/api/Dangkyhocphan',409,'::1'),
(163,'2026-11-18 01:49:21',29,'dtms_p4_1df9f0df2f','POST','/api/Dangkyhocphan',409,'::1'),
(164,'2026-11-18 01:49:21',29,'dtms_p4_1df9f0df2f','POST','/api/Dangkyhocphan',200,'::1'),
(165,'2026-11-18 01:49:21',29,'dtms_p4_1df9f0df2f','POST','/api/Dangkyhocphan',409,'::1'),
(166,'2026-11-18 01:49:21',23,'dtms_test_ncs01','DELETE','/api/Dangkyhocphan/4',404,'::1'),
(167,'2026-11-18 01:49:21',29,'dtms_p4_1df9f0df2f','DELETE','/api/Dangkyhocphan/4',204,'::1'),
(168,'2026-11-18 01:49:21',14,'dtms_test_pdt','DELETE','/api/Nghiencuusinhs/T41DF9F0DF2F',204,'::1'),
(169,'2026-11-18 01:49:21',13,'dtms_test_admin','DELETE','/api/Nguoidungs/29',204,'::1'),
(170,'2026-11-18 02:10:43',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(171,'2026-11-18 02:10:43',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(172,'2026-11-18 02:10:43',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(173,'2026-11-18 02:10:44',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(174,'2026-11-18 02:10:44',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(175,'2026-11-18 02:10:44',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(176,'2026-11-18 02:10:44',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(177,'2026-11-18 02:10:44',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(178,'2026-11-18 02:10:44',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(179,'2026-11-18 02:11:46',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(180,'2026-11-18 02:11:46',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(181,'2026-11-18 02:11:46',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(182,'2026-11-18 02:11:46',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(183,'2026-11-18 02:11:46',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(184,'2026-11-18 02:11:46',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(185,'2026-11-18 02:11:46',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(186,'2026-11-18 02:11:47',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(187,'2026-11-18 02:11:47',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(188,'2026-11-18 02:20:24',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(189,'2026-11-18 02:20:24',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(190,'2026-11-18 02:20:24',23,'dtms_test_ncs01','POST','/api/File/upload',400,'::1'),
(191,'2026-11-18 02:33:12',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(192,'2026-11-18 02:33:12',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(193,'2026-11-18 02:33:12',23,'dtms_test_ncs01','POST','/api/File/upload',400,'::1'),
(194,'2026-11-18 02:40:43',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(195,'2026-11-18 02:40:43',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(196,'2026-11-18 02:40:43',23,'dtms_test_ncs01','POST','/api/File/upload',400,'::1'),
(197,'2026-11-18 02:50:21',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(198,'2026-11-18 02:50:21',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(199,'2026-11-18 02:50:21',23,'dtms_test_ncs01','POST','/api/File/upload',200,'::1'),
(200,'2026-11-18 03:25:17',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(201,'2026-11-19 22:57:57',NULL,NULL,'POST','/api/Auth/quen-mat-khau',200,'::1'),
(202,'2026-11-19 22:58:12',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(203,'2026-11-23 13:46:06',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(204,'2026-11-23 13:48:19',NULL,NULL,'POST','/api/Auth/login',200,'::1'),
(205,'2026-11-24 01:21:55',NULL,NULL,'POST','/api/Auth/login',200,'127.0.0.1'),
(206,'2026-11-24 01:23:04',NULL,NULL,'POST','/api/Auth/login',200,'127.0.0.1'),
(207,'2026-11-24 01:23:10',NULL,NULL,'POST','/api/Auth/login',200,'127.0.0.1'),
(208,'2026-11-24 01:23:11',NULL,NULL,'POST','/api/Auth/login',200,'127.0.0.1'),
(209,'2026-11-24 01:23:11',NULL,NULL,'POST','/api/Auth/login',200,'127.0.0.1'),
(210,'2026-11-24 01:23:11',NULL,NULL,'POST','/api/Auth/login',200,'127.0.0.1'),
(211,'2026-11-24 01:23:12',NULL,NULL,'POST','/api/Auth/login',200,'127.0.0.1'),
(212,'2026-11-24 01:23:12',30,'goc-ncs','POST','/api/Kehoachhoctaps',200,'127.0.0.1'),
(213,'2026-11-24 01:23:12',33,'goc-pdt','PUT','/api/Kehoachhoctaps/7/duyet',409,'127.0.0.1'),
(214,'2026-11-24 01:23:12',31,'goc-nhd','PUT','/api/Kehoachhoctaps/7/duyet',200,'127.0.0.1'),
(215,'2026-11-24 01:23:12',32,'goc-bm','PUT','/api/Kehoachhoctaps/7/duyet',200,'127.0.0.1'),
(216,'2026-11-24 01:23:12',33,'goc-pdt','PUT','/api/Kehoachhoctaps/7/duyet',200,'127.0.0.1'),
(217,'2026-11-24 01:24:25',NULL,NULL,'POST','/api/Auth/login',200,'127.0.0.1');
/*!40000 ALTER TABLE `nhatky_thaotac` ENABLE KEYS */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50003 TRIGGER nhatky_khong_sua BEFORE UPDATE ON nhatky_thaotac
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nhật ký thao tác không được sửa.';
END 
*/;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50003 TRIGGER nhatky_khong_xoa BEFORE DELETE ON nhatky_thaotac
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nhật ký thao tác không được xóa.';
END 
*/;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `phamvi_don_vi`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `phamvi_don_vi` (
  `MaGV` varchar(20) NOT NULL,
  `MaNganh` varchar(20) NOT NULL,
  PRIMARY KEY (`MaGV`,`MaNganh`),
  KEY `fk_pv_nganh` (`MaNganh`),
  CONSTRAINT `fk_pv_gv` FOREIGN KEY (`MaGV`) REFERENCES `giangvien` (`MaGV`),
  CONSTRAINT `fk_pv_nganh` FOREIGN KEY (`MaNganh`) REFERENCES `nganhdaotao` (`MaNganh`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phamvi_don_vi`
--
-- ORDER BY:  `MaGV`,`MaNganh`

/*!40000 ALTER TABLE `phamvi_don_vi` DISABLE KEYS */;
INSERT INTO `phamvi_don_vi` VALUES
('GOCM05TBM','KTPM'),
('GV01','KTPM'),
('TEST_GV_KHOA','KTPM'),
('TEST_GV_TBM','KHMT'),
('TEST_GV_TBM','KTPM');
/*!40000 ALTER TABLE `phamvi_don_vi` ENABLE KEYS */;

--
-- Table structure for table `phanbiendoclap`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `phanbiendoclap` (
  `MaPhanBien` int(11) NOT NULL AUTO_INCREMENT,
  `MaNCS` varchar(20) NOT NULL,
  `MaGV` varchar(20) NOT NULL,
  `NgayGui` date NOT NULL,
  `NgayNhan` date DEFAULT NULL,
  `KetQua` tinyint(4) NOT NULL,
  `FileNhanXet` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`MaPhanBien`),
  KEY `MaNCS` (`MaNCS`),
  KEY `MaGV` (`MaGV`),
  CONSTRAINT `phanbiendoclap_ibfk_1` FOREIGN KEY (`MaNCS`) REFERENCES `nghiencuusinh` (`MaNCS`),
  CONSTRAINT `phanbiendoclap_ibfk_2` FOREIGN KEY (`MaGV`) REFERENCES `giangvien` (`MaGV`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phanbiendoclap`
--
-- ORDER BY:  `MaPhanBien`

/*!40000 ALTER TABLE `phanbiendoclap` DISABLE KEYS */;
INSERT INTO `phanbiendoclap` VALUES
(1,'TEST_NCS01','TEST_GV_PBDL1','2026-10-05',NULL,0,NULL),
(2,'TEST_NCS02','TEST_GV_PBDL2','2026-10-08',NULL,0,NULL);
/*!40000 ALTER TABLE `phanbiendoclap` ENABLE KEYS */;

--
-- Table structure for table `phanconghuongdan`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `phanconghuongdan` (
  `MaPhanCong` int(11) NOT NULL AUTO_INCREMENT,
  `MaNCS` varchar(20) NOT NULL,
  `MaGV` varchar(20) NOT NULL,
  `VaiTro` tinyint(4) NOT NULL,
  `SoQuyetDinh` varchar(50) NOT NULL,
  `NgayHieuLuc` date NOT NULL,
  `NgayKetThuc` date DEFAULT NULL,
  `TrangThai` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`MaPhanCong`),
  KEY `MaNCS` (`MaNCS`),
  KEY `MaGV` (`MaGV`),
  CONSTRAINT `phanconghuongdan_ibfk_1` FOREIGN KEY (`MaNCS`) REFERENCES `nghiencuusinh` (`MaNCS`),
  CONSTRAINT `phanconghuongdan_ibfk_2` FOREIGN KEY (`MaGV`) REFERENCES `giangvien` (`MaGV`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phanconghuongdan`
--
-- ORDER BY:  `MaPhanCong`

/*!40000 ALTER TABLE `phanconghuongdan` DISABLE KEYS */;
INSERT INTO `phanconghuongdan` VALUES
(1,'NCS01','GV01',1,'501/QĐ-ĐHAG','2023-10-01',NULL,1),
(2,'NCS01','GV02',2,'501/QĐ-ĐHAG','2023-10-01',NULL,1),
(3,'NCS02','GV03',1,'502/QĐ-ĐHAG','2023-10-01',NULL,1),
(4,'NCS03','GV01',1,'503/QĐ-ĐHAG','2024-10-01',NULL,1),
(5,'NCS04','GV02',1,'504/QĐ-ĐHAG','2025-10-01',NULL,1),
(6,'NCS05','GV03',1,'505/QĐ-ĐHAG','2022-10-01',NULL,1),
(7,'TEST_NCS01','TEST_GV_NHD1',1,'TEST-PC-01','2025-10-01',NULL,1),
(8,'TEST_NCS02','TEST_GV_NHD2',1,'TEST-PC-02','2024-10-01',NULL,1),
(9,'GOCM05NCS','GOCM05NHD',1,'TEST-GOC-PC','2026-09-01',NULL,1);
/*!40000 ALTER TABLE `phanconghuongdan` ENABLE KEYS */;

--
-- Table structure for table `phieu_bo_phieu`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `phieu_bo_phieu` (
  `MaHoiDong` int(11) NOT NULL,
  `MaGV` varchar(20) NOT NULL,
  `LaDongY` tinyint(4) NOT NULL,
  `NgayBo` datetime NOT NULL,
  PRIMARY KEY (`MaHoiDong`,`MaGV`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phieu_bo_phieu`
--
-- ORDER BY:  `MaHoiDong`,`MaGV`

/*!40000 ALTER TABLE `phieu_bo_phieu` DISABLE KEYS */;
INSERT INTO `phieu_bo_phieu` VALUES
(4,'TEST_GV_KHOA',1,'2026-10-09 14:40:06'),
(4,'TEST_GV_NHD1',0,'2026-10-09 14:40:06'),
(4,'TEST_GV_PBDL1',1,'2026-10-09 14:40:06'),
(4,'TEST_GV_PBDL2',1,'2026-10-09 14:40:06'),
(4,'TEST_GV_TBM',1,'2026-10-09 14:40:06');
/*!40000 ALTER TABLE `phieu_bo_phieu` ENABLE KEYS */;

--
-- Table structure for table `thanhvienhoidong`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `thanhvienhoidong` (
  `MaHoiDong` int(11) NOT NULL,
  `MaGV` varchar(20) NOT NULL,
  `VaiTro` varchar(50) NOT NULL,
  `CoMat` tinyint(1) DEFAULT 1,
  `DiemChuaTron` float DEFAULT NULL,
  `FilePhieuNhanXet` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`MaHoiDong`,`MaGV`),
  KEY `MaGV` (`MaGV`),
  CONSTRAINT `thanhvienhoidong_ibfk_1` FOREIGN KEY (`MaHoiDong`) REFERENCES `hoidongdanhgia` (`MaHoiDong`) ON DELETE CASCADE,
  CONSTRAINT `thanhvienhoidong_ibfk_2` FOREIGN KEY (`MaGV`) REFERENCES `giangvien` (`MaGV`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thanhvienhoidong`
--
-- ORDER BY:  `MaHoiDong`,`MaGV`

/*!40000 ALTER TABLE `thanhvienhoidong` DISABLE KEYS */;
INSERT INTO `thanhvienhoidong` VALUES
(1,'TEST_GV_KHOA','CHU_TICH',1,NULL,NULL),
(1,'TEST_GV_PBDL1','UY_VIEN',1,NULL,NULL),
(1,'TEST_GV_TBM','THU_KY',1,NULL,NULL),
(2,'TEST_GV_KHOA','CHU_TICH',1,NULL,NULL),
(2,'TEST_GV_NHD2','UY_VIEN',1,NULL,NULL),
(2,'TEST_GV_PBDL1','UY_VIEN',1,NULL,NULL),
(2,'TEST_GV_PBDL2','UY_VIEN',1,NULL,NULL),
(2,'TEST_GV_TBM','THU_KY',1,NULL,NULL),
(3,'TEST_GV_KHOA','CHU_TICH',1,NULL,NULL),
(3,'TEST_GV_NHD2','UY_VIEN',1,NULL,NULL),
(3,'TEST_GV_PBDL1','UY_VIEN',1,NULL,NULL),
(3,'TEST_GV_PBDL2','UY_VIEN',1,NULL,NULL),
(3,'TEST_GV_TBM','THU_KY',1,NULL,NULL),
(4,'TEST_GV_KHOA','CHU_TICH',1,NULL,NULL),
(4,'TEST_GV_NHD1','UY_VIEN',1,NULL,NULL),
(4,'TEST_GV_PBDL1','UY_VIEN',1,NULL,NULL),
(4,'TEST_GV_PBDL2','UY_VIEN',1,NULL,NULL),
(4,'TEST_GV_TBM','THU_KY',1,NULL,NULL);
/*!40000 ALTER TABLE `thanhvienhoidong` ENABLE KEYS */;

--
-- Table structure for table `vaitro`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `vaitro` (
  `MaVaiTro` varchar(20) NOT NULL,
  `TenVaiTro` varchar(50) NOT NULL,
  PRIMARY KEY (`MaVaiTro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vaitro`
--
-- ORDER BY:  `MaVaiTro`

/*!40000 ALTER TABLE `vaitro` DISABLE KEYS */;
INSERT INTO `vaitro` VALUES
('ADMIN','Quản trị hệ thống'),
('BGH','Ban giám hiệu'),
('KHOA','Ban chủ nhiệm khoa'),
('NCS','Nghiên cứu sinh'),
('NHD','Người Hướng dẫn'),
('PBDL','Phản biện Độc lập'),
('PDT','Phòng Đào tạo'),
('TBM','Trưởng Bộ môn');
/*!40000 ALTER TABLE `vaitro` ENABLE KEYS */;

--
-- Table structure for table `yeucau_hocvu`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `yeucau_hocvu` (
  `MaYeuCau` int(11) NOT NULL AUTO_INCREMENT,
  `MaNCS` varchar(20) NOT NULL,
  `LoaiYeuCau` varchar(30) NOT NULL,
  `NoiDung` varchar(1000) NOT NULL,
  `LyDo` varchar(1000) DEFAULT NULL,
  `MaGVMoi` varchar(20) DEFAULT NULL,
  `SoThangGiaHan` int(11) DEFAULT NULL,
  `TrangThai` varchar(20) NOT NULL DEFAULT 'CHO_DUYET',
  `NgayTao` datetime NOT NULL,
  `NgayKetThuc` datetime DEFAULT NULL,
  PRIMARY KEY (`MaYeuCau`),
  KEY `idx_yc_ncs` (`MaNCS`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yeucau_hocvu`
--
-- ORDER BY:  `MaYeuCau`

/*!40000 ALTER TABLE `yeucau_hocvu` DISABLE KEYS */;
INSERT INTO `yeucau_hocvu` VALUES
(1,'TEST_NCS01','TAM_DUNG','[DTMS-SEED] Xin tạm dừng học tập','Lý do cá nhân (thử nghiệm)',NULL,NULL,'CHO_DUYET','2026-11-16 14:40:06',NULL),
(2,'TEST_NCS02','GIA_HAN','[DTMS-SEED] Xin gia hạn 6 tháng','Đang hoàn thiện nghiên cứu (thử nghiệm)',NULL,6,'CHO_DUYET','2026-11-16 14:40:06',NULL),
(3,'TEST_NCS01','DOI_TEN_DE_TAI','[DTMS-SEED] Xin đổi tên đề tài','Bổ sung phạm vi nghiên cứu',NULL,NULL,'CHO_DUYET','2026-11-16 14:40:06',NULL),
(4,'TEST_NCS01','DOI_NHD','[DTMS-SEED] Xin đổi người hướng dẫn','Đổi hướng nghiên cứu','TEST_GV_NHD3',NULL,'CHO_DUYET','2026-11-16 14:40:06',NULL);
/*!40000 ALTER TABLE `yeucau_hocvu` ENABLE KEYS */;

--
-- Table structure for table `yeucau_hocvu_buoc`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `yeucau_hocvu_buoc` (
  `MaBuoc` int(11) NOT NULL AUTO_INCREMENT,
  `MaYeuCau` int(11) NOT NULL,
  `VaiTro` varchar(20) NOT NULL,
  `Thu` int(11) NOT NULL,
  `TrangThai` tinyint(4) NOT NULL DEFAULT 0,
  `NguoiDuyet` varchar(50) DEFAULT NULL,
  `NgayDuyet` datetime DEFAULT NULL,
  `YKien` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`MaBuoc`),
  KEY `idx_buoc_yc` (`MaYeuCau`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yeucau_hocvu_buoc`
--
-- ORDER BY:  `MaBuoc`

/*!40000 ALTER TABLE `yeucau_hocvu_buoc` DISABLE KEYS */;
INSERT INTO `yeucau_hocvu_buoc` VALUES
(1,1,'PDT',1,0,NULL,NULL,NULL),
(2,2,'PDT',1,0,NULL,NULL,NULL),
(3,2,'BGH',2,0,NULL,NULL,NULL),
(4,3,'NHD',1,0,NULL,NULL,NULL),
(5,3,'TBM',2,0,NULL,NULL,NULL),
(6,3,'PDT',3,0,NULL,NULL,NULL),
(7,3,'BGH',4,0,NULL,NULL,NULL),
(8,4,'NHD_CU',1,0,NULL,NULL,NULL),
(9,4,'NHD_MOI',2,0,NULL,NULL,NULL),
(10,4,'TBM',3,0,NULL,NULL,NULL),
(11,4,'KHOA',4,0,NULL,NULL,NULL),
(12,4,'BGH',5,0,NULL,NULL,NULL);
/*!40000 ALTER TABLE `yeucau_hocvu_buoc` ENABLE KEYS */;

--
-- Dumping events for database 'dtms_db'
--

--
-- Dumping routines for database 'dtms_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-11-24  1:32:25
