-- =============================================================================
-- EduMonitor — Seed Data Master (tanpa dependensi profiles)
-- =============================================================================
-- File ini hanya mengisi data yang TIDAK bergantung pada tabel profiles.
-- Aman dijalankan kapan saja (bahkan sebelum user register).
--
-- Tabel yang diisi:
--   - classes
--   - students
--   - guardians
--   - guardian_students
--   - reports
--   - attendance
--   - schedules
--   - visitors
--
-- IDEMPOTEN: hapus data lama dulu, lalu insert ulang.
-- =============================================================================

-- =============================================================================
-- Hapus data lama (reverse FK order)
-- =============================================================================
DELETE FROM guardian_students;
DELETE FROM schedules;
DELETE FROM attendance;
DELETE FROM reports;
DELETE FROM visitors;
DELETE FROM guardians;
DELETE FROM students;
DELETE FROM classes;

ALTER SEQUENCE classes_id_seq   RESTART WITH 1;
ALTER SEQUENCE students_id_seq  RESTART WITH 1;
ALTER SEQUENCE guardians_id_seq RESTART WITH 1;

-- =============================================================================
-- 1. CLASSES
-- =============================================================================

INSERT INTO classes (name, homeroom_teacher_id) VALUES
    ('Kelas 1-A', NULL),
    ('Kelas 1-B', NULL),
    ('Kelas 2-A', NULL),
    ('Kelas 2-B', NULL),
    ('Kelas 3-A', NULL),
    ('Kelas 3-B', NULL);

-- =============================================================================
-- 2. STUDENTS (24 siswa — 4 per kelas)
-- =============================================================================

INSERT INTO students (name, birth_date, class_id, category) VALUES
    -- Kelas 1-A (class_id = 1)
    ('Aditya Nugraha',     '2017-03-15', 1, 'Autisme'),
    ('Bella Safitri',      '2017-07-22', 1, 'ADHD'),
    ('Candra Wijaya',      '2018-01-10', 1, 'Disleksia'),
    ('Dian Permata Sari',  '2017-11-05', 1, 'Umum'),
    -- Kelas 1-B (class_id = 2)
    ('Eko Prasetyo',       '2017-05-18', 2, 'Autisme'),
    ('Fitri Handayani',    '2017-09-30', 2, 'ADHD'),
    ('Gilang Ramadhan',    '2018-02-14', 2, 'Umum'),
    ('Hana Kirana',        '2017-12-25', 2, 'Disleksia'),
    -- Kelas 2-A (class_id = 3)
    ('Indra Lesmana',      '2016-04-20', 3, 'Autisme'),
    ('Jasmine Putri',      '2016-08-11', 3, 'Umum'),
    ('Kevin Sanjaya',      '2016-01-28', 3, 'ADHD'),
    ('Larasati Dewi',      '2016-10-03', 3, 'Disleksia'),
    -- Kelas 2-B (class_id = 4)
    ('Mega Wulandari',     '2016-06-15', 4, 'Autisme'),
    ('Niko Pratama',       '2016-12-07', 4, 'ADHD'),
    ('Olivia Natasya',     '2017-02-19', 4, 'Umum'),
    ('Putra Hidayat',      '2016-09-14', 4, 'Disleksia'),
    -- Kelas 3-A (class_id = 5)
    ('Qori Az Zahra',      '2015-03-22', 5, 'Autisme'),
    ('Rafi Ahmad',         '2015-07-08', 5, 'ADHD'),
    ('Salsabila Nur',      '2015-11-30', 5, 'Disleksia'),
    ('Teguh Setiawan',     '2015-01-17', 5, 'Umum'),
    -- Kelas 3-B (class_id = 6)
    ('Umar Al Faruq',      '2015-05-12', 6, 'Autisme'),
    ('Vina Amalia',        '2015-08-24', 6, 'Umum'),
    ('Wahyu Saputra',      '2015-10-06', 6, 'ADHD'),
    ('Zahra Aulia',        '2015-04-29', 6, 'Disleksia');

-- =============================================================================
-- 3. GUARDIANS
-- =============================================================================
-- user_id dikosongi (nullable) karena profiles belum tentu ada saat seed ini
-- dijalankan. Admin bisa mengisi user_id nanti secara manual.
-- =============================================================================

INSERT INTO guardians (user_id, name, relation, phone, address) VALUES
    (NULL, 'Budi Santoso',   'Ayah',   '0812-2222-0001', 'Jl. Melati No. 45, Kebayoran Baru, Jakarta Selatan'),
    (NULL, 'Siti Rahmawati', 'Ibu',    '0812-2222-0002', 'Apartemen Green Bay Tower C Lt.12, Pluit'),
    (NULL, 'Hendrawan',      'Kakek',  '0812-2222-0003', 'Jl. Kemang Raya No. 12B, Mampang Prapatan'),
    (NULL, 'Rina Marlina',   'Ibu',    '0812-2222-0004', 'Jl. Anggrek No. 8, Pondok Indah'),
    (NULL, 'Slamet Riyadi',  'Ayah',   '0812-2222-0005', 'Perumahan Bukit Indah Blok C3, Bekasi'),
    (NULL, 'Dewi Lestari',   'Nenek',  '0812-2222-0006', 'Jl. Kenanga No. 21, Depok');

-- =============================================================================
-- 4. GUARDIAN_STUDENTS
-- =============================================================================

INSERT INTO guardian_students (guardian_id, student_id, is_primary) VALUES
    (1, 1,  true),
    (2, 2,  true),
    (3, 3,  true),
    (4, 4,  true),
    (4, 5,  false),
    (5, 6,  true),
    (5, 7,  true),
    (6, 8,  true),
    (1, 9,  false),
    (2, 10, false);

-- =============================================================================
-- 5. REPORTS
-- =============================================================================
-- teacher_id dikosongi (nullable) — tidak ada dependensi ke profiles
-- =============================================================================

INSERT INTO reports (student_id, teacher_id, author_name, report_type, category, date, status, score, stars, note, tags) VALUES
    (1,  NULL, 'Maria Astuti',     'progress',   'Interaksi Sosial',   '2025-01-15', 'BSH', 72, 3, 'Mulai berani menyapa teman sebangku.',              '["Maju Pesat", "Sosial"]'::jsonb),
    (1,  NULL, 'Maria Astuti',     'progress',   'Motorik Halus',      '2025-02-10', 'BSB', 85, 4, 'Mampu memegang pensil dengan benar.',                '["Berkembang"]'::jsonb),
    (1,  NULL, 'Ahmad Subarjo',    'assessment', 'Kemampuan Kognitif', '2025-01-20', 'MB',  45, 2, 'Masih perlu bimbingan dalam mengenal huruf vokal.',   '["Butuh Perhatian"]'::jsonb),
    (2,  NULL, 'Maria Astuti',     'progress',   'Perilaku',           '2025-01-18', 'BSH', 70, 3, 'Duduk tenang selama 15 menit.',                       '["Konsisten"]'::jsonb),
    (2,  NULL, 'Maria Astuti',     'progress',   'Regulasi Emosi',     '2025-02-22', 'MB',  55, 2, 'Terjadi tantrum ringan saat transisi kegiatan.',      '["Butuh Perhatian", "Perilaku"]'::jsonb),
    (3,  NULL, 'Ahmad Subarjo',    'journal',    'Terapi Wicara',      '2025-01-25', 'BB',  30, 1, 'Baru bisa mengucapkan 5 kata dengan jelas.',           '["Terapi Wicara"]'::jsonb),
    (3,  NULL, 'Ahmad Subarjo',    'journal',    'Terapi Wicara',      '2025-02-28', 'MB',  40, 2, 'Mulai meniru ucapan terapis dengan 60% ketepatan.',   '["Terapi Wicara", "Maju Pesat"]'::jsonb),
    (4,  NULL, 'Maria Astuti',     'progress',   'Interaksi Sosial',   '2025-01-12', 'BSB', 90, 5, 'Mampu memimpin permainan kelompok kecil.',            '["Maju Pesat", "Sosial"]'::jsonb),
    (5,  NULL, 'Dewi Sartika',     'progress',   'Motorik Halus',      '2025-01-14', 'BSH', 68, 3, 'Mulai bisa mengancing baju sendiri.',                 '["Berkembang"]'::jsonb),
    (5,  NULL, 'Dewi Sartika',     'progress',   'Kemampuan Kognitif', '2025-02-18', 'BSB', 82, 4, 'Berhitung 1-20 dengan benar.',                        '["Akademik"]'::jsonb),
    (6,  NULL, 'Dewi Sartika',     'assessment', 'Perilaku',           '2025-01-30', 'MB',  50, 2, 'Perlu pengawasan saat bermain dengan teman.',          '["Perilaku"]'::jsonb),
    (7,  NULL, 'Dewi Sartika',     'journal',    'Okupasi',            '2025-02-05', 'BSH', 75, 3, 'Menyelesaikan puzzle 12 keping dalam 5 menit.',       '["Okupasi"]'::jsonb),
    (8,  NULL, 'Maria Astuti',     'progress',   'Membaca',            '2025-02-12', 'BSH', 70, 3, 'Membaca 10 kata per menit.',                         '["Akademik"]'::jsonb),
    (9,  NULL, 'Bambang Pamungkas','progress',   'Olahraga',           '2025-01-22', 'BSB', 88, 4, 'Melempar dan menangkap bola dengan baik.',             '["Fisik"]'::jsonb),
    (10, NULL, 'Bambang Pamungkas','progress',   'Olahraga',           '2025-02-20', 'BSH', 78, 3, 'Mengikuti senam pagi dengan tertib.',                  '["Fisik"]'::jsonb),
    (11, NULL, 'Maria Astuti',     'progress',   'Interaksi Sosial',   '2025-01-08', 'BB',  35, 1, 'Masih sulit berbagi mainan dengan teman.',             '["Perilaku", "Butuh Perhatian"]'::jsonb),
    (12, NULL, 'Ahmad Subarjo',    'journal',    'Terapi Wicara',      '2025-02-15', 'BSH', 65, 3, 'Mulai menggunakan kalimat 3 kata.',                    '["Terapi Wicara"]'::jsonb),
    (13, NULL, 'Bambang Pamungkas','assessment', 'Motorik Kasar',      '2025-01-28', 'MB',  48, 2, 'Perlu latihan keseimbangan.',                          '["Fisik"]'::jsonb),
    (14, NULL, 'Maria Astuti',     'progress',   'Regulasi Emosi',     '2025-02-25', 'BSH', 70, 3, 'Mengelola emosi marah dengan teknik napas dalam.',     '["Maju Pesat"]'::jsonb),
    (15, NULL, 'Dewi Sartika',     'progress',   'Kemampuan Kognitif', '2025-01-05', 'BSB', 92, 5, 'Mengenal semua huruf alfabet.',                        '["Akademik"]'::jsonb);

-- =============================================================================
-- 6. ATTENDANCE
-- =============================================================================

INSERT INTO attendance (student_id, date, status, notes) VALUES
    (1,  '2025-01-06', 'hadir', NULL),
    (1,  '2025-01-07', 'hadir', NULL),
    (1,  '2025-01-08', 'sakit', 'Demam ringan'),
    (1,  '2025-01-09', 'hadir', NULL),
    (1,  '2025-01-10', 'hadir', NULL),
    (2,  '2025-01-06', 'hadir', NULL),
    (2,  '2025-01-07', 'izin',  'Ada acara keluarga'),
    (2,  '2025-01-08', 'hadir', NULL),
    (2,  '2025-01-09', 'hadir', NULL),
    (2,  '2025-01-10', 'hadir', NULL),
    (3,  '2025-01-06', 'hadir', NULL),
    (3,  '2025-01-07', 'hadir', NULL),
    (3,  '2025-01-08', 'hadir', NULL),
    (3,  '2025-01-09', 'alpha', 'Tidak ada kabar'),
    (3,  '2025-01-10', 'hadir', NULL),
    (4,  '2025-01-06', 'hadir', NULL),
    (4,  '2025-01-07', 'hadir', NULL),
    (4,  '2025-01-08', 'hadir', NULL),
    (4,  '2025-01-09', 'hadir', NULL),
    (4,  '2025-01-10', 'sakit', 'Flu'),
    (9,  '2025-01-06', 'hadir', NULL),
    (9,  '2025-01-07', 'hadir', NULL),
    (9,  '2025-01-08', 'hadir', NULL),
    (9,  '2025-01-09', 'hadir', NULL),
    (9,  '2025-01-10', 'hadir', NULL),
    (10, '2025-01-06', 'hadir', NULL),
    (10, '2025-01-07', 'sakit', 'Batuk'),
    (10, '2025-01-08', 'sakit', 'Batuk'),
    (10, '2025-01-09', 'hadir', NULL),
    (10, '2025-01-10', 'hadir', NULL),
    (11, '2025-01-06', 'hadir', NULL),
    (11, '2025-01-07', 'hadir', NULL),
    (11, '2025-01-08', 'izin', 'Keperluan dokter'),
    (11, '2025-01-09', 'hadir', NULL),
    (11, '2025-01-10', 'hadir', NULL),
    (12, '2025-01-06', 'hadir', NULL),
    (12, '2025-01-07', 'hadir', NULL),
    (12, '2025-01-08', 'hadir', NULL),
    (12, '2025-01-09', 'sakit', 'Demam'),
    (12, '2025-01-10', 'hadir', NULL),
    (17, '2025-01-06', 'hadir', NULL),
    (17, '2025-01-07', 'hadir', NULL),
    (17, '2025-01-08', 'hadir', NULL),
    (17, '2025-01-09', 'hadir', NULL),
    (17, '2025-01-10', 'hadir', NULL),
    (18, '2025-01-06', 'alpha', 'Tidak ada keterangan'),
    (18, '2025-01-07', 'hadir', NULL),
    (18, '2025-01-08', 'hadir', NULL),
    (18, '2025-01-09', 'hadir', NULL),
    (18, '2025-01-10', 'sakit', 'Sakit perut');

-- =============================================================================
-- 7. SCHEDULES
-- =============================================================================

INSERT INTO schedules (student_id, class_id, title, description, day_of_week, date, start_time, end_time, location, schedule_type) VALUES
    (1,  NULL, 'Terapi Wicara',    'Sesi individu dengan terapis wicara',        2, NULL, '09:00', '10:00', 'Ruang Terapi 1', 'Terapi Wicara'),
    (3,  NULL, 'Terapi Wicara',    'Sesi individu dengan terapis wicara',        3, NULL, '10:00', '11:00', 'Ruang Terapi 1', 'Terapi Wicara'),
    (NULL, 1,   'Belajar Bersama', 'Kegiatan belajar kelompok Kelas 1-A',        1, NULL, '08:00', '10:00', 'Kelas 1-A',       'Belajar'),
    (NULL, 1,   'Olahraga',        'Olahraga bersama Kelas 1-A',                 4, NULL, '07:30', '08:30', 'Lapangan',        'Kelas'),
    (NULL, 2,   'Belajar Bersama', 'Kegiatan belajar kelompok Kelas 1-B',        1, NULL, '08:00', '10:00', 'Kelas 1-B',       'Belajar'),
    (NULL, 3,   'Belajar Bersama', 'Kegiatan belajar kelompok Kelas 2-A',        1, NULL, '08:00', '10:00', 'Kelas 2-A',       'Belajar'),
    (NULL, 4,   'Belajar Bersama', 'Kegiatan belajar kelompok Kelas 2-B',        1, NULL, '08:00', '10:00', 'Kelas 2-B',       'Belajar'),
    (13, NULL, 'Terapi Okupasi',   'Latihan motorik halus dengan terapis okupasi',5, NULL, '13:00', '14:00', 'Ruang Terapi 2', 'Terapi Okupasi'),
    (NULL, 5,   'Asesmen Bulanan', 'Asesmen perkembangan bulanan Kelas 3-A',     NULL, '2025-01-25', '08:00', '12:00', 'Aula',            'Asesmen'),
    (NULL, 6,   'Asesmen Bulanan', 'Asesmen perkembangan bulanan Kelas 3-B',     NULL, '2025-01-25', '13:00', '16:00', 'Aula',            'Asesmen'),
    (NULL, 1,   'Evaluasi Semester', 'Evaluasi perkembangan siswa semester ganjil', NULL, '2025-03-17', '08:00', '15:00', 'Aula Serbaguna', 'Evaluasi');

-- =============================================================================
-- 8. VISITORS
-- =============================================================================

INSERT INTO visitors (name, purpose, check_in, check_out) VALUES
    ('Andi Wijaya',         'Menemui wali kelas — Ibu Maria Astuti',                   now() - interval '2 days' + interval '8 hours',  now() - interval '2 days' + interval '10 hours'),
    ('Rina Marlina',        'Mengantar anak — Bella Safitri',                           now() - interval '1 day' + interval '7 hours',    now() - interval '1 day' + interval '7 hours 30 minutes'),
    ('Budi Santoso',        'Rapat dengan Kepala Sekolah',                             now() - interval '1 day' + interval '9 hours',    now() - interval '1 day' + interval '11 hours'),
    ('Slamet Riyadi',       'Mengambil rapor anak — Eko Prasetyo',                     now() + interval '7 hours',                      NULL),
    ('Dr. Fitriani',        'Kunjungan dokter — pemeriksaan berkala siswa',             now() + interval '8 hours',                      NULL),
    ('Kurir Logistic Jaya', 'Mengantar alat terapi okupasi',                           now() - interval '3 hours',                      NULL);
