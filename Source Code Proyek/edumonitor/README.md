# EduMonitor

Aplikasi monitoring perkembangan siswa inklusi.

## Struktur Proyek

```
EduMonitor/
├── frontend/          # React + Vite + Supabase application
│   ├── src/           # Source code (components, pages, hooks, services, etc.)
│   ├── public/        # Static assets
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── .env.local     # Supabase credentials (not tracked)
├── database/          # Database schemas, migrations, and seeds
├── docs/              # Documentation
│   ├── database-design.md
│   ├── screenshots/   # UI reference screenshots
│   ├── ERD/           # Entity Relationship Diagrams
│   ├── BPMN/          # Business Process Model and Notation
│   └── Software Requirement Specification (SRS)
└── README.md
```

## Menjalankan Proyek

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Build Produksi

```bash
cd frontend
npm run build
npm run preview
```

## Akun Demo

| Peran | Email |
|---|---|
| Guru | `guru@edumonitor.id` |
| Admin | `admin@edumonitor.id` |
| Wali Murid | `wali@edumonitor.id` |
| Security | `security@edumonitor.id` |

Kata sandi: `123456`
