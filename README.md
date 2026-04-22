# Cara Setup & Instalasi

1. Database (PostgreSQL/PostGIS)
  - Pastikan ekstensi PostGIS sudah terpasang: CREATE EXTENSION postgis;
  - Buat database: sig_123140143.

2. Backend (FastAPI)

  - Masuk ke folder backend: cd backend
  - Buat file requirements.txt dan jalankan: pip install -r requirements.txt
  - Jalankan server: uvicorn main:app --reload
  - Akses Dokumentasi API: http://127.0.0.1:8000/docs

3. Frontend (React)

  - Masuk ke folder frontend: cd frontend-gis
  - Install library: npm install
  - Jalankan aplikasi: npm run dev
  - Buka browser: http://localhost:5173

# Screenshot Hasil Kerja

1. Registrasi Akun (Swagger UI)
![alt text](https://github.com/32gz/Praktikum9_SIG_123140143_Khairul-Rijal-Syauqi/blob/main/Screenshot%202026-04-22%20183305.png)


2. Tampilan Login & Peta Utama
![alt text](https://github.com/32gz/Praktikum9_SIG_123140143_Khairul-Rijal-Syauqi/blob/main/Screenshot%202026-04-22%20183039.png)
