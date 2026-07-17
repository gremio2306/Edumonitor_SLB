-- =============================================================================
-- EduMonitor — Row Level Security (Supabase)
-- =============================================================================
-- File ini berisi seluruh kebijakan RLS berdasarkan skema database.sql.
--
-- Hirarki akses:
--   admin    → akses penuh ke semua data
--   teacher  → data kelas sendiri + laporan sendiri
--   guardian → data anak sendiri
--   security → panic alert, insiden, CCTV, pengunjung
--
-- Urutan: helper function → enable RLS → policies per tabel
-- =============================================================================

-- =============================================================================
-- HELPER FUNCTION: auth_role()
-- Mengembalikan role user saat ini dari tabel profiles.
-- Aman dipanggil dari RLS policy (SECURITY DEFINER bypass RLS profiles).
-- =============================================================================
CREATE OR REPLACE FUNCTION public.auth_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER SET search_path = public
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- =============================================================================
-- HELPER FUNCTION: auth_teacher_id()
-- Mengembalikan ID teacher jika user saat ini terdaftar sebagai guru.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.auth_teacher_id()
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER SET search_path = public
AS $$
    SELECT id FROM public.teachers WHERE user_id = auth.uid()
$$;

-- =============================================================================
-- HELPER FUNCTION: auth_guardian_id()
-- Mengembalikan ID guardian jika user saat ini terdaftar sebagai wali.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.auth_guardian_id()
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER SET search_path = public
AS $$
    SELECT id FROM public.guardians WHERE user_id = auth.uid()
$$;

-- =============================================================================
-- SYNC TRIGGER: profiles.role → auth.users.raw_app_meta_data
-- Memastikan role tersedia di JWT claim untuk performa RLS.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.sync_profile_role_to_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    UPDATE auth.users
    SET raw_app_meta_data =
        COALESCE(raw_app_meta_data, '{}'::jsonb) ||
        jsonb_build_object('role', NEW.role)
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_profiles_sync_role
    AFTER INSERT OR UPDATE OF role ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_profile_role_to_auth();


-- =============================================================================
-- 1. PROFILES
-- =============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Admin: akses penuh ke semua profile
CREATE POLICY profiles_admin_all ON profiles
    FOR ALL
    USING (auth_role() = 'admin')
    WITH CHECK (auth_role() = 'admin');

-- Semua user terautentikasi bisa melihat profile mereka sendiri
CREATE POLICY profiles_select_own ON profiles
    FOR SELECT
    USING (id = auth.uid());

-- User bisa mengupdate data diri mereka sendiri (tidak bisa mengganti role)
CREATE POLICY profiles_update_own ON profiles
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid()
        AND role = (SELECT role FROM profiles WHERE id = auth.uid())
    );


-- =============================================================================
-- 2. TEACHERS
-- =============================================================================
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- Admin: akses penuh
CREATE POLICY teachers_admin_all ON teachers
    FOR ALL
    USING (auth_role() = 'admin')
    WITH CHECK (auth_role() = 'admin');

-- Semua user terautentikasi bisa melihat data guru (nama, kontak)
CREATE POLICY teachers_select_auth ON teachers
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Guru bisa mengupdate data dirinya sendiri
CREATE POLICY teachers_update_own ON teachers
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());


-- =============================================================================
-- 3. CLASSES
-- =============================================================================
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Admin: akses penuh
CREATE POLICY classes_admin_all ON classes
    FOR ALL
    USING (auth_role() = 'admin')
    WITH CHECK (auth_role() = 'admin');

-- Semua user terautentikasi bisa melihat data kelas
CREATE POLICY classes_select_auth ON classes
    FOR SELECT
    USING (auth.uid() IS NOT NULL);


-- =============================================================================
-- 4. STUDENTS
-- =============================================================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Admin: akses penuh
CREATE POLICY students_admin_all ON students
    FOR ALL
    USING (auth_role() = 'admin')
    WITH CHECK (auth_role() = 'admin');

-- Teacher: akses ke siswa di kelasnya sendiri
CREATE POLICY students_teacher_all ON students
    FOR ALL
    USING (
        auth_role() = 'teacher'
        AND EXISTS (
            SELECT 1
            FROM classes c
            JOIN teachers t ON t.id = c.homeroom_teacher_id
            WHERE c.id = class_id
              AND t.user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth_role() = 'teacher'
        AND EXISTS (
            SELECT 1
            FROM classes c
            JOIN teachers t ON t.id = c.homeroom_teacher_id
            WHERE c.id = class_id
              AND t.user_id = auth.uid()
        )
    );

-- Guardian: lihat anaknya sendiri
CREATE POLICY students_guardian_select ON students
    FOR SELECT
    USING (
        auth_role() = 'guardian'
        AND EXISTS (
            SELECT 1
            FROM guardian_students gs
            JOIN guardians g ON g.id = gs.guardian_id
            WHERE gs.student_id = students.id
              AND g.user_id = auth.uid()
        )
    );

-- Security: lihat data siswa (untuk keperluan monitoring / panic alert)
CREATE POLICY students_security_select ON students
    FOR SELECT
    USING (auth_role() = 'security');


-- =============================================================================
-- 5. GUARDIANS
-- =============================================================================
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;

-- Admin: akses penuh
CREATE POLICY guardians_admin_all ON guardians
    FOR ALL
    USING (auth_role() = 'admin')
    WITH CHECK (auth_role() = 'admin');

-- Teacher: lihat data wali murid (untuk siswa di kelasnya)
CREATE POLICY guardians_teacher_select ON guardians
    FOR SELECT
    USING (
        auth_role() = 'teacher'
        AND EXISTS (
            SELECT 1
            FROM guardian_students gs
            JOIN students s ON s.id = gs.student_id
            JOIN classes c ON c.id = s.class_id
            JOIN teachers t ON t.id = c.homeroom_teacher_id
            WHERE gs.guardian_id = guardians.id
              AND t.user_id = auth.uid()
        )
    );

-- Guardian: lihat dan update data dirinya sendiri
CREATE POLICY guardians_select_own ON guardians
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY guardians_update_own ON guardians
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());


-- =============================================================================
-- 6. GUARDIAN_STUDENTS
-- =============================================================================
ALTER TABLE guardian_students ENABLE ROW LEVEL SECURITY;

-- Admin: akses penuh
CREATE POLICY guardian_students_admin_all ON guardian_students
    FOR ALL
    USING (auth_role() = 'admin')
    WITH CHECK (auth_role() = 'admin');

-- Guardian: lihat relasi anaknya sendiri
CREATE POLICY guardian_students_guardian_select ON guardian_students
    FOR SELECT
    USING (
        auth_role() = 'guardian'
        AND guardian_id IN (
            SELECT id FROM guardians WHERE user_id = auth.uid()
        )
    );

-- Teacher: lihat relasi wali untuk siswa di kelasnya
CREATE POLICY guardian_students_teacher_select ON guardian_students
    FOR SELECT
    USING (
        auth_role() = 'teacher'
        AND student_id IN (
            SELECT s.id
            FROM students s
            JOIN classes c ON c.id = s.class_id
            JOIN teachers t ON t.id = c.homeroom_teacher_id
            WHERE t.user_id = auth.uid()
        )
    );


-- =============================================================================
-- 7. REPORTS
-- =============================================================================
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Admin: akses penuh
CREATE POLICY reports_admin_all ON reports
    FOR ALL
    USING (auth_role() = 'admin')
    WITH CHECK (auth_role() = 'admin');

-- Teacher:
--   SELECT: laporan siswa di kelasnya + laporan yang dibuatnya sendiri
--   INSERT: laporan untuk siswa di kelasnya (terkait teacher_id sendiri)
--   UPDATE/DELETE: hanya laporan yang dibuatnya sendiri
CREATE POLICY reports_teacher_select ON reports
    FOR SELECT
    USING (
        auth_role() = 'teacher'
        AND (
            EXISTS (
                SELECT 1
                FROM students s
                JOIN classes c ON c.id = s.class_id
                JOIN teachers t ON t.id = c.homeroom_teacher_id
                WHERE s.id = student_id
                  AND t.user_id = auth.uid()
            )
            OR teacher_id = auth_teacher_id()
        )
    );

CREATE POLICY reports_teacher_insert ON reports
    FOR INSERT
    WITH CHECK (
        auth_role() = 'teacher'
        AND teacher_id = auth_teacher_id()
        AND EXISTS (
            SELECT 1
            FROM students s
            JOIN classes c ON c.id = s.class_id
            JOIN teachers t ON t.id = c.homeroom_teacher_id
            WHERE s.id = student_id
              AND t.user_id = auth.uid()
        )
    );

CREATE POLICY reports_teacher_update ON reports
    FOR UPDATE
    USING (
        auth_role() = 'teacher'
        AND teacher_id = auth_teacher_id()
    )
    WITH CHECK (
        auth_role() = 'teacher'
        AND teacher_id = auth_teacher_id()
        AND EXISTS (
            SELECT 1
            FROM students s
            JOIN classes c ON c.id = s.class_id
            JOIN teachers t ON t.id = c.homeroom_teacher_id
            WHERE s.id = student_id
              AND t.user_id = auth.uid()
        )
    );

CREATE POLICY reports_teacher_delete ON reports
    FOR DELETE
    USING (
        auth_role() = 'teacher'
        AND teacher_id = auth_teacher_id()
    );

-- Guardian: lihat laporan anaknya
CREATE POLICY reports_guardian_select ON reports
    FOR SELECT
    USING (
        auth_role() = 'guardian'
        AND EXISTS (
            SELECT 1
            FROM guardian_students gs
            JOIN guardians g ON g.id = gs.guardian_id
            WHERE gs.student_id = reports.student_id
              AND g.user_id = auth.uid()
        )
    );

-- Security: lihat laporan (untuk monitoring insiden)
CREATE POLICY reports_security_select ON reports
    FOR SELECT
    USING (auth_role() = 'security');


-- =============================================================================
-- 8. NOTIFICATIONS
-- =============================================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Admin: akses penuh (bisa membuat notifikasi untuk user lain)
CREATE POLICY notifications_admin_all ON notifications
    FOR ALL
    USING (auth_role() = 'admin')
    WITH CHECK (auth_role() = 'admin');

-- Semua user terautentikasi: buat notifikasi (digunakan oleh sistem saat
-- membuat laporan, panic alert, atau event lain yang membutuhkan notifikasi)
CREATE POLICY notifications_insert_auth ON notifications
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Setiap user: lihat dan update notifikasinya sendiri
CREATE POLICY notifications_select_own ON notifications
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY notifications_update_own ON notifications
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());


-- =============================================================================
-- 9. PANIC_ALERTS
-- =============================================================================
ALTER TABLE panic_alerts ENABLE ROW LEVEL SECURITY;

-- Admin: akses penuh
CREATE POLICY panic_alerts_admin_all ON panic_alerts
    FOR ALL
    USING (auth_role() = 'admin')
    WITH CHECK (auth_role() = 'admin');

-- Security: lihat semua panic alert + resolve
CREATE POLICY panic_alerts_security_select ON panic_alerts
    FOR SELECT
    USING (auth_role() = 'security');

CREATE POLICY panic_alerts_security_update ON panic_alerts
    FOR UPDATE
    USING (auth_role() = 'security')
    WITH CHECK (auth_role() = 'security');

-- Teacher & Guardian: trigger panic (INSERT) + lihat alert yang mereka buat
CREATE POLICY panic_alerts_trigger_insert ON panic_alerts
    FOR INSERT
    WITH CHECK (
        triggered_by = auth.uid()
        AND auth_role() IN ('teacher', 'guardian', 'security')
    );

CREATE POLICY panic_alerts_select_own ON panic_alerts
    FOR SELECT
    USING (triggered_by = auth.uid());


-- =============================================================================
-- 10. SETTINGS
-- =============================================================================
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Setiap user: akses ke settings-nya sendiri
CREATE POLICY settings_select_own ON settings
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY settings_update_own ON settings
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY settings_insert_own ON settings
    FOR INSERT
    WITH CHECK (user_id = auth.uid());


-- =============================================================================
-- 11. ATTENDANCE
-- =============================================================================
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Admin: akses penuh
CREATE POLICY attendance_admin_all ON attendance
    FOR ALL
    USING (auth_role() = 'admin')
    WITH CHECK (auth_role() = 'admin');

-- Teacher: kelola absensi siswa di kelasnya
CREATE POLICY attendance_teacher_all ON attendance
    FOR ALL
    USING (
        auth_role() = 'teacher'
        AND EXISTS (
            SELECT 1
            FROM students s
            JOIN classes c ON c.id = s.class_id
            JOIN teachers t ON t.id = c.homeroom_teacher_id
            WHERE s.id = student_id
              AND t.user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth_role() = 'teacher'
        AND EXISTS (
            SELECT 1
            FROM students s
            JOIN classes c ON c.id = s.class_id
            JOIN teachers t ON t.id = c.homeroom_teacher_id
            WHERE s.id = student_id
              AND t.user_id = auth.uid()
        )
    );

-- Guardian: lihat absensi anaknya
CREATE POLICY attendance_guardian_select ON attendance
    FOR SELECT
    USING (
        auth_role() = 'guardian'
        AND EXISTS (
            SELECT 1
            FROM guardian_students gs
            JOIN guardians g ON g.id = gs.guardian_id
            WHERE gs.student_id = attendance.student_id
              AND g.user_id = auth.uid()
        )
    );


-- =============================================================================
-- 12. SCHEDULES
-- =============================================================================
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Admin: akses penuh
CREATE POLICY schedules_admin_all ON schedules
    FOR ALL
    USING (auth_role() = 'admin')
    WITH CHECK (auth_role() = 'admin');

-- Teacher: lihat jadwal untuk kelasnya
CREATE POLICY schedules_teacher_select ON schedules
    FOR SELECT
    USING (
        auth_role() = 'teacher'
        AND (
            class_id IN (
                SELECT c.id
                FROM classes c
                JOIN teachers t ON t.id = c.homeroom_teacher_id
                WHERE t.user_id = auth.uid()
            )
            OR student_id IN (
                SELECT s.id
                FROM students s
                JOIN classes c ON c.id = s.class_id
                JOIN teachers t ON t.id = c.homeroom_teacher_id
                WHERE t.user_id = auth.uid()
            )
        )
    );

-- Guardian: lihat jadwal anaknya
CREATE POLICY schedules_guardian_select ON schedules
    FOR SELECT
    USING (
        auth_role() = 'guardian'
        AND (
            schedules.student_id IN (
                SELECT gs.student_id
                FROM guardian_students gs
                JOIN guardians g ON g.id = gs.guardian_id
                WHERE g.user_id = auth.uid()
            )
            OR schedules.class_id IN (
                SELECT s.class_id
                FROM guardian_students gs
                JOIN guardians g ON g.id = gs.guardian_id
                JOIN students s ON s.id = gs.student_id
                WHERE g.user_id = auth.uid()
            )
        )
    );


-- =============================================================================
-- 13. SECURITY_INCIDENTS
-- =============================================================================
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;

-- Admin: akses penuh
CREATE POLICY security_incidents_admin_all ON security_incidents
    FOR ALL
    USING (auth_role() = 'admin')
    WITH CHECK (auth_role() = 'admin');

-- Security: akses penuh (buat, lihat, resolve)
CREATE POLICY security_incidents_security_all ON security_incidents
    FOR ALL
    USING (auth_role() = 'security')
    WITH CHECK (auth_role() = 'security');


-- =============================================================================
-- 14. VISITORS
-- =============================================================================
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Admin: akses penuh
CREATE POLICY visitors_admin_all ON visitors
    FOR ALL
    USING (auth_role() = 'admin')
    WITH CHECK (auth_role() = 'admin');

-- Security: akses penuh (catat pengunjung, lihat daftar)
CREATE POLICY visitors_security_all ON visitors
    FOR ALL
    USING (auth_role() = 'security')
    WITH CHECK (auth_role() = 'security');


-- =============================================================================
-- 15. CAMERA_FEEDS
-- =============================================================================
ALTER TABLE camera_feeds ENABLE ROW LEVEL SECURITY;

-- Admin: akses penuh
CREATE POLICY camera_feeds_admin_all ON camera_feeds
    FOR ALL
    USING (auth_role() = 'admin')
    WITH CHECK (auth_role() = 'admin');

-- Security: lihat daftar kamera
CREATE POLICY camera_feeds_security_select ON camera_feeds
    FOR SELECT
    USING (auth_role() = 'security');

-- Teacher & Guardian: lihat kamera (untuk konteks monitoring)
CREATE POLICY camera_feeds_teacher_select ON camera_feeds
    FOR SELECT
    USING (auth_role() = 'teacher');

CREATE POLICY camera_feeds_guardian_select ON camera_feeds
    FOR SELECT
    USING (auth_role() = 'guardian');
