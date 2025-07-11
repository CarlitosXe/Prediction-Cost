using CpCostApi.Services;

using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Menambahkan layanan singleton untuk dependensi injeksi
builder.Services.AddSingleton<CpCostService>();
builder.Services.AddSingleton<CpClasifService>();

// Menambahkan layanan untuk controller
builder.Services.AddControllers();

// Mengaktifkan eksplorasi endpoint API
builder.Services.AddEndpointsApiExplorer();

// Menambahkan layanan Swagger untuk dokumentasi API
builder.Services.AddSwaggerGen();

// Tambahkan CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Menampilkan Swagger UI hanya dalam mode pengembangan
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Aktifkan middleware CORS sebelum Authorization
app.UseCors("AllowAll");

// Middleware untuk otorisasi
app.UseAuthorization();

// Memetakan semua controller ke rute API
app.MapControllers();

// Menjalankan aplikasi
app.Run();
