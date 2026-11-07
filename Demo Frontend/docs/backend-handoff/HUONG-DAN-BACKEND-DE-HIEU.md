# Hướng dẫn bàn giao Backend dễ hiểu

**Mục đích:** mình làm Frontend, bạn làm Backend; tài liệu này giúp hai bạn thống nhất việc xảy ra sau mỗi nút bấm. Bản này đọc lại cả 9 tài liệu kỹ thuật trong cùng thư mục và viết bằng lời đơn giản. Không thay thế chi tiết hợp đồng API khi bạn bắt đầu lập trình.

**Hiểu nhanh:** Frontend là phần người dùng nhìn và bấm. Backend là phần máy chủ kiểm tra và xử lý. Database, hay cơ sở dữ liệu, là nơi lưu hồ sơ để tải lại trang hoặc dùng thiết bị khác vẫn thấy. API là cách Frontend gửi yêu cầu và nhận kết quả từ Backend; API-01, API-02… là mã để tìm đúng chức năng trong [danh sách API](03-DANH-SACH-API.md).

Hiện website còn dùng dữ liệu mẫu. Nhiều nút chỉ hiện thông báo hoặc lưu trên trình duyệt, không chứng minh đã lưu máy chủ. **Mọi API nhắc ở đây đều là đề xuất trong tài liệu kỹ thuật, chưa phải Backend đã có.** Mục nào chưa có nút hoặc chưa chốt quy trình sẽ ghi rõ. Không tự thêm cấp duyệt hay chọn ngưỡng học thuật từ số mẫu.

## Ai dùng hệ thống?

| Mã trong tài liệu | Tên dễ hiểu | Xem gì? |
|---|---|---|
| NCS | Nghiên cứu sinh | Hồ sơ của mình; phân hệ m01–m12 theo thanh chức năng hiện tại. |
| NHD | Người hướng dẫn | NCS được phân công; m01, m02, m03, m05–m12. |
| BM | Trưởng Bộ môn | Hồ sơ thuộc bộ môn; m01, m02, m03, m05, m06, m07, m09, m10, m12. |
| KHOA | Ban Chủ nhiệm Khoa | Hồ sơ thuộc khoa; m01, m02, m03, m05, m06, m10, m12, m13. |
| PDT | Phòng Đào tạo | Nghiệp vụ trong phạm vi được giao; đủ m01–m14 theo thanh chức năng demo. |
| BGH | Ban Giám hiệu | Giám sát và quyết định theo thẩm quyền; m01, m03, m10–m13. |
| HOIDONG/HĐ | Hội đồng đánh giá | Chỉ hồ sơ được giao; m09, m10. |

m01–m14 là mã 14 phân hệ trong bộ kỹ thuật, được viết kèm tên ở các chương dưới. Quyền chi tiết cần nhóm chốt; được mở trang không đồng nghĩa được chấm/duyệt. Phần căn cước, phản biện kín và tài liệu riêng không trả cho người ngoài quyền. Trang công khai chỉ trả thông tin được công bố.

Mỗi mục giữ đúng 8 ý bạn cần bàn giao. Mã CN là nhóm trong [kiểm kê](01-DANH-SACH-CHUC-NANG.md) và [đặc tả](02-DAC-TA-CHUC-NANG.md). Các hậu tố a, b, c… chỉ tách việc cho dễ đọc; hậu tố x là khoảng trống đã được bộ kỹ thuật nêu, chưa có giao diện. Không phải chức năng đã triển khai.

**Cách phối hợp chung:** mình hiển thị “Đang gửi”, giữ dữ liệu nhập khi lỗi và chỉ báo thành công sau kết quả máy chủ. Bạn kiểm quyền, thông tin và điều kiện; không tin tên/vai trò/ngày nộp do giao diện tự gửi. Bấm lại hoặc mất mạng không được tạo hai đơn, hai phân công hay hai bằng.

## Mục lục theo phân hệ

- [Tài khoản và đổi vai trò](#tài-khoản-và-đổi-vai-trò)
- [Điều khiển chung của website](#điều-khiển-chung-của-website)
- [Bàn làm việc theo vai trò](#bàn-làm-việc-theo-vai-trò)
- [m01 — Hồ sơ nghiên cứu sinh](#m01--hồ-sơ-nghiên-cứu-sinh)
- [m02 — Chương trình và kế hoạch đào tạo](#m02--chương-trình-và-kế-hoạch-đào-tạo)
- [m03 — Người hướng dẫn khoa học](#m03--người-hướng-dẫn-khoa-học)
- [m04 — Học phần và điểm](#m04--học-phần-và-điểm)
- [m05 — Tiểu luận tổng quan và đề cương](#m05--tiểu-luận-tổng-quan-và-đề-cương)
- [m06 — Chuyên đề tiến sĩ](#m06--chuyên-đề-tiến-sĩ)
- [m07 — Tiến độ nghiên cứu](#m07--tiến-độ-nghiên-cứu)
- [m08 — Công bố khoa học](#m08--công-bố-khoa-học)
- [m09 — Đề tài và luận án](#m09--đề-tài-và-luận-án)
- [m10 — Bảo vệ luận án](#m10--bảo-vệ-luận-án)
- [m11 — Hoàn thiện và cấp bằng](#m11--hoàn-thiện-và-cấp-bằng)
- [m12 — Biến động học vụ](#m12--biến-động-học-vụ)
- [m13 — Tra cứu và báo cáo](#m13--tra-cứu-và-báo-cáo)
- [m14 — Phân quyền và nhật ký](#m14--phân-quyền-và-nhật-ký)
- [Cổng công khai — Luận án và văn bằng](#cổng-công-khai--luận-án-và-văn-bằng)
- [Các trang giới thiệu ngoài hệ thống quản lý](#các-trang-giới-thiệu-ngoài-hệ-thống-quản-lý)
- [Hỗ trợ và liên hệ](#hỗ-trợ-và-liên-hệ)


## Tài khoản và đổi vai trò

### CN-02a — Đăng nhập

**Người dùng:** Tất cả người dùng. **Hiện tại:** Demo mới kiểm tra tài khoản mẫu.

1. **Vị trí:** Nút “Đăng nhập” nằm trên thanh phía trên website; bấm để mở hộp đăng nhập.
2. **Hiển thị:** Hiện ô email, mật khẩu; đăng nhập đúng thì mở bàn làm việc của người đó.
3. **Nhập:** Email và mật khẩu. Không yêu cầu người dùng tự nhập vai trò để được cấp quyền.
4. **Backend:** Kiểm tra tài khoản, mật khẩu và tài khoản còn được sử dụng; xác định quyền đã cấp.
5. **Lưu:** Thông tin tài khoản và lần đăng nhập đang có hiệu lực; không lưu mật khẩu ở dạng đọc được.
6. **Trả về:** Tên người dùng, vai trò, đơn vị và danh sách chức năng được phép mở.
7. **Lỗi:** Báo “Email hoặc mật khẩu chưa đúng”; giữ email, không cho vào bàn làm việc.
8. **API:** API-01 để đăng nhập; API-02 để lấy thông tin người đang đăng nhập.

### CN-02b — Ghi nhớ tài khoản

**Người dùng:** Người đăng nhập. **Hiện tại:** Có ô chọn nhưng demo chưa xử lý lựa chọn.

1. **Vị trí:** Ô “Ghi nhớ tài khoản” nằm trong hộp đăng nhập, cạnh liên kết quên mật khẩu.
2. **Hiển thị:** Cho đánh dấu hoặc bỏ dấu trước khi bấm đăng nhập; giữ đăng nhập theo lựa chọn đã thống nhất.
3. **Nhập:** Chỉ chọn có ghi nhớ hay không; email, mật khẩu vẫn nhập ở chức năng đăng nhập.
4. **Backend:** Quyết định thời gian giữ đăng nhập; hết thời gian thì yêu cầu đăng nhập lại.
5. **Lưu:** Lựa chọn ghi nhớ và thời điểm lần đăng nhập hết hiệu lực, gắn với đúng tài khoản.
6. **Trả về:** Cho Frontend biết người dùng còn đăng nhập hay phải nhập lại mật khẩu.
7. **Lỗi:** Nếu không lưu được lựa chọn, báo rõ; không tự hứa sẽ ghi nhớ vô thời hạn.
8. **API:** Dùng lựa chọn rememberMe của API-01; kiểm tra trạng thái bằng API-02.

rememberMe chỉ là tên trường kỹ thuật, nghĩa là “có ghi nhớ lần đăng nhập này không”.

### CN-02c — Quên và đặt lại mật khẩu

**Người dùng:** Người cần lấy lại tài khoản. **Hiện tại:** Liên kết hiện chưa hoạt động; màn đặt mật khẩu mới còn thiếu.

1. **Vị trí:** Bấm “Quên mật khẩu?” trong hộp đăng nhập; cần bổ sung màn nhập email.
2. **Hiển thị:** Thông báo đã tiếp nhận; người dùng mở liên kết trong email rồi nhập mật khẩu mới.
3. **Nhập:** Email tài khoản; sau đó nhập mật khẩu mới tại đường dẫn đặt lại.
4. **Backend:** Gửi đường dẫn chỉ dùng được một lần; kiểm tra còn hạn trước khi đổi mật khẩu.
5. **Lưu:** Yêu cầu đặt lại, thời hạn và việc đường dẫn đã sử dụng; cập nhật mật khẩu của tài khoản.
6. **Trả về:** Thông báo đã tiếp nhận hoặc đã đổi thành công; yêu cầu đăng nhập bằng mật khẩu mới.
7. **Lỗi:** Đường dẫn hết hạn thì hướng dẫn gửi yêu cầu mới; không thông báo công khai email có tài khoản hay không.
8. **API:** API-05 tiếp nhận yêu cầu; API-06 hoàn tất đặt lại mật khẩu.

### CN-03 — Đổi vai trò và thẻ người dùng

**Người dùng:** Người có nhiều vai trò được cấp. **Hiện tại:** Demo đổi sang người mẫu khác; tài khoản thật cần xử lý khác.

1. **Vị trí:** Bấm tên hoặc ảnh người dùng, “Đổi vai trò”, hay thẻ người dùng trên bàn làm việc.
2. **Hiển thị:** Hiện các vai trò đã được cấp; chọn xong cập nhật tên, thanh chức năng, số liệu và các nút được dùng.
3. **Nhập:** Chọn vai trò muốn làm việc, ví dụ người hướng dẫn; không nhập tên một tài khoản khác.
4. **Backend:** Kiểm tra người này có vai trò đó; tải lại đúng hồ sơ được phép xem.
5. **Lưu:** Vai trò đang sử dụng của lần đăng nhập; giữ nguyên chủ tài khoản thật.
6. **Trả về:** Vai trò mới, thông tin người dùng, thanh chức năng được phép và dữ liệu bàn làm việc.
7. **Lỗi:** Không có quyền thì giữ vai trò cũ và giải thích; không mở dữ liệu của người khác.
8. **API:** API-03 đổi vai trò; API-02 lấy quyền; API-07 lấy số liệu bàn làm việc.

### CN-04 — Đăng xuất

**Người dùng:** Người đã đăng nhập. **Hiện tại:** Demo chưa có nút; cần bổ sung khi tích hợp.

1. **Vị trí:** Bổ sung nút “Đăng xuất” trong khu vực tài khoản ở thanh phía trên.
2. **Hiển thị:** Bấm xong đóng bàn làm việc riêng, xóa thông tin nhạy cảm trên màn hình và về trang công khai.
3. **Nhập:** Không nhập thông tin; có thể xác nhận nếu nhóm muốn nhắc về biểu mẫu chưa lưu.
4. **Backend:** Kết thúc lần đăng nhập để tài khoản không tiếp tục gọi chức năng riêng bằng thông tin cũ.
5. **Lưu:** Thời điểm lần đăng nhập kết thúc; dữ liệu học tập, điểm và hồ sơ vẫn được giữ.
6. **Trả về:** Xác nhận đã đăng xuất; lần mở hồ sơ tiếp theo phải đăng nhập lại.
7. **Lỗi:** Nếu máy chủ chưa xác nhận, báo chưa hoàn tất; không gọi đổi vai trò thay cho đăng xuất.
8. **API:** API-04; sau đó API-02 không còn trả người dùng đã đăng nhập.


## Điều khiển chung của website

### CN-01 — Mở trang và chuyển phân hệ

**Người dùng:** Bảy vai trò, theo quyền được cấp. **Hiện tại:** Điều hướng đã có; chưa lấy dữ liệu thật.

1. **Vị trí:** Bấm biểu tượng ở thanh bên, ô ứng dụng trên trang chủ hoặc tên một phân hệ.
2. **Hiển thị:** Mở đúng màn hình, đánh dấu mục đang chọn; lấy dữ liệu khi vào phân hệ.
3. **Nhập:** Không nhập dữ liệu, chỉ chọn nơi muốn xem; ví dụ bấm “Học phần & Điểm”.
4. **Backend:** Cung cấp quyền được mở và dữ liệu của màn tương ứng; chặn yêu cầu ngoài quyền.
5. **Lưu:** Không lưu thay đổi học vụ chỉ vì chuyển trang; dữ liệu tài khoản vẫn được giữ.
6. **Trả về:** Thông tin người dùng, thanh chức năng được phép và dữ liệu đúng phân hệ đang mở.
7. **Lỗi:** Nếu không đủ quyền, giữ màn trước và báo rõ; tải lỗi thì hiện nút thử lại.
8. **API:** API-02 xác định thanh chức năng; dùng API đọc của từng phân hệ ở các mục phía dưới.

### CN-05 — Tìm nhanh để mở phân hệ

**Người dùng:** Người dùng có quyền mở phân hệ. **Hiện tại:** Đây là tìm tên chức năng, chưa tìm trong hồ sơ.

1. **Vị trí:** Ô tìm nhanh nằm trên thanh phía trên; nhập từ khóa rồi nhấn Enter.
2. **Hiển thị:** Chuyển tới phân hệ phù hợp, ví dụ nhập “tiến độ” để mở phần báo cáo nghiên cứu.
3. **Nhập:** Một từ khóa về chức năng; không coi ô này là nơi tìm đầy đủ tên NCS hay điểm.
4. **Backend:** Không cần làm tìm kiếm toàn hệ thống; chỉ cung cấp quyền và dữ liệu khi phân hệ được mở.
5. **Lưu:** Không tạo hay sửa bản ghi học vụ khi người dùng nhập từ khóa.
6. **Trả về:** Dữ liệu của phân hệ đã chọn; việc nhận biết từ khóa do Frontend thực hiện.
7. **Lỗi:** Không tìm được mục hoặc không có quyền thì báo rõ, không nói đã tìm thấy hồ sơ.
8. **API:** Không có API tìm riêng; API-02 cho quyền và API đọc của phân hệ được chọn.

### CN-06 — Chuyển tiếng Việt và tiếng Anh

**Người dùng:** Tất cả người dùng. **Hiện tại:** Chuyển ngôn ngữ đã có ở Frontend.

1. **Vị trí:** Bấm nút “VI | EN” trên thanh phía trên website.
2. **Hiển thị:** Đổi nhãn, tiêu đề, hướng dẫn và thông báo; vẫn giữ hồ sơ đang xem và bộ lọc đã chọn.
3. **Nhập:** Không nhập gì; bấm để chọn ngôn ngữ cần đọc.
4. **Backend:** Trả cùng bản ghi và kết quả; cung cấp tên đề tài tiếng Việt, tiếng Anh nếu đã lưu.
5. **Lưu:** Không đổi điểm hay trạng thái học vụ; Frontend có thể ghi nhớ lựa chọn ngôn ngữ trên thiết bị.
6. **Trả về:** Thông tin nghiệp vụ giữ nguyên; chỉ dùng phần tên song ngữ phù hợp khi hiển thị.
7. **Lỗi:** Thiếu bản tiếng Anh thì hiện tên gốc hoặc “Chưa cập nhật”, không tự tạo tên mới.
8. **API:** Không có API đổi ngôn ngữ; tên song ngữ lấy từ API-43, API-57 hoặc API-58.

### CN-07a — Mở, đóng và hủy biểu mẫu

**Người dùng:** Người được phép thực hiện chức năng. **Hiện tại:** Các hộp biểu mẫu và nút đóng đã có.

1. **Vị trí:** Bấm nút mở biểu mẫu; đóng bằng “X”, “Hủy”, “Hủy bỏ” hoặc vùng ngoài hộp.
2. **Hiển thị:** Mở đúng biểu mẫu và dữ liệu hiện có; đóng lại khi hủy, không hiển thị thông báo đã lưu.
3. **Nhập:** Chỉ nhập khi muốn gửi; bấm đóng hoặc hủy không phải xác nhận lưu dữ liệu.
4. **Backend:** Kiểm quyền khi thực sự gửi; không tạo hồ sơ mới chỉ vì hộp biểu mẫu được mở.
5. **Lưu:** Không lưu thay đổi học vụ khi hủy; dữ liệu cũ trong cơ sở dữ liệu giữ nguyên.
6. **Trả về:** Không cần kết quả lưu cho việc đóng; nếu gửi thì trả theo chức năng của biểu mẫu.
7. **Lỗi:** Hủy không gây lỗi nghiệp vụ; nếu đang gửi, Frontend cần tránh gửi thêm một lần nữa.
8. **API:** Không có API mở/đóng; nút Lưu hoặc Gửi dùng API của biểu mẫu tương ứng.

### CN-07b — Chọn và tải tệp lên máy chủ

**Người dùng:** Người gửi hồ sơ có quyền. **Hiện tại:** Demo chọn được tệp nhưng chưa gửi nội dung lên máy chủ.

1. **Vị trí:** Bấm vùng chọn tệp trong các đơn, báo cáo, bài báo hoặc luận án.
2. **Hiển thị:** Hiện tên và dung lượng tệp; khi gửi, tải tệp lên trước rồi mới gửi hồ sơ.
3. **Nhập:** Chọn tệp đúng loại; ví dụ báo cáo yêu cầu PDF, một số đơn chấp nhận Word.
4. **Backend:** Kiểm tra loại, dung lượng, nội dung tệp và người gửi có quyền gắn vào hồ sơ.
5. **Lưu:** Nội dung tệp và thông tin tên, người tải, thời điểm, hồ sơ liên quan.
6. **Trả về:** Mã tệp, tên, dung lượng và kết quả kiểm tra để Frontend gắn vào đơn.
7. **Lỗi:** Tệp sai loại, quá lớn hoặc tải lỗi thì giữ biểu mẫu, yêu cầu chọn lại; không báo đã nộp.
8. **API:** API-64 tải tệp; API-65 kiểm tra thông tin. Giới hạn dung lượng cần nhóm chốt.

### CN-13 — Tải hồ sơ và các tệp minh chứng

**Người dùng:** Người được phép xem tài liệu. **Hiện tại:** Phần lớn nút tải hiện chỉ hiện thông báo.

1. **Vị trí:** Các nút “File”, “Minh chứng”, “Biên bản”, “Xem QĐ”, “Tải về” và “Tải hồ sơ số”.
2. **Hiển thị:** Mở hoặc tải đúng tài liệu của hàng được bấm; hồ sơ tổng hợp thì chờ tạo tệp.
3. **Nhập:** Không nhập nội dung; chọn hồ sơ, kỳ báo cáo, chuyên đề hoặc phiên bản luận án cần tải.
4. **Backend:** Kiểm quyền xem, tìm đúng tệp; tạo hồ sơ tổng hợp nếu yêu cầu nhiều tài liệu.
5. **Lưu:** Tệp đã có không cần lưu lại; yêu cầu tạo bộ hồ sơ và lịch sử tải lưu theo quy định.
6. **Trả về:** Tệp thật, tên và loại tệp; bộ hồ sơ trả trạng thái đang tạo rồi đường dẫn tải.
7. **Lỗi:** Không có tệp thì báo “Chưa có tài liệu”; không dùng thông báo giả đã tải thành công.
8. **API:** API-66 tải riêng; API-61 và API-62 tạo, theo dõi hồ sơ tổng hợp.

### CN-09 — Khôi phục dữ liệu demo

**Người dùng:** Phòng Đào tạo trong bản demo. **Hiện tại:** Chỉ dành cho việc thử giao diện.

1. **Vị trí:** Nút khôi phục dữ liệu mẫu nằm trên thanh phía trên, được ẩn với vai trò khác.
2. **Hiển thị:** Xóa phần dữ liệu mẫu đã thay trên thiết bị và tải lại giao diện ban đầu.
3. **Nhập:** Không nhập thông tin hồ sơ; nhóm có thể thêm xác nhận để tránh bấm nhầm khi thử.
4. **Backend:** Không cần xử lý dữ liệu thật; tuyệt đối không nối nút này với việc xóa dữ liệu đào tạo.
5. **Lưu:** Không xóa bảng, tệp hay lịch sử trên máy chủ; chỉ đặt lại bộ nhớ demo ở trình duyệt.
6. **Trả về:** Không có kết quả nghiệp vụ từ Backend; Frontend hiện lại mẫu và thông báo đã khôi phục demo.
7. **Lỗi:** Nếu không đặt lại được dữ liệu cục bộ thì báo lỗi; không chuyển sang xóa dữ liệu thật.
8. **API:** Không có API tương ứng. Khi đưa hệ thống thật vào sử dụng, cần ẩn chức năng demo này.


## Bàn làm việc theo vai trò

Bảng này giúp bạn biết dữ liệu cần trả cho từng vai trò, thay vì chỉ làm màn NCS:

| Vai trò | Các thẻ và công việc cần lấy thật |
|---|---|
| NCS | Tiến độ, tín chỉ, ngày còn lại; hạn báo cáo/chuyên đề; các yêu cầu đã gửi. |
| NHD | NCS đang hướng dẫn, hồ sơ chờ duyệt, báo cáo cần đánh giá. |
| BM | NCS thuộc bộ môn, hồ sơ chờ xác nhận, mốc sắp đến hạn. |
| KHOA | NCS của khoa, hồ sơ chờ thông qua, cảnh báo tiến độ. |
| PDT | NCS đang đào tạo, hồ sơ chờ thẩm định, số đủ điều kiện bảo vệ. |
| BGH | NCS toàn trường, quyết định chờ ký, hồ sơ bảo vệ. |
| HĐ | Hồ sơ được giao, phiếu đã gửi/tổng phải gửi, phiên bảo vệ sắp tới. |

### CN-08 — Số liệu, việc cần làm và nút truy cập nhanh

**Người dùng:** Bảy vai trò đăng nhập. **Hiện tại:** Các số hiện tại chủ yếu là mẫu.

1. **Vị trí:** Mở bàn làm việc để xem các thẻ; bấm nút nhanh như “Nộp báo cáo” hoặc “Hồ sơ trình ký”.
2. **Hiển thị:** Hiện số liệu, công việc cần xử lý, hạn gần nhất và yêu cầu mới của đúng người.
3. **Nhập:** Không nhập gì để xem; chỉ chọn công việc muốn mở.
4. **Backend:** Đếm hồ sơ và việc chờ theo người dùng; tính hạn từ ngày thật, không giữ “Còn 12 ngày” cố định.
5. **Lưu:** Dùng hồ sơ, phân công, kế hoạch và kết quả đã lưu; không lưu số mẫu thành kết quả thật.
6. **Trả về:** Các số, hạn, việc ưu tiên và phân hệ cần mở; phần chưa có công thức phải ghi chưa xác định.
7. **Lỗi:** Tải lỗi thì báo thử lại; không lấy số mẫu để thay thế như thể đã tải thành công.
8. **API:** API-07; API-02 kiểm quyền. Công thức tiến độ cần thống nhất trước khi tính.


## m01 — Hồ sơ nghiên cứu sinh

### CN-10 — Danh sách, tìm kiếm và lọc NCS

**Người dùng:** NCS, NHD và các đơn vị quản lý được cấp quyền. **Hiện tại:** Ô tìm và lọc hiện chưa hoạt động thật.

1. **Vị trí:** Trong “Hồ sơ NCS”, dùng ô tên/mã/căn cước, bộ lọc trạng thái và “Xem & Sửa” từng hàng.
2. **Hiển thị:** Lọc bảng, cập nhật thẻ tổng số; bấm một hàng thì mở đúng hồ sơ của người đó.
3. **Nhập:** Từ khóa, trạng thái, khóa tuyển sinh; khi bổ sung chia trang thì chọn trang cần xem.
4. **Backend:** Tìm và lọc trong danh sách được quyền xem; kiểm quyền riêng nếu tìm bằng căn cước.
5. **Lưu:** Không sửa hồ sơ khi tìm kiếm; dùng dữ liệu NCS, ngành, khóa và người hướng dẫn đã lưu.
6. **Trả về:** Danh sách, số lượng, trạng thái, ngành, khóa và thông tin để mở từng hồ sơ.
7. **Lỗi:** Không thấy thì hiện bảng rỗng; không có quyền thì báo rõ, không mở hồ sơ mẫu khác.
8. **API:** API-08 lấy danh sách; API-11 lấy số lượng; API-09 xem hồ sơ.

### CN-11 — Xem hồ sơ và sửa thông tin liên hệ

**Người dùng:** NCS sửa hồ sơ mình; Phòng Đào tạo theo quyền. **Hiện tại:** Demo lưu cục bộ, chưa đồng bộ dữ liệu thật.

1. **Vị trí:** Bấm “Cập nhật thông tin cá nhân” hoặc “Xem & Sửa”; xem hai thẻ cá nhân và đào tạo.
2. **Hiển thị:** Mở đúng thông tin hiện tại; lưu xong cập nhật số điện thoại, email và nơi công tác.
3. **Nhập:** Ba thông tin trên; họ tên, mã NCS, ngành và thời hạn không sửa bằng biểu mẫu này.
4. **Backend:** Kiểm tra email, điện thoại và quyền; chỉ sửa các trường liên hệ được phép.
5. **Lưu:** Thông tin liên hệ mới của NCS và lịch sử ai sửa, sửa khi nào.
6. **Trả về:** Hồ sơ vừa cập nhật; phần đào tạo trả ngành, khóa, quyết định và hạn có nguồn thật.
7. **Lỗi:** Sai email hoặc mất mạng thì giữ dữ liệu nhập, báo lỗi; không đóng biểu mẫu như đã lưu.
8. **API:** API-09 đọc hồ sơ; API-10 lưu liên hệ. Tải lại trang vẫn phải thấy giá trị mới.

### CN-12 — Đơn xin gia hạn hoặc tạm dừng

**Người dùng:** NCS nộp; người quản lý xem theo quyền. **Hiện tại:** Demo mới ghi đơn cục bộ.

1. **Vị trí:** Bấm “Đơn xin gia hạn / Tạm dừng” hoặc nút thêm đơn trong lịch sử học vụ.
2. **Hiển thị:** Mở biểu mẫu; gửi thành công thêm đơn vào lịch sử với trạng thái đang chờ.
3. **Nhập:** Loại đơn, thời gian đề nghị, lý do và tệp đơn có chữ ký; nên tách ngày bắt đầu, kết thúc.
4. **Backend:** Kiểm dữ liệu, lưu đơn và chuyển đến người xử lý; không tự đổi hạn học khi vừa nộp.
5. **Lưu:** Đơn, loại, thời gian, lý do, người nộp, ngày nộp và tệp minh chứng.
6. **Trả về:** Mã đơn, trạng thái, người hoặc đơn vị xử lý tiếp và lịch sử để hiển thị.
7. **Lỗi:** Thiếu tệp hoặc thời gian sai thì báo tại ô nhập; giữ đơn chưa gửi để sửa.
8. **API:** API-13 gửi đơn; API-12 đọc lịch sử. Duyệt và áp dụng dùng API-14 sau khi chốt quy trình.

### CN-11x — Tiếp nhận NCS trúng tuyển và nhập danh sách

**Người dùng:** Phòng Đào tạo theo phân công cần xác nhận. **Hiện tại:** Khoảng trống trong tài liệu cũ; chưa có nút nhập danh sách.

1. **Vị trí:** Nếu nhóm chọn triển khai, cần thêm nơi tiếp nhận hồ sơ hoặc nhập tệp danh sách trúng tuyển.
2. **Hiển thị:** Hiện danh sách xem trước và lỗi từng dòng; chỉ xác nhận tạo hồ sơ khi dữ liệu đã đúng.
3. **Nhập:** Dữ liệu NCS, ngành, khóa, loại đầu vào và quyết định; mẫu tệp cần nhóm thống nhất.
4. **Backend:** Kiểm trùng, đối chiếu quyết định, tạo hồ sơ và gán chương trình phù hợp; không nhập nguyên dữ liệu demo.
5. **Lưu:** Hồ sơ, tài khoản liên quan nếu được cấp, quyết định, đầu vào và kết quả nhập.
6. **Trả về:** Số thành công/thất bại, lỗi từng dòng và hồ sơ mới để mở.
7. **Lỗi:** Dữ liệu sai thì sửa trước xác nhận; gửi lại không tạo thêm NCS trùng.
8. **API:** Chưa có API tạo/nhập trong bộ kỹ thuật; API-08/09 đọc hồ sơ, API-15 đọc chương trình. Chốt phạm vi trước bổ sung.


## m02 — Chương trình và kế hoạch đào tạo

### CN-14 — Xem khung chương trình và tiến độ học kỳ

**Người dùng:** NCS, NHD, Bộ môn, Khoa, Phòng Đào tạo theo quyền. **Hiện tại:** Khung và phần trăm hiện đang ghi sẵn.

1. **Vị trí:** Mở “CTĐT & Kế hoạch”; xem các khối tín chỉ, bảng học kỳ và thanh tiến độ.
2. **Hiển thị:** Hiện chương trình đúng ngành, khóa và đầu vào; đối chiếu kết quả với kế hoạch được duyệt.
3. **Nhập:** Không nhập khi xem; chọn NCS nếu tài khoản quản lý được phép xem nhiều hồ sơ.
4. **Backend:** Lấy chương trình, kết quả và các mốc; chỉ tính phần trăm khi nhóm đã thống nhất cách tính.
5. **Lưu:** Chương trình, yêu cầu từng khối, kế hoạch và căn cứ miễn học bổ sung; không lưu phần trăm giả.
6. **Trả về:** Số tín chỉ cần, đã đạt, mốc, hạn, trạng thái và tiến độ có nguồn.
7. **Lỗi:** Thiếu chương trình hoặc công thức thì ghi chưa xác định; không mặc định90 TC hoặc68%.
8. **API:** API-15 lấy chương trình; API-16 lấy kế hoạch. “Tải Khung CTĐT” dùng API-66.

### CN-15 — Lập, điều chỉnh kế hoạch và thêm mốc

**Người dùng:** NCS. **Hiện tại:** Hai nút cùng mở một biểu mẫu trong demo.

1. **Vị trí:** Bấm “Lập / Điều chỉnh kế hoạch” hoặc “+Thêm mốc” phía trên bảng kế hoạch.
2. **Hiển thị:** Hiện biểu mẫu; gửi xong cập nhật mốc và chuyển kế hoạch sang chờ người hướng dẫn duyệt.
3. **Nhập:** Học kỳ, ngày hạn, nội dung cần làm, sản phẩm dự kiến; lý do điều chỉnh cần bổ sung nếu yêu cầu.
4. **Backend:** Phân biệt thêm mốc với sửa mốc; giữ kế hoạch cũ và gửi bản mới để duyệt lại.
5. **Lưu:** Các mốc, bản kế hoạch mới, lý do, ngày gửi và lịch sử các bản.
6. **Trả về:** Mốc đã lưu, số bản kế hoạch và trạng thái chờ duyệt để Frontend cập nhật.
7. **Lỗi:** Ngày sai hoặc bản kế hoạch đã bị người khác sửa thì báo, giữ biểu mẫu để kiểm tra.
8. **API:** API-17 gửi bản kế hoạch; API-16 đọc lại. Không ghi đè bản đã duyệt.

### CN-16 — Phê duyệt kế hoạch qua các vai trò

**Người dùng:** NHD → Bộ môn → Phòng Đào tạo. **Hiện tại:** Demo có ba bước; Khoa thấy nút nhưng chưa có bước xử lý.

1. **Vị trí:** Nút “Phê duyệt kế hoạch” nằm phía trên phân hệ chương trình và kế hoạch.
2. **Hiển thị:** Cho người đúng bước bấm duyệt; sau thành công đổi nhãn và chuyển đến cấp tiếp theo.
3. **Nhập:** Xem bản kế hoạch; ý kiến duyệt, yêu cầu sửa hoặc từ chối cần bổ sung theo quyết định nhóm.
4. **Backend:** Kiểm người duyệt, hồ sơ phụ trách và bước hiện tại; không cho duyệt vượt cấp.
5. **Lưu:** Kết quả từng bước, người duyệt, thời gian, ý kiến và bản kế hoạch được duyệt.
6. **Trả về:** Trạng thái mới, cấp cần xử lý tiếp và lịch sử duyệt; cập nhật việc chờ.
7. **Lỗi:** Sai bước hoặc đã duyệt thì báo rõ; không chuyển trạng thái lần nữa.
8. **API:** API-18 ghi duyệt; API-16 và API-07 cập nhật kế hoạch, bàn làm việc. Chốt vai trò Khoa trước khi thêm bước.

### CN-14x — Quản lý chương trình đào tạo theo ngành, khóa

**Người dùng:** Người quản lý do nhóm xác nhận. **Hiện tại:** Chỉ có khung để xem; chưa có nút thêm/sửa chương trình.

1. **Vị trí:** Nếu cần quản trị, bổ sung màn tạo và sửa khung chương trình; không dùng nút sửa kế hoạch NCS thay thế.
2. **Hiển thị:** Cho nhập yêu cầu từng khối, xem bản hiện tại và các bản đã được sử dụng.
3. **Nhập:** Ngành, khóa, đầu vào, tín chỉ, yêu cầu đầu ra và văn bản làm căn cứ.
4. **Backend:** Kiểm thông tin; áp dụng đúng phiên bản cho NCS, không sửa khung cũ làm thay đổi hồ sơ đã duyệt.
5. **Lưu:** Các bản chương trình, khối kiến thức, điều kiện, văn bản và thời gian áp dụng.
6. **Trả về:** Khung đã lưu và danh sách bản để chọn; hồ sơ NCS đọc đúng khung được gán.
7. **Lỗi:** Chưa chốt12/24 tín chỉ hoặc điều kiện thì chưa đưa vào áp dụng.
8. **API:** API-15 đọc, API-68 lấy danh mục. Chưa có API quản trị chương trình; cần chốt rồi bổ sung.


## m03 — Người hướng dẫn khoa học

### CN-17 — Danh sách, định mức và hồ sơ NHD

**Người dùng:** Các vai trò được mở m03. **Hiện tại:** Nút “Chi tiết” hiện chỉ thông báo.

1. **Vị trí:** Mở bảng người hướng dẫn; bấm “Chi tiết” ở từng hàng để xem hồ sơ.
2. **Hiển thị:** Hiện học hàm, học vị, đơn vị, hướng nghiên cứu và danh sách NCS đang hướng dẫn.
3. **Nhập:** Không nhập khi xem; chọn đúng người hướng dẫn, có thể bổ sung tìm kiếm sau.
4. **Backend:** Lấy hồ sơ, đếm NCS còn được hướng dẫn và so với định mức đã được nhóm xác nhận.
5. **Lưu:** Thông tin NHD, quan hệ phân công và quy định định mức; số đang hướng dẫn lấy từ quan hệ thật.
6. **Trả về:** Chi tiết hồ sơ, số NCS hiện tại, giới hạn và số chỗ còn lại.
7. **Lỗi:** Chưa có định mức thì ghi chưa xác nhận; không lấy giới hạn3/2/1 hay4/3/3 tùy ý.
8. **API:** API-19 lấy danh sách; API-20 xem chi tiết. Quy định đang mâu thuẫn, cần chốt trước phân công.

### CN-18 — Phân công NHD chính và phụ

**Người dùng:** Phòng Đào tạo. **Hiện tại:** Demo tăng bộ đếm nhưng chưa lưu phân công thật.

1. **Vị trí:** Bấm “Phân công Người hướng dẫn”, chọn người rồi xác nhận ban hành phân công.
2. **Hiển thị:** Mở biểu mẫu; lưu xong cập nhật hồ sơ NCS và số người đang được từng NHD hướng dẫn.
3. **Nhập:** NCS, NHD chính, NHD phụ nếu có và quyết định phân công.
4. **Backend:** Kiểm quyền, quyết định và định mức; không cho cùng một người làm cả chính lẫn phụ.
5. **Lưu:** Quan hệ NCS–NHD, vai trò chính/phụ, ngày hiệu lực, quyết định và lịch sử thay đổi.
6. **Trả về:** Phân công mới, quyết định và số chỗ còn của NHD; tải lại vẫn hiển thị đúng.
7. **Lỗi:** Đầy định mức hoặc chọn trùng thì báo để chọn lại; gửi lặp không tăng số lần hai.
8. **API:** API-21 lưu; API-19 và API-09 cập nhật danh sách, hồ sơ.

### CN-19 — Đổi, bổ sung hoặc rút NHD phụ

**Người dùng:** NCS đề xuất; người có thẩm quyền duyệt. **Hiện tại:** Demo mới lưu nội dung yêu cầu.

1. **Vị trí:** Bấm “Đề xuất Thay đổi / Bổ sung NHD” trong phân hệ người hướng dẫn.
2. **Hiển thị:** Hiện NHD hiện tại và biểu mẫu; gửi xong hiển thị đơn đang chờ, chưa đổi người ngay.
3. **Nhập:** Loại thay đổi, người đề xuất mới khi cần, lý do và tệp có ý kiến hoặc chữ ký.
4. **Backend:** Kiểm dữ liệu, định mức; tiếp nhận và chuyển duyệt theo quy trình nhóm thống nhất.
5. **Lưu:** Đơn đề xuất, NHD cũ/mới, tệp, ý kiến, quyết định và lịch sử phân công.
6. **Trả về:** Mã đơn, trạng thái; sau quyết định cuối mới trả quan hệ hướng dẫn đã thay.
7. **Lỗi:** Thiếu tệp hoặc vượt định mức thì báo rõ; không làm mất thông tin NHD cũ.
8. **API:** API-13 gửi; API-12 xem; API-14 duyệt và áp dụng sau khi chốt quyền các bên.

### CN-17x — Cập nhật hồ sơ khoa học của NHD

**Người dùng:** Người phụ trách hồ sơ do nhóm chốt. **Hiện tại:** Có bảng xem nhưng chưa có biểu mẫu thêm/sửa NHD.

1. **Vị trí:** Nếu làm đầy đủ hồ sơ, cần bổ sung nút cập nhật bên cạnh chức năng “Chi tiết”.
2. **Hiển thị:** Hiện thông tin hiện tại; lưu xong cập nhật hồ sơ và các chỗ đang hiển thị NHD.
3. **Nhập:** Tên, học hàm/học vị, cơ quan, hướng nghiên cứu, liên hệ, lý lịch và công trình.
4. **Backend:** Kiểm người có quyền sửa, chứng cứ; không dùng tên làm mã để tránh nhầm hai người trùng tên.
5. **Lưu:** Hồ sơ NHD, tài liệu, công trình và lịch sử sửa; phân công hướng dẫn lưu riêng.
6. **Trả về:** Thông tin đã cập nhật để xem lại; số NCS đang hướng dẫn vẫn lấy từ quan hệ thật.
7. **Lỗi:** Thiếu chứng cứ hoặc sai quyền thì không cập nhật; giữ bản cũ.
8. **API:** API-19/20 đọc và API-64 tải tệp. Chưa có API sửa hồ sơ NHD, cần nhóm chốt phạm vi.


## m04 — Học phần và điểm

### CN-20 — Xem bảng điểm và học phần bổ sung

**Người dùng:** NCS và Phòng Đào tạo theo thanh chức năng hiện tại. **Hiện tại:** Điểm và điểm trung bình đang là mẫu.

1. **Vị trí:** Mở “Học phần & Điểm”; xem bảng môn học, thẻ tín chỉ và phần miễn học bổ sung.
2. **Hiển thị:** Hiện tên môn, tín chỉ, giảng viên, điểm quá trình, thi, tổng kết và kết quả.
3. **Nhập:** Không nhập khi xem; chọn hồ sơ hoặc kỳ học nếu giao diện quản lý được bổ sung.
4. **Backend:** Lấy điểm thật, tính tổng và điểm trung bình theo cách nhóm đã chốt; xét tín chỉ đã đạt.
5. **Lưu:** Môn, lần đăng ký, điểm, kết quả và quyết định miễn bổ sung; không dùng số mẫu.
6. **Trả về:** Bảng điểm, tín chỉ cần/đạt, điểm trung bình và lý do được miễn bổ sung.
7. **Lỗi:** Chưa có điểm thì hiện chưa có; không đổi thành0 hoặc tự đánh đã đạt.
8. **API:** API-22 lấy điểm; API-15 lấy yêu cầu chương trình. GPA nghĩa là điểm trung bình học tập.

### CN-21 — Đăng ký hoặc hủy học phần

**Người dùng:** NCS. **Hiện tại:** Demo có nút đổi đăng ký/hủy cho ENV809.

1. **Vị trí:** Bấm “+Đăng ký” ở hàng môn chưa đăng ký; sau đó có nút “Hủy đăng ký”.
2. **Hiển thị:** Chỉ đổi trạng thái nút sau máy chủ xác nhận; cập nhật danh sách môn đã đăng ký.
3. **Nhập:** Chọn học phần được mở trong kỳ; không nhập điểm để đăng ký.
4. **Backend:** Kiểm thời gian đăng ký, điều kiện môn, chỗ còn và quyền; kiểm thời hạn khi hủy.
5. **Lưu:** Lần đăng ký, học phần mở theo kỳ, trạng thái, ngày đăng ký hoặc hủy.
6. **Trả về:** Mã đăng ký, trạng thái mới và việc còn được phép hủy hay không.
7. **Lỗi:** Đăng ký trùng, hết hạn hoặc đã chốt điểm thì báo lý do; giữ trạng thái cũ.
8. **API:** API-23 đăng ký; API-24 hủy; API-22 đọc lại. Đăng ký không đồng nghĩa đã đạt tín chỉ.

### CN-22 — Đồng bộ bảng điểm

**Người dùng:** Phòng Đào tạo. **Hiện tại:** Nút hiện chỉ báo đã cập nhật.

1. **Vị trí:** Bấm “Đồng bộ bảng điểm” phía trên bảng học phần và điểm.
2. **Hiển thị:** Hiện đang lấy điểm; xong mới tải lại bảng, kèm các dòng không cập nhật được.
3. **Nhập:** Chọn NCS hoặc phạm vi cần đồng bộ nếu được bổ sung; không nhập lại từng điểm tại nút này.
4. **Backend:** Kết nối nguồn điểm đã thống nhất, đối chiếu mã môn và NCS; không tự ghi đè điểm đã xác nhận.
5. **Lưu:** Yêu cầu đồng bộ, nguồn, kết quả từng dòng và điểm được cập nhật thật.
6. **Trả về:** Thông báo đang chạy, hoàn tất hoặc thất bại; số dòng cập nhật và lỗi chi tiết.
7. **Lỗi:** Chưa kết nối nguồn thì báo rõ; không đổi bảng hay báo thành công giả.
8. **API:** API-25 bắt đầu; API-26 theo dõi; API-22 lấy bảng điểm mới.


## m05 — Tiểu luận tổng quan và đề cương

### CN-23 — Nộp tiểu luận tổng quan

**Người dùng:** NCS. **Hiện tại:** Demo mới ghi nội dung và tên tệp trên thiết bị.

1. **Vị trí:** Bấm “Nộp Tiểu luận tổng quan” phía trên phân hệ tiểu luận và đề cương.
2. **Hiển thị:** Mở biểu mẫu; gửi xong hiện bài đã nộp và chờ đánh giá, không giữ nhãn đạt của bản cũ.
3. **Nhập:** Tên tiểu luận, tóm tắt nội dung và tệp PDF; không nhập điểm tự chấm.
4. **Backend:** Kiểm quyền, nội dung, tệp; tạo lần nộp mới và đưa đến người phụ trách đánh giá.
5. **Lưu:** Tên, tóm tắt, tệp, người nộp, ngày nộp, lần nộp và trạng thái.
6. **Trả về:** Bài đã tiếp nhận, trạng thái chờ, thông tin tệp và lịch sử các lần nộp.
7. **Lỗi:** Thiếu PDF hoặc tải lỗi thì giữ biểu mẫu; chưa nộp thành công không đổi thành đã đạt.
8. **API:** API-28 với loại tiểu luận; API-27 xem lại. Các nút “Tải Tiểu luận”, “Tải Biên bản” dùng API-66.

### CN-24 — Nhập điểm đánh giá tiểu luận

**Người dùng:** NHD hoặc Bộ môn được phân công. **Hiện tại:** Demo chưa lưu phần nhận xét.

1. **Vị trí:** Bấm “Nhập điểm Tiểu ban” để mở hộp nhập điểm của ba người chấm.
2. **Hiển thị:** Hiện điểm hiện có; lưu xong cập nhật từng điểm, trung bình, kết luận và điều kiện bảo vệ.
3. **Nhập:** Ba điểm, nhận xét; biên bản và thông tin người chấm cần gắn đúng theo phân công.
4. **Backend:** Kiểm điểm 0–10, người có quyền; tính trung bình và xét đạt theo ngưỡng đã xác nhận.
5. **Lưu:** Điểm từng người, nhận xét, biên bản, kết quả, người nhập và thời gian đánh giá.
6. **Trả về:** Điểm trung bình, đạt/không đạt và toàn bộ điểm để Frontend hiển thị thống nhất.
7. **Lỗi:** Điểm sai, sai người chấm hoặc hồ sơ chưa nộp thì báo rõ và không lưu kết quả.
8. **API:** API-29 lưu điểm; API-27 đọc lại; API-48 cập nhật điều kiện. Ngưỡng 7 trong demo cần nhóm chốt.

### CN-25a — Nộp đề cương và bản giải trình

**Người dùng:** NCS. **Hiện tại:** Demo bắt hai PDF; việc yêu cầu giải trình lần đầu cần chốt.

1. **Vị trí:** Bấm “Nộp Đề cương nghiên cứu”; có ô chọn đề cương và bản giải trình.
2. **Hiển thị:** Mở biểu mẫu; sau gửi hiện chờ xem xét, cập nhật tài liệu mới thay vì nhãn duyệt sẵn.
3. **Nhập:** Tên đề cương, đối tượng nghiên cứu, phương pháp, PDF đề cương và giải trình khi được yêu cầu.
4. **Backend:** Kiểm thông tin, tài liệu; ghi bản nộp mới và chuyển cho người có quyền đánh giá.
5. **Lưu:** Nội dung đề cương, hai tệp, ngày nộp, lần nộp và trạng thái đang chờ.
6. **Trả về:** Hồ sơ mới, tài liệu, trạng thái và thông tin cần sửa nếu có ý kiến.
7. **Lỗi:** Thiếu tài liệu bắt buộc thì báo từng tệp; giữ nội dung đã nhập để bổ sung.
8. **API:** API-28 với loại đề cương; API-27 đọc lại. “Tải Đề cương”, “Bản giải trình” dùng API-66.

### CN-25b — Duyệt lại đề cương và xác nhận giải trình

**Người dùng:** Người đánh giá thuộc Bộ môn/Khoa/Phòng Đào tạo, cần chốt. **Hiện tại:** Chưa có nút duyệt lại trong demo.

1. **Vị trí:** Cần bổ sung nút duyệt hoặc yêu cầu sửa ở hồ sơ đề cương được giao.
2. **Hiển thị:** Hiện tài liệu và ý kiến; kết luận xong đổi sang đã thông qua hoặc cần chỉnh sửa.
3. **Nhập:** Kết luận, nhận xét, biên bản, quyết định; chứng cứ xác nhận giải trình nếu quy trình yêu cầu.
4. **Backend:** Kiểm người duyệt, bản đang xét và các tài liệu; không lấy nhãn “Đã duyệt” viết sẵn làm căn cứ.
5. **Lưu:** Ý kiến, người duyệt, ngày duyệt, bản đề cương, biên bản và quyết định liên quan.
6. **Trả về:** Kết luận, lý do, lịch sử; NCS đọc được yêu cầu sửa và điều kiện được cập nhật.
7. **Lỗi:** Thiếu chữ ký hoặc giải trình cần thiết thì chưa thông qua; nói rõ cần bổ sung gì.
8. **API:** API-30 xử lý xét duyệt; API-27 xem kết quả. Chốt quyền và thành phần hội đồng trước triển khai.


## m06 — Chuyên đề tiến sĩ

### CN-26 — Danh sách và tổng kết chuyên đề

**Người dùng:** NCS, NHD, Bộ môn, Khoa, Phòng Đào tạo theo quyền. **Hiện tại:** Tên, điểm và thẻ tổng kết đang chưa đồng nhất.

1. **Vị trí:** Mở “Chuyên đề Tiến sĩ”; xem bảng và thẻ tổng kết phía dưới.
2. **Hiển thị:** Hiện từng chuyên đề, người phụ trách, ngày báo cáo, điểm, trạng thái và tổng tín chỉ đạt.
3. **Nhập:** Không nhập khi xem; chọn hồ sơ NCS nếu tài khoản quản lý được phép.
4. **Backend:** Lấy kết quả đúng từng chuyên đề; tính số đã đạt, tín chỉ và điểm trung bình.
5. **Lưu:** Dùng chuyên đề, người phụ trách và kết quả đã lưu; không ghi100% cố định.
6. **Trả về:** Danh sách và phần tổng kết từ cùng dữ liệu để sửa điểm thì cả hai cùng thay.
7. **Lỗi:** Chưa chấm thì hiện chờ đánh giá; chưa đủ dữ liệu không tự ghi đã hoàn thành.
8. **API:** API-31. “Biên bản” từng hàng dùng API-66; “Tải sổ biên bản” dùng API-61/62. Số 2 hay 3 cần chốt.

### CN-27 — Đăng ký chuyên đề mới

**Người dùng:** NCS. **Hiện tại:** Demo đang thay chuyên đề có sẵn; chưa tạo hồ sơ thật.

1. **Vị trí:** Bấm “Đăng ký chuyên đề mới” phía trên danh sách chuyên đề.
2. **Hiển thị:** Hiện biểu mẫu; gửi xong thêm hoặc cập nhật đúng chuyên đề với trạng thái chờ đánh giá.
3. **Nhập:** Số thứ tự, tên chuyên đề, người phụ trách, tháng dự kiến báo cáo và tệp nếu bắt buộc.
4. **Backend:** Kiểm chuyên đề thuộc chương trình, số thứ tự không trùng và điều kiện học vụ được nhóm chốt.
5. **Lưu:** Thông tin chuyên đề, thời gian, người phụ trách, tài liệu và lịch sử lần đăng ký.
6. **Trả về:** Mã chuyên đề, tên, trạng thái chờ và bảng tổng kết mới.
7. **Lỗi:** Trùng hoặc chưa đủ điều kiện thì giải thích; không ghi đè điểm của chuyên đề đã đạt.
8. **API:** API-32 gửi; API-31 đọc lại. Chốt điều kiện năm 1 và việc bắt buộc tệp trước tích hợp.

### CN-28 — Chấm điểm từng chuyên đề

**Người dùng:** NHD hoặc Bộ môn được phân công. **Hiện tại:** Demo đang đánh đạt cả khi nhập0 điểm.

1. **Vị trí:** Bấm “Chấm điểm” tại chuyên đề 1, 2 hoặc 3; các nút phải xử lý đúng hàng tương ứng.
2. **Hiển thị:** Hiện nơi nhập điểm; sau lưu cập nhật điểm, đạt/không đạt, tổng kết và điều kiện bảo vệ.
3. **Nhập:** Điểm, nhận xét và biên bản; các ô ngoài điểm cần bổ sung khi nhóm thống nhất.
4. **Backend:** Kiểm điểm 0–10, quyền chấm và ngưỡng đạt; không tự đánh tất cả điểm là đạt.
5. **Lưu:** Điểm, kết luận, nhận xét, biên bản, người đánh giá và thời gian.
6. **Trả về:** Kết quả chuyên đề vừa chấm, thông tin người chấm và tổng kết được tính lại.
7. **Lỗi:** Điểm sai thì yêu cầu nhập lại; hủy hộp nhập không gửi; thiếu biên bản theo quy định thì chưa chốt.
8. **API:** API-33 lưu; API-31 và API-48 cập nhật kết quả. Ngưỡng đạt cần xác nhận.


## m07 — Tiến độ nghiên cứu

### CN-29 — Xem báo cáo, kỳ cần nộp và cảnh báo

**Người dùng:** NCS, NHD, Bộ môn và quản lý theo quyền. **Hiện tại:** Kỳ và số ngày quá hạn trong demo đang mâu thuẫn.

1. **Vị trí:** Mở “Tiến độ Nghiên cứu”; xem bảng từng kỳ và khung cảnh báo phía trên.
2. **Hiển thị:** Hiện nội dung, ngày nộp, nhận xét, kết luận; báo rõ kỳ chưa nộp và đã quá hạn bao lâu.
3. **Nhập:** Không nhập để xem; chọn NCS hoặc kỳ báo cáo khi giao diện cho phép.
4. **Backend:** Xác định kỳ theo lịch đào tạo, so với hạn thật; không chọn kỳ cuối trong dữ liệu mẫu.
5. **Lưu:** Lịch từng kỳ, hạn, báo cáo và đánh giá; số ngày quá hạn tính từ những ngày này.
6. **Trả về:** Danh sách, kỳ được nộp, kỳ gần nhất và cảnh báo thuộc hồ sơ có quyền xem.
7. **Lỗi:** Thiếu lịch thì ghi chưa xác định; tải lỗi không dùng 18 ngày mẫu thay cho kết quả.
8. **API:** API-34 lấy báo cáo; API-37 lấy cảnh báo. Nút “File” từng kỳ dùng API-66.

### CN-30 — Nộp báo cáo tiến độ

**Người dùng:** NCS. **Hiện tại:** Demo chỉ ghi nội dung cục bộ, chưa tải PDF lên máy chủ.

1. **Vị trí:** Bấm “Nộp Báo cáo tiến độ kỳ mới” trong phân hệ tiến độ.
2. **Hiển thị:** Hiện các kỳ được nộp; gửi thành công đưa báo cáo vào bảng với trạng thái chờ đánh giá.
3. **Nhập:** Kỳ báo cáo, công việc đã làm, khó khăn, kế hoạch tiếp theo và PDF báo cáo.
4. **Backend:** Kiểm kỳ đúng hồ sơ, dữ liệu và tệp; ngày nộp lấy từ máy chủ.
5. **Lưu:** Nội dung, tệp, kỳ, người nộp, thời gian và các lần nộp lại.
6. **Trả về:** Mã báo cáo, kỳ, trạng thái chờ; cập nhật hạn và việc cần làm trên bàn làm việc.
7. **Lỗi:** Thiếu tệp hoặc kỳ không được nộp thì giữ biểu mẫu, báo lý do; gửi lặp không tạo hai báo cáo.
8. **API:** API-35 gửi; API-34 và API-07 cập nhật. Không dùng ngày 29/09 ghi sẵn làm ngày nộp thật.

### CN-31 — Đánh giá báo cáo tiến độ

**Người dùng:** NHD hoặc Bộ môn theo phân công. **Hiện tại:** Demo chỉ có nút “Đạt”; nhận xét chưa được lưu.

1. **Vị trí:** Bấm “Đạt” ở từng kỳ; cần bổ sung lựa chọn không đạt/yêu cầu sửa và ô nhận xét.
2. **Hiển thị:** Mở đúng báo cáo; sau đánh giá hiện kết luận, nhận xét và thời gian xử lý.
3. **Nhập:** Kết luận và nhận xét; khi chưa đạt phải chỉ rõ phần cần bổ sung.
4. **Backend:** Kiểm quyền, báo cáo đã nộp và bản đang xét; ghi kết quả, thông báo cho NCS.
5. **Lưu:** Kết luận, nhận xét, người đánh giá, ngày đánh giá và báo cáo tương ứng.
6. **Trả về:** Kết quả để NCS xem; cập nhật bảng tiến độ và điều kiện bảo vệ nếu liên quan.
7. **Lỗi:** Chưa nộp hoặc sai quyền thì không cho chấm; lỗi lưu giữ nhận xét để thử lại.
8. **API:** API-36 lưu; API-34 và API-48 cập nhật. Chốt Bộ môn cùng chấm hay xác nhận bước riêng.

### CN-32 — Gửi cảnh báo quá hạn và nhắc ngay

**Người dùng:** NHD, Phòng Đào tạo. **Hiện tại:** Hai nút hiện chỉ thông báo, chưa gửi email thật.

1. **Vị trí:** Bấm “Gửi cảnh báo quá hạn (Email)” hoặc “Nhắc nhở ngay” ở khung cảnh báo.
2. **Hiển thị:** Hiện đang gửi, sau đó số gửi thành công hoặc lỗi; không nói đã gửi khi mới tiếp nhận.
3. **Nhập:** Chọn cảnh báo hay danh sách cần nhắc; không tự nhập email người ngoài hồ sơ.
4. **Backend:** Lấy email NCS/NHD từ dữ liệu thật, kiểm kỳ chưa nộp; tránh gửi lặp liên tục.
5. **Lưu:** Yêu cầu gửi, người nhận, báo cáo liên quan, lần gửi và kết quả email.
6. **Trả về:** Đang xử lý, đã gửi hoặc thất bại; số người nhận và lý do gửi lỗi.
7. **Lỗi:** Chưa cấu hình email thì báo rõ; không gửi cố định cho tên NCS trong demo.
8. **API:** API-37 lấy danh sách; API-38 gửi; API-39 kiểm tra kết quả.


## m08 — Công bố khoa học

### CN-33 — Khai báo bài báo và xem danh sách

**Người dùng:** NCS khai báo; NHD/PDT xem theo quyền. **Hiện tại:** Demo bỏ qua ISSN và tự gán tác giả chính.

1. **Vị trí:** Bấm “Khai báo bài báo khoa học”; xem các bài và tổng công bố bên dưới.
2. **Hiển thị:** Mở biểu mẫu; gửi thành công thêm bài đang chờ thẩm định, chưa cộng điểm được duyệt.
3. **Nhập:** Tên bài, tạp chí, loại, DOI (mã nhận diện bài), ISSN (mã tạp chí), PDF minh chứng.
4. **Backend:** Kiểm thông tin và bài trùng; lưu vai trò tác giả thực, không tự coi mọi người là tác giả chính.
5. **Lưu:** Bài báo, tác giả, tạp chí, mã nhận diện, tệp, ngày gửi và trạng thái.
6. **Trả về:** Danh sách mới, bài đang chờ, số bài đã duyệt và tổng điểm được công nhận.
7. **Lỗi:** Sai mã hoặc thiếu minh chứng thì báo để sửa; dữ liệu tác giả còn thiếu cần bổ sung giao diện.
8. **API:** API-41 khai báo; API-40 xem. Số bài và điểm chuẩn đầu ra phải chốt với nhóm.

### CN-34 — Thẩm định công bố

**Người dùng:** NHD hoặc Phòng Đào tạo theo quy trình chốt. **Hiện tại:** Demo nhập điểm thủ công, chưa tra nguồn tạp chí thật.

1. **Vị trí:** Nút “Thẩm định” xuất hiện ở bài chưa duyệt, với vai trò được phép.
2. **Hiển thị:** Cho đọc bài và minh chứng; lưu xong đổi trạng thái và cập nhật tổng điểm, điều kiện bảo vệ.
3. **Nhập:** Kết luận, điểm được công nhận, nhận xét và căn cứ kiểm tra.
4. **Backend:** Kiểm quyền, vai trò tác giả và minh chứng; NCS không được tự duyệt bài của mình.
5. **Lưu:** Người duyệt, thời gian, kết luận, điểm và tài liệu làm căn cứ.
6. **Trả về:** Trạng thái, điểm công nhận và các tổng số đã tính lại; bài chưa duyệt không được tính.
7. **Lỗi:** Sai quyền, thiếu chứng cứ hoặc điểm không hợp lệ thì báo, giữ trạng thái chờ.
8. **API:** API-42 xử lý; API-40 và API-48 đọc lại. Chốt NHD/PDT duyệt một hay hai bước trước triển khai.

### CN-35 — Xem sơ đồ thẩm định bài báo

**Người dùng:** NHD và Phòng Đào tạo. **Hiện tại:** Chỉ là hộp mô tả quy trình.

1. **Vị trí:** Bấm “Sơ đồ Phân tích Thiết kế (Thẩm định công bố)” trong phân hệ công bố.
2. **Hiển thị:** Mở sơ đồ; đọc các bước rồi đóng bằng X hoặc vùng ngoài hộp.
3. **Nhập:** Không nhập bài, điểm hay ý kiến vào sơ đồ; chỉ xem hướng dẫn.
4. **Backend:** Không duyệt bài khi mở hộp này; nếu cần tiến độ thật thì lấy lịch sử bài báo.
5. **Lưu:** Không tạo thêm kết quả công bố hay quyết định; nội dung hướng dẫn có thể để ở Frontend.
6. **Trả về:** Không cần phản hồi nghiệp vụ chỉ để mở; thông tin bài thật lấy từ phần danh sách.
7. **Lỗi:** Nếu chưa chốt quy trình thì ghi rõ là mô tả đề xuất, không coi sơ đồ là kết quả đã hoàn tất.
8. **API:** Không có API mở sơ đồ; API-40 dùng khi xem dữ liệu bài. Sơ đồ hai cấp đang khác demo một bước.


## m09 — Đề tài và luận án

### CN-36 — Xem đề tài và các phiên bản luận án

**Người dùng:** NCS, NHD, Bộ môn, Phòng Đào tạo; HĐ theo phân công. **Hiện tại:** Nội dung đề tài, tệp và nhãn đã ký hiện còn là mẫu.

1. **Vị trí:** Mở “Đề tài & Luận án”; xem thông tin đề tài và bảng các bản thảo.
2. **Hiển thị:** Hiện tên Việt/Anh, quyết định, NHD; từng bản có giai đoạn, ngày tải, dung lượng và ghi chú.
3. **Nhập:** Không nhập khi xem; chọn đúng hồ sơ và bản muốn mở hoặc tải.
4. **Backend:** Lấy đề tài, tài liệu và kết quả kiểm tra thuộc cùng bản luận án; kiểm quyền hồ sơ được giao.
5. **Lưu:** Đề tài, các bản, tệp và quan hệ với quyết định; bản chốt phải được bảo vệ khỏi ghi đè.
6. **Trả về:** Thông tin đề tài, danh sách bản, bản hiện tại và kết quả thật nếu đã có.
7. **Lỗi:** Chưa kiểm tra hay chưa ký thì hiện chưa có; không hiển thị14% hoặc “Đã ký” mặc định.
8. **API:** API-43 đọc; các nút “Tải về”, “Tải bản chính” dùng API-66. Khóa bản còn cần chốt.

### CN-37 — Đề nghị đổi tên đề tài

**Người dùng:** NCS đề xuất; cấp có thẩm quyền duyệt. **Hiện tại:** Demo chỉ lưu nội dung yêu cầu.

1. **Vị trí:** Bấm “Đổi tên đề tài” phía trên phân hệ đề tài và luận án.
2. **Hiển thị:** Hiện tên hiện tại và biểu mẫu; gửi xong hiện đơn đang chờ, chưa đổi tên chính thức.
3. **Nhập:** Tên mới tiếng Việt, tiếng Anh, lý do và PDF đơn hoặc ý kiến xác nhận.
4. **Backend:** Lấy tên cũ từ hồ sơ, kiểm đề nghị và chuyển duyệt; chỉ áp dụng khi có quyết định hợp lệ.
5. **Lưu:** Đơn, tên cũ/mới, tệp, các ý kiến, quyết định và ngày áp dụng.
6. **Trả về:** Mã đơn, trạng thái; sau duyệt trả tên mới cho hồ sơ và phần công khai.
7. **Lỗi:** Thiếu tên hoặc tệp thì giữ biểu mẫu, báo rõ; không làm mất lịch sử tên cũ.
8. **API:** API-13 gửi, API-14 duyệt, API-43 đọc đề tài. Quy trình học vụ dùng chung với m12.

### CN-38 — Tải lên phiên bản luận án mới

**Người dùng:** NCS. **Hiện tại:** Nút lớn mở biểu mẫu; nút nhỏ “+Nộp phiên bản mới” còn chỉ thông báo.

1. **Vị trí:** Bấm “Upload phiên bản luận án mới” hoặc nối nút nhỏ nói trên đến cùng biểu mẫu.
2. **Hiển thị:** Cho chọn giai đoạn, ghi chú và PDF; gửi xong thêm bản vào lịch sử.
3. **Nhập:** Giai đoạn, nội dung chỉnh sửa, tệp luận án; người dùng không tự chọn số bản để ghi đè bản cũ.
4. **Backend:** Kiểm tệp và hồ sơ, đặt số bản mới; xem việc phải duyệt/kiểm tra lại khi đổi bản.
5. **Lưu:** Bản mới, ngày gửi, người gửi, tệp, ghi chú và liên hệ với bản trước.
6. **Trả về:** Số bản, tên tệp, dung lượng và trạng thái; tải lại trang vẫn thấy lịch sử.
7. **Lỗi:** Tệp sai hoặc bản đã bị khóa thì báo; không thay nội dung bản cũ.
8. **API:** API-44 gửi; API-43 đọc; API-64 tải tệp. Chính sách khóa và duyệt lại cần nhóm chốt.

### CN-39 — Kiểm tra tương đồng bằng Turnitin

**Người dùng:** Phòng Đào tạo. **Hiện tại:** Hiện báo chưa kết nối; số14% trên giao diện vẫn là mẫu.

1. **Vị trí:** Bấm “Quét Turnitin” tại phần kiểm tra trùng lặp của luận án.
2. **Hiển thị:** Hiện đang kiểm tra; xong mới hiện phần trăm và tệp báo cáo của đúng bản.
3. **Nhập:** Chọn phiên bản luận án cần kiểm tra; không nhập phần trăm kết quả.
4. **Backend:** Gửi tài liệu tới dịch vụ so sánh văn bản; lấy kết quả thật, không tạo tỷ lệ giả.
5. **Lưu:** Yêu cầu kiểm tra, bản/tệp, kết quả, báo cáo và thời gian.
6. **Trả về:** Đang chạy, thành công hoặc lỗi; phần trăm chỉ trả khi dịch vụ đã hoàn tất.
7. **Lỗi:** Chưa kết nối thì báo rõ, bỏ nhãn đạt giả; không kết luận đạo văn chỉ từ tỷ lệ.
8. **API:** API-45 bắt đầu; API-46 lấy kết quả. Turnitin là dịch vụ kiểm tra văn bản tương đồng.

### CN-40 — NHD đồng ý cho bảo vệ

**Người dùng:** NHD đang hướng dẫn NCS. **Hiện tại:** Demo mới ghi thời điểm xác nhận, chưa có ký số thật.

1. **Vị trí:** Bấm “NHD Ký số đồng ý cho bảo vệ” trong hồ sơ luận án.
2. **Hiển thị:** Hiện đúng bản cần xét; sau xác nhận cập nhật người, thời gian và tình trạng đồng ý.
3. **Nhập:** Nhận xét, tài liệu đồng ý và chứng cứ chữ ký nếu nhóm triển khai ký số thật.
4. **Backend:** Kiểm phân công và bản luận án; không coi một lần bấm nút là chữ ký điện tử được xác thực.
5. **Lưu:** Ý kiến, NHD, ngày xác nhận, bản luận án và tài liệu/chữ ký liên quan.
6. **Trả về:** Kết quả đồng ý, bản được đồng ý và việc có chữ ký thật hay chỉ xác nhận tài khoản.
7. **Lỗi:** Sai NHD hoặc bản đã thay đổi thì báo; yêu cầu xem lại trước xác nhận.
8. **API:** API-47 ghi; API-43 đọc. Đổi bản cần xử lý lại hiệu lực đồng ý theo quy định chốt.

### CN-36x — Khóa bản luận án đã chốt

**Người dùng:** Người có thẩm quyền cần xác nhận. **Hiện tại:** Chưa có nút hoặc API khóa trong demo.

1. **Vị trí:** Cần bổ sung thao tác khóa/mở ở bản luận án nếu nhóm quyết định triển khai.
2. **Hiển thị:** Hiện bản nào đã khóa, ai khóa và lý do; không cho thay tệp cũ bằng thao tác tải bản mới.
3. **Nhập:** Bản luận án, lý do và chứng cứ quyết định; quyền mở lại phải được thống nhất.
4. **Backend:** Kiểm thẩm quyền, bảo vệ đúng tệp đã chốt; phân biệt khóa bản cũ với cấm nộp bản mới.
5. **Lưu:** Người khóa/mở, thời điểm, lý do, bản và lịch sử liên quan.
6. **Trả về:** Trạng thái khóa và các thao tác còn được phép để Frontend bật/tắt nút.
7. **Lỗi:** Không có quyền hoặc bản đã chốt thì báo, không ghi đè tài liệu.
8. **API:** API-43 đọc trạng thái, API-44 nộp bản mới. API khóa/mở chưa có, cần bổ sung sau khi chốt quy định.


## m10 — Bảo vệ luận án

Các mục CN-45a–d giải thích phần điều phối còn thiếu giao diện. Không coi việc xem sơ đồ là đã lập hội đồng, đã gửi phản biện hay đã công khai.

### CN-41 — Xem bảng kiểm điều kiện bảo vệ

**Người dùng:** Các vai trò được mở m10; NCS chỉ hồ sơ mình. **Hiện tại:** Bảng demo chưa kiểm đầy đủ dữ liệu thật.

1. **Vị trí:** Mở phần bảo vệ để xem các ô điều kiện và nhãn đủ/chưa đủ.
2. **Hiển thị:** Hiện từng điều kiện đạt, chưa đạt hoặc chưa xác định; giải thích phần còn thiếu.
3. **Nhập:** Không tự đánh dấu đạt; chọn hồ sơ muốn kiểm nếu tài khoản có quyền.
4. **Backend:** Đối chiếu điểm, tín chỉ, tiểu luận, đề cương, chuyên đề, công bố, báo cáo và thời hạn thật.
5. **Lưu:** Các chứng cứ và quy định đã chốt; bảng kiểm lấy từ đó, không lưu sáu dấu tích giả.
6. **Trả về:** Kết quả từng mục, căn cứ, số mục đạt và việc đủ điều kiện hay chưa.
7. **Lỗi:** Thiếu dữ liệu hoặc quy định chưa chốt thì chưa kết luận đạt; không lấy tiểu luận thay cho24 tín chỉ.
8. **API:** API-48. Ngoại ngữ, trình luận án, NHD và tương đồng cần chốt danh sách điều kiện chính thức.

### CN-42 — Xem phản biện, công khai và hội đồng

**Người dùng:** Vai trò được mở m10; HĐ chỉ hồ sơ được giao. **Hiện tại:** Hai phản biện, 30 ngày và bảng thành viên hiện là mẫu.

1. **Vị trí:** Xem bảng phản biện độc lập, thời gian công khai, lịch và danh sách hội đồng.
2. **Hiển thị:** Hiện hồ sơ thật, kết luận phản biện và kết quả; thông tin kín phải được ẩn đúng người.
3. **Nhập:** Không nhập khi xem; chọn hồ sơ hoặc tài liệu được phép đọc.
4. **Backend:** Lấy kết quả, lịch, hội đồng; tính ngày công khai từ ngày đăng thật.
5. **Lưu:** Hồ sơ phản biện, hội đồng, quyết định, ngày đăng, phiên bảo vệ và biên bản.
6. **Trả về:** Danh sách, kết luận, thời gian, thành viên và kết quả được phép hiển thị.
7. **Lỗi:** Chưa có nhận xét thì hiện đang chờ; không hiện2/2 đạt hay30/30 từ dữ liệu mẫu.
8. **API:** API-49; “Quyết định thành lập HĐ”, “Tải Nghị quyết HĐ” dùng API-66.

### CN-43 — Nhập kết quả bỏ phiếu hội đồng

**Người dùng:** Thành viên được phân công và có quyền ghi kết quả. **Hiện tại:** Demo cho nhập tổng phiếu; quyền người nhập cần chốt.

1. **Vị trí:** Bấm “Nhập kết quả bỏ phiếu Hội đồng” trong hồ sơ bảo vệ.
2. **Hiển thị:** Hiện nơi nhập; lưu xong cập nhật số tán thành, tổng phiếu và kết luận.
3. **Nhập:** Số phiếu, biên bản, nghị quyết; nếu chọn phiếu cá nhân thì mỗi người chỉ nhập phiếu mình.
4. **Backend:** Kiểm người nhập, số người dự và quy tắc thông qua; không để mọi thành viên sửa tổng tùy ý.
5. **Lưu:** Phiếu hoặc tổng có chứng cứ, người ghi, ngày ghi, biên bản và kết quả.
6. **Trả về:** Số phiếu hợp lệ, đạt/không đạt và tài liệu làm căn cứ.
7. **Lỗi:** Phiếu vượt người dự, sai quyền hoặc chưa tổ chức thì báo và không chốt.
8. **API:** API-50 nhập tổng hoặc API-51 phiếu cá nhân; API-49 xem. Chọn một cách, không cộng cả hai.

### CN-44 — Xem sơ đồ sáu bước bảo vệ

**Người dùng:** Các vai trò được phép mở phần bảo vệ. **Hiện tại:** Sơ đồ chỉ mô tả, không thực hiện các bước.

1. **Vị trí:** Bấm “Sơ đồ Phân tích Thiết kế (Quy trình6 bước Bảo vệ)” phía trên.
2. **Hiển thị:** Mở hộp để đọc từng bước, rồi đóng; không đổi hồ sơ chỉ vì chọn hoặc xem một bước.
3. **Nhập:** Không nhập; nội dung trình luận án, thẩm định, phản biện, hội đồng, công khai và bỏ phiếu chỉ để đọc.
4. **Backend:** Không tự tạo hội đồng hay gửi phản biện; tiến độ thật phải lấy từ hồ sơ bảo vệ.
5. **Lưu:** Không lưu thêm quyết định hoặc kết quả khi mở sơ đồ; hướng dẫn có thể để Frontend.
6. **Trả về:** Không cần phản hồi nghiệp vụ để mở; nếu xem tiến độ thật trả trạng thái từng phần.
7. **Lỗi:** Quy trình chưa chốt thì ghi “Đề xuất”, tránh hiểu đã hoàn tất.
8. **API:** Không có API mở sơ đồ; API-49 xem hồ sơ. Các ngưỡng trong mô tả cần đối chiếu quy định.

### CN-45a — Ghi nhận trình luận án tại Bộ môn

**Người dùng:** Bộ môn/Khoa theo phân công cần xác nhận. **Hiện tại:** Chưa có nút nhập hoặc lập buổi trình luận án.

1. **Vị trí:** Cần bổ sung nơi ghi buổi trình luận án tại đơn vị chuyên môn trong hồ sơ bảo vệ.
2. **Hiển thị:** Cho mở thông tin buổi họp, thành viên và biên bản; chỉ hiện hoàn tất khi có kết luận thật.
3. **Nhập:** Ngày tổ chức, người tham gia, kết luận, biên bản và tài liệu theo quy định đã chốt.
4. **Backend:** Kiểm người phụ trách, thành phần và chứng cứ; không tự thêm cấp phê duyệt.
5. **Lưu:** Buổi trình luận án, danh sách người tham gia, kết luận và tệp biên bản.
6. **Trả về:** Trạng thái, ngày, kết luận và tài liệu để hồ sơ bảo vệ đọc được.
7. **Lỗi:** Thiếu biên bản hoặc chưa chốt điều kiện thì chưa ghi hoàn tất.
8. **API:** API-49 hiện chỉ đọc phần này; chưa có API ghi trong tài liệu kỹ thuật, cần bổ sung sau khi nhóm xác nhận.

### CN-45b — Gửi và tiếp nhận phản biện độc lập

**Người dùng:** Phòng Đào tạo và chuyên gia được giao; quyền cần chốt. **Hiện tại:** Chưa có giao diện gửi/nhận phản biện thật.

1. **Vị trí:** Cần bổ sung thao tác giao tài liệu và nhận bản nhận xét trong hồ sơ bảo vệ.
2. **Hiển thị:** Cho người được quyền theo dõi đã gửi, chờ nhận, đã nhận; NCS không thấy danh tính kín.
3. **Nhập:** Chuyên gia, bản luận án, ngày gửi, hạn nhận, nhận xét, kết luận và tệp phản biện.
4. **Backend:** Kiểm quyền, gửi đúng bản; giữ bí mật, tiếp nhận kết luận và hướng dẫn xử lý nếu yêu cầu sửa.
5. **Lưu:** Phân công, tài liệu gửi, các ngày, nhận xét, kết luận và file riêng tư.
6. **Trả về:** Mã phản biện, tình trạng, kết luận được phép xem; thông tin kín chỉ trả đúng người.
7. **Lỗi:** Quá hạn, thiếu tệp hoặc sai quyền thì báo rõ, không tự đánh đồng ý.
8. **API:** API-49 đọc; chưa có API ghi/gửi riêng, cần chốt và bổ sung hợp đồng.

### CN-45c — Thành lập hội đồng và lên lịch bảo vệ

**Người dùng:** Khoa, Phòng Đào tạo, BGH theo thẩm quyền cần chốt. **Hiện tại:** Hiện chỉ có bảng hội đồng mẫu và nút tải quyết định.

1. **Vị trí:** Cần bổ sung nơi lập thành viên, trình quyết định và nhập lịch trong phần bảo vệ.
2. **Hiển thị:** Hiện danh sách đề xuất; sau quyết định hợp lệ mới hiện hội đồng chính thức và lịch.
3. **Nhập:** Thành viên, vai trò, cơ quan, học hàm/học vị, quyết định, ngày giờ và địa điểm.
4. **Backend:** Kiểm cơ cấu theo quy định nhóm đã xác nhận, quyền ban hành và hồ sơ luận án.
5. **Lưu:** Hội đồng, thành viên, quyết định, lịch, địa điểm và lịch sử thay đổi.
6. **Trả về:** Danh sách chính thức, số quyết định, thời gian và trạng thái tổ chức.
7. **Lỗi:** Sai cơ cấu hoặc thiếu quyết định thì chưa lập chính thức; không mặc định7 người.
8. **API:** API-49 đọc; API-66 tải quyết định. API lập/duyệt/lên lịch chưa có, cần bổ sung.

### CN-45d — Đăng luận án công khai trước bảo vệ

**Người dùng:** Phòng Đào tạo, cần xác nhận quyền cuối. **Hiện tại:** Chưa có nút đăng công khai trong demo.

1. **Vị trí:** Cần bổ sung nút đăng tóm tắt, toàn văn hoặc đóng góp mới trong hồ sơ bảo vệ.
2. **Hiển thị:** Hiện tài liệu được đăng; thành công thì xuất hiện ở cổng công khai và bắt đầu tính ngày.
3. **Nhập:** Tài liệu được phép công khai, lịch bảo vệ; không nhập ngày đăng lùi để đủ hạn.
4. **Backend:** Kiểm bản luận án và quyền, đăng đúng tệp; lấy thời điểm đăng từ máy chủ.
5. **Lưu:** Lần công khai, tài liệu, người đăng, thời điểm, lịch và việc thu hồi nếu có.
6. **Trả về:** Trạng thái, ngày đăng, ngày đã công khai và đường dẫn tài liệu thật.
7. **Lỗi:** Chưa được phép hoặc thiếu tệp thì báo; không đưa phản biện kín lên cổng.
8. **API:** API-52 đăng; API-58 và API-49 xem. Thời hạn 30 ngày, đổi tệp có tính lại hay không cần chốt.

### CN-41x — Xác nhận chứng cứ ngoại ngữ và các điều kiện còn thiếu

**Người dùng:** Người thẩm định do nhóm chốt. **Hiện tại:** Có trong mô tả, chưa có biểu mẫu nhập riêng.

1. **Vị trí:** Cần bổ sung nơi xem, nộp và xác nhận chứng cứ nếu đây là điều kiện bảo vệ chính thức.
2. **Hiển thị:** Hiện chứng cứ, còn hạn hay không và kết luận thẩm định; bảng điều kiện đọc kết quả đã xác nhận.
3. **Nhập:** Thông tin chứng chỉ, ngày, tệp và nội dung theo quy định đã được nhóm đối chiếu.
4. **Backend:** Kiểm chứng cứ thật, hiệu lực và người xác nhận; không tự cho đạt vì ô điều kiện viết sẵn.
5. **Lưu:** Chứng cứ, tệp, ngày hiệu lực, ý kiến và người xác nhận.
6. **Trả về:** Đạt/chưa đạt/chưa đủ chứng cứ, kèm lý do; cập nhật bảng điều kiện.
7. **Lỗi:** Chưa có quy định hoặc chứng chỉ chưa kiểm tra thì chưa đánh đạt.
8. **API:** API-48 đọc điều kiện. Chưa có API quản lý chứng chỉ; chỉ bổ sung khi nhóm chốt yêu cầu.


## m11 — Hoàn thiện và cấp bằng

### CN-46 — Xem hồ sơ sau bảo vệ và lưu chiểu

**Người dùng:** Các vai trò được mở m11. **Hiện tại:** Các nhãn đã hoàn tất hiện đang viết sẵn.

1. **Vị trí:** Mở “Hoàn thiện & Cấp bằng”; xem phần lưu chiểu và bảng điều kiện tốt nghiệp.
2. **Hiển thị:** Hiện bản chỉnh sửa, giải trình, biên nhận và phần còn thiếu trước khi cấp bằng.
3. **Nhập:** Không nhập khi xem; chọn hồ sơ có quyền đọc.
4. **Backend:** Lấy kết quả bảo vệ, hồ sơ chỉnh sửa và xác nhận nộp tài liệu; không lấy bảng bảo vệ thay cho tốt nghiệp.
5. **Lưu:** Hồ sơ sau bảo vệ, tệp, biên nhận, xác nhận và bằng nếu đã cấp thật.
6. **Trả về:** Trạng thái từng điều kiện, nơi đã nộp, số biên nhận và việc đủ điều kiện cấp bằng.
7. **Lỗi:** Thiếu chứng cứ thì hiện chưa hoàn tất; không tự đánh đã nộp ở cả ba nơi.
8. **API:** API-53 đọc; “Giấy TV ĐHAG”, “Giấy TV Quốc Gia” dùng API-66. Lưu chiểu nghĩa là nộp tài liệu để thư viện lưu giữ.

### CN-47a — Nộp bản chỉnh sửa sau bảo vệ

**Người dùng:** NCS. **Hiện tại:** Demo chỉ lưu nội dung và thông tin tệp.

1. **Vị trí:** Bấm “Nộp bản chỉnh sửa sau bảo vệ” phía trên phần hoàn thiện.
2. **Hiển thị:** Mở biểu mẫu; sau gửi hiện hồ sơ đang chờ kiểm tra, không tự đánh đủ điều kiện.
3. **Nhập:** PDF luận án hoàn thiện, PDF giải trình và số/ngày biên nhận hai thư viện; cần chứng cứ tệp theo quy định.
4. **Backend:** Kiểm đã bảo vệ đạt, tệp và thông tin; chuyển đến người xác nhận được nhóm chốt.
5. **Lưu:** Lần nộp, hai tài liệu, các biên nhận, người nộp, ngày và trạng thái.
6. **Trả về:** Hồ sơ đã nhận, các tài liệu và mục cần kiểm tra hoặc bổ sung.
7. **Lỗi:** Thiếu tệp hoặc chưa có kết quả bảo vệ đạt thì báo, giữ biểu mẫu để bổ sung.
8. **API:** API-54 gửi; API-53 đọc lại. Nơi lưu chiểu thứ ba và thời hạn cần xác nhận.

### CN-47b — Xác nhận bản chỉnh sửa và biên nhận

**Người dùng:** Chủ tịch/thư ký HĐ, Phòng Đào tạo theo quyền cần chốt. **Hiện tại:** Demo chưa có nút xác nhận riêng.

1. **Vị trí:** Cần thêm nút xác nhận hoặc yêu cầu sửa ở hồ sơ sau bảo vệ được giao.
2. **Hiển thị:** Cho đọc tài liệu, đối chiếu biên nhận; kết luận xong cập nhật từng điều kiện tốt nghiệp.
3. **Nhập:** Kết luận, nhận xét, mục biên nhận đã kiểm tra và chứng cứ chữ ký nếu yêu cầu.
4. **Backend:** Kiểm người có quyền, tài liệu và biên nhận thật; không coi mã NCS tự nhập là chứng cứ đã nộp.
5. **Lưu:** Ý kiến, người xác nhận, ngày, bản tài liệu và kết quả kiểm tra biên nhận.
6. **Trả về:** Hồ sơ đã xác nhận hoặc cần sửa, lý do và các mục còn thiếu.
7. **Lỗi:** Thiếu xác nhận cần thiết thì chưa thông qua; lỗi lưu giữ nhận xét để gửi lại.
8. **API:** API-55 xác nhận; API-53 đọc. Phân công và chữ ký cần chốt trước bổ sung giao diện.

### CN-48 — BGH công nhận học vị và cấp bằng

**Người dùng:** Ban Giám hiệu. **Hiện tại:** Demo chưa kiểm đủ bảo vệ và lưu chiểu, chưa ghi sổ thật.

1. **Vị trí:** Bấm “BGH Ký Quyết Định Công Nhận Học Vị” trong phần cấp bằng.
2. **Hiển thị:** Hiện hồ sơ cần xét; thành công mới hiện đã cấp bằng và thông tin bằng thật.
3. **Nhập:** Quyết định công nhận; người dùng không tự nhập mã bằng để tạo kết quả giả.
4. **Backend:** Kiểm các điều kiện tốt nghiệp và quyết định; cấp mã bằng, số vào sổ duy nhất.
5. **Lưu:** Bằng, số sổ, ngày cấp, người được cấp, quyết định và lịch sử ban hành.
6. **Trả về:** Thông tin bằng chính thức; cổng tra cứu phải tìm được cùng bản ghi này.
7. **Lỗi:** Chưa đủ điều kiện hoặc đã cấp thì báo; bấm hai lần không tạo hai bằng.
8. **API:** API-56 cấp; API-53 kiểm hồ sơ; API-57 tra cứu. Không chỉ đổi nhãn thành đã cấp.

### CN-49a — Mở phôi bằng từ hồ sơ tốt nghiệp

**Người dùng:** Người được mở m11. **Hiện tại:** Nút hiện chỉ chuyển tới trang công khai.

1. **Vị trí:** Bấm “Xem Phôi Bằng Ép Kim 3D” trong hồ sơ hoàn thiện và cấp bằng.
2. **Hiển thị:** Mở phần tra cứu; dùng mã bằng của hồ sơ nếu đã có, rồi hiển thị bản ghi được xác nhận.
3. **Nhập:** Không nhập lại nếu đã điền mã đúng; nếu chưa có thì nhập mã hoặc họ tên ở trang tra cứu.
4. **Backend:** Tra đúng sổ bằng, chỉ trả bằng đã ban hành; không tạo phôi từ tên tùy ý.
5. **Lưu:** Không cấp hoặc sửa bằng khi xem; dùng bản ghi cấp bằng có sẵn.
6. **Trả về:** Tên, ngành, mã, số sổ, ngày cấp, quyết định và tình trạng bằng.
7. **Lỗi:** Chưa có bằng hoặc không tìm thấy thì báo; không dựng phôi giả.
8. **API:** API-57; thông tin bằng từ API-53. 3D chỉ là cách trình bày trên màn hình, không phải tệp tải riêng.


## m12 — Biến động học vụ

### CN-50 — Tạo đơn yêu cầu thay đổi học vụ

**Người dùng:** NCS; yêu cầu xử lý hành chính của PDT cần chốt. **Hiện tại:** Demo mới lưu yêu cầu, chưa áp dụng thay đổi.

1. **Vị trí:** Bấm “Tạo đơn / Yêu cầu thay đổi” trong phân hệ biến động.
2. **Hiển thị:** Hiện loại yêu cầu; gửi xong thêm đơn đang chờ, chưa đổi hồ sơ chính thức.
3. **Nhập:** Loại, lý do, PDF; thêm ngày cho gia hạn/tạm dừng, NHD/tên mới hoặc nơi chuyển theo từng loại.
4. **Backend:** Kiểm thông tin riêng từng loại; chuyển người xử lý đúng, không cho NCS tự ban hành buộc thôi học.
5. **Lưu:** Đơn, nội dung đề nghị, tệp, ngày, người gửi và lịch sử xử lý.
6. **Trả về:** Mã đơn, trạng thái và phần còn cần bổ sung; m01/m03/m09 dùng chung lịch sử này.
7. **Lỗi:** Thiếu nội dung theo loại thì báo; không nhận đơn chỉ có mô tả mơ hồ.
8. **API:** API-13 gửi; API-12 đọc. API-14 xét duyệt sau khi chốt quyền và quy trình.

### CN-51a — Xem lịch sử biến động và quyết định

**Người dùng:** Người được mở m12, theo hồ sơ được giao. **Hiện tại:** Bảng hiện là các hàng mẫu.

1. **Vị trí:** Xem bảng biến động; bấm “Xem QĐ”, “Biên bản” hoặc “Chi tiết” tại đúng hàng.
2. **Hiển thị:** Hiện NCS, loại thay đổi, nội dung, ngày, quyết định và tình trạng; mở tài liệu liên quan.
3. **Nhập:** Không nhập khi xem; chọn yêu cầu hoặc quyết định cần đọc.
4. **Backend:** Lấy lịch sử thật, kiểm quyền đọc và tài liệu; bảo đảm lịch sử m01 và m12 cùng nguồn.
5. **Lưu:** Dùng đơn, ý kiến, quyết định, ngày hiệu lực và tệp đã lưu; không tạo đơn khi mở.
6. **Trả về:** Chi tiết từng thay đổi và tài liệu, kể cả NHD/tên cũ nếu cần đối chiếu.
7. **Lỗi:** Chưa có quyết định thì báo đang chờ; không mở quyết định mẫu của người khác.
8. **API:** API-12 đọc lịch sử; API-66 tải. Các hàng gia hạn, đổi tên, tạm dừng, thôi học đều áp dụng cách này.

### CN-51b — Xem sơ đồ xử lý biến động

**Người dùng:** NCS, NHD và quản lý được cấp quyền. **Hiện tại:** Sơ đồ hiện chỉ để đọc.

1. **Vị trí:** Bấm “Sơ đồ Phân tích Thiết kế (Xử lý biến động & Thôi học)”.
2. **Hiển thị:** Mở các bước tiếp nhận, xem xét ở Khoa, thẩm tra tại Phòng Đào tạo và ban hành quyết định.
3. **Nhập:** Không nhập đơn hoặc kết luận trong sơ đồ; chỉ đọc và đóng hộp.
4. **Backend:** Không thay đổi học vụ khi mở; cần tiến độ của đơn thì lấy lịch sử xử lý thật.
5. **Lưu:** Không lưu quyết định hoặc kết quả mới; hướng dẫn tĩnh do Frontend hiển thị.
6. **Trả về:** Không cần kết quả nghiệp vụ chỉ để xem; đơn thật phải có trạng thái riêng.
7. **Lỗi:** Quy trình chưa chốt thì ghi rõ đề xuất; không báo đã được các cấp duyệt.
8. **API:** Không có API mở sơ đồ; API-12 xem đơn. Quyền duyệt và cách tính thời hạn phải được nhóm xác nhận.

### CN-50b — Duyệt và áp dụng thay đổi học vụ

**Người dùng:** Khoa → Phòng Đào tạo → BGH là luồng đề xuất cần chốt. **Hiện tại:** Chưa có nút duyệt đơn trong demo.

1. **Vị trí:** Cần bổ sung nút xem xét, yêu cầu sửa, từ chối hoặc ban hành quyết định ở đơn được giao.
2. **Hiển thị:** Hiện tài liệu; xử lý xong đổi trạng thái và chuyển tới cấp tiếp theo.
3. **Nhập:** Kết luận, lý do, ý kiến liên quan, quyết định và ngày hiệu lực.
4. **Backend:** Kiểm đúng người, đúng bước; chỉ quyết định cuối hợp lệ mới đổi hạn, tên hoặc phân công.
5. **Lưu:** Các ý kiến, trạng thái, quyết định, thay đổi trước/sau và hồ sơ đã được áp dụng.
6. **Trả về:** Trạng thái mới, người cần xử lý; kết quả chính thức nếu đã ban hành.
7. **Lỗi:** Sai bước, thiếu chứng cứ hoặc vượt định mức thì báo, không cập nhật hồ sơ một phần.
8. **API:** API-14 xử lý; API-12 xem. Nộp đơn không đồng nghĩa đã được gia hạn.


## m13 — Tra cứu và báo cáo

### CN-49b — Tra cứu nhanh và mở màn phôi bằng

**Người dùng:** Khoa, Phòng Đào tạo, BGH theo thanh chức năng m13. **Hiện tại:** Demo đang đưa cả họ tên vào ô mã bằng.

1. **Vị trí:** Nhập ở công cụ tra cứu nhanh rồi bấm “Tra cứu ngay”; “Mở Console 3D” mở trang công khai.
2. **Hiển thị:** Chuyển sang tra cứu, điền đúng mã hoặc tên; hiển thị kết quả cùng cách với cổng công khai.
3. **Nhập:** Số hiệu bằng hoặc họ tên; không nhầm hai loại dữ liệu.
4. **Backend:** Tìm bản ghi thật; nếu nhập cả mã và tên thì cả hai phải thuộc cùng một bằng.
5. **Lưu:** Không tạo hoặc sửa bằng khi tra; sử dụng sổ cấp bằng đã lưu.
6. **Trả về:** Danh sách bằng phù hợp hoặc thông báo không tìm thấy; chọn đúng người khi trùng tên.
7. **Lỗi:** Sai mã hoặc kết hợp tên/mã khác người thì không xác thực; xóa kết quả cũ.
8. **API:** Dùng API-57, không thêm API tra nhanh khác. 3D là hình minh họa bằng trên màn hình.

### CN-52a — Thống kê tiến độ theo khóa và ngành

**Người dùng:** Khoa, Phòng Đào tạo, BGH. **Hiện tại:** Số48 NCS và các tỷ lệ hiện là mẫu.

1. **Vị trí:** Xem phần “Thống kê Tiến độ Nghiên cứu sinh Theo Khóa” trong báo cáo.
2. **Hiển thị:** Hiện số NCS từng khóa, trong hạn, gia hạn và các tỷ lệ; thay đổi theo bộ lọc được bổ sung.
3. **Nhập:** Chọn ngành, khóa, đơn vị và ngày thống kê nếu giao diện có bộ lọc.
4. **Backend:** Đếm đúng hồ sơ được quyền xem; tính tỷ lệ theo cùng nhóm và hạn được duyệt.
5. **Lưu:** Dùng hồ sơ, khóa và quyết định thay đổi; không lưu các tổng mẫu như dữ liệu thật.
6. **Trả về:** Tổng, từng nhóm, tỷ lệ và phạm vi tính để Frontend vẽ thanh thống kê.
7. **Lỗi:** Chưa có quy tắc trong hạn thì báo chưa xác định; không giữ tỷ lệ mẫu.
8. **API:** API-59. Số trên báo cáo và bàn làm việc phải thống nhất hoặc giải thích phạm vi48/126 khác nhau.

### CN-52b — Thống kê công bố khoa học

**Người dùng:** Khoa, Phòng Đào tạo, BGH. **Hiện tại:** Số91 bài và 2.4 bài/NCS chưa có cách tính thật.

1. **Vị trí:** Xem phần “Thống kê Công bố Khoa học Toàn Trường” trong báo cáo.
2. **Hiển thị:** Hiện số bài theo nhóm tạp chí, tỷ lệ và bình quân; cập nhật khi thay bộ lọc.
3. **Nhập:** Năm, đơn vị, NHD hoặc nhóm NCS khi giao diện quản lý được bổ sung.
4. **Backend:** Lấy bài đã thẩm định, tránh đếm trùng bài đồng tác giả; tính bình quân với mẫu số rõ ràng.
5. **Lưu:** Dùng bài, tác giả và kết quả thẩm định; không tạo thêm bài để đủ số mẫu.
6. **Trả về:** Số bài, phân nhóm, tỷ lệ, số NCS dùng tính và bình quân tương ứng.
7. **Lỗi:** Nhóm rỗng thì hiện0 bài; chưa chốt mẫu số thì chưa có bình quân, không tự trả 2.4.
8. **API:** API-60. WoS/Scopus là tên các hệ thống phân loại, tra cứu công bố; nguồn kiểm tra cần được xác nhận.

### CN-53 — Xuất ba loại báo cáo quản trị

**Người dùng:** Khoa, Phòng Đào tạo, BGH. **Hiện tại:** Ba nút hiện tải CSV mẫu cùng nhánh.

1. **Vị trí:** Bấm “Xuất Báo Cáo Kiểm Định AUN-QA”, “Xuất Báo Cáo Thông tư 18” hoặc “Xuất Dữ Liệu Ba Công Khai”.
2. **Hiển thị:** Hiện đang tạo, xong tải đúng báo cáo; ba nút phải cho ba nội dung tương ứng.
3. **Nhập:** Chọn loại, định dạng, phạm vi và thời điểm theo mẫu báo cáo nhóm đã thống nhất.
4. **Backend:** Lấy số liệu thật, tạo tệp đúng yêu cầu; không gắn tên .xlsx hoặc .pdf cho tệp CSV (tệp bảng có thể mở bằng Excel).
5. **Lưu:** Yêu cầu xuất, bộ lọc, thời điểm, người yêu cầu, kết quả và tệp đã tạo.
6. **Trả về:** Trạng thái đang tạo/hoàn tất/lỗi, tên, loại và đường dẫn tệp.
7. **Lỗi:** Chưa có mẫu hoặc tạo lỗi thì báo, cho thử lại; không báo đã xuất khi chưa có tệp.
8. **API:** API-61 tạo; API-62 kiểm tra và nhận đường dẫn. Cần chốt mẫu từng báo cáo.


## m14 — Phân quyền và nhật ký

### CN-54a — Xem ma trận quyền

**Người dùng:** Phòng Đào tạo theo thanh chức năng m14. **Hiện tại:** Bảng hiện chỉ ghi 6 vai trò, thiếu Hội đồng.

1. **Vị trí:** Mở “Phân quyền & Nhật ký”; xem bảng ai được xem, nộp, chấm hoặc duyệt.
2. **Hiển thị:** Hiện quyền theo tài khoản thật; không lấy việc nút đang ẩn làm bằng chứng đã kiểm quyền.
3. **Nhập:** Không nhập khi xem; “Chuyển đổi vai trò làm việc” dùng chức năng đổi vai trò ở đầu tài liệu.
4. **Backend:** Cung cấp quyền được cấp và kiểm lại mỗi yêu cầu; không cho người dùng tự cấp quyền qua giao diện.
5. **Lưu:** Tài khoản, vai trò và quyền đã được người phụ trách cấu hình.
6. **Trả về:** Vai trò đang dùng, thanh chức năng và thao tác được phép để Frontend hiển thị.
7. **Lỗi:** Không có quyền thì chặn và báo; không mở hồ sơ chỉ vì biết mã của người khác.
8. **API:** API-02 lấy quyền; API-03 đổi vai trò đã có. Không có màn sửa/cấp quyền tài khoản trong demo.

### CN-54b — Xem nhật ký hoạt động

**Người dùng:** Phòng Đào tạo có quyền xem lịch sử. **Hiện tại:** Demo chỉ có nhật ký cục bộ và địa chỉ mạng giả.

1. **Vị trí:** Xem bảng “Nhật Ký Hoạt Động Hệ Thống” trong phân hệ phân quyền.
2. **Hiển thị:** Hiện thời gian, người, vai trò, hành động, hồ sơ liên quan và kết quả.
3. **Nhập:** Chọn thời gian, người hoặc thao tác nếu bộ lọc được bổ sung; không nhập lại nội dung lịch sử.
4. **Backend:** Lấy nhật ký từ máy chủ và chỉ trả người được quyền; mọi lưu/duyệt thật phải ghi lịch sử.
5. **Lưu:** Mỗi thao tác, người thực hiện, ngày giờ, hồ sơ và kết quả; không ghi mật khẩu.
6. **Trả về:** Danh sách và tổng số để chia trang, tìm kiếm; địa chỉ mạng lấy từ hệ thống thật.
7. **Lỗi:** Tải lỗi thì báo; không dùng mảng mẫu hoặc cho sửa/xóa lịch sử bằng màn này.
8. **API:** API-63 đọc. Khi thay đổi nghiệp vụ, Backend tự ghi lịch sử, không cần Frontend gửi tên người để làm căn cứ.

### CN-54c — Làm mới nhật ký

**Người dùng:** Phòng Đào tạo có quyền đọc. **Hiện tại:** Demo chỉ đọc lại bộ nhớ trên thiết bị.

1. **Vị trí:** Bấm “Làm mới” cạnh tiêu đề bảng nhật ký hoạt động.
2. **Hiển thị:** Hiện đang tải rồi thay bảng bằng lịch sử mới; giữ bộ lọc đang dùng.
3. **Nhập:** Không nhập mới; dùng lại khoảng thời gian và các lựa chọn đang xem.
4. **Backend:** Đọc lại lịch sử thật, kiểm quyền; không thêm thao tác giả chỉ vì bấm làm mới.
5. **Lưu:** Không sửa nhật ký cũ; các thao tác nghiệp vụ mới đã được Backend ghi riêng.
6. **Trả về:** Danh sách mới và tổng số; nếu không có thêm thao tác thì bảng có thể giữ nguyên.
7. **Lỗi:** Mất mạng thì báo chưa làm mới được, giữ bảng cũ và ghi rõ chưa phải dữ liệu mới nhất.
8. **API:** Gọi lại API-63, không cần API làm mới riêng.

Việc tải lại bảng không phải phê duyệt hay chỉnh sửa dữ liệu học vụ.

### CN-54d — Xuất nhật ký ra tệp CSV

**Người dùng:** Phòng Đào tạo có quyền xuất. **Hiện tại:** Demo tải được CSV nhưng chỉ từ lịch sử cục bộ.

1. **Vị trí:** Bấm “Xuất Audit Log (CSV)” phía trên phân hệ phân quyền và nhật ký.
2. **Hiển thị:** Chờ tạo tệp rồi tải danh sách thao tác đang được phép xem.
3. **Nhập:** Khoảng thời gian và bộ lọc nếu có; không tự chọn phạm vi ngoài quyền tài khoản.
4. **Backend:** Lấy nhật ký thật, tạo tệp đúng cột; không đưa mật khẩu hoặc thông tin bí mật vào.
5. **Lưu:** Yêu cầu xuất, người yêu cầu, bộ lọc và tệp kết quả; nhật ký gốc giữ nguyên.
6. **Trả về:** Trạng thái tạo, tên tệp và đường dẫn tải khi hoàn tất.
7. **Lỗi:** Không có quyền hoặc lỗi tạo thì báo; không xuất mảng mẫu thay cho dữ liệu thật.
8. **API:** API-61 với loại audit_log; API-62 theo dõi. CSV là tệp bảng dữ liệu có thể mở bằng Excel.

### CN-54x — Quản trị tài khoản và cấp quyền

**Người dùng:** Người quản trị do nhóm xác nhận, chưa có vai trò riêng. **Hiện tại:** Demo chưa có màn quản trị tài khoản.

1. **Vị trí:** Nếu nhóm cần quản trị, phải bổ sung màn tài khoản; nút đổi vai trò demo không phải cấp quyền.
2. **Hiển thị:** Cho người phụ trách xem tài khoản, tình trạng và quyền; thay đổi chỉ có hiệu lực sau máy chủ xác nhận.
3. **Nhập:** Thông tin tài khoản, quyền đề nghị, đơn vị và thời gian áp dụng theo quy định.
4. **Backend:** Kiểm người được phép quản trị; ngăn tự cấp quyền và kết thúc các lần đăng nhập khi cần.
5. **Lưu:** Tài khoản, các quyền, đơn vị, thời hạn và lịch sử người cấp/thay đổi.
6. **Trả về:** Tài khoản và quyền sau cập nhật; Frontend lấy lại thanh chức năng và dữ liệu được phép.
7. **Lỗi:** Sai quyền hoặc tài khoản trùng thì không tạo/sửa; không tin vai trò gửi từ giao diện.
8. **API:** API-01–06 xử lý đăng nhập/tài khoản hiện tại, API-02 đọc quyền. Chưa có API quản trị; cần chốt rồi bổ sung.


## Cổng công khai — Luận án và văn bằng

### CN-57a — Tìm luận án công khai

**Người dùng:** Khách và các vai trò đăng nhập. **Hiện tại:** Hiện có ba luận án mẫu.

1. **Vị trí:** Mở “Công khai”; dùng ô lọc theo tên NCS, chuyên ngành hoặc tên luận án.
2. **Hiển thị:** Hiện danh sách phù hợp; giữ từ khóa khi đổi ngôn ngữ; nếu nhiều kết quả cần chia trang.
3. **Nhập:** Từ khóa; chọn ngành, trang hoặc cách sắp xếp nếu được bổ sung.
4. **Backend:** Chỉ lấy luận án đã được phép công khai; không trả các bản riêng tư hoặc phản biện kín.
5. **Lưu:** Dùng đề tài, lần đăng công khai và tệp đã duyệt; tìm kiếm không tạo luận án.
6. **Trả về:** Tên luận án, NCS, ngành, ngày bảo vệ, ngày đăng và tài liệu được đọc.
7. **Lỗi:** Không thấy thì báo không có kết quả; mất mạng thì báo lỗi, không thay bằng dữ liệu mẫu.
8. **API:** API-58 lấy danh sách. Đường dẫn cấu hình đã có nhưng giao diện hiện chưa gọi API thật.

### CN-57b — Tải tóm tắt hoặc toàn văn luận án

**Người dùng:** Khách và người đăng nhập. **Hiện tại:** Đường dẫn hiện trỏ tới tệp ví dụ.

1. **Vị trí:** Bấm “Tóm tắt PDF” hoặc “Toàn văn PDF” ở từng luận án công khai.
2. **Hiển thị:** Mở hoặc tải đúng tệp của luận án đã chọn; không thay bằng bản khác.
3. **Nhập:** Không nhập thông tin; chọn luận án và loại tài liệu muốn đọc.
4. **Backend:** Kiểm tệp đã được công khai, tìm nội dung thật; không cho tải tệp riêng chỉ bằng đoán mã.
5. **Lưu:** Dùng tệp và liên kết với lần công khai; không cần lưu hồ sơ người đọc để tạo kết quả giả.
6. **Trả về:** Nội dung PDF, tên tệp và loại tài liệu; chỉ hiện nút khi tài liệu được phép có.
7. **Lỗi:** Chưa có toàn văn hoặc tệp không còn thì báo rõ; không dẫn tới example.com.
8. **API:** API-67 tải tệp công khai; API-58 cung cấp danh sách và đường dẫn. Tệp riêng dùng API-66 theo quyền.

### CN-58 — Tra cứu văn bằng và hiển thị phôi 3D

**Người dùng:** Khách, NCS và các vai trò khác. **Hiện tại:** Demo mới đối chiếu ba bản ghi mẫu.

1. **Vị trí:** Nhập tại phần tra cứu rồi bấm “Xuất phôi bằng Tiến sĩ 3D”.
2. **Hiển thị:** Hiện bằng đúng sổ gốc; không thấy thì bỏ kết quả cũ; tên trùng cần cho chọn.
3. **Nhập:** Mã bằng hoặc họ tên; nếu nhập cả hai thì phải đúng cùng người.
4. **Backend:** Tìm sổ bằng thật, xem tình trạng còn hợp lệ hay đã thu hồi; không tạo bằng từ dữ liệu nhập.
5. **Lưu:** Dùng bản ghi bằng đã cấp, số sổ, quyết định và ngày; tra cứu không cấp bằng mới.
6. **Trả về:** Tên, ngành, mã, số sổ, ngày, quyết định và tình trạng; không trả căn cước/địa chỉ riêng.
7. **Lỗi:** Sai mã, sai tên hoặc ghép hai người thì báo không tìm thấy; không xác thực giả.
8. **API:** API-57. Phôi3D là minh họa kết quả trên màn hình, không tự chứng minh ký số hoặc giá trị pháp lý.


## Các trang giới thiệu ngoài hệ thống quản lý

### CN-55 — Xem giới thiệu bảy vai trò

**Người dùng:** Mọi người. **Hiện tại:** Đây là mô phỏng công việc, không đổi người đăng nhập.

1. **Vị trí:** Mở trang “Đối tượng”; bấm một trong bảy nút vai trò.
2. **Hiển thị:** Hiện mô tả nhiệm vụ và thanh khối lượng công việc của vai trò đã chọn.
3. **Nhập:** Không nhập thông tin; chỉ chọn NCS, NHD, Bộ môn, Khoa, Phòng Đào tạo, BGH hoặc HĐ.
4. **Backend:** Không cấp quyền hoặc lấy hồ sơ riêng khi bấm; số công việc thật chỉ làm nếu nhóm yêu cầu thêm.
5. **Lưu:** Không tạo tài khoản hay đổi vai trò thật; nội dung giới thiệu có thể lưu ngay ở Frontend.
6. **Trả về:** Không cần kết quả nghiệp vụ; nếu mở rộng số thật, phải thống nhất cách tính trước.
7. **Lỗi:** Nội dung chưa có thì ghi chưa cập nhật; không dùng85% hay 90%mẫu làm tiến độ thật.
8. **API:** Không có API cho trang mô phỏng; API-07 dùng bàn làm việc thật. TBM/BCNK/PĐT/HĐ chỉ là tên gọi khác.

### CN-56 — Xem lộ trình sáu giai đoạn

**Người dùng:** Mọi người. **Hiện tại:** Các mốc chỉ có nội dung hướng dẫn.

1. **Vị trí:** Mở “Quy trình”; bấm một mốc từ công nhận NCS đến tốt nghiệp, cấp bằng.
2. **Hiển thị:** Mở hộp giải thích giai đoạn và sản phẩm cần có; đóng bằng X hoặc vùng ngoài.
3. **Nhập:** Không nhập gì; lần lượt đọc kế hoạch, học tập, nghiên cứu, đánh giá và hoàn thành.
4. **Backend:** Không tạo hồ sơ hoặc chuyển giai đoạn chỉ vì người dùng xem mốc.
5. **Lưu:** Không lưu kết quả học tập từ hộp hướng dẫn; nội dung có thể giữ ở Frontend.
6. **Trả về:** Không cần dữ liệu Backend cho bản giới thiệu; giai đoạn thật của NCS lấy từ bàn làm việc.
7. **Lỗi:** Nội dung chưa được nhóm chốt phải ghi rõ; không coi các số mẫu là quy định đã xác nhận.
8. **API:** Không có API mở mốc; API-07 dùng khi cần hiện giai đoạn thật của người đăng nhập.

### CN-59a — Trang chủ và các ô mở ứng dụng

**Người dùng:** Mọi người. **Hiện tại:** Trang chủ hiện có các nút chuyển trang.

1. **Vị trí:** Bấm các ô quản lý học vụ, đối tượng, quy trình, công khai, văn bản hoặc giới thiệu.
2. **Hiển thị:** Chuyển đến trang tương ứng; ô quản lý phải tuân theo đăng nhập và quyền.
3. **Nhập:** Không nhập dữ liệu ở ô ứng dụng; chỉ chọn nơi muốn xem.
4. **Backend:** Không tạo nghiệp vụ khi bấm ô; cung cấp quyền và dữ liệu riêng nếu mở phần quản lý.
5. **Lưu:** Không lưu hồ sơ hoặc quyết định mới; nội dung trang chủ do Frontend trình bày.
6. **Trả về:** Không cần kết quả cho chuyển trang; phần có dữ liệu thật sẽ lấy API của trang đích.
7. **Lỗi:** Trang không tồn tại hoặc chưa được mở thì thông báo; không tự chuyển thành người dùng NCS.
8. **API:** Không có API trang chủ riêng; API-02 xác định quyền. Cách điều hướng dùng chung với CN-01.

### CN-59b — Xem văn bản và căn cứ

**Người dùng:** Mọi người. **Hiện tại:** Ba thẻ hiện chưa có liên kết tài liệu gốc.

1. **Vị trí:** Mở “Văn bản”; đọc tên thông tư và các quyết định được liệt kê.
2. **Hiển thị:** Hiện tên, cơ quan và mô tả; không coi bấm thẻ là đã tải tài liệu.
3. **Nhập:** Không nhập gì; nếu nhóm bổ sung đường dẫn thì chọn văn bản muốn đọc.
4. **Backend:** Bản hiện tại không cần xử lý; nếu quản lý tài liệu sau này, phải lưu đúng bản được xác nhận.
5. **Lưu:** Không tạo quyết định đào tạo khi đọc thẻ; hướng dẫn hiện có thể đặt ở Frontend.
6. **Trả về:** Không cần phản hồi nghiệp vụ; tài liệu gốc chỉ cung cấp sau khi có tệp hợp lệ.
7. **Lỗi:** Chưa có tệp thì ghi rõ; không tuyên bố đã đối chiếu quy định chỉ từ tên trên thẻ.
8. **API:** Không có API riêng. Nếu bổ sung tệp thì áp dụng API tải theo quyền, không tự coi văn bản đã công khai.

### CN-59c — Xem giới thiệu hệ thống

**Người dùng:** Mọi người. **Hiện tại:** Nội dung hiện là các thẻ giới thiệu tĩnh.

1. **Vị trí:** Bấm “Giới thiệu” ở thanh bên hoặc ô ứng dụng trên trang chủ.
2. **Hiển thị:** Hiện mục tiêu và mô tả hệ thống; không mở hồ sơ riêng hoặc thay đổi kết quả đào tạo.
3. **Nhập:** Không nhập thông tin; người dùng chỉ đọc nội dung.
4. **Backend:** Không cần xử lý nghiệp vụ; nếu nhóm muốn sửa nội dung qua trang quản trị thì phải bổ sung yêu cầu riêng.
5. **Lưu:** Không thêm tài khoản, quyết định hay dữ liệu NCS khi xem; nội dung có thể giữ ở Frontend.
6. **Trả về:** Không cần kết quả Backend cho trang hiện tại.
7. **Lỗi:** Thiếu nội dung thì báo chưa cập nhật; câu “đáp ứng100%” trên giao diện không thay cho việc kiểm tra thực tế.
8. **API:** Không có API giới thiệu riêng. Việc mở trang vẫn thuộc CN-01; không tạo chức năng quản trị chỉ vì có thẻ mô tả.


## Hỗ trợ và liên hệ

### CN-60a — Mở và đóng hộp hỗ trợ

**Người dùng:** Mọi người. **Hiện tại:** Hộp hỗ trợ đã hoạt động cục bộ.

1. **Vị trí:** Bấm “Hỗ trợ & Liên hệ” nổi ở góc trang; các lựa chọn Zalo, Facebook và trợ lý hiện ra.
2. **Hiển thị:** Mở danh sách; bấm ngoài để đóng; chọn kênh thì thực hiện đúng hướng dẫn ở các mục sau.
3. **Nhập:** Không nhập thông tin chỉ để mở danh sách kênh hỗ trợ.
4. **Backend:** Không cần gọi máy chủ hoặc gửi yêu cầu học vụ khi mở/đóng hộp.
5. **Lưu:** Không tạo đơn, tin nhắn hay kết quả đánh giá; cấu hình kênh hiện nằm ở Frontend.
6. **Trả về:** Không có kết quả nghiệp vụ; Frontend tự hiển thị các kênh.
7. **Lỗi:** Thiếu cấu hình kênh thì ghi chưa có; không mở đường dẫn hoặc gửi tới địa chỉ tự đoán.
8. **API:** Không có API riêng. Hộp hỗ trợ chỉ là điểm mở các kênh, không phải chức năng gửi email nhắc hạn.

### CN-60b — Xem liên hệ Zalo

**Người dùng:** Mọi người. **Hiện tại:** Demo chỉ hiện số điện thoại mẫu.

1. **Vị trí:** Mở hộp hỗ trợ rồi bấm “Chat qua Zalo Hỗ trợ”.
2. **Hiển thị:** Hiện thông tin liên hệ; chỉ mở đường dẫn Zalo thật khi nhóm đã xác nhận.
3. **Nhập:** Không nhập đơn hoặc nội dung học vụ tại nút; nhắn tin thật là thao tác riêng của người dùng.
4. **Backend:** Bản demo không cần xử lý tin nhắn; không tự gửi dữ liệu hồ sơ qua Zalo.
5. **Lưu:** Không lưu cuộc trò chuyện hay hồ sơ từ thao tác này; địa chỉ liên hệ cần được người phụ trách xác nhận.
6. **Trả về:** Không có phản hồi Backend; Frontend hiện số/đường dẫn đúng cấu hình.
7. **Lỗi:** Chưa có liên hệ thật thì thông báo; không coi 098.765.4321là số hỗ trợ chính thức.
8. **API:** Không có API Zalo trong tài liệu kỹ thuật. Kết nối nhắn tin chỉ làm nếu nhóm bổ sung phạm vi.

### CN-60c — Xem liên hệ Facebook

**Người dùng:** Mọi người. **Hiện tại:** Demo mới thông báo tên trang, chưa mở hội thoại.

1. **Vị trí:** Trong hộp hỗ trợ, bấm lựa chọn Facebook hoặc Messenger.
2. **Hiển thị:** Hiện thông tin trang; có thể mở trang liên hệ thật sau khi nhóm xác nhận đường dẫn.
3. **Nhập:** Không nhập dữ liệu hồ sơ; nếu muốn liên hệ thì người dùng tự thao tác trên trang được mở.
4. **Backend:** Không cần xử lý ở Backend cho bản hiện tại; không tự gửi tin nhắn hoặc nội dung luận án.
5. **Lưu:** Không tạo yêu cầu học vụ, không lưu hội thoại Facebook; giữ thông tin liên hệ đã được xác nhận.
6. **Trả về:** Không có kết quả nghiệp vụ; Frontend dùng tên và liên kết đúng.
7. **Lỗi:** Thiếu liên kết thì báo chưa cấu hình, không mở trang tự đoán theo tên.
8. **API:** Không có API Facebook trong bộ kỹ thuật; việc tích hợp nhắn tin thật phải được nhóm thống nhất riêng.

### CN-60d — Hỏi trợ lý trong giao diện

**Người dùng:** Mọi người. **Hiện tại:** Trợ lý hiện trả lời bằng nội dung đặt sẵn.

1. **Vị trí:** Chọn “AI Trợ lý Học thuật”, nhập câu rồi “Gửi”/Enter; hoặc bấm bốn câu hỏi gợi ý; X đóng hộp.
2. **Hiển thị:** Hiện câu hỏi và câu trả lời trong cuộc trò chuyện; nội dung này không thay đổi hồ sơ.
3. **Nhập:** Câu hỏi ngắn về hệ thống, quy trình, điều kiện bảo vệ hoặc tra cứu bằng.
4. **Backend:** Không cần dịch vụ trí tuệ nhân tạo cho bản demo; câu trả lời do Frontend chọn từ nội dung sẵn.
5. **Lưu:** Không có yêu cầu lưu hội thoại hay hồ sơ ở Backend trong phạm vi hiện tại.
6. **Trả về:** Không có API trả lời; chỉ hiện hướng dẫn cơ bản, không kết luận điều kiện riêng của NCS.
7. **Lỗi:** Câu hỏi chưa có trả lời thì nêu giới hạn; quy định chưa chốt không nói chắc chắn.
8. **API:** Không có API trợ lý. AI nghĩa là trí tuệ nhân tạo, nhưng chức năng hiện tại chỉ mô phỏng.

## Các nút tải nhỏ: tài liệu nào phải đi cùng hàng nào?

Tất cả dùng hướng dẫn CN-13, nhưng bạn Backend phải trả đúng tệp tương ứng. Các hàng cùng tên nút vẫn là các tài liệu khác nhau.

| Phân hệ | Nút/tài liệu | API |
|---|---|---|
| m01 | Tải hồ sơ số(PDF); File đơn/tên tệp ở lịch sử gia hạn | API-61/62 tạo hồ sơ; API-66 tải từng đơn |
| m02 | Tải Khung CTĐT | API-15 trả tệp khung; API-66 tải |
| m05 | Tải Tiểu luận, Tải Biên bản, Tải Đề cương, Bản giải trình | API-27 trả đúng tệp; API-66 tải |
| m06 | Biên bản từng chuyên đề1/2/3; Tải sổ biên bản | API-31+API-66 từng bản; API-61/62 cả sổ |
| m07 | File ở từng kỳ báo cáo 1/2/3/4 và các kỳ được bổ sung | API-34 trả tệp đúng kỳ; API-66 tải |
| m08 | Minh chứng từng bài báo | API-40 trả tệp; API-66 tải; demo hiện thay bảng nên nút có thể biến mất |
| m09 | Tải về v1/v2; Tải bản chính v3; những bản mới | API-43 trả tệp đúng bản; API-66 tải |
| m10 | Quyết định thành lập HĐ; Tải Nghị quyết HĐ/biên bản | API-49 trả tài liệu; API-66 tải |
| m11 | Giấy TV ĐHAG; Giấy TV Quốc Gia | API-53 trả đúng biên nhận; API-66 tải |
| m12 | Xem QĐ, Biên bản, Chi tiết đơn tại từng biến động | API-12 trả tài liệu đúng đơn; API-66 tải |
| Công khai | Tóm tắt PDF, Toàn văn PDF tại từng luận án | API-58 trả tệp công khai; API-67 tải |
| m13, m14 | Ba báo cáo quản trị; Xuất Audit Log (CSV) | API-61 tạo đúng loại; API-62 theo dõi và lấy tệp |

## Những điều hai bạn cần hỏi nhóm trước khi làm phần phụ thuộc

Đây là những chỗ chưa có câu trả lời thống nhất, không phải bạn Backend phải tự đoán. Xem đầy đủ27 câu trong [08-CAU-HOI-CAN-XAC-NHAN.md](08-CAU-HOI-CAN-XAC-NHAN.md).

| Cần thống nhất | Vì sao chưa nên lấy số mẫu làm quy định | Mã câu hỏi |
|---|---|---|
| Quyền và thứ tự duyệt | Bảy vai trò nhưng ma trận sáu; Khoa thấy nút duyệt kế hoạch nhưng chưa có bước. | Q-02, Q-03 |
| Chương trình/tín chỉ | Có 12 và 24 tín chỉ ở những chỗ khác nhau; khung 90 chưa áp dụng được cho mọi đầu vào. | Q-04, Q-06 |
| Định mức NHD | Có hai bộ giới hạn 3/2/1 và 4/3/3 trong demo. | Q-05 |
| Tiểu luận, đề cương, chuyên đề | Ngưỡng, chữ ký, giải trình, số 2 hay 3 chuyên đề và điều kiện năm 1 chưa đủ căn cứ. | Q-07, Q-09 |
| Công bố | Hai bài hay tổng 0.75 điểm; NHD/PDT duyệt một hay hai cấp; cách tính đóng góp. | Q-08 |
| Báo cáo và hạn học | Kỳ 1–4/5–6/7 không thống nhất; tạm dừng/gia hạn đổi thời hạn thế nào. | Q-10, Q-12, Q-13 |
| Số liệu và phần trăm | 68%, 48/126 NCS, 2.4 bài/NCS chưa có cách tính, phạm vi rõ. | Q-14 |
| Luận án/bảo vệ | Khóa bản, ký số, tương đồng, ngoại ngữ, hội đồng, phiếu và công khai phải chốt. | Q-15–Q-20 |
| Sau bảo vệ/bằng | Hai hay ba nơi lưu chiểu, hạn, chữ ký, tài chính và điều kiện cấp bằng. | Q-21, Q-22 |
| Tệp, báo cáo, nhật ký và việc thiếu UI | Dung lượng, mẫu báo cáo, quyền/lưu lịch sử, import/quản trị và cách kết nối. | Q-23–Q-27 |

## Đối chiếu để không bỏ sót chức năng

87 mục trên bao phủ đủ 60 nhómCN trong bộ kỹ thuật, bao gồm 6 mục x nói rõ khoảng trống cần chốt. Những nút đóng/Hủy/ngoài hộp dùng CN-07a; ô chọn tệp dùng CN-07b; các nút tải dùng CN-13 và bảng tải nhỏ. Ba nút chấm chuyên đề, bốn nút Đạt báo cáo, bảy lựa chọn vai trò và các nút tạo động được giải thích theo nhóm, hồ sơ từng hàng vẫn phải có mã riêng.

Khi hai bạn thử cùng nhau, cần đăng nhập lần lượt đủ 7 vai trò, xem quyền mở trang và thử xem hồ sơ ngoài phạm vi. Sau một thao tác lưu, đổi thiết bị hoặc tải lại trang phải còn dữ liệu. Khi máy chủ lỗi, giữ nội dung nhập và không báo thành công. Chỉ xem giới thiệu, sơ đồ, chuyển trang hay đóng hộp không được làm thay đổi hồ sơ.

## Bảng chia công việc Backend theo thứ tự nên làm

Nếu có hai bạn Backend, có thể dùng cột “Gợi ý phụ trách”; đổi người theo nhóm thực tế. “Làm sau” là việc cần có nền tảng hoặc quyết định trước, không phải thời gian cố định. Chi tiết kỹ thuật tương ứng ở [07-CHECKLIST-BACKEND.md](07-CHECKLIST-BACKEND.md).

| Thứ tự | Công việc | Gợi ý phụ trách | Làm sau | Đối chiếu kỹ thuật | Xong khi |
|---|---|---|---|---|---|
| 1 | Cùng chốt phạm vi/quy định; đánh dấu việc thiếu UI | Cả nhóm | Trước phần phụ thuộc | Q-01–Q-27; BE-01/22 | Có câu trả lời ghi lại; không tự dùng số mẫu. |
| 2 | Đăng nhập, đăng xuất, đổi vai trò, quên mật khẩu và quyền hồ sơ | Bạn Backend A | Sau 1 | API-01–06; BE-02 | Bảy vai trò đúng; người A không lấy hồ sơ B. |
| 3 | Tạo dữ liệu nền: đơn vị, ngành, khóa, chương trình, hồ sơ | Bạn Backend B | Sau 1; phối hợp 2 | API-08/09/15/68; BE-03/06 | Mã và quan hệ thống nhất, danh mục thật. |
| 4 | Tải tệp lên/xuống; kiểm quyền và loại/dung lượng | Bạn Backend A | Có tài khoản và hồ sơ | API-64–67; BE-04 | Tệp có nội dung thật, không tải được tệp kín. |
| 5 | Lịch sử thao tác và nền gửi thông báo | Bạn Backend A | Sau 2/3 | API-63/38/39; BE-05 | Lưu đúng người/ngày; lỗi gửi được báo, không gửi trùng. |
| 6 | Tìm/lọc/chia trang hồ sơ, sửa liên hệ | Bạn Backend B | Sau 2/3 | API-08–11; BE-06 | Đúng hàng/đúng quyền; lưu rồi tải lại vẫn đúng. |
| 7 | Kế hoạch, các bản, mốc và ba bước duyệt | Bạn Backend B | Sau 5/6; chốt Q-03/04 | API-16–18; BE-07 | Không vượt bước; giữ bản cũ. |
| 8 | NHD, định mức và phân công | Bạn Backend A | Sau 3/5/6; chốt Q-05 | API-19–21; BE-08 | Không trùng chính/phụ, không tăng số vì gửi lặp. |
| 9 | Học phần, đăng ký/hủy, điểm và đồng bộ | Bạn Backend B | Sau 3/6; chốt Q-06 | API-22–26; BE-09 | Đăng ký khác đạt tín chỉ; điểm trung bình có cách tính. |
| 10 | Tiểu luận, đề cương, chuyên đề và đánh giá | Bạn Backend B | Sau 4/5/9; chốt Q-07/09 | API-27–33; BE-10 | Nhận xét/biên bản được lưu, không tự đạt mọi điểm. |
| 11 | Kỳ báo cáo, nộp, chấm, cảnh báo và nhắc email | Bạn Backend A | Sau 4/5/7; chốt Q-10/11 | API-34–39; BE-11 | Đúng kỳ/hạn, báo rõ gửi thành công hay lỗi. |
| 12 | Bài báo, tác giả, thẩm định và tổng chuẩn đầu ra | Bạn Backend A | Sau 4/5; chốt Q-08 | API-40–42; BE-12 | NCS không tự duyệt; bài chờ không cộng điểm. |
| 13 | Đơn biến động, duyệt/quyết định và áp dụng | Bạn Backend B | Sau 5/6/8; chốt Q-12/13 | API-12–14; BE-16 | Chỉ quyết định cuối mới đổi hạn/tên/phân công. |
| 14 | Bản luận án, tương đồng, NHD đồng ý | Bạn Backend A | Sau 4/5/8; chốt Q-15/16 | API-43–47; BE-13 | Không ghi đè bản chốt, không phần trăm/ký số giả. |
| 15 | Điều kiện bảo vệ, hồ sơ, HĐ/phản biện, lịch/công khai, phiếu | Hai bạn chia theo hồ sơ/phiếu | Sau 7–14; chốt Q-17–20 | API-48–52; BE-14/15 | Thiếu chứng cứ chưa đạt; chốt API ghi phần thiếu UI. |
| 16 | Hồ sơ sau bảo vệ, xác nhận, lưu chiểu, cấp bằng và sổ | Bạn Backend B | Sau 15; chốt Q-21 | API-53–57; BE-17 | Thiếu điều kiện không cấp; bấm lại chỉ có một bằng. |
| 17 | Cổng công khai, tìm luận án, tra bằng, tải PDF | Bạn Backend A | Sau 4/15/16 | API-57/58/67; BE-18 | Không tìm thấy không tạo phôi; tệp công khai đúng quyền. |
| 18 | Bàn làm việc và các thống kê | Hai bạn mỗi người phần dữ liệu mình | Khi đã có dữ liệu thật; chốt Q-14 | API-07/11/59/60; BE-19 | Số liệu có nguồn, ngày/tỷ lệ đúng phạm vi. |
| 19 | Xuất hồ sơ, ba báo cáo và nhật ký | Bạn Backend B | Sau 4/18; chốt mẫu Q-23 | API-61/62; BE-20 | Ba nội dung đúng; tệp PDF/XLSX/CSV thật. |
| 20 | Ghép Frontend, thử đủ vai trò, lỗi và từng nút nhỏ | Hai bạn Backend + mình Frontend | Từng phần hoàn thành, kiểm lại cuối | BE-21; CN-01–60 | Không dùng mẫu thay dữ liệu thật; 9 tài liệu cũ giữ nguyên. |


