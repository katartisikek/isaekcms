-- ============================================================
-- ISAEK CMS - Πλήρες Schema Βάσης Δεδομένων (Supabase)
-- Εκτελέστε στο SQL Editor του Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS specialties (
  id text PRIMARY KEY,
  title text NOT NULL,
  sector text
);

CREATE TABLE IF NOT EXISTS sections (
  id text PRIMARY KEY,
  name text NOT NULL,
  "specialtyId" text,
  semester text
);

CREATE TABLE IF NOT EXISTS students (
  id text PRIMARY KEY,
  "fullName" text NOT NULL,
  phone text,
  email text,
  "specialtyId" text,
  "sectionId" text,
  "mathitisAr" text,
  year text,
  "totalDebt" numeric DEFAULT 0,
  "paidAmount" numeric DEFAULT 0,
  "hasInstallments" boolean DEFAULT false,
  "numberOfInstallments" integer DEFAULT 1,
  notes text,
  status text,
  amka text,
  afm text,
  "idNumber" text,
  documents jsonb,
  "bekDegree" jsonb
);

CREATE TABLE IF NOT EXISTS tasks (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text,
  status text,
  "assignedTo" text,
  "dueDate" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS contacts (
  id text PRIMARY KEY,
  name text NOT NULL,
  role text,
  phone text,
  email text,
  department text,
  notes text
);

CREATE TABLE IF NOT EXISTS grades (
  id text PRIMARY KEY,
  "studentId" text,
  "courseTitle" text,
  "progressGrade" text,
  "finalGrade" text
);

CREATE TABLE IF NOT EXISTS absences (
  id text PRIMARY KEY,
  "studentId" text,
  date text,
  hours integer,
  "courseTitle" text,
  type text,
  notes text
);

CREATE TABLE IF NOT EXISTS teacher_reports (
  id text PRIMARY KEY,
  "teacherId" text,
  "teacherName" text,
  "sectionId" text,
  "sectionName" text,
  "specialtyTitle" text,
  "courseTitle" text,
  date text,
  hours integer,
  timestamp timestamp with time zone,
  "absentStudents" jsonb,
  status text,
  "arrivalTime" text,
  "departureTime" text
);

CREATE TABLE IF NOT EXISTS events (
  id text PRIMARY KEY,
  title text NOT NULL,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  type text,
  description text
);

CREATE TABLE IF NOT EXISTS courses_data (
  "specialtyId" text PRIMARY KEY,
  data jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS interests (
  id text PRIMARY KEY,
  "lastName" text NOT NULL,
  "firstName" text NOT NULL,
  email text,
  phone text,
  "specialtyId" text,
  comments text,
  "createdAt" timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id bigserial PRIMARY KEY,
  action text NOT NULL,
  entity text NOT NULL,
  entity_name text,
  user_name text,
  details text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_records (
  id text PRIMARY KEY,
  "studentId" text NOT NULL,
  amount numeric NOT NULL,
  "paymentDate" date NOT NULL,
  notes text,
  "createdAt" timestamp with time zone DEFAULT now(),
  "createdBy" text
);

-- ============================================================
-- Απενεργοποίηση Row Level Security (εσωτερικό CMS)
-- ============================================================
ALTER TABLE specialties DISABLE ROW LEVEL SECURITY;
ALTER TABLE sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
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

-- ============================================================
-- Προσθήκη στηλών που μπορεί να λείπουν από παλιότερες εκδόσεις
-- (Ασφαλής εκτέλεση - δεν επηρεάζει υπάρχοντα δεδομένα)
-- ============================================================
ALTER TABLE students ADD COLUMN IF NOT EXISTS "paidAmount" numeric DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS amka text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS afm text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "idNumber" text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS documents jsonb;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "bekDegree" jsonb;
ALTER TABLE teacher_reports ADD COLUMN IF NOT EXISTS "arrivalTime" text;
ALTER TABLE teacher_reports ADD COLUMN IF NOT EXISTS "departureTime" text;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS notes text;
