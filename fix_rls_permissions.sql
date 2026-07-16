-- ============================================================
-- ISAEK CMS - Διόρθωση Row Level Security (RLS)
-- Τρέξτε αυτό στο SQL Editor του Supabase
-- ============================================================

-- ΒΗΜΑ 1: Απενεργοποίηση RLS σε ΟΛΟΥΣ τους πίνακες
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE specialties DISABLE ROW LEVEL SECURITY;
ALTER TABLE sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE grades DISABLE ROW LEVEL SECURITY;
ALTER TABLE absences DISABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE interests DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records DISABLE ROW LEVEL SECURITY;

-- ΒΗΜΑ 2: Δώστε πλήρη δικαιώματα στο anon και authenticated role
GRANT ALL ON students TO anon, authenticated;
GRANT ALL ON specialties TO anon, authenticated;
GRANT ALL ON sections TO anon, authenticated;
GRANT ALL ON tasks TO anon, authenticated;
GRANT ALL ON contacts TO anon, authenticated;
GRANT ALL ON grades TO anon, authenticated;
GRANT ALL ON absences TO anon, authenticated;
GRANT ALL ON teacher_reports TO anon, authenticated;
GRANT ALL ON events TO anon, authenticated;
GRANT ALL ON courses_data TO anon, authenticated;
GRANT ALL ON interests TO anon, authenticated;
GRANT ALL ON audit_log TO anon, authenticated;
GRANT ALL ON payment_records TO anon, authenticated;
GRANT USAGE ON SEQUENCE audit_log_id_seq TO anon, authenticated;
