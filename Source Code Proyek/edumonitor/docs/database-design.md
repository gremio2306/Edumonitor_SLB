# Database Design — EduMonitor

> Dokumen ini adalah hasil audit terhadap 100% source code frontend (`src/`).
> Setiap tabel, kolom, relationship, dan constraint diturunkan langsung dari
> kode yang ada — bukan dari template atau asumsi.
>
> Dokumen ini belum berisi SQL. Ini adalah panduan untuk membuat migration.

---

## Daftar Tabel

| # | Tabel | Tujuan |
|---|-------|--------|
| 1 | `profiles` | Ekstensi `auth.users` — role, nama, kontak |
| 2 | `classes` | Kelas/rombongan belajar |
| 3 | `teachers` | Direktori tenaga pendidik |
| 4 | `students` | Data siswa |
| 5 | `guardians` | Data wali murid |
| 6 | `guardian_students` | Relasi N:N wali → siswa |
| 7 | `reports` | Semua catatan: progress, assessment, jurnal |
| 8 | `notifications` | Notifikasi per pengguna |
| 9 | `panic_alerts` | Alert tombol darurat |
| 10 | `settings` | Preferensi aplikasi per pengguna |
| 11 | `attendance` | Absensi harian siswa |
| 12 | `schedules` | Jadwal siswa & kelas |
| 13 | `security_incidents` | Laporan insiden keamanan |
| 14 | `visitors` | Catatan pengunjung sekolah |
| 15 | `camera_feeds` | Konfigurasi CCTV |

---

## 1. `profiles`

**Fungsi:** Memperluas `auth.users` Supabase dengan data profil aplikasi.
Role HANYA berasal dari tabel ini — tidak dari `user_metadata` atau klaim JWT.

| Kolom | Type | Nullable | Default | Constraint |
|-------|------|----------|---------|------------|
| `id` | `uuid` | NOT NULL | — | **PK** → `auth.users.id` CASCADE |
| `email` | `text` | NOT NULL | — | **UNIQUE** |
| `name` | `text` | NOT NULL | — | |
| `role` | `text` | NOT NULL | — | **CHECK** `role IN ('admin', 'teacher', 'guardian', 'security')` |
| `phone` | `text` | YES | `null` | |
| `avatar_url` | `text` | YES | `null` | |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | |

**Index:**
- `idx_profiles_role` ON `role`
- `idx_profiles_email` ON `email` (UNIQUE)

**Catatan:**
- `initials` dan `title` TIDAK disimpan — dihitung di aplikasi dari `name` dan `role`.
- Saat registrasi (`RegisterPage.jsx`), role dikirim dari form (Teacher/Guardian/Security).
  Backend WAJIB memvalidasi role — Admin tidak bisa register dari form.
- `avatar_url` belum digunakan frontend (ProfilePage pakai gambar statis). Frontend perlu
  ditambah untuk upload avatar ke Supabase Storage.

**Source code reference:**
- `src/services/authService.js:59-67` — `login()`: ambil profile via `getUserProfile()`
- `src/services/authService.js:69-97` — `register()`: TODO insert ke `profiles`
- `src/services/authService.js:44-57` — `buildUserSession()`: gabung user + profile
- `src/pages/RegisterPage.jsx` — form registrasi
- `src/pages/ProfilePage.jsx:17-18` — tampilkan nama, email, role
- `src/components/ProtectedRoute.jsx` — guard berdasarkan role
- `src/utils/helpers.js:64-71` — `roleProfiles()`: mapping role → name/title/initials

---

## 2. `classes`

**Fungsi:** Kelompok belajar. Setiap kelas bisa memiliki satu wali kelas (homeroom teacher).
Nama kelas adalah nilai unik (contoh: "Kelas 2-A", "Kelas Inklusi A").

| Kolom | Type | Nullable | Default | Constraint |
|-------|------|----------|---------|------------|
| `id` | `serial` | NOT NULL | — | **PK** |
| `name` | `text` | NOT NULL | — | **UNIQUE** |
| `homeroom_teacher_id` | `int` | YES | `null` | **FK** → `teachers.id`, **UNIQUE** (partial) |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |

**Index:**
- `idx_classes_name` ON `name` (UNIQUE)
- `idx_classes_homeroom_teacher` ON `homeroom_teacher_id` **WHERE** `homeroom_teacher_id IS NOT NULL` (UNIQUE)

**Constraint khusus:**
- Satu guru hanya bisa menjadi wali kelas SATU kelas.
  → Partial unique index pada `homeroom_teacher_id` dengan `WHERE homeroom_teacher_id IS NOT NULL`.

**Catatan:**
- Saat ini `students.className` di frontend adalah input teks bebas ("Kelas 2-A", "Kelas 3-C").
  **Frontend perlu ditambah**: halaman CRUD kelas, atau ubah input siswa dari free-text `className`
  menjadi dropdown pilih kelas.
- Di `TeacherHome.jsx:157`, "Kelas Inklusi A" adalah hardcoded. Harus diganti dengan `classes.name`
  berdasarkan `classes.homeroom_teacher_id` yang cocok dengan teacher saat ini.

**Source code reference:**
- `src/data/mockData.js:2-7` — `initialStudents`: masing-masing punya `className`
- `src/pages/StudentsPage.jsx:96-98` — form siswa: input free-text untuk kelas
- `src/pages/StudentDetailPage.jsx:69-71,226-229` — edit form kelas
- `src/pages/TeacherHome.jsx:157` — hardcoded "Kelas Inklusi A"

---

## 3. `teachers`

**Fungsi:** Direktori tenaga pendidik sekolah. INI BERBEDA dengan auth `profiles.role = 'teacher'`.
Seorang guru di direktori BELUM TENTU memiliki akun login (bisa tidak memiliki `user_id`).
Sebaliknya, user dengan `role = 'teacher'` di `profiles` harusnya merujuk ke satu record di sini.

| Kolom | Type | Nullable | Default | Constraint |
|-------|------|----------|---------|------------|
| `id` | `serial` | NOT NULL | — | **PK** |
| `user_id` | `uuid` | YES | `null` | **FK** → `profiles.id`, **UNIQUE** |
| `name` | `text` | NOT NULL | — | |
| `email` | `text` | NOT NULL | — | **UNIQUE** |
| `phone` | `text` | NOT NULL | — | |
| `role` | `text` | NOT NULL | — | **CHECK** `role IN ('Wali Kelas', 'Terapis Wicara', 'Kepala Sekolah', 'Admin', 'Guru Olahraga')` |
| `status` | `text` | NOT NULL | `'Aktif'` | **CHECK** `status IN ('Aktif', 'Tidak Aktif', 'Cuti', 'Luar Kota')` |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | |

**Index:**
- `idx_teachers_user_id` ON `user_id` (UNIQUE)
- `idx_teachers_email` ON `email` (UNIQUE)
- `idx_teachers_role` ON `role`

**Catatan:**
- `initials` TIDAK disimpan — dihitung dari `name`.
- Di kode saat ini, `meta` adalah string seperti "12 Siswa", "Aktif", "Admin", "Luar Kota".
  Ini sebenarnya dua field berbeda: `status` dan informasi lain. `meta` dipecah menjadi
  `status` (enum) dan data lain di-relasikan via tabel terpisah.
- ID format "GRU-xxx" saat ini di-generate di `teacherService.js`. Di database, PK adalah
  `serial`. Format `GRU-xxx` hanya untuk display (dihitung di aplikasi via `formatTeacherId()`).

**Source code reference:**
- `src/data/mockData.js:10-15` — data awal: name, role, meta, initials
- `src/services/teacherService.js:38-47` — `createTeacher()`: generate id "GRU-..."
- `src/pages/TeachersPage.jsx` — CRUD lengkap dengan search/filter/sort
- `src/utils/helpers.js:11-14` — `formatTeacherId()`

---

## 4. `students`

**Fungsi:** Data siswa. Setiap siswa terdaftar di satu kelas.

| Kolom | Type | Nullable | Default | Constraint |
|-------|------|----------|---------|------------|
| `id` | `serial` | NOT NULL | — | **PK** |
| `name` | `text` | NOT NULL | — | |
| `birth_date` | `date` | NOT NULL | — | |
| `class_id` | `int` | NOT NULL | — | **FK** → `classes.id` |
| `category` | `text` | NOT NULL | — | **CHECK** `category IN ('Autisme', 'ADHD', 'Disleksia', 'Umum')` |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | |

**Index:**
- `idx_students_class_id` ON `class_id`
- `idx_students_category` ON `category`
- `idx_students_name` ON `name`

**Catatan:**
- `initials`, `tone`, `progress` TIDAK disimpan — semuanya dihitung:
  - `initials`: dari `name` (via `createInitials()`)
  - `tone`: murni visual untuk avatar — harusnya random atau berdasarkan `category`
  - `progress`: agregat skor dari `reports` — harus dihitung via query `AVG(score)`
- Tanggal lahir saat ini disimpan sebagai teks ("12 Jan 2016"). Di database pakai `date`.
  **Frontend perlu ditambah**: validasi input tanggal lahir di form tambah/edit siswa.
- ID siswa di kode adalah `String(Date.now()).slice(-8)` — tidak scalable. PK serial.

**Source code reference:**
- `src/data/mockData.js:1-8` — data awal: id, name, birth, className, category, initials, tone, progress
- `src/services/studentService.js:24-29` — `createStudent()`: generate id dari Date.now()
- `src/pages/StudentsPage.jsx` — CRUD dengan search/filter/sort
- `src/pages/StudentDetailPage.jsx` — detail, edit, delete
- `src/pages/TeacherHome.jsx:96-140` — filter siswa, hitung progress, hitung kehadiran
- `src/pages/AdminHome.jsx:105-115` — distribusi kategori siswa

---

## 5. `guardians`

**Fungsi:** Data wali murid. Satu wali bisa memiliki banyak siswa (via `guardian_students`).
Bisa memiliki akun login (`user_id` → `profiles.id`) jika role = 'guardian'.

| Kolom | Type | Nullable | Default | Constraint |
|-------|------|----------|---------|------------|
| `id` | `serial` | NOT NULL | — | **PK** |
| `user_id` | `uuid` | YES | `null` | **FK** → `profiles.id`, **UNIQUE** |
| `name` | `text` | NOT NULL | — | |
| `relation` | `text` | NOT NULL | — | **CHECK** `relation IN ('Ayah', 'Ibu', 'Kakek', 'Nenek', 'Saudara')` |
| `phone` | `text` | NOT NULL | — | |
| `address` | `text` | NOT NULL | — | |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | |

**Index:**
- `idx_guardians_user_id` ON `user_id` (UNIQUE)
- `idx_guardians_name` ON `name`

**Catatan:**
- `initials` TIDAK disimpan — dihitung dari `name`.
- `relation` disimpan di tabel `guardians` (bukan di join table) karena secara domain
  seorang wali memiliki hubungan yang sama ke semua anaknya.
- Di kode, `child` dan `studentId` adalah properti di guardian — ini di-pecah menjadi
  relasi N:N via `guardian_students`.
- `GuardiansPage.jsx` menampilkan `childName` yang dicari dari `students` berdasarkan `studentId`.

**Source code reference:**
- `src/data/mockData.js:17-21` — data awal: id, name, relation, child, address, phone, initials
- `src/services/guardianService.js` — CRUD localStorage
- `src/pages/GuardiansPage.jsx` — CRUD dengan search/filter/sort

---

## 6. `guardian_students`

**Fungsi:** Relasi banyak-ke-banyak antara wali murid dan siswa.
Seorang wali bisa memiliki banyak anak. Seorang siswa bisa memiliki banyak wali.

| Kolom | Type | Nullable | Default | Constraint |
|-------|------|----------|---------|------------|
| `guardian_id` | `int` | NOT NULL | — | **PK**, **FK** → `guardians.id` CASCADE |
| `student_id` | `int` | NOT NULL | — | **PK**, **FK** → `students.id` CASCADE |
| `is_primary` | `boolean` | NOT NULL | `false` | |

**Index:**
- `idx_guardian_students_student` ON `student_id`

**Constraint:**
- **PRIMARY KEY** (`guardian_id`, `student_id`)

**Catatan:**
- `relation` TIDAK ada di tabel ini — sudah ada di `guardians` karena satu wali
  memiliki hubungan yang sama ke semua anaknya.
- `is_primary` menandai wali utama (untuk display di dashboard anak).
- Frontend saat ini hanya mendukung SATU siswa per wali (`GuardiansPage.jsx` pilih satu siswa).
  **Frontend perlu ditambah**: dukungan multiple siswa per wali (checkbox atau multi-select).

**Source code reference:**
- `src/pages/GuardiansPage.jsx:57-60` — form pilih 1 siswa → `payload.studentId`
- `src/pages/ChildMonitoringPage.jsx:44-52` — akses `students[0]` sebagai anak wali
- Konsep "satu guardian → banyak siswa" dari requirement sistem

---

## 7. `reports`

**Fungsi:** Tabel PUSAT yang menyatukan semua jenis catatan:
- **Progress** (ProgressFormPage): kategori Kognitif, Motorik Halus, Interaksi Sosial, Perilaku, Kemandirian
- **Assessment** (AssessmentPage): kategori dengan prefix "Penilaian ..."
- **Journal** (JournalPage): kategori "Jurnal Harian"

| Kolom | Type | Nullable | Default | Constraint |
|-------|------|----------|---------|------------|
| `id` | `serial` | NOT NULL | — | **PK** |
| `student_id` | `int` | NOT NULL | — | **FK** → `students.id` CASCADE |
| `teacher_id` | `int` | YES | `null` | **FK** → `teachers.id` SET NULL |
| `author_name` | `text` | NOT NULL | — | |
| `report_type` | `text` | NOT NULL | — | **CHECK** `report_type IN ('progress', 'assessment', 'journal')` |
| `category` | `text` | NOT NULL | — | |
| `date` | `date` | NOT NULL | — | |
| `status` | `text` | NOT NULL | — | **CHECK** `status IN ('BB', 'MB', 'BSH', 'BSB')` |
| `score` | `int` | YES | `null` | **CHECK** `score >= 0 AND score <= 100` |
| `stars` | `int` | YES | `null` | **CHECK** `stars >= 1 AND stars <= 5` |
| `note` | `text` | YES | `null` | |
| `tags` | `jsonb` | NOT NULL | `'[]'` | |
| `photo_url` | `text` | YES | `null` | |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | |

**Index:**
- `idx_reports_student_id` ON `student_id`
- `idx_reports_teacher_id` ON `teacher_id`
- `idx_reports_date` ON `date`
- `idx_reports_type` ON `report_type`
- `idx_reports_category` ON `category`
- `idx_reports_student_date` ON `student_id`, `date` DESC
- `idx_reports_tags` ON `tags` using GIN

**Catatan:**
- `report_type` bisa dijadikan GENERATED column dari `category`:
  - `category LIKE 'Penilaian%'` → `'assessment'`
  - `category = 'Jurnal Harian'` → `'journal'`
  - ELSE → `'progress'`
  Tapi lebih eksplisit disimpan sebagai kolom terpisah.
- `author_name` adalah denormalisasi (display name). Di masa depan,
  bisa di-resolve dari `teacher_id` → `teachers.name`.
- `student` (denormalized student name di mock data) TIDAK disimpan — cukup FK ke `students.id`.
- `score` nullable karena journal entry mungkin tidak punya skor.
- `stars` hanya untuk assessment.
- `photo_url` untuk progress report — frontend belum upload ke storage.
  **Frontend perlu ditambah**: upload foto ke Supabase Storage, simpan URL.
- HistoryPage (`src/pages/HistoryPage.jsx`) menampilkan data yang sama dengan filter `report_type`.

**Source code reference:**
- `src/data/mockData.js:23-27` — initialReports: id, studentId, student, date, category, status, score, note, author
- `src/services/reportService.js` — CRUD localStorage
- `src/pages/ProgressFormPage.jsx` — create/edit progress report
- `src/pages/AssessmentPage.jsx` — create/edit assessment (stars, tags, score)
- `src/pages/JournalPage.jsx` — create/edit journal (tags)
- `src/pages/MonitoringPage.jsx` — list semua report dengan filter
- `src/pages/StudentDetailPage.jsx:37-50` — report per student
- `src/pages/ReportsPage.jsx` — laporan dengan filter periode
- `src/pages/HistoryPage.jsx` — timeline history
- `src/context/useReports.js` — hook: addReport, updateReport, deleteReport

---

## 8. `notifications`

**Fungsi:** Notifikasi per pengguna. Dipicu oleh:
- Report baru (progress, assessment)
- Panic button
- Informasi sistem

| Kolom | Type | Nullable | Default | Constraint |
|-------|------|----------|---------|------------|
| `id` | `serial` | NOT NULL | — | **PK** |
| `user_id` | `uuid` | NOT NULL | — | **FK** → `profiles.id` CASCADE |
| `type` | `text` | NOT NULL | — | **CHECK** `type IN ('danger', 'progress', 'info', 'note')` |
| `title` | `text` | NOT NULL | — | |
| `body` | `text` | YES | `null` | |
| `is_read` | `boolean` | NOT NULL | `false` | |
| `related_entity_type` | `text` | YES | `null` | |
| `related_entity_id` | `int` | YES | `null` | |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |

**Index:**
- `idx_notifications_user_id` ON `user_id`
- `idx_notifications_user_unread` ON `user_id`, `is_read` WHERE `is_read = false`
- `idx_notifications_created_at` ON `created_at` DESC

**Catatan:**
- `time` (string di mock) TIDAK disimpan — pakai `created_at`.
- `unread` (boolean di mock) → `is_read`.
- `related_entity_type` + `related_entity_id` memungkinkan navigasi ke entity terkait
  (contoh: klik notifikasi → buka halaman student).
- Saat `addPanicAlert()` dipanggil, notification dibuat untuk seluruh security.
  **Frontend perlu ditambah**: query notifikasi untuk semua user dengan role 'security'.
- `addNotification()` di `useReports.js:13-14` membuat notifikasi untuk report baru.
  Harusnya dikirim ke guardian terkait (via `guardian_students`).

**Source code reference:**
- `src/data/mockData.js:29-34` — initialNotifications: id, type, title, body, time, unread
- `src/services/notificationService.js` — CRUD localStorage
- `src/pages/NotificationsPage.jsx` — list dengan tab All/Unread
- `src/context/useNotifications.js` — hook: addNotification, markNotificationDone
- `src/pages/AdminHome.jsx:73-82` — aktivitas dari notifikasi
- `src/pages/SecurityHome.jsx:192-195` — hitung unread count

---

## 9. `panic_alerts`

**Fungsi:** Alert darurat dari tombol panic. Dikirim realtime ke semua security.
Dibuat dari `EmergencyPage.jsx` dan dilihat di `SecurityHome.jsx`.

| Kolom | Type | Nullable | Default | Constraint |
|-------|------|----------|---------|------------|
| `id` | `serial` | NOT NULL | — | **PK** |
| `student_id` | `int` | YES | `null` | **FK** → `students.id` SET NULL |
| `triggered_by` | `uuid` | NOT NULL | — | **FK** → `profiles.id` |
| `triggered_by_name` | `text` | NOT NULL | — | |
| `triggered_by_role` | `text` | NOT NULL | — | **CHECK** `triggered_by_role IN ('admin', 'teacher', 'guardian', 'security')` |
| `location` | `text` | YES | `null` | |
| `status` | `text` | NOT NULL | `'Perlu tindakan'` | **CHECK** `status IN ('Perlu tindakan', 'Selesai')` |
| `resolved_by` | `uuid` | YES | `null` | **FK** → `profiles.id` |
| `resolved_at` | `timestamptz` | YES | `null` | |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |

**Index:**
- `idx_panic_alerts_status` ON `status`
- `idx_panic_alerts_created_at` ON `created_at` DESC

**Catatan:**
- `title` di mock panic TIDAK perlu disimpan — bisa di-generate dari data lain.
- `time` di mock → `created_at`.
- `type` di mock → `'danger'` selalu, tidak perlu kolom.
- Security perlu subscribe realtime ke `panic_alerts` untuk menerima alert langsung.
- `student_id` nullable karena mungkin panic ditekan tanpa memilih siswa tertentu.

**Source code reference:**
- `src/services/panicService.js` — CRUD localStorage
- `src/context/usePanicAlerts.js:7-21` — `addPanicAlert()`
- `src/pages/EmergencyPage.jsx:17-33` — trigger panic
- `src/pages/SecurityHome.jsx:132-153` — daftar & filter panic alerts

---

## 10. `settings`

**Fungsi:** Preferensi aplikasi per pengguna.

| Kolom | Type | Nullable | Default | Constraint |
|-------|------|----------|---------|------------|
| `user_id` | `uuid` | NOT NULL | — | **PK**, **FK** → `profiles.id` CASCADE |
| `language` | `text` | NOT NULL | `'Bahasa Indonesia'` | **CHECK** `language IN ('Bahasa Indonesia', 'English')` |
| `notifications_enabled` | `boolean` | NOT NULL | `true` | |
| `privacy_enabled` | `boolean` | NOT NULL | `true` | |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | |

**Catatan:**
- Settings dibuat otomatis saat user pertama kali register (INSERT ON CONFLICT...).
- `SettingsPage.jsx:19-21` toggle language, notifications, privacy.

**Source code reference:**
- `src/services/settingsService.js` — localStorage
- `src/context/useSettings.js` — hook: toggleLanguage, toggleNotifications, togglePrivacy
- `src/pages/SettingsPage.jsx` — UI pengaturan

---

## 11. `attendance`

**Fungsi:** Absensi harian siswa. Setiap siswa memiliki satu record per hari.

| Kolom | Type | Nullable | Default | Constraint |
|-------|------|----------|---------|------------|
| `id` | `serial` | NOT NULL | — | **PK** |
| `student_id` | `int` | NOT NULL | — | **FK** → `students.id` CASCADE |
| `date` | `date` | NOT NULL | — | |
| `status` | `text` | NOT NULL | — | **CHECK** `status IN ('hadir', 'sakit', 'izin', 'alpha')` |
| `notes` | `text` | YES | `null` | |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |

**Constraint:**
- **UNIQUE** (`student_id`, `date`)

**Index:**
- `idx_attendance_student_date` ON `student_id`, `date`

**Catatan:**
- Tabel ini DITAMBAHKAN karena dashboard menampilkan data kehadiran yang saat ini
  masih hardcoded:
  - `TeacherHome.jsx:126-132`: `attendanceRate` dihitung pakai `student.progress` sebagai
    proksi — ini SALAH. Kehadiran harus dari tabel `attendance`.
  - `ChildMonitoringPage.jsx:116`: "Kehadiran 98%" hardcoded.
- **Frontend perlu ditambah**: halaman input absensi guru, atau minimal API untuk
  mencatat kehadihan.

**Source code reference:**
- `src/pages/TeacherHome.jsx:126-136` — hitung kehadiran dari progress (SALAH)
- `src/pages/ChildMonitoringPage.jsx:116` — hardcoded "Kehadiran 98%"

---

## 12. `schedules`

**Fungsi:** Jadwal siswa dan kelas. Digunakan untuk agenda hari ini di dashboard.

| Kolom | Type | Nullable | Default | Constraint |
|-------|------|----------|---------|------------|
| `id` | `serial` | NOT NULL | — | **PK** |
| `student_id` | `int` | YES | `null` | **FK** → `students.id` CASCADE |
| `class_id` | `int` | YES | `null` | **FK** → `classes.id` CASCADE |
| `title` | `text` | NOT NULL | — | |
| `description` | `text` | YES | `null` | |
| `day_of_week` | `int` | YES | `null` | **CHECK** `day_of_week >= 0 AND day_of_week <= 6` |
| `date` | `date` | YES | `null` | |
| `start_time` | `time` | NOT NULL | — | |
| `end_time` | `time` | YES | `null` | |
| `location` | `text` | YES | `null` | |
| `schedule_type` | `text` | NOT NULL | — | **CHECK** `schedule_type IN ('Terapi Okupasi', 'Terapi Wicara', 'Asesmen', 'Belajar', 'Kelas', 'Evaluasi')` |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |

**Constraint:**
- Minimal salah satu dari `student_id` atau `class_id` harus terisi.
  → **CHECK** `(student_id IS NOT NULL) OR (class_id IS NOT NULL)`

**Index:**
- `idx_schedules_student` ON `student_id`
- `idx_schedules_class` ON `class_id`
- `idx_schedules_date` ON `date`

**Catatan:**
- `day_of_week` (0=Minggu, 6=Sabtu) untuk jadwal rutin mingguan.
- `date` untuk jadwal khusus (misal asesmen bulanan).
- Tabel ini DITAMBAHKAN karena data jadwal saat ini hardcoded:
  - `TeacherHome.jsx:23-57`: `agendaItems` hardcoded
  - `ChildMonitoringPage.jsx:307-355`: jadwal anak hardcoded
- **Frontend perlu ditambah**: halaman manajemen jadwal.

**Source code reference:**
- `src/pages/TeacherHome.jsx:23-57` — hardcoded agenda items
- `src/pages/ChildMonitoringPage.jsx:307-355` — hardcoded schedule

---

## 13. `security_incidents`

**Fungsi:** Laporan insiden keamanan — catatan pemeriksaan, kejadian, dan tindakan security.

| Kolom | Type | Nullable | Default | Constraint |
|-------|------|----------|---------|------------|
| `id` | `serial` | NOT NULL | — | **PK** |
| `title` | `text` | NOT NULL | — | |
| `description` | `text` | YES | `null` | |
| `location` | `text` | YES | `null` | |
| `reported_by` | `uuid` | YES | `null` | **FK** → `profiles.id` SET NULL |
| `officer_name` | `text` | YES | `null` | |
| `status` | `text` | NOT NULL | `'Perlu tindakan'` | **CHECK** `status IN ('Perlu tindakan', 'Selesai', 'Aman')` |
| `incident_type` | `text` | NOT NULL | `'warning'` | **CHECK** `incident_type IN ('warning', 'success', 'danger')` |
| `resolved_at` | `timestamptz` | YES | `null` | |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |

**Index:**
- `idx_security_incidents_status` ON `status`
- `idx_security_incidents_type` ON `incident_type`

**Catatan:**
- `incident_type` mapping: 'warning' → perlu tindakan, 'success' → aman/selesai, 'danger' → darurat.
- `officer_name` denormalized — bisa di-resolve dari `reported_by` jika user terdaftar.
- Tabel DITAMBAHKAN karena saat ini `initialIncidents` di `SecurityHome.jsx` adalah
  hardcoded array dalam komponen. Frontend perlu diubah untuk read dari DB.
- `SecurityHome.jsx` menggunakan `incident.status` dan `incident.type` untuk styling.
  `handleResolveIncident()` di frontend mengubah status lokal — harusnya update DB.

**Source code reference:**
- `src/pages/SecurityHome.jsx:30-58` — `initialIncidents` hardcoded
- `src/pages/SecurityHome.jsx:185-188` — `activeIncidentCount`
- `src/pages/SecurityHome.jsx:197-209` — `handleResolveIncident()`

---

## 14. `visitors`

**Fungsi:** Catatan pengunjung sekolah — nama, tujuan, waktu masuk/keluar.

| Kolom | Type | Nullable | Default | Constraint |
|-------|------|----------|---------|------------|
| `id` | `serial` | NOT NULL | — | **PK** |
| `name` | `text` | NOT NULL | — | |
| `purpose` | `text` | NOT NULL | — | |
| `check_in` | `timestamptz` | NOT NULL | `now()` | |
| `check_out` | `timestamptz` | YES | `null` | |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |

**Index:**
- `idx_visitors_check_in` ON `check_in` DESC

**Catatan:**
- Tabel DITAMBAHKAN karena `SecurityHome.jsx` memiliki form "Catat Pengunjung" dan
  menampilkan jumlah pengunjung hari ini (`visitorCount`). Saat ini semua state lokal.
- **Frontend perlu ditambah**: integrasikan form visitor dengan API persistence.
- Hitung "3 masih di area sekolah" dari `check_out IS NULL`.

**Source code reference:**
- `src/pages/SecurityHome.jsx:121` — `setVisitorCount(18)` hardcoded
- `src/pages/SecurityHome.jsx:156-159,211-229` — visitor form (local state)
- `src/pages/SecurityHome.jsx:396-398` — display visitor count

---

## 15. `camera_feeds`

**Fungsi:** Konfigurasi kamera CCTV untuk dashboard security.

| Kolom | Type | Nullable | Default | Constraint |
|-------|------|----------|---------|------------|
| `id` | `serial` | NOT NULL | — | **PK** |
| `name` | `text` | NOT NULL | — | |
| `location` | `text` | NOT NULL | — | |
| `stream_url` | `text` | NOT NULL | — | |
| `status` | `text` | NOT NULL | `'Online'` | **CHECK** `status IN ('Online', 'Offline', 'Maintenance')` |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |

**Catatan:**
- Tabel DITAMBAHKAN karena `SecurityHome.jsx` menampilkan "CCTV Aktif 12/12" dan
  "Semua kamera online" yang saat ini hardcoded.
- `stream_url` untuk URL streaming/embed CCTV. Saat ini `cameraFeeds` pakai
  Unsplash image sebagai placeholder.
- **Frontend perlu ditambah**: halaman konfigurasi kamera.

**Source code reference:**
- `src/pages/SecurityHome.jsx:60-85` — `cameraFeeds` hardcoded
- `src/pages/SecurityHome.jsx:376-386` — stat "CCTV Aktif 12/12"

---

## Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    %% Supabase built-in
    auth_users }o--|| profiles : extends

    %% Profiles → roles
    profiles ||--o{ teachers : "has (user_id)"
    profiles ||--o{ guardians : "has (user_id)"
    profiles ||--o{ notifications : "receives"
    profiles ||--o{ panic_alerts : "triggers"
    profiles ||--o{ panic_alerts : "resolves"
    profiles ||--o{ security_incidents : "reports"
    profiles ||--|| settings : "configures"

    %% Teachers → Classes → Students
    teachers ||--o| classes : "homeroom"
    classes ||--o{ students : "contains"

    %% Teachers → Reports
    teachers ||--o{ reports : "creates"

    %% Students → Core Data
    students ||--o{ reports : "has"
    students ||--o{ attendance : "attends"
    students ||--o{ schedules : "scheduled"
    students ||--o{ panic_alerts : "involved"
    students }o--|| guardians : "via"
    students }o--|| guardians : "guardian_students"

    %% Guardians → Students (N:N via join table)
    guardians ||--o{ guardian_students : "has"
    students ||--o{ guardian_students : "has"

    %% Other
    classes ||--o{ schedules : "has"

    entity auth_users {
        id uuid PK
        email text
        encrypted_password text
    }

    entity profiles {
        id uuid PK
        email text UK
        name text
        role text
        phone text
        avatar_url text
        created_at timestamptz
        updated_at timestamptz
    }

    entity classes {
        id serial PK
        name text UK
        homeroom_teacher_id int FK
        created_at timestamptz
    }

    entity teachers {
        id serial PK
        user_id uuid FK UK
        name text
        email text UK
        phone text
        role text
        status text
        created_at timestamptz
        updated_at timestamptz
    }

    entity students {
        id serial PK
        name text
        birth_date date
        class_id int FK
        category text
        created_at timestamptz
        updated_at timestamptz
    }

    entity guardians {
        id serial PK
        user_id uuid FK UK
        name text
        relation text
        phone text
        address text
        created_at timestamptz
        updated_at timestamptz
    }

    entity guardian_students {
        guardian_id int PK
        student_id int PK
        is_primary boolean
    }

    entity reports {
        id serial PK
        student_id int FK
        teacher_id int FK
        author_name text
        report_type text
        category text
        date date
        status text
        score int
        stars int
        note text
        tags jsonb
        photo_url text
        created_at timestamptz
        updated_at timestamptz
    }

    entity notifications {
        id serial PK
        user_id uuid FK
        type text
        title text
        body text
        is_read boolean
        related_entity_type text
        related_entity_id int
        created_at timestamptz
    }

    entity panic_alerts {
        id serial PK
        student_id int FK
        triggered_by uuid FK
        triggered_by_name text
        triggered_by_role text
        location text
        status text
        resolved_by uuid FK
        resolved_at timestamptz
        created_at timestamptz
    }

    entity settings {
        user_id uuid PK
        language text
        notifications_enabled boolean
        privacy_enabled boolean
        updated_at timestamptz
    }

    entity attendance {
        id serial PK
        student_id int FK
        date date
        status text
        notes text
        created_at timestamptz
    }

    entity schedules {
        id serial PK
        student_id int FK
        class_id int FK
        title text
        description text
        day_of_week int
        date date
        start_time time
        end_time time
        location text
        schedule_type text
        created_at timestamptz
    }

    entity security_incidents {
        id serial PK
        title text
        description text
        location text
        reported_by uuid FK
        officer_name text
        status text
        incident_type text
        resolved_at timestamptz
        created_at timestamptz
    }

    entity visitors {
        id serial PK
        name text
        purpose text
        check_in timestamptz
        check_out timestamptz
        created_at timestamptz
    }

    entity camera_feeds {
        id serial PK
        name text
        location text
        stream_url text
        status text
        created_at timestamptz
    }
```

---

## Daftar Index Lengkap

| Tabel | Index | Type | Kolom |
|-------|-------|------|-------|
| `profiles` | `idx_profiles_role` | B-tree | `role` |
| `profiles` | `idx_profiles_email` | UNIQUE B-tree | `email` |
| `classes` | `idx_classes_name` | UNIQUE B-tree | `name` |
| `classes` | `idx_classes_homeroom_teacher` | UNIQUE partial B-tree | `homeroom_teacher_id` WHERE `homeroom_teacher_id IS NOT NULL` |
| `teachers` | `idx_teachers_user_id` | UNIQUE B-tree | `user_id` |
| `teachers` | `idx_teachers_email` | UNIQUE B-tree | `email` |
| `teachers` | `idx_teachers_role` | B-tree | `role` |
| `students` | `idx_students_class_id` | B-tree | `class_id` |
| `students` | `idx_students_category` | B-tree | `category` |
| `students` | `idx_students_name` | B-tree | `name` |
| `guardians` | `idx_guardians_user_id` | UNIQUE B-tree | `user_id` |
| `guardians` | `idx_guardians_name` | B-tree | `name` |
| `guardian_students` | `idx_guardian_students_student` | B-tree | `student_id` |
| `reports` | `idx_reports_student_id` | B-tree | `student_id` |
| `reports` | `idx_reports_teacher_id` | B-tree | `teacher_id` |
| `reports` | `idx_reports_date` | B-tree | `date` |
| `reports` | `idx_reports_type` | B-tree | `report_type` |
| `reports` | `idx_reports_category` | B-tree | `category` |
| `reports` | `idx_reports_student_date` | B-tree | `student_id`, `date` DESC |
| `reports` | `idx_reports_tags` | GIN | `tags` |
| `notifications` | `idx_notifications_user_id` | B-tree | `user_id` |
| `notifications` | `idx_notifications_user_unread` | partial B-tree | `user_id`, `is_read` WHERE `is_read = false` |
| `notifications` | `idx_notifications_created_at` | B-tree | `created_at` DESC |
| `panic_alerts` | `idx_panic_alerts_status` | B-tree | `status` |
| `panic_alerts` | `idx_panic_alerts_created_at` | B-tree | `created_at` DESC |
| `attendance` | `idx_attendance_student_date` | UNIQUE B-tree | `student_id`, `date` |
| `schedules` | `idx_schedules_student` | B-tree | `student_id` |
| `schedules` | `idx_schedules_class` | B-tree | `class_id` |
| `schedules` | `idx_schedules_date` | B-tree | `date` |
| `security_incidents` | `idx_security_incidents_status` | B-tree | `status` |
| `security_incidents` | `idx_security_incidents_type` | B-tree | `incident_type` |
| `visitors` | `idx_visitors_check_in` | B-tree | `check_in` DESC |

---

## Daftar Constraint Lengkap

### Primary Keys
| Tabel | PK |
|-------|----|
| `profiles` | `id` |
| `classes` | `id` |
| `teachers` | `id` |
| `students` | `id` |
| `guardians` | `id` |
| `guardian_students` | `(guardian_id, student_id)` |
| `reports` | `id` |
| `notifications` | `id` |
| `panic_alerts` | `id` |
| `settings` | `user_id` |
| `attendance` | `id` |
| `schedules` | `id` |
| `security_incidents` | `id` |
| `visitors` | `id` |
| `camera_feeds` | `id` |

### Foreign Keys
| Tabel | Kolom | Referensi | On Delete |
|-------|-------|-----------|-----------|
| `profiles` | `id` | `auth.users.id` | CASCADE |
| `classes` | `homeroom_teacher_id` | `teachers.id` | SET NULL |
| `teachers` | `user_id` | `profiles.id` | SET NULL |
| `students` | `class_id` | `classes.id` | RESTRICT |
| `guardians` | `user_id` | `profiles.id` | SET NULL |
| `guardian_students` | `guardian_id` | `guardians.id` | CASCADE |
| `guardian_students` | `student_id` | `students.id` | CASCADE |
| `reports` | `student_id` | `students.id` | CASCADE |
| `reports` | `teacher_id` | `teachers.id` | SET NULL |
| `notifications` | `user_id` | `profiles.id` | CASCADE |
| `panic_alerts` | `student_id` | `students.id` | SET NULL |
| `panic_alerts` | `triggered_by` | `profiles.id` | |
| `panic_alerts` | `resolved_by` | `profiles.id` | SET NULL |
| `settings` | `user_id` | `profiles.id` | CASCADE |
| `attendance` | `student_id` | `students.id` | CASCADE |
| `schedules` | `student_id` | `students.id` | CASCADE |
| `schedules` | `class_id` | `classes.id` | CASCADE |
| `security_incidents` | `reported_by` | `profiles.id` | SET NULL |

### Unique Constraints (non-PK)
| Tabel | Kolom |
|-------|-------|
| `profiles` | `email` |
| `classes` | `name` |
| `classes` | `homeroom_teacher_id` WHERE NOT NULL |
| `teachers` | `user_id` |
| `teachers` | `email` |
| `guardians` | `user_id` |
| `attendance` | `(student_id, date)` |

### Check Constraints
| Tabel | Kolom | Rule |
|-------|-------|------|
| `profiles` | `role` | `IN ('admin', 'teacher', 'guardian', 'security')` |
| `teachers` | `role` | `IN ('Wali Kelas', 'Terapis Wicara', 'Kepala Sekolah', 'Admin', 'Guru Olahraga')` |
| `teachers` | `status` | `IN ('Aktif', 'Tidak Aktif', 'Cuti', 'Luar Kota')` |
| `students` | `category` | `IN ('Autisme', 'ADHD', 'Disleksia', 'Umum')` |
| `guardians` | `relation` | `IN ('Ayah', 'Ibu', 'Kakek', 'Nenek', 'Saudara')` |
| `reports` | `report_type` | `IN ('progress', 'assessment', 'journal')` |
| `reports` | `status` | `IN ('BB', 'MB', 'BSH', 'BSB')` |
| `reports` | `score` | `>= 0 AND <= 100` |
| `reports` | `stars` | `>= 1 AND <= 5` |
| `notifications` | `type` | `IN ('danger', 'progress', 'info', 'note')` |
| `panic_alerts` | `triggered_by_role` | `IN ('admin', 'teacher', 'guardian', 'security')` |
| `panic_alerts` | `status` | `IN ('Perlu tindakan', 'Selesai')` |
| `settings` | `language` | `IN ('Bahasa Indonesia', 'English')` |
| `attendance` | `status` | `IN ('hadir', 'sakit', 'izin', 'alpha')` |
| `schedules` | `day_of_week` | `>= 0 AND <= 6` |
| `schedules` | `schedule_type` | `IN ('Terapi Okupasi', 'Terapi Wicara', 'Asesmen', 'Belajar', 'Kelas', 'Evaluasi')` |
| `schedules` | `(student_id, class_id)` | `(student_id IS NOT NULL) OR (class_id IS NOT NULL)` |
| `security_incidents` | `status` | `IN ('Perlu tindakan', 'Selesai', 'Aman')` |
| `security_incidents` | `incident_type` | `IN ('warning', 'success', 'danger')` |
| `camera_feeds` | `status` | `IN ('Online', 'Offline', 'Maintenance')` |

---

## Catatan: Field Frontend yang Perlu Ditambah

### 1. Kelas — Free text → Dropdown terstruktur
- **File:** `StudentsPage.jsx:96-98`, `StudentDetailPage.jsx:226-229`
- **Sekarang:** Input teks bebas `className`
- **Harus:** Dropdown pilih dari tabel `classes`
- **Perlu ditambah:** Halaman CRUD kelas (minimal seed data)

### 2. Tanggal Lahir — Free text → Date picker
- **File:** `StudentsPage.jsx:95`, `StudentDetailPage.jsx:223`
- **Sekarang:** Input teks "12 Jan 2016"
- **Harus:** Input type `date` + validasi format ISO

### 3. Wali Murid — Single student → Multiple students
- **File:** `GuardiansPage.jsx:123`
- **Sekarang:** Select satu siswa
- **Harus:** Multi-select atau checkbox list (untuk `guardian_students`)

### 4. Upload Foto — Filename → Supabase Storage
- **File:** `ProgressFormPage.jsx:73`
- **Sekarang:** Hanya ambil `fileName` dari input file, tidak diupload
- **Harus:** Upload ke Supabase Storage, simpan `photo_url`

### 5. Avatar Profile — Static → Upload
- **File:** `ProfilePage.jsx:17`, `src/assets/profile-sarah.png`
- **Sekarang:** Gambar statis dari assets
- **Harus:** Upload ke Supabase Storage, simpan `avatar_url` di `profiles`

### 6. Kehadiran — Computed dari progress → Tabel attendance
- **File:** `TeacherHome.jsx:126-132`
- **Sekarang:** `student.progress` dipakai sebagai proksi kehadiran (SALAH)
- **Harus:** Query dari tabel `attendance`

### 7. Kehadiran — Hardcoded → Query database
- **File:** `ChildMonitoringPage.jsx:116`
- **Sekarang:** "Kehadiran 98%" hardcoded
- **Harus:** Hitung dari tabel `attendance` untuk student_id terkait

### 8. Agenda Guru — Hardcoded → Query schedules
- **File:** `TeacherHome.jsx:23-57`
- **Sekarang:** Array `agendaItems` hardcoded
- **Harus:** Query dari tabel `schedules` (by class_id atau teacher_id)

### 9. Agenda Anak — Hardcoded → Query schedules
- **File:** `ChildMonitoringPage.jsx:307-355`
- **Sekarang:** Jadwal hardcoded
- **Harus:** Query dari tabel `schedules` (by student_id)

### 10. Insiden Keamanan — Local state → DB
- **File:** `SecurityHome.jsx:30-58`
- **Sekarang:** `initialIncidents` array hardcoded, resolusi lokal (`setIncidents`)
- **Harus:** Query dari tabel `security_incidents`, update via API

### 11. CCTV — Hardcoded → Camera_feeds table
- **File:** `SecurityHome.jsx:60-85,376-386`
- **Sekarang:** `cameraFeeds` hardcoded, "12/12" hardcoded
- **Harus:** Query dari tabel `camera_feeds`, hitung total & online

### 12. Pengunjung — Local state → Visitors table
- **File:** `SecurityHome.jsx:121,156-159,211-229,396-398`
- **Sekarang:** `visitorCount` state lokal 18, form tanpa persistence
- **Harus:** INSERT ke `visitors`, SELECT COUNT by date

### 13. Chart Data — Hardcoded → Query
- **File:** `AdminHome.jsx:20-27` — `monthlyGrowth` hardcoded
- **File:** `ChildMonitoringPage.jsx:21-35` — `weeklyProgress` / `monthlyProgress` hardcoded
- **Harus:** Hitung dari agregat `reports.score` atau `students.created_at`

### 14. Notifikasi Panic → Realtime untuk Security
- **File:** `EmergencyPage.jsx:17-33`, `SecurityHome.jsx:132-153`
- **Sekarang:** Notifikasi dibuat via `addNotification` di session sendiri
- **Harus:** Saat panic alert dibuat, INSERT notification untuk SEMUA user role 'security'
  + kirim via Supabase Realtime

### 15. "Siswa Baru Bulan Ini" — Hardcoded → Query
- **File:** `AdminHome.jsx:206`
- **Sekarang:** "12 siswa baru bulan ini" hardcoded
- **Harus:** `SELECT COUNT(*) FROM students WHERE created_at >= date_trunc('month', now())`

### 16. "18 guru aktif hari ini" — Hardcoded → Query
- **File:** `AdminHome.jsx:222`
- **Sekarang:** Hardcoded "18 guru aktif hari ini"
- **Harus:** `SELECT COUNT(*) FROM teachers WHERE status = 'Aktif'`

---

## Realtime Supabase

Tabel yang perlu diaktifkan Realtime:

| Tabel | Alasan | Subscribe |
|-------|--------|-----------|
| `panic_alerts` | Security harus menerima alert DETIK ITU juga | Semua user role `security` |
| `notifications` | Pengguna harus lihat notifikasi tanpa refresh | Per user_id |
| `reports` | Guardian lihat progress baru anak | Guardian via `guardian_students` |
| `security_incidents` | Update status realtime di tabel security | Semua user role `security` |

**Cara:**
1. Aktifkan `supabase_realtime` publication untuk tabel di atas.
2. Frontend subscribe via `supabase.channel()` dengan filter yang sesuai.
3. Untuk `panic_alerts`, kirim juga notifikasi push via Supabase Edge Functions
   jika diperlukan notifikasi di luar aplikasi.

---

## Ringkasan Dashboard Queries

### AdminHome.jsx
| Card | Query |
|------|-------|
| Total Siswa | `SELECT COUNT(*) FROM students` |
| Tenaga Pendidik | `SELECT COUNT(*) FROM teachers WHERE status = 'Aktif'` |
| Wali Murid | `SELECT COUNT(*) FROM guardians` |
| Total Laporan | `SELECT COUNT(*) FROM reports` |
| Kategori Pendampingan | `SELECT category, COUNT(*) FROM students GROUP BY category` |
| Aktivitas Terbaru | `SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5` |
| Perlu Ditinjau | `SELECT COUNT(*) FROM notifications WHERE is_read = false` |
| Pertumbuhan Data Siswa | `SELECT date_trunc('month', created_at) AS month, COUNT(*) FROM students GROUP BY month ORDER BY month` |

### TeacherHome.jsx
| Card | Query |
|------|-------|
| Total Siswa (saya) | `SELECT COUNT(*) FROM students WHERE class_id = (SELECT id FROM classes WHERE homeroom_teacher_id = $teacherId)` |
| Kehadiran Hari Ini | `SELECT COUNT(*) FROM attendance WHERE date = CURRENT_DATE AND status = 'hadir' AND student_id IN (students in my class)` |
| Rata-rata Perkembangan | `SELECT AVG(score) FROM reports WHERE student_id IN (students in my class)` |
| Perlu Perhatian | `SELECT student_id, AVG(score) FROM reports GROUP BY student_id HAVING AVG(score) < 70` |
| Agenda Hari Ini | `SELECT * FROM schedules WHERE day_of_week = EXTRACT(DOW FROM CURRENT_DATE) AND (class_id = $classId OR student_id IN (...))` |
| Progres Siswa | `SELECT s.*, AVG(r.score) as avg_score FROM students s LEFT JOIN reports r ON r.student_id = s.id WHERE s.class_id = $classId GROUP BY s.id` |

### SecurityHome.jsx
| Card | Query |
|------|-------|
| CCTV Aktif | `SELECT COUNT(*) FILTER (WHERE status = 'Online') AS online, COUNT(*) AS total FROM camera_feeds` |
| Pengunjung Hari Ini | `SELECT COUNT(*) FROM visitors WHERE check_in::date = CURRENT_DATE` |
| Insiden Aktif | `SELECT COUNT(*) FROM security_incidents WHERE status = 'Perlu tindakan'` |
| Area Aman | `SELECT COUNT(*) FROM camera_feeds WHERE status = 'Online'` |
| Laporan Keamanan | `SELECT * FROM security_incidents ORDER BY created_at DESC` |
| Panic Alert Aktif | `SELECT COUNT(*) FROM panic_alerts WHERE status = 'Perlu tindakan'` |

### ChildMonitoringPage.jsx (Guardian)
| Card | Query |
|------|-------|
| Profil Anak | `SELECT * FROM students WHERE id IN (SELECT student_id FROM guardian_students WHERE guardian_id = $guardianId)` |
| Progres Semester | `SELECT AVG(score) FROM reports WHERE student_id = $childId` |
| Kehadiran | `SELECT COUNT(*) FILTER (WHERE status = 'hadir') * 100.0 / COUNT(*) FROM attendance WHERE student_id = $childId AND date >= date_trunc('month', CURRENT_DATE)` |
| Catatan Terbaru | `SELECT * FROM reports WHERE student_id = $childId ORDER BY date DESC LIMIT 3` |
| Jadwal Anak | `SELECT * FROM schedules WHERE student_id = $childId OR class_id = (SELECT class_id FROM students WHERE id = $childId)` |

---

## Catatan untuk Migration

1. **`profiles` dibuat via Supabase trigger** — `ON auth.users INSERT`, buat profile row
   dengan `id = NEW.id`, `email = NEW.email`, role default 'teacher'.

2. **RLS (Row Level Security)** — Setiap tabel harus punya policy:
   - `profiles`: SELECT sendiri (by id), UPDATE sendiri
   - `students`: SELECT semua (all roles), INSERT/UPDATE/DELETE hanya admin & teacher
   - `reports`: SELECT guardian → anaknya sendiri, teacher → siswanya sendiri, admin → semua
   - `panic_alerts`: INSERT semua, SELECT security & admin
   - `notifications`: SELECT sendiri (user_id = auth.uid())
   - `settings`: SELECT & UPDATE sendiri

3. **Updated_at trigger** — Buat fungsi `update_updated_at()` yang SET `updated_at = now()`
   untuk tabel: profiles, teachers, students, guardians, reports, settings.

4. **Seed data** — Butuh migration untuk insert data awal:
   - Admin user di auth.users → profile admin
   - Kelas: "Kelas 2-A", "Kelas 3-C", "Kelas 2-B", "Kelas 1-B", "Kelas 3-B", "Kelas Inklusi A"
   - Teacher directory dari `src/data/mockData.js`
   - Students dari `src/data/mockData.js` (dengan class_id mapping)
   - Guardians dari `src/data/mockData.js`
   - Sample reports, notifications
   - Camera feeds (3 untuk SecurityHome)
   - Security incidents (3 untuk SecurityHome)
