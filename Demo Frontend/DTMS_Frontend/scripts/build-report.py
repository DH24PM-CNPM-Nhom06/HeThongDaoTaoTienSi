"""Xuất báo cáo bàn giao PDF từ bằng chứng kiểm thử đã lưu; không thay dữ liệu ứng dụng."""
from pathlib import Path
import json
import html
import re

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, KeepTogether

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "output" / "pdf"
OUTPUT.mkdir(parents=True, exist_ok=True)
PDF = OUTPUT / "BAO_CAO_HOAN_THIEN_FRONTEND_2026-10-18.pdf"
summary = json.loads((ROOT / "docs/TEST_SUMMARY_2026-10-18.json").read_text(encoding="utf-8"))
status = json.loads((ROOT / "docs/ISSUE_STATUS_2026-10-18.json").read_text(encoding="utf-8"))
changes = json.loads((ROOT / "docs/CHANGESET_2026-10-18.json").read_text(encoding="utf-8"))
assert all(suite["passed"] == suite["total"] for browser in summary["summary"] for suite in browser["suites"])
total_passed = sum(suite["passed"] for browser in summary["summary"] for suite in browser["suites"])
assert total_passed == 212 and status["total"] == 64

pdfmetrics.registerFont(TTFont("Arial", "C:/Windows/Fonts/arial.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Bold", "C:/Windows/Fonts/arialbd.ttf"))
pdfmetrics.registerFontFamily("Arial", normal="Arial", bold="Arial-Bold", italic="Arial", boldItalic="Arial-Bold")
NAVY = colors.HexColor("#0b3866")
BLUE = colors.HexColor("#1d65b2")
INK = colors.HexColor("#183047")
MUTED = colors.HexColor("#526578")
LINE = colors.HexColor("#d8e2ec")
LIGHT = colors.HexColor("#f0f6fc")
AMBER = colors.HexColor("#fff5df")
WIDTH = 178 * mm
styles = {
    "title": ParagraphStyle("title", fontName="Arial-Bold", fontSize=23, leading=29, textColor=NAVY, spaceAfter=12),
    "h1": ParagraphStyle("h1", fontName="Arial-Bold", fontSize=17, leading=22, textColor=NAVY, spaceAfter=12),
    "h2": ParagraphStyle("h2", fontName="Arial-Bold", fontSize=11.5, leading=16, textColor=NAVY, spaceBefore=10, spaceAfter=6),
    "body": ParagraphStyle("body", fontName="Arial", fontSize=9.5, leading=14.5, textColor=INK, spaceAfter=8),
    "small": ParagraphStyle("small", fontName="Arial", fontSize=8.3, leading=12, textColor=MUTED, spaceAfter=6),
    "cell": ParagraphStyle("cell", fontName="Arial", fontSize=8.4, leading=12, textColor=INK),
    "head": ParagraphStyle("head", fontName="Arial-Bold", fontSize=8.6, leading=12, textColor=colors.white),
    "metric": ParagraphStyle("metric", fontName="Arial-Bold", fontSize=23, leading=30, textColor=NAVY, alignment=TA_CENTER),
    "metriclabel": ParagraphStyle("metriclabel", fontName="Arial", fontSize=8.1, leading=12, textColor=MUTED, alignment=TA_CENTER),
}


def clean(text):
    return re.sub("[\u2010-\u2015\u2212]", "-", str(text))


def p(text, style="body"):
    return Paragraph(html.escape(clean(text)).replace("\n", "<br/>"), styles[style])


def table(headers, rows, widths):
    data = [[p(value, "head") for value in headers]] + [[p(value, "cell") for value in row] for row in rows]
    result = Table(data, colWidths=[value * mm for value in widths], repeatRows=1, hAlign="LEFT")
    result.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, LINE),
    ]))
    return result


def note(text):
    result = Table([[p(text)]], colWidths=[WIDTH])
    result.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), AMBER), ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#e7c889")), ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12), ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 4)]))
    return result


def page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, A4[1] - 12 * mm, A4[0], 12 * mm, fill=1, stroke=0)
    canvas.setFont("Arial-Bold", 8)
    canvas.setFillColor(colors.white)
    canvas.drawString(16 * mm, A4[1] - 7.6 * mm, "DTMS  |  BÀN GIAO FRONTEND")
    canvas.setFont("Arial", 8)
    canvas.drawRightString(A4[0] - 16 * mm, A4[1] - 7.6 * mm, "18/10/2026")
    canvas.setStrokeColor(LINE)
    canvas.line(16 * mm, 14 * mm, A4[0] - 16 * mm, 14 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Arial", 7.5)
    canvas.drawString(16 * mm, 9 * mm, "Frontend/demo đã kiểm thử - API thật và Safari thật chưa nghiệm thu")
    canvas.drawRightString(A4[0] - 16 * mm, 9 * mm, f"Trang {doc.page:02d}")
    canvas.restoreState()


story = [p("Rà soát và hoàn thiện\nfrontend DTMS", "title"), p("Báo cáo kết quả Phiên 1 và Phiên 2", "h2"), p("Website quản lý đào tạo sau đại học - phạm vi mã hiện có: đào tạo tiến sĩ, 10 view và 14 phân hệ.")]
metric_data = [[p("64", "metric"), p("55", "metric"), p("212/212", "metric"), p("400", "metric")], [p("Mục rà soát", "metriclabel"), p("Xong frontend/demo", "metriclabel"), p("Nhóm test đạt", "metriclabel"), p("Trường hợp modal", "metriclabel")]]
metrics = Table(metric_data, colWidths=[WIDTH / 4] * 4)
metrics.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), LIGHT), ("TOPPADDING", (0, 0), (-1, 0), 12), ("BOTTOMPADDING", (0, 1), (-1, 1), 12)]))
story += [Spacer(1, 6 * mm), metrics, Spacer(1, 8 * mm), p("Kết quả bàn giao", "h2"), p("Đã thực hiện phần giao diện, responsive, chức năng và kiểm tra cuối của cả hai phiên. Giữ HTML/CSS/JavaScript thuần, màu xanh đại học, font Be Vietnam Pro và cấu trúc màn hình hiện có; không dựng lại website."), p("Đã sửa các lỗi XSS, lưu thất bại vẫn báo thành công, form chấm điểm bị chặn, quota tự giảm, nộp lại vẫn giữ kết quả Đạt và xét cấp bằng thiếu điều kiện."), p("Trạng thái 64 mục: 55 xong frontend/demo, 6 hoàn thành một phần, 3 chờ backend. Chi tiết từng mã nằm trong TODO.md và ISSUE_STATUS_2026-10-18.json."), Spacer(1, 4 * mm), note("Chưa phải bản nghiệp vụ sản xuất: backend login và diploma vẫn là stub, các API học vụ/tệp chưa có trong ZIP. API trong kiểm thử là giả lập. WebKit không thay thế Safari thật."), p("Nguồn và bản sao", "h2"), p("Project được sao lưu trước sửa trong thư mục DTMS-backups bên cạnh Demo Frontend. Audit, ảnh trước sửa và SHA-256 nguồn được giữ nguyên. ZIP backend không bị chỉnh sửa.", "small")]

story += [PageBreak(), p("01  Giao diện và responsive", "h1"), p("Đã giữ thiết kế hiện có và sửa các phần bị tràn hoặc thiếu trạng thái. Chưa có Figma/bản thiết kế cuối để xác nhận từng pixel."), table(["Phần sửa", "Hành vi sau sửa"], [
    ("Shell / điều hướng", "Có main/skip link, đủ đường vào 10 view, URL trực tiếp, Back/Forward; trang tách về SPA dùng chung."),
    ("Mobile / bảng", "Hamburger, backdrop và đóng bằng Escape; bảng cuộn trong vùng riêng, form/select không tràn trên WebKit."),
    ("Component", "Dùng chung validation, dialog, bảng và danh sách thẻ tìm/lọc/sort/page; có rỗng, loading, lỗi và thử lại."),
    ("Bàn phím / focus", "Modal có nhãn, giữ Tab, trả focus; nội dung ẩn không nhận focus; nút, link và input có trạng thái focus."),
], [37, 141]), Spacer(1, 6 * mm)]
desktop = Image(str(ROOT / "docs/final-1440-chromium.png"), width=137 * mm, height=95.14 * mm)
mobile = Image(str(ROOT / "docs/final-360-chromium.png"), width=34 * mm, height=94.44 * mm)
photos = Table([[desktop, mobile], [p("1440px - bố cục desktop", "small"), p("360px", "small")]], colWidths=[142 * mm, 36 * mm])
photos.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0)]))
story += [photos, p("Đã kiểm 360/768/1024/1440px; mở rộng thêm 320/390/430/1366/1920px. Không tự thay palette, ảnh campus hoặc framework.", "small")]

modules = [
    ("M01", "CRUD, mã/email trùng, scope NCS/NHD, reload, sao lưu và xác nhận xóa.", "Xong demo"),
    ("M02", "Lưu/hiện kế hoạch; duyệt NHD → BM → PDT; bản mới chờ duyệt.", "Xong demo"),
    ("M03", "Quota không reset/tăng lặp; phân công theo ID, chặn chính/phụ trùng.", "Xong demo"),
    ("M04", "Đăng ký/hủy có lưu, kiểm quyền; tín chỉ/GPA tính từ hàng điểm.", "Xong demo"),
    ("M05", "Tiểu luận nộp lại chờ chấm; điểm/nhận xét; đề cương có duyệt demo.", "Xong demo"),
    ("M06", "Sửa form capture; điểm thấp không Đạt; lưu nhận xét và lịch sử.", "Xong demo"),
    ("M07", "Đủ 6 kỳ, kết luận/nhận xét giữ sau reload; nhắc hạn ghi đúng nguồn.", "Xong demo"),
    ("M08", "DOI chống trùng; sửa/xóa bản chờ, khóa bản duyệt; thẩm định có quyền.", "Xong demo"),
    ("M09", "Phiên bản/metadata hiển thị; xác nhận NHD không giả chữ ký số.", "Xong demo"),
    ("M10", "12 TC mẫu không tự thành 24; điều kiện/phiếu có kiểm; hội đồng thật cần server.", "Một phần"),
    ("M11", "Chặn thiếu tín chỉ/NHD/phiếu/hồ sơ; chặn ghi quyết định lặp.", "Xong demo"),
    ("M12", "Đơn mới lưu/hiện trên bảng; quyết định và áp dụng chính thức cần backend.", "Một phần"),
    ("M13", "Tra cứu đúng view; ba CSV khác nội dung, lấy state; thống kê cập nhật.", "Xong client"),
    ("M14", "Ma trận 7 vai trò; nhật ký escape; CSV chống công thức, nhãn cục bộ.", "Xong client"),
]
story += [PageBreak(), p("02  Chức năng và dữ liệu", "h1"), p("Phiên demo không thu mật khẩu thật; có nhớ email, đăng xuất và kiểm quyền handler. Xác thực/tài khoản thật là phần còn phụ thuộc backend."), table(["Module", "Kết quả", "Trạng thái"], modules, [18, 128, 32]), Spacer(1, 4 * mm), p("Schema 3 giữ khóa dữ liệu cũ. Hồ sơ và workflowSubmissions lưu cùng state; lỗi ghi rollback và giữ form. Tệp chỉ lưu metadata, không giả upload/email/ký số/Turnitin.", "small")]

matrix = []
names = {"chromium": "Chromium", "msedge": "Edge", "firefox": "Firefox portable", "webkit": "WebKit Windows"}
for browser in summary["summary"]:
    matrix.append((names[browser["browser"]], *[f"{suite['passed']}/{suite['total']}" for suite in browser["suites"]], "53/53"))
story += [PageBreak(), p("03  Kiểm thử và nghiệm thu", "h1"), table(["Engine", "Chức năng", "Workflow/API", "Hồi quy", "Tổng"], matrix, [44, 32, 38, 32, 32]), Spacer(1, 5 * mm), p("400 trường hợp dialog", "h2"), p("25 modal × 4 viewport × 4 engine. Kiểm giới hạn ngang, kích thước và vùng nội dung; bàn phím/focus/Escape được kiểm theo luồng. Đã xử lý select native và nhóm lọc gây tràn trên WebKit."), p("Các nhánh lỗi đã kiểm", "h2"), p("XSS tên tệp/tiêu đề; DOI/mã trùng; JSON hỏng/thiếu trường; lỗi ghi bộ nhớ; tệp sai/rỗng/quá cỡ; quyền sai; gửi kép; API 500/JSON/schema/timeout/URL nguy hiểm; diploma không khớp hoặc không tìm thấy."), note("212 nhóm là kiểm thử client với API mock trong context riêng. Không ghi nhận pageerror trong các luồng đã chạy. Chưa có server/database thật, Safari macOS/iOS hoặc thiết bị vật lý để nghiệm thu."), p("Checklist người dùng", "h2")]
for item in ["Mở 4 viewport; thử menu, bảng cuộn và modal bằng bàn phím.", "Mở/thoát phiên NCS/NHD/PDT, reload và thử vào quản lý sau thoát.", "CRUD một hồ sơ mới; thử mã trùng, lọc rỗng, sort và phân trang.", "Duyệt kế hoạch đúng ba cấp; phân công trùng không đổi quota.", "Chấm điểm thấp, đánh giá cần sửa, nộp lại và kiểm sau reload.", "Kiểm bảng 12 TC mẫu; thiếu điều kiện phải chặn cấp bằng.", "Tải ba CSV và JSON; tra cứu chưa có server không báo bằng hợp lệ."]:
    story.append(p("[ ] " + item, "small"))

pending_rows = []
for issue in status["issues"]:
    if issue["state"] != "done":
        pending_rows.append((issue["id"], "Chờ backend" if issue["state"] == "backend" else "Một phần", issue["note"]))
story += [PageBreak(), p("04  Các phụ thuộc còn mở", "h1"), p("Không đánh dấu các phần dưới đây là hoàn thành đầu cuối chỉ vì UI có nút. 55 mục xong là trong phạm vi frontend/demo."), table(["Mã", "Trạng thái", "Việc còn cần"], pending_rows, [26, 29, 123]), p("Phạm vi cần dữ liệu/quy tắc riêng", "h2"), p("Source hiện chủ yếu phục vụ tiến sĩ. Chưa có model/API/quy tắc chương trình thạc sĩ hoặc luồng tuyển sinh mới. Không tự áp điều kiện tiến sĩ hoặc tạo tài khoản xác thực giả."), p("Cấu hình diploma", "h2"), p("Client dùng GET /api/Public/diploma?code=&name= theo DTO của ZIP; DEGREE_SERVICE_READY mặc định false. Chỉ bật khi backend bỏ IsValid=true cố định và có truy vấn sổ gốc tin cậy.", "small")]

source_rows = [
    ("Shell / CSS", "index.html\ncss/responsive.css"),
    ("Core", "js/core/config.js\njs/core/api.js\njs/core/app.js"),
    ("Feature đã sửa", "js/features/assistant.js\njs/features/degree-lookup.js\njs/features/public-theses.js"),
    ("Quản lý", "js/modules/management.js"),
    ("11 trang tách", "pages/index.html, home.html, profile.html, management.html, roles.html, roadmap.html, notifications.html, public.html, lookup.html, citations.html, about.html"),
    ("Test đã sửa", "scripts/check-all.cjs\nscripts/check-frontend.cjs\nscripts/check-integration.cjs"),
    ("3 file thêm", "js/features/collections.js\njs/features/notifications.js\nscripts/check-regressions.cjs"),
]
story += [PageBreak(), p("05  File thay đổi và bàn giao", "h1"), p(f"Đối chiếu SHA-256 trước sửa: {len(changes['changed'])} tệp mã nguồn sửa, {len(changes['added'])} tệp thêm. Data/UI dùng chung có sẵn được nối lại; không nạp hai bộ JS song song."), table(["Nhóm", "File"], source_rows, [38, 140]), p("Tài liệu và bằng chứng", "h2"), p("TODO.md: 64 mã và trạng thái. PROGRESS.md: tiến độ/quy ước. API-INTEGRATION.md: hợp đồng hiện hành. docs/TESTING.md: cách chạy. docs/TEST_SUMMARY_2026-10-18.json và các TEST_*: bằng chứng. Báo cáo Markdown chứa checklist và chi tiết. Công cụ tái xuất: scripts/build-report.py.", "small"), p("Chạy frontend", "h2"), p("node scripts/serve.cjs\nhttp://127.0.0.1:4173", "small"), p("Chạy kiểm thử", "h2"), p("node scripts/check-all.cjs chromium msedge firefox webkit\nMáy này cần DTMS_FIREFOX_EXECUTABLE trỏ binary portable đã dùng; xem PROGRESS.md. Các package kiểm thử không là dependency khi chạy frontend.", "small"), p("Phiên tiếp theo", "h2"), p("Đọc PROGRESS.md, các mã còn mở trong TODO và API contract. Ưu tiên backend auth/scope/tệp trước khi nối mutation thật; giữ migration và không reset dữ liệu người dùng để né lỗi.", "small")]

document = SimpleDocTemplate(str(PDF), pagesize=A4, rightMargin=16 * mm, leftMargin=16 * mm, topMargin=22 * mm, bottomMargin=22 * mm, title="Báo cáo hoàn thiện frontend DTMS - 18/10/2026", author="DTMS Frontend Review")
document.build(story, onFirstPage=page, onLaterPages=page)
from pypdf import PdfReader
reader = PdfReader(str(PDF))
assert len(reader.pages) == 6, f"Unexpected page count: {len(reader.pages)}"
assert "212/212" in "\n".join(page.extract_text() for page in reader.pages)
print(f"PDF: {PDF} ({len(reader.pages)} pages)")
try:
    import fitz
    render = ROOT / "tmp/pdfs/review"
    render.mkdir(parents=True, exist_ok=True)
    with fitz.open(str(PDF)) as doc:
        for number, sheet in enumerate(doc):
            sheet.get_pixmap(matrix=fitz.Matrix(1.3, 1.3)).save(str(render / f"page-{number + 1}.png"))
    print(f"Rendered previews: {render}")
except ImportError:
    import shutil
    import subprocess
    import sys
    bundled = Path(sys.executable).parent.parent / "native/poppler/Library/bin/pdftoppm.exe"
    executable = shutil.which("pdftoppm") or (str(bundled) if bundled.exists() else None)
    if executable:
        render = ROOT / "tmp/pdfs/review"
        render.mkdir(parents=True, exist_ok=True)
        subprocess.run([executable, "-r", "100", "-png", str(PDF), str(render / "page")], check=True)
        print(f"Rendered previews: {render}")
    else:
        print("PDF written; rendering requires PyMuPDF or Poppler.")
