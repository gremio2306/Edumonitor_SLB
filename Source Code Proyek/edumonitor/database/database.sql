-- =============================================================================
-- EduMonitor — Database Production untuk Supabase
-- =============================================================================
-- File ini berisi CREATE TABLE, CREATE INDEX, FOREIGN KEY, PRIMARY KEY,
-- UNIQUE, CHECK, DEFAULT, Trigger, Function, dan View dashboard.
--
-- Dapat langsung dijalankan di Supabase SQL Editor.
-- Tidak mengandung Row Level Security atau seed data.
-- =============================================================================

-- =============================================================================
-- 1. TABEL PROFILES
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id              UUID        NOT NULL PRIMARY KEY,
    email           TEXT        NOT NULL,
    name            TEXT        NOT NULL,
    role            TEXT        NOT NULL,
    phone           TEXT,
    avatar_url      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT profiles_role_check
        CHECK (role IN ('admin', 'teacher', 'guardian', 'security')),

    CONSTRAINT profiles_email_unique
        UNIQUE (email),

    CONSTRAINT profiles_id_fkey
        FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles (role);


-- =============================================================================
-- 2. TABEL TEACHERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS teachers (
    id          SERIAL      NOT NULL PRIMARY KEY,
    user_id     UUID,
    name        TEXT        NOT NULL,
    email       TEXT        NOT NULL,
    phone       TEXT        NOT NULL,
    role        TEXT        NOT NULL,
    status      TEXT        NOT NULL DEFAULT 'Aktif',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT teachers_role_check
        CHECK (role IN ('Wali Kelas', 'Terapis Wicara', 'Kepala Sekolah', 'Admin', 'Guru Olahraga')),

    CONSTRAINT teachers_status_check
        CHECK (status IN ('Aktif', 'Tidak Aktif', 'Cuti', 'Luar Kota')),

    CONSTRAINT teachers_user_id_unique
        UNIQUE (user_id),

    CONSTRAINT teachers_email_unique
        UNIQUE (email),

    CONSTRAINT teachers_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES profiles (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers (user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_email   ON teachers (email);
CREATE INDEX IF NOT EXISTS idx_teachers_role    ON teachers (role);


-- =============================================================================
-- 3. TABEL CLASSES
-- =============================================================================
CREATE TABLE IF NOT EXISTS classes (
    id                  SERIAL      NOT NULL PRIMARY KEY,
    name                TEXT        NOT NULL,
    homeroom_teacher_id INTEGER,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT classes_name_unique
        UNIQUE (name),

    CONSTRAINT classes_homeroom_teacher_fkey
        FOREIGN KEY (homeroom_teacher_id) REFERENCES teachers (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_classes_name ON classes (name);

CREATE UNIQUE INDEX IF NOT EXISTS idx_classes_homeroom_teacher
    ON classes (homeroom_teacher_id)
    WHERE homeroom_teacher_id IS NOT NULL;


-- =============================================================================
-- 4. TABEL STUDENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS students (
    id          SERIAL      NOT NULL PRIMARY KEY,
    name        TEXT        NOT NULL,
    birth_date  DATE        NOT NULL,
    class_id    INTEGER     NOT NULL,
    category    TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT students_category_check
        CHECK (category IN ('Autisme', 'ADHD', 'Disleksia', 'Umum')),

    CONSTRAINT students_class_id_fkey
        FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_students_class_id  ON students (class_id);
CREATE INDEX IF NOT EXISTS idx_students_category  ON students (category);
CREATE INDEX IF NOT EXISTS idx_students_name      ON students (name);


-- =============================================================================
-- 5. TABEL GUARDIANS
-- =============================================================================
CREATE TABLE IF NOT EXISTS guardians (
    id          SERIAL      NOT NULL PRIMARY KEY,
    user_id     UUID,
    name        TEXT        NOT NULL,
    relation    TEXT        NOT NULL,
    phone       TEXT        NOT NULL,
    address     TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT guardians_relation_check
        CHECK (relation IN ('Ayah', 'Ibu', 'Kakek', 'Nenek', 'Saudara')),

    CONSTRAINT guardians_user_id_unique
        UNIQUE (user_id),

    CONSTRAINT guardians_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES profiles (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_guardians_user_id ON guardians (user_id);
CREATE INDEX IF NOT EXISTS idx_guardians_name    ON guardians (name);


-- =============================================================================
-- 6. TABEL GUARDIAN_STUDENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS guardian_students (
    guardian_id INTEGER NOT NULL,
    student_id  INTEGER NOT NULL,
    is_primary  BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT guardian_students_pkey
        PRIMARY KEY (guardian_id, student_id),

    CONSTRAINT guardian_students_guardian_id_fkey
        FOREIGN KEY (guardian_id) REFERENCES guardians (id) ON DELETE CASCADE,

    CONSTRAINT guardian_students_student_id_fkey
        FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_guardian_students_student
    ON guardian_students (student_id);


-- =============================================================================
-- 7. TABEL REPORTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS reports (
    id          BIGSERIAL   NOT NULL PRIMARY KEY,
    student_id  INTEGER     NOT NULL,
    teacher_id  INTEGER,
    author_name TEXT        NOT NULL,
    report_type TEXT        NOT NULL,
    category    TEXT        NOT NULL,
    date        DATE        NOT NULL,
    status      TEXT        NOT NULL,
    score       INTEGER,
    stars       INTEGER,
    note        TEXT,
    tags        JSONB       NOT NULL DEFAULT '[]'::jsonb,
    photo_url   TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT reports_type_check
        CHECK (report_type IN ('progress', 'assessment', 'journal')),

    CONSTRAINT reports_status_check
        CHECK (status IN ('BB', 'MB', 'BSH', 'BSB')),

    CONSTRAINT reports_score_check
        CHECK (score >= 0 AND score <= 100),

    CONSTRAINT reports_stars_check
        CHECK (stars >= 1 AND stars <= 5),

    CONSTRAINT reports_student_id_fkey
        FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,

    CONSTRAINT reports_teacher_id_fkey
        FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_student_id   ON reports (student_id);
CREATE INDEX IF NOT EXISTS idx_reports_teacher_id   ON reports (teacher_id);
CREATE INDEX IF NOT EXISTS idx_reports_date         ON reports (date);
CREATE INDEX IF NOT EXISTS idx_reports_type         ON reports (report_type);
CREATE INDEX IF NOT EXISTS idx_reports_category     ON reports (category);
CREATE INDEX IF NOT EXISTS idx_reports_student_date ON reports (student_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_reports_tags         ON reports USING GIN (tags);


-- =============================================================================
-- 8. TABEL NOTIFICATIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id                  BIGSERIAL   NOT NULL PRIMARY KEY,
    user_id             UUID        NOT NULL,
    type                TEXT        NOT NULL,
    title               TEXT        NOT NULL,
    body                TEXT,
    is_read             BOOLEAN     NOT NULL DEFAULT false,
    related_entity_type TEXT,
    related_entity_id   INTEGER,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT notifications_type_check
        CHECK (type IN ('danger', 'progress', 'info', 'note')),

    CONSTRAINT notifications_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES profiles (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id       ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at    ON notifications (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
    ON notifications (user_id, is_read)
    WHERE is_read = false;


-- =============================================================================
-- 9. TABEL PANIC_ALERTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS panic_alerts (
    id                BIGSERIAL   NOT NULL PRIMARY KEY,
    student_id        INTEGER,
    triggered_by      UUID        NOT NULL,
    triggered_by_name TEXT        NOT NULL,
    triggered_by_role TEXT        NOT NULL,
    location          TEXT,
    status            TEXT        NOT NULL DEFAULT 'Perlu tindakan',
    resolved_by       UUID,
    resolved_at       TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT panic_alerts_triggered_by_role_check
        CHECK (triggered_by_role IN ('admin', 'teacher', 'guardian', 'security')),

    CONSTRAINT panic_alerts_status_check
        CHECK (status IN ('Perlu tindakan', 'Selesai')),

    CONSTRAINT panic_alerts_student_id_fkey
        FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE SET NULL,

    CONSTRAINT panic_alerts_triggered_by_fkey
        FOREIGN KEY (triggered_by) REFERENCES profiles (id),

    CONSTRAINT panic_alerts_resolved_by_fkey
        FOREIGN KEY (resolved_by) REFERENCES profiles (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_panic_alerts_status      ON panic_alerts (status);
CREATE INDEX IF NOT EXISTS idx_panic_alerts_created_at  ON panic_alerts (created_at DESC);

-- Migration: tambah kolom untuk integrasi frontend panic button
ALTER TABLE panic_alerts
    ADD COLUMN IF NOT EXISTS latitude       DECIMAL(10,7),
    ADD COLUMN IF NOT EXISTS longitude      DECIMAL(10,7),
    ADD COLUMN IF NOT EXISTS location_name  TEXT,
    ADD COLUMN IF NOT EXISTS note           TEXT,
    ADD COLUMN IF NOT EXISTS teacher_id     INTEGER REFERENCES teachers (id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS class_id       INTEGER REFERENCES classes (id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ;

-- Migration: update status CHECK untuk mendukung 'responding' dan 'resolved'
ALTER TABLE panic_alerts DROP CONSTRAINT IF EXISTS panic_alerts_status_check;
ALTER TABLE panic_alerts ADD CONSTRAINT panic_alerts_status_check
    CHECK (status IN ('pending', 'Perlu tindakan', 'responding', 'resolved', 'Selesai'));

-- Trigger untuk updated_at
CREATE OR REPLACE FUNCTION update_panic_alerts_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_panic_alerts_updated_at ON panic_alerts;
CREATE TRIGGER trg_panic_alerts_updated_at
    BEFORE UPDATE ON panic_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_panic_alerts_updated_at();


-- =============================================================================
-- 10. TABEL SETTINGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS settings (
    user_id              UUID        NOT NULL PRIMARY KEY,
    language             TEXT        NOT NULL DEFAULT 'Bahasa Indonesia',
    notifications_enabled BOOLEAN    NOT NULL DEFAULT true,
    privacy_enabled      BOOLEAN    NOT NULL DEFAULT true,
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT settings_language_check
        CHECK (language IN ('Bahasa Indonesia', 'English')),

    CONSTRAINT settings_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES profiles (id) ON DELETE CASCADE
);


-- =============================================================================
-- 11. TABEL ATTENDANCE
-- =============================================================================
CREATE TABLE IF NOT EXISTS attendance (
    id          BIGSERIAL   NOT NULL PRIMARY KEY,
    student_id  INTEGER     NOT NULL,
    date        DATE        NOT NULL,
    status      TEXT        NOT NULL,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT attendance_status_check
        CHECK (status IN ('hadir', 'sakit', 'izin', 'alpha')),

    CONSTRAINT attendance_student_date_unique
        UNIQUE (student_id, date),

    CONSTRAINT attendance_student_id_fkey
        FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_attendance_student_date
    ON attendance (student_id, date);


-- =============================================================================
-- 12. TABEL SCHEDULES
-- =============================================================================
CREATE TABLE IF NOT EXISTS schedules (
    id            BIGSERIAL   NOT NULL PRIMARY KEY,
    student_id    INTEGER,
    class_id      INTEGER,
    title         TEXT        NOT NULL,
    description   TEXT,
    day_of_week   INTEGER,
    date          DATE,
    start_time    TIME        NOT NULL,
    end_time      TIME,
    location      TEXT,
    schedule_type TEXT        NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT schedules_day_of_week_check
        CHECK (day_of_week >= 0 AND day_of_week <= 6),

    CONSTRAINT schedules_type_check
        CHECK (schedule_type IN (
            'Terapi Okupasi', 'Terapi Wicara', 'Asesmen',
            'Belajar', 'Kelas', 'Evaluasi'
        )),

    CONSTRAINT schedules_at_least_one_owner_check
        CHECK ((student_id IS NOT NULL) OR (class_id IS NOT NULL)),

    CONSTRAINT schedules_student_id_fkey
        FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,

    CONSTRAINT schedules_class_id_fkey
        FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_schedules_student ON schedules (student_id);
CREATE INDEX IF NOT EXISTS idx_schedules_class   ON schedules (class_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date    ON schedules (date);


-- =============================================================================
-- 13. TABEL SECURITY_INCIDENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS security_incidents (
    id            BIGSERIAL   NOT NULL PRIMARY KEY,
    title         TEXT        NOT NULL,
    description   TEXT,
    location      TEXT,
    reported_by   UUID,
    officer_name  TEXT,
    status        TEXT        NOT NULL DEFAULT 'Perlu tindakan',
    incident_type TEXT        NOT NULL DEFAULT 'warning',
    resolved_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT security_incidents_status_check
        CHECK (status IN ('Perlu tindakan', 'Selesai', 'Aman')),

    CONSTRAINT security_incidents_type_check
        CHECK (incident_type IN ('warning', 'success', 'danger')),

    CONSTRAINT security_incidents_reported_by_fkey
        FOREIGN KEY (reported_by) REFERENCES profiles (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_security_incidents_status ON security_incidents (status);
CREATE INDEX IF NOT EXISTS idx_security_incidents_type   ON security_incidents (incident_type);


-- =============================================================================
-- 14. TABEL VISITORS
-- =============================================================================
CREATE TABLE IF NOT EXISTS visitors (
    id          BIGSERIAL   NOT NULL PRIMARY KEY,
    name        TEXT        NOT NULL,
    purpose     TEXT        NOT NULL,
    check_in    TIMESTAMPTZ NOT NULL DEFAULT now(),
    check_out   TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visitors_check_in ON visitors (check_in DESC);


-- =============================================================================
-- 15. TABEL CAMERA_FEEDS
-- =============================================================================
CREATE TABLE IF NOT EXISTS camera_feeds (
    id          SERIAL      NOT NULL PRIMARY KEY,
    name        TEXT        NOT NULL,
    location    TEXT        NOT NULL,
    stream_url  TEXT        NOT NULL,
    status      TEXT        NOT NULL DEFAULT 'Online',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT camera_feeds_status_check
        CHECK (status IN ('Online', 'Offline', 'Maintenance'))
);


-- =============================================================================
-- TRIGGER: updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_teachers_updated_at
    BEFORE UPDATE ON teachers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_guardians_updated_at
    BEFORE UPDATE ON guardians
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();


-- =============================================================================
-- TRIGGER: create profile + settings on auth.users signup
-- =============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_name  TEXT;
    v_role  TEXT;
BEGIN
    v_name := COALESCE(
        NEW.raw_user_meta_data ->> 'name',
        split_part(NEW.email, '@', 1)
    );
    v_role := COALESCE(
        NEW.raw_user_meta_data ->> 'role',
        'teacher'
    );

    INSERT INTO profiles (id, email, name, role)
    VALUES (NEW.id, NEW.email, v_name, v_role);

    INSERT INTO settings (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();


-- =============================================================================
-- VIEWS DASHBOARD
-- =============================================================================

-- -----------------------------------------------------------------------------
-- student_progress_view
-- Digunakan oleh: TeacherHome, StudentDetailPage, ChildMonitoringPage
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW student_progress_view AS
SELECT
    s.id,
    s.name,
    s.birth_date,
    s.category,
    s.class_id,
    c.name                               AS class_name,
    c.homeroom_teacher_id,
    COUNT(r.id)                          AS report_count,
    COALESCE(AVG(r.score)::int, 0)       AS avg_score,
    COALESCE(MAX(r.score), 0)            AS max_score,
    COALESCE(MIN(r.score), 0)            AS min_score,
    ROUND(COALESCE(
        (SELECT COUNT(*)::float
         FROM attendance a
         WHERE a.student_id = s.id AND a.status = 'hadir'
        ) / NULLIF(
            (SELECT COUNT(*) FROM attendance a WHERE a.student_id = s.id),
            0
        ) * 100,
        0
    ))::int                               AS attendance_rate,
    COALESCE(
        (SELECT AVG(r2.score)::int
         FROM reports r2
         WHERE r2.student_id = s.id
           AND r2.date >= CURRENT_DATE - 7
        ),
        0
    )                                     AS weekly_avg_score
FROM students s
LEFT JOIN classes c  ON c.id = s.class_id
LEFT JOIN reports r  ON r.student_id = s.id
GROUP BY s.id, s.name, s.birth_date, s.category, s.class_id, c.name, c.homeroom_teacher_id;


-- -----------------------------------------------------------------------------
-- teacher_class_view
-- Digunakan oleh: TeacherHome
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW teacher_class_view AS
SELECT
    t.id              AS teacher_id,
    t.name            AS teacher_name,
    c.id              AS class_id,
    c.name            AS class_name,
    COUNT(DISTINCT s.id)                                           AS student_count,
    COUNT(DISTINCT r.id)                                           AS total_reports,
    COUNT(DISTINCT r.id) FILTER (WHERE r.date = CURRENT_DATE)     AS today_reports,
    COALESCE(AVG(r.score)::int, 0)                                AS class_avg_score,
    COUNT(DISTINCT s.id) FILTER (WHERE COALESCE(
        (SELECT AVG(r2.score) FROM reports r2 WHERE r2.student_id = s.id),
        0
    ) < 70)                                                        AS below_target_count,
    t.role            AS teacher_role,
    t.status          AS teacher_status
FROM teachers t
LEFT JOIN classes c           ON c.homeroom_teacher_id = t.id
LEFT JOIN students s          ON s.class_id = c.id
LEFT JOIN reports r           ON r.student_id = s.id
GROUP BY t.id, t.name, c.id, c.name, t.role, t.status;


-- -----------------------------------------------------------------------------
-- guardian_dashboard_view
-- Digunakan oleh: ChildMonitoringPage
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW guardian_dashboard_view AS
SELECT
    g.id                         AS guardian_id,
    g.name                       AS guardian_name,
    g.relation                   AS guardian_relation,
    s.id                         AS student_id,
    s.name                       AS student_name,
    s.class_id,
    c.name                       AS class_name,
    s.category                   AS student_category,
    gs.is_primary,
    spv.avg_score                AS student_avg_score,
    spv.report_count             AS student_report_count,
    spv.attendance_rate          AS student_attendance_rate
FROM guardians g
JOIN guardian_students gs        ON gs.guardian_id = g.id
JOIN students s                  ON s.id = gs.student_id
LEFT JOIN classes c              ON c.id = s.class_id
LEFT JOIN student_progress_view spv ON spv.id = s.id;


-- -----------------------------------------------------------------------------
-- admin_dashboard_stats
-- Digunakan oleh: AdminHome — semua card statistik
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM students)                                                 AS total_students,
    (SELECT COUNT(*) FROM teachers WHERE status = 'Aktif')                          AS active_teachers,
    (SELECT COUNT(*) FROM guardians)                                                AS total_guardians,
    (SELECT COUNT(*) FROM reports)                                                  AS total_reports,
    (SELECT COUNT(*) FROM reports
     WHERE date >= date_trunc('month', CURRENT_DATE))                               AS reports_this_month,
    (SELECT COUNT(*) FROM notifications WHERE is_read = false)                      AS unread_notifications,
    (SELECT COUNT(*) FROM students
     WHERE created_at >= date_trunc('month', CURRENT_DATE))                         AS new_students_this_month,
    (SELECT COUNT(*) FROM students
     WHERE created_at >= date_trunc('year', CURRENT_DATE))                          AS new_students_this_year;


-- -----------------------------------------------------------------------------
-- student_category_distribution
-- Digunakan oleh: AdminHome — grafik kategori pendampingan
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW student_category_distribution AS
SELECT
    category,
    COUNT(*)                                    AS student_count,
    ROUND(
        COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (),
        1
    )                                           AS percentage
FROM students
GROUP BY category
ORDER BY category;


-- -----------------------------------------------------------------------------
-- today_attendance_view
-- Digunakan oleh: TeacherHome — kehadiran hari ini
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW today_attendance_view AS
SELECT
    c.id                      AS class_id,
    c.name                    AS class_name,
    c.homeroom_teacher_id,
    COUNT(DISTINCT s.id)      AS total_students,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'hadir')  AS present_count,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'sakit')  AS sick_count,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'izin')   AS excused_count,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'alpha')  AS absent_count,
    CASE
        WHEN COUNT(DISTINCT s.id) > 0
        THEN ROUND(
            COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'hadir') * 100.0
            / COUNT(DISTINCT s.id),
            1
        )
        ELSE 0
    END                       AS attendance_percentage
FROM classes c
LEFT JOIN students s          ON s.class_id = c.id
LEFT JOIN attendance a        ON a.student_id = s.id AND a.date = CURRENT_DATE
GROUP BY c.id, c.name, c.homeroom_teacher_id
ORDER BY c.name;


-- -----------------------------------------------------------------------------
-- active_panic_alerts_view
-- Digunakan oleh: SecurityHome — panic alert aktif
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW active_panic_alerts_view AS
SELECT
    pa.id,
    pa.student_id,
    s.name                    AS student_name,
    pa.triggered_by,
    p.name                    AS triggered_by_name,
    pa.triggered_by_role,
    pa.location,
    pa.latitude,
    pa.longitude,
    pa.location_name,
    pa.note,
    pa.teacher_id,
    t.name                    AS teacher_name,
    pa.class_id,
    c.name                    AS class_name,
    pa.status,
    pa.created_at,
    pa.updated_at,
    pa.resolved_by,
    pr.name                   AS resolved_by_name,
    pa.resolved_at
FROM panic_alerts pa
LEFT JOIN students s          ON s.id = pa.student_id
LEFT JOIN teachers t          ON t.id = pa.teacher_id
LEFT JOIN classes c           ON c.id = pa.class_id
LEFT JOIN profiles p          ON p.id = pa.triggered_by
LEFT JOIN profiles pr         ON pr.id = pa.resolved_by
WHERE pa.status IN ('pending', 'Perlu tindakan', 'responding')
ORDER BY pa.created_at DESC;


-- -----------------------------------------------------------------------------
-- security_dashboard_view
-- Digunakan oleh: SecurityHome — seluruh ringkasan
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW security_dashboard_view AS
SELECT
    COALESCE(
        (SELECT COUNT(*) FROM camera_feeds WHERE status = 'Online'),
        0
    )                                               as online_cameras,
    COALESCE(
        (SELECT COUNT(*) FROM camera_feeds),
        0
    )                                               as total_cameras,
    COALESCE(
        (SELECT COUNT(*)
         FROM visitors
         WHERE check_in::date = CURRENT_DATE),
        0
    )                                               as today_visitors,
    COALESCE(
        (SELECT COUNT(*)
         FROM visitors
         WHERE check_in::date = CURRENT_DATE AND check_out IS NULL),
        0
    )                                               as visitors_in_building,
    COALESCE(
        (SELECT COUNT(*)
         FROM security_incidents
         WHERE status = 'Perlu tindakan'),
        0
    )                                               as active_incidents,
    COALESCE(
         (SELECT COUNT(*)
          FROM panic_alerts
          WHERE status IN ('pending', 'Perlu tindakan', 'responding')),
         0
    )                                               as active_panic_alerts;


-- -----------------------------------------------------------------------------
-- monthly_growth_view
-- Digunakan oleh: AdminHome — grafik pertumbuhan siswa
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW monthly_growth_view AS
SELECT
    date_trunc('month', created_at)::date  AS month,
    COUNT(*)                               AS new_students,
    SUM(COUNT(*)) OVER (
        ORDER BY date_trunc('month', created_at)
    )                                      AS cumulative
FROM students
GROUP BY date_trunc('month', created_at)
ORDER BY month;


-- -----------------------------------------------------------------------------
-- student_category_reports_view
-- Digunakan oleh: ReportsPage — rata-rata skor per kategori
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW student_category_reports_view AS
SELECT
    s.category                              AS student_category,
    r.category                              AS report_category,
    COUNT(*)                                AS report_count,
    COALESCE(AVG(r.score)::int, 0)          AS avg_score,
    MAX(r.date)                             AS latest_report_date
FROM students s
JOIN reports r                              ON r.student_id = s.id
WHERE r.score IS NOT NULL
GROUP BY s.category, r.category
ORDER BY s.category, r.category;
