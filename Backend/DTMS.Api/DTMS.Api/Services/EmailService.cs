using System.Net;
using System.Net.Mail;

namespace DTMS.Api.Services
{
    // Gửi email qua SMTP. Cấu hình ở mục "Smtp" trong appsettings.json, mật khẩu đặt trong User Secrets.
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task GuiAsync(string denEmail, string tieuDe, string noiDung)
        {
            var host = _config["Smtp:Host"];
            if (string.IsNullOrWhiteSpace(host))
            {
                throw new InvalidOperationException("Chưa cấu hình Smtp:Host.");
            }

            using var message = new MailMessage
            {
                From = new MailAddress(_config["Smtp:From"] ?? "no-reply@dtms.local", _config["Smtp:FromName"] ?? "DTMS"),
                Subject = tieuDe,
                Body = noiDung,
                IsBodyHtml = false
            };
            message.To.Add(denEmail);

            using var client = new SmtpClient(host, _config.GetValue<int>("Smtp:Port", 587))
            {
                EnableSsl = _config.GetValue<bool>("Smtp:EnableSsl", true),
                Credentials = new NetworkCredential(_config["Smtp:User"], _config["Smtp:Password"])
            };

            await client.SendMailAsync(message);
        }
    }
}