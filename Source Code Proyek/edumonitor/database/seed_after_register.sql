-- =============================================================================
-- EduMonitor — Seed Data Setelah Register
-- =============================================================================
-- File ini hanya boleh dijalankan SETELAH ada user yang terdaftar
-- via Supabase Auth (register atau invite), sehingga tabel profiles terisi.
--
-- Prioritas profile yang dipakai: teacher → security → admin → guardian → pertama
-- Karena panic_alert seharusnya dibuat oleh teacher.
--
-- Jika profiles masih kosong, semua INSERT dilewati.
-- =============================================================================

DO $$
DECLARE
    profile_id UUID;
    has_profile BOOLEAN;
BEGIN
    SELECT EXISTS (SELECT 1 FROM profiles) INTO has_profile;

    IF NOT has_profile THEN
        RAISE NOTICE 'SKIP: Tabel profiles kosong. Seed after register dilewati.';
        RETURN;
    END IF;

    SELECT id INTO profile_id FROM profiles WHERE role = 'teacher'  LIMIT 1;
    IF profile_id IS NULL THEN SELECT id INTO profile_id FROM profiles WHERE role = 'security' LIMIT 1; END IF;
    IF profile_id IS NULL THEN SELECT id INTO profile_id FROM profiles WHERE role = 'admin'    LIMIT 1; END IF;
    IF profile_id IS NULL THEN SELECT id INTO profile_id FROM profiles WHERE role = 'guardian' LIMIT 1; END IF;
    IF profile_id IS NULL THEN SELECT id INTO profile_id FROM profiles                         LIMIT 1; END IF;

    -- =========================================================================
    -- 1. NOTIFICATIONS
    -- =========================================================================

    INSERT INTO notifications (user_id, type, title, body, is_read, related_entity_type, created_at) VALUES
        (profile_id, 'info',    'Selamat Datang',    'Sistem EduMonitor siap digunakan.',                       true,  NULL,         '2025-01-01 08:00:00+07'),
        (profile_id, 'progress','Rapor Siswa',       'Rapor bulan Januari telah diterbitkan.',                  false, NULL,         '2025-02-01 10:00:00+07'),
        (profile_id, 'info',    'Jadwal Terapi',     'Sesi terapi wicara untuk Aditya pukul 09:00.',             true,  NULL,         '2025-01-10 07:00:00+07'),
        (profile_id, 'danger',  'Peringatan',        'Aditya terdeteksi keluar dari zona aman.',                false, 'panic_alert','2025-02-15 11:30:00+07'),
        (profile_id, 'danger',  'Panic Alert',       'Panic alert dikirim oleh Maria Astuti — Kelas 2-A.',       false, 'panic_alert','2025-03-01 09:15:00+07'),
        (profile_id, 'info',    'Pengunjung Baru',   'Tamu atas nama Andi Wijaya telah check in.',              true,  NULL,         '2025-03-02 08:30:00+07'),
        (profile_id, 'note',    'Catatan Guru',      'Sesi hari ini berjalan lancar — siswa sangat kooperatif.', false, NULL,         '2025-03-03 12:00:00+07'),
        (profile_id, 'info',    'Perkembangan Ananda','Bella menunjukkan kemajuan dalam interaksi sosial.',       false, NULL,         '2025-02-10 14:00:00+07'),
        (profile_id, 'progress','Laporan Baru',      'Laporan terbaru untuk Aditya telah tersedia.',            false, NULL,         '2025-02-20 16:00:00+07');

    -- =========================================================================
    -- 2. PANIC_ALERTS
    -- =========================================================================

    INSERT INTO panic_alerts (student_id, triggered_by, triggered_by_name, triggered_by_role, location, status, resolved_by, resolved_at, created_at) VALUES
        (9,  profile_id, 'Maria Astuti',     'teacher', 'Kelas 2-A — Siswa mengalami kejang', 'Selesai',
             profile_id, now() - interval '1 day',  now() - interval '2 days'),
        (5,  profile_id, 'Maria Astuti',     'teacher', 'Kelas 1-B',                        'Perlu tindakan',
             NULL,       NULL,                        now() - interval '6 hours'),
        (13, profile_id, 'Budi Santoso',     'guardian','Kelas 2-B',                        'Perlu tindakan',
             NULL,       NULL,                        now() - interval '1 hour');

    -- =========================================================================
    -- 3. SECURITY_INCIDENTS
    -- =========================================================================

    INSERT INTO security_incidents (title, description, location, reported_by, officer_name, status, incident_type, created_at) VALUES
        ('Pintu gerbang terbuka',    'Pintu gerbang belakang ditemukan tidak terkunci pada pagi hari.',         'Gerbang Belakang',    profile_id, 'Dimas Prasetyo', 'Selesai',        'warning', now() - interval '5 days'),
        ('Orang tidak dikenal',      'Seseorang tidak dikenal terlihat di area parkir guru.',                    'Area Parkir',         NULL,        'Maria Astuti',   'Selesai',        'danger',  now() - interval '3 days'),
        ('Lampu koridor mati',       'Lampu di koridor selatan mati total — membahayakan siswa.',                'Koridor Selatan',     profile_id, 'Dimas Prasetyo', 'Perlu tindakan', 'warning', now() - interval '1 day'),
        ('Tamu mencurigakan',        'Seorang tamu tidak dapat menunjukkan identitas yang jelas saat check-in.', 'Resepsionis',         NULL,        'Joko Susilo',    'Perlu tindakan', 'warning', now());

END;
$$;
