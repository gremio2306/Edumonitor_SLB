-- Migration: Update CHECK constraint panic_alerts_status_check
-- Menambahkan nilai status: pending, responding, resolved
-- Menghapus nilai lama: Perlu tindakan, Selesai (tidak dihapus, tetap bisa dipakai)
-- Jalanakan di Supabase SQL Editor

ALTER TABLE panic_alerts DROP CONSTRAINT IF EXISTS panic_alerts_status_check;

ALTER TABLE panic_alerts ADD CONSTRAINT panic_alerts_status_check
    CHECK (status IN ('pending', 'Perlu tindakan', 'responding', 'resolved', 'Selesai'));
