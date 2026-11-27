/* 147 HTTP actions trích từ backend snapshot 18/11/2026; Swagger live là nguồn ưu tiên. */
window.DTMS_API_MANIFEST = Object.freeze([
  {
    "method": "POST",
    "path": "/api/Auth/login",
    "roles": "Công khai",
    "controller": "AuthController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Auth/quen-mat-khau",
    "roles": "Công khai",
    "controller": "AuthController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Auth/dat-lai-mat-khau",
    "roles": "Công khai",
    "controller": "AuthController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Auth/mo-khoa/{manguoidung:int}",
    "roles": "ADMIN,PDT",
    "controller": "AuthController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Baocaotiendoes",
    "roles": "ADMIN,NCS,NHD,PDT,TBM",
    "controller": "BaocaotiendoesController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Baocaotiendoes/{mabaocao:int}",
    "roles": "ADMIN,NCS,NHD,PDT,TBM",
    "controller": "BaocaotiendoesController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Baocaotiendoes",
    "roles": "ADMIN,NCS,PDT",
    "controller": "BaocaotiendoesController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Baocaotiendoes/{mabaocao:int}/nhanxet",
    "roles": "NHD",
    "controller": "BaocaotiendoesController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Baocaotiendoes/{mabaocao:int}",
    "roles": "ADMIN,PDT",
    "controller": "BaocaotiendoesController.cs"
  },
  {
    "method": "DELETE",
    "path": "/api/Baocaotiendoes/{mabaocao:int}",
    "roles": "ADMIN,PDT",
    "controller": "BaocaotiendoesController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Biendonghocvus",
    "roles": "ADMIN,NCS,NHD,PDT,TBM",
    "controller": "BiendonghocvusController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Biendonghocvus/{mabiendong:int}",
    "roles": "ADMIN,NCS,NHD,PDT,TBM",
    "controller": "BiendonghocvusController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Biendonghocvus/{mabiendong:int}",
    "roles": "ADMIN,PDT",
    "controller": "BiendonghocvusController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Biendonghocvus",
    "roles": "ADMIN,PDT",
    "controller": "BiendonghocvusController.cs"
  },
  {
    "method": "DELETE",
    "path": "/api/Biendonghocvus/{mabiendong:int}",
    "roles": "ADMIN,PDT",
    "controller": "BiendonghocvusController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Capbang/{maNcs}",
    "roles": "ADMIN,BGH,KHOA,NCS,NHD,PDT,TBM",
    "controller": "CapbangController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Capbang/{maNcs}/giai-trinh",
    "roles": "NCS",
    "controller": "CapbangController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Capbang/{maNcs}/luu-chieu",
    "roles": "ADMIN,PDT",
    "controller": "CapbangController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Capbang/{maNcs}/cong-khai",
    "roles": "ADMIN,PDT",
    "controller": "CapbangController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Capbang/{maNcs}/cap-bang",
    "roles": "BGH",
    "controller": "CapbangController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Chungchingoaingus",
    "roles": "ADMIN,NCS,NHD,PDT,TBM",
    "controller": "ChungchingoaingusController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Chungchingoaingus/{machungchi:int}",
    "roles": "ADMIN,NCS,NHD,PDT,TBM",
    "controller": "ChungchingoaingusController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Chungchingoaingus",
    "roles": "ADMIN,NCS,PDT",
    "controller": "ChungchingoaingusController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Chungchingoaingus/{machungchi:int}",
    "roles": "ADMIN,NCS,PDT",
    "controller": "ChungchingoaingusController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Chungchingoaingus/{machungchi:int}/duyet",
    "roles": "ADMIN,PDT",
    "controller": "ChungchingoaingusController.cs"
  },
  {
    "method": "DELETE",
    "path": "/api/Chungchingoaingus/{machungchi:int}",
    "roles": "ADMIN,PDT",
    "controller": "ChungchingoaingusController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Congbokhoahocs",
    "roles": "ADMIN,NCS,NHD,PDT,TBM",
    "controller": "CongbokhoahocsController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Congbokhoahocs/{macongbo:int}",
    "roles": "ADMIN,NCS,NHD,PDT,TBM",
    "controller": "CongbokhoahocsController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Congbokhoahocs",
    "roles": "ADMIN,NCS,PDT",
    "controller": "CongbokhoahocsController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Congbokhoahocs/{macongbo:int}",
    "roles": "ADMIN,NCS,PDT",
    "controller": "CongbokhoahocsController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Congbokhoahocs/{macongbo:int}/duyet",
    "roles": "ADMIN,NHD,PDT",
    "controller": "CongbokhoahocsController.cs"
  },
  {
    "method": "DELETE",
    "path": "/api/Congbokhoahocs/{macongbo:int}",
    "roles": "ADMIN,PDT",
    "controller": "CongbokhoahocsController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Ctdt",
    "roles": "ADMIN,BGH,KHOA,NCS,NHD,PDT,TBM",
    "controller": "CtdtController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Ctdt",
    "roles": "ADMIN,PDT",
    "controller": "CtdtController.cs"
  },
  {
    "method": "DELETE",
    "path": "/api/Ctdt/{id:int}",
    "roles": "ADMIN,PDT",
    "controller": "CtdtController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Dangkyhocphan",
    "roles": "NCS",
    "controller": "DangkyhocphanController.cs"
  },
  {
    "method": "DELETE",
    "path": "/api/Dangkyhocphan/{id:int}",
    "roles": "NCS",
    "controller": "DangkyhocphanController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Dangkyhocphan",
    "roles": "ADMIN,BGH,KHOA,NCS,NHD,PDT,TBM",
    "controller": "DangkyhocphanController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Dangkyhocphan/dot",
    "roles": "ADMIN,PDT",
    "controller": "DangkyhocphanController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Dangkyhocphan/dot",
    "roles": "ADMIN,NCS,PDT",
    "controller": "DangkyhocphanController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Danhgiagiaidoan",
    "roles": "ADMIN,BGH,KHOA,NCS,NHD,PDT,TBM",
    "controller": "DanhgiagiaidoanController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Danhgiagiaidoan",
    "roles": "ADMIN,KHOA,NHD,PDT,TBM",
    "controller": "DanhgiagiaidoanController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Danhgiahocthuats",
    "roles": "ADMIN,NCS,NHD,PDT,TBM",
    "controller": "DanhgiahocthuatsController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Danhgiahocthuats/{madanhgia:int}",
    "roles": "ADMIN,NCS,NHD,PDT,TBM",
    "controller": "DanhgiahocthuatsController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Danhgiahocthuats",
    "roles": "ADMIN,NHD,PDT,TBM",
    "controller": "DanhgiahocthuatsController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Danhgiahocthuats/{madanhgia:int}",
    "roles": "ADMIN,NHD,PDT,TBM",
    "controller": "DanhgiahocthuatsController.cs"
  },
  {
    "method": "DELETE",
    "path": "/api/Danhgiahocthuats/{madanhgia:int}",
    "roles": "ADMIN,PDT",
    "controller": "DanhgiahocthuatsController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Detailuanans",
    "roles": "ADMIN,NCS,NHD,PBDL,PDT,TBM",
    "controller": "DetailuanansController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Detailuanans/{made:int}",
    "roles": "ADMIN,NCS,NHD,PBDL,PDT,TBM",
    "controller": "DetailuanansController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Detailuanans",
    "roles": "ADMIN,NCS,PDT",
    "controller": "DetailuanansController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Detailuanans/{made:int}",
    "roles": "ADMIN,NCS,PDT",
    "controller": "DetailuanansController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Detailuanans/{made:int}/duyet",
    "roles": "ADMIN,PDT",
    "controller": "DetailuanansController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Detailuanans/{made:int}/khoa",
    "roles": "ADMIN,PDT",
    "controller": "DetailuanansController.cs"
  },
  {
    "method": "DELETE",
    "path": "/api/Detailuanans/{made:int}",
    "roles": "ADMIN,PDT",
    "controller": "DetailuanansController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Doichieu/{maNcs}",
    "roles": "ADMIN,BGH,KHOA,NCS,NHD,PBDL,PDT,TBM",
    "controller": "DoichieuController.cs"
  },
  {
    "method": "POST",
    "path": "/api/File/upload",
    "roles": "Đăng nhập",
    "controller": "FileController.cs"
  },
  {
    "method": "GET",
    "path": "/api/File/{name}",
    "roles": "Đăng nhập",
    "controller": "FileController.cs"
  },
  {
    "method": "GET",
    "path": "/api/File/legacy/{maNcs}/{fileName}",
    "roles": "Đăng nhập",
    "controller": "FileController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Giangviens",
    "roles": "Đăng nhập",
    "controller": "GiangviensController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Giangviens/{magv}",
    "roles": "Đăng nhập",
    "controller": "GiangviensController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Giangviens/{magv}",
    "roles": "ADMIN,PDT",
    "controller": "GiangviensController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Giangviens",
    "roles": "ADMIN,PDT",
    "controller": "GiangviensController.cs"
  },
  {
    "method": "DELETE",
    "path": "/api/Giangviens/{magv}",
    "roles": "ADMIN,PDT",
    "controller": "GiangviensController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Hoanthienvatotnghieps",
    "roles": "ADMIN,NCS,NHD,PDT,TBM",
    "controller": "HoanthienvatotnghiepsController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Hoanthienvatotnghieps/{matotnghiep:int}",
    "roles": "ADMIN,NCS,NHD,PDT,TBM",
    "controller": "HoanthienvatotnghiepsController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Hoanthienvatotnghieps/{matotnghiep:int}",
    "roles": "ADMIN,PDT",
    "controller": "HoanthienvatotnghiepsController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Hoanthienvatotnghieps",
    "roles": "ADMIN,PDT",
    "controller": "HoanthienvatotnghiepsController.cs"
  },
  {
    "method": "DELETE",
    "path": "/api/Hoanthienvatotnghieps/{matotnghiep:int}",
    "roles": "ADMIN,PDT",
    "controller": "HoanthienvatotnghiepsController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Hocvu/canhbao",
    "roles": "ADMIN,NCS,NHD,PDT,TBM",
    "controller": "HocvuController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Hocvu/thongke",
    "roles": "ADMIN,PDT,TBM",
    "controller": "HocvuController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Hocvu/canhbao/xuat",
    "roles": "ADMIN,NCS,NHD,PDT,TBM",
    "controller": "HocvuController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Hoidongdanhgiums",
    "roles": "ADMIN,BGH,KHOA,NCS,NHD,PBDL,PDT,TBM",
    "controller": "HoidongdanhgiumsController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Hoidongdanhgiums/{mahoidong:int}",
    "roles": "ADMIN,BGH,KHOA,NCS,NHD,PBDL,PDT,TBM",
    "controller": "HoidongdanhgiumsController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Hoidongdanhgiums/{mahoidong:int}",
    "roles": "ADMIN,PDT",
    "controller": "HoidongdanhgiumsController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Hoidongdanhgiums",
    "roles": "ADMIN,PDT",
    "controller": "HoidongdanhgiumsController.cs"
  },
  {
    "method": "DELETE",
    "path": "/api/Hoidongdanhgiums/{mahoidong:int}",
    "roles": "ADMIN,PDT",
    "controller": "HoidongdanhgiumsController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Hoidongtruong/{maHoiDong:int}/kiem-tra",
    "roles": "ADMIN,PDT",
    "controller": "HoidongtruongController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Hoidongtruong/{maHoiDong:int}/bo-phieu",
    "roles": "ADMIN,BGH,KHOA,NHD,PBDL,PDT,TBM",
    "controller": "HoidongtruongController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Hoidongtruong/{maHoiDong:int}/ket-qua",
    "roles": "ADMIN,PDT",
    "controller": "HoidongtruongController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Kehoachhoctaps",
    "roles": "ADMIN,NCS,NHD,PDT,TBM",
    "controller": "KehoachhoctapsController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Kehoachhoctaps",
    "roles": "ADMIN,NCS,PDT",
    "controller": "KehoachhoctapsController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Kehoachhoctaps/{id:int}",
    "roles": "ADMIN,NCS,PDT",
    "controller": "KehoachhoctapsController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Kehoachhoctaps/{id:int}/duyet",
    "roles": "ADMIN,NHD,PDT,TBM",
    "controller": "KehoachhoctapsController.cs"
  },
  {
    "method": "DELETE",
    "path": "/api/Kehoachhoctaps/{id:int}",
    "roles": "ADMIN,PDT",
    "controller": "KehoachhoctapsController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Ketquahocphans",
    "roles": "ADMIN,NCS,NHD,PDT,TBM",
    "controller": "KetquahocphansController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Ketquahocphans/{maketqua:int}",
    "roles": "ADMIN,NCS,NHD,PDT,TBM",
    "controller": "KetquahocphansController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Ketquahocphans",
    "roles": "ADMIN,NHD,PDT,TBM",
    "controller": "KetquahocphansController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Ketquahocphans/{maketqua:int}",
    "roles": "ADMIN,NHD,PDT,TBM",
    "controller": "KetquahocphansController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Ketquahocphans/{maketqua:int}/khoa",
    "roles": "ADMIN,NHD,PDT,TBM",
    "controller": "KetquahocphansController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Ketquahocphans/{maketqua:int}/mo-khoa",
    "roles": "ADMIN,PDT",
    "controller": "KetquahocphansController.cs"
  },
  {
    "method": "DELETE",
    "path": "/api/Ketquahocphans/{maketqua:int}",
    "roles": "ADMIN,PDT",
    "controller": "KetquahocphansController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Lylich",
    "roles": "ADMIN,BGH,KHOA,NCS,NHD,PBDL,PDT,TBM",
    "controller": "LylichController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Lylich",
    "roles": "ADMIN,BGH,KHOA,NCS,NHD,PBDL,PDT,TBM",
    "controller": "LylichController.cs"
  },
  {
    "method": "DELETE",
    "path": "/api/Lylich/{id:int}",
    "roles": "ADMIN,BGH,KHOA,NCS,NHD,PBDL,PDT,TBM",
    "controller": "LylichController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Monhocs",
    "roles": "Đăng nhập",
    "controller": "MonhocsController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Monhocs/{mamonhoc}",
    "roles": "Đăng nhập",
    "controller": "MonhocsController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Monhocs/{mamonhoc}",
    "roles": "Đăng nhập",
    "controller": "MonhocsController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Monhocs",
    "roles": "Đăng nhập",
    "controller": "MonhocsController.cs"
  },
  {
    "method": "DELETE",
    "path": "/api/Monhocs/{mamonhoc}",
    "roles": "Đăng nhập",
    "controller": "MonhocsController.cs"
  },
  {
    "method": "POST",
    "path": "/api/NcsImport",
    "roles": "ADMIN,PDT",
    "controller": "NcsImportController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Nganhdaotaos",
    "roles": "Đăng nhập",
    "controller": "NganhdaotaosController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Nganhdaotaos/{manganh}",
    "roles": "Đăng nhập",
    "controller": "NganhdaotaosController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Nganhdaotaos/{manganh}",
    "roles": "Đăng nhập",
    "controller": "NganhdaotaosController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Nganhdaotaos",
    "roles": "Đăng nhập",
    "controller": "NganhdaotaosController.cs"
  },
  {
    "method": "DELETE",
    "path": "/api/Nganhdaotaos/{manganh}",
    "roles": "Đăng nhập",
    "controller": "NganhdaotaosController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Nghiencuusinhs",
    "roles": "ADMIN,BGH,KHOA,NCS,NHD,PBDL,PDT,TBM",
    "controller": "NghiencuusinhsController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Nghiencuusinhs/{mancs}",
    "roles": "ADMIN,BGH,KHOA,NCS,NHD,PBDL,PDT,TBM",
    "controller": "NghiencuusinhsController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Nghiencuusinhs/{mancs}",
    "roles": "ADMIN,PDT",
    "controller": "NghiencuusinhsController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Nghiencuusinhs",
    "roles": "ADMIN,PDT",
    "controller": "NghiencuusinhsController.cs"
  },
  {
    "method": "DELETE",
    "path": "/api/Nghiencuusinhs/{mancs}",
    "roles": "ADMIN,PDT",
    "controller": "NghiencuusinhsController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Nguoidungs",
    "roles": "Đăng nhập",
    "controller": "NguoidungsController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Nguoidungs/{manguoidung:int}",
    "roles": "Đăng nhập",
    "controller": "NguoidungsController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Nguoidungs",
    "roles": "Đăng nhập",
    "controller": "NguoidungsController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Nguoidungs/{manguoidung:int}",
    "roles": "Đăng nhập",
    "controller": "NguoidungsController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Nguoidungs/{manguoidung:int}/password",
    "roles": "Đăng nhập",
    "controller": "NguoidungsController.cs"
  },
  {
    "method": "DELETE",
    "path": "/api/Nguoidungs/{manguoidung:int}",
    "roles": "Đăng nhập",
    "controller": "NguoidungsController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Phanbiendoclaps",
    "roles": "ADMIN,PBDL,PDT",
    "controller": "PhanbiendoclapsController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Phanbiendoclaps/{maphanbien:int}",
    "roles": "ADMIN,PBDL,PDT",
    "controller": "PhanbiendoclapsController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Phanbiendoclaps/{maphanbien:int}/nhanxet",
    "roles": "PBDL",
    "controller": "PhanbiendoclapsController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Phanbiendoclaps/{maphanbien:int}",
    "roles": "ADMIN,PDT",
    "controller": "PhanbiendoclapsController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Phanbiendoclaps",
    "roles": "ADMIN,PDT",
    "controller": "PhanbiendoclapsController.cs"
  },
  {
    "method": "DELETE",
    "path": "/api/Phanbiendoclaps/{maphanbien:int}",
    "roles": "ADMIN,PDT",
    "controller": "PhanbiendoclapsController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Phanconghuongdans",
    "roles": "ADMIN,NCS,NHD,PDT,TBM",
    "controller": "PhanconghuongdansController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Phanconghuongdans/{maphancong:int}",
    "roles": "ADMIN,NCS,NHD,PDT,TBM",
    "controller": "PhanconghuongdansController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Phanconghuongdans/{maphancong:int}",
    "roles": "ADMIN,PDT",
    "controller": "PhanconghuongdansController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Phanconghuongdans",
    "roles": "ADMIN,PDT",
    "controller": "PhanconghuongdansController.cs"
  },
  {
    "method": "DELETE",
    "path": "/api/Phanconghuongdans/{maphancong:int}",
    "roles": "ADMIN,PDT",
    "controller": "PhanconghuongdansController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Profile/me",
    "roles": "Đăng nhập",
    "controller": "ProfileController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Profile/me",
    "roles": "Đăng nhập",
    "controller": "ProfileController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Public/theses",
    "roles": "Công khai",
    "controller": "PublicController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Public/diploma",
    "roles": "Công khai",
    "controller": "PublicController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Thanhvienhoidongs",
    "roles": "ADMIN,BGH,KHOA,NCS,NHD,PBDL,PDT,TBM",
    "controller": "ThanhvienhoidongsController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Thanhvienhoidongs/{mahoidong:int}/{magv}",
    "roles": "ADMIN,BGH,KHOA,NCS,NHD,PBDL,PDT,TBM",
    "controller": "ThanhvienhoidongsController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Thanhvienhoidongs/{mahoidong:int}/{magv}",
    "roles": "ADMIN,PDT",
    "controller": "ThanhvienhoidongsController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Thanhvienhoidongs",
    "roles": "ADMIN,PDT",
    "controller": "ThanhvienhoidongsController.cs"
  },
  {
    "method": "DELETE",
    "path": "/api/Thanhvienhoidongs/{mahoidong:int}/{magv}",
    "roles": "ADMIN,PDT",
    "controller": "ThanhvienhoidongsController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Totnghiep/xet",
    "roles": "ADMIN,PDT",
    "controller": "TotnghiepController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Totnghiep/duyet-hang-loat",
    "roles": "ADMIN,PDT",
    "controller": "TotnghiepController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Vaitroes",
    "roles": "Đăng nhập",
    "controller": "VaitroesController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Vaitroes/{mavaitro}",
    "roles": "Đăng nhập",
    "controller": "VaitroesController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Vaitroes/{mavaitro}",
    "roles": "Đăng nhập",
    "controller": "VaitroesController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Vaitroes",
    "roles": "Đăng nhập",
    "controller": "VaitroesController.cs"
  },
  {
    "method": "DELETE",
    "path": "/api/Vaitroes/{mavaitro}",
    "roles": "Đăng nhập",
    "controller": "VaitroesController.cs"
  },
  {
    "method": "POST",
    "path": "/api/Yeucauhocvu",
    "roles": "NCS",
    "controller": "YeucauhocvuController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Yeucauhocvu",
    "roles": "ADMIN,BGH,KHOA,NCS,NHD,PDT,TBM",
    "controller": "YeucauhocvuController.cs"
  },
  {
    "method": "GET",
    "path": "/api/Yeucauhocvu/{id:int}",
    "roles": "ADMIN,BGH,KHOA,NCS,NHD,PDT,TBM",
    "controller": "YeucauhocvuController.cs"
  },
  {
    "method": "PUT",
    "path": "/api/Yeucauhocvu/{id:int}/duyet",
    "roles": "ADMIN,BGH,KHOA,NHD,PDT,TBM",
    "controller": "YeucauhocvuController.cs"
  }
]);
