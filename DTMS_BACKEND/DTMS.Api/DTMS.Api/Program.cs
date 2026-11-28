using DTMS.Api.Filters;
using DTMS.Api.Models;
using DTMS.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Ghi nhật ký mọi thao tác ghi dữ liệu và đăng nhập
builder.Services.AddScoped<AuditFilter>();
builder.Services.AddControllers(options =>
{
    options.Filters.AddService<AuditFilter>();
});

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập 'Bearer' [khoảng trắng] và chuỗi Token. Ví dụ: Bearer eyJhb...",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<DtmsDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddTransient<EmailService>();

// Chỉ chạy dịch vụ nhắc nộp báo cáo khi được bật
if (builder.Configuration.GetValue<bool>("NhacNopBaoCao:Enabled"))
{
    builder.Services.AddHostedService<NhacNopBaoCaoService>();
}

var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["Key"]
    ?? throw new InvalidOperationException("Thiếu cấu hình Jwt:Key. Hãy đặt trong User Secrets hoặc biến môi trường.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

builder.Services.AddAuthorization(options =>
{
    // Mọi endpoint không khai báo gì sẽ yêu cầu phải đăng nhập
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

var frontendOrigins = builder.Configuration.GetSection("Frontend:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.WithOrigins(frontendOrigins).AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

app.UseRouting();
app.UseCors();

// Swagger và chuyển hướng HTTPS chỉ dùng khi phát triển (khi triển khai, Nginx lo HTTPS)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseHttpsRedirection();
    app.MapGet("/", () => Results.Redirect("/swagger")).AllowAnonymous();
}
else
{
    app.MapGet("/", () => Results.Ok("DTMS API")).AllowAnonymous();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
