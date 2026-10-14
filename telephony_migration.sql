-- ============================================================
-- ISAEK CMS — Telephony / CTI Integration
-- Νέοι πίνακες για iPECS SME τηλεφωνικό κέντρο
-- Εκτελέστε στο SQL Editor του Supabase
-- ============================================================

-- 1. call_log: Ιστορικό κλήσεων (SMDR data + parsed events)
CREATE TABLE IF NOT EXISTS call_log (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  call_ref_id integer,
  direction text,              -- 'incoming', 'outgoing', 'missed', 'internal'
  caller_number text,          -- αριθμός καλούντος
  caller_name text,            -- όνομα (από contacts lookup ή SMDR StationName)
  called_number text,          -- αριθμός που κλήθηκε
  station_number text,         -- εσωτερικό extension
  station_name text,           -- όνομα σταθμού
  start_time timestamptz,      -- χρόνος έναρξης
  duration text,               -- 'hh:mm:ss'
  duration_seconds integer,    -- διάρκεια σε δευτερόλεπτα (για sorting/filtering)
  status text,                 -- 'answered', 'missed', 'busy', 'rejected'
  disconnect_cause text,       -- αιτία τερματισμού
  contact_id text,             -- FK → contacts.id (αν βρέθηκε αντιστοίχιση)
  co_number text,              -- CO line number
  notes text,
  raw_data jsonb,              -- πλήρες SMDR/event JSON για debugging
  created_at timestamptz DEFAULT now()
);

-- Indexes για γρήγορο querying
CREATE INDEX IF NOT EXISTS idx_call_log_start_time ON call_log(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_call_log_caller ON call_log(caller_number);
CREATE INDEX IF NOT EXISTS idx_call_log_direction ON call_log(direction);
CREATE INDEX IF NOT EXISTS idx_call_log_station ON call_log(station_number);
CREATE INDEX IF NOT EXISTS idx_call_log_contact ON call_log(contact_id);

-- 2. live_calls: Real-time active calls (για popup notifications)
CREATE TABLE IF NOT EXISTS live_calls (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  call_ref_id integer UNIQUE,
  event_type text,             -- 'ringing', 'connected', 'released', 'held'
  caller_number text,
  caller_name text,            -- auto-matched from contacts
  called_number text,
  station_number text,
  station_name text,
  contact_id text,             -- FK → contacts.id
  started_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_live_calls_event ON live_calls(event_type);
CREATE INDEX IF NOT EXISTS idx_live_calls_updated ON live_calls(updated_at);

-- ============================================================
-- Απενεργοποίηση RLS (εσωτερικό CMS — ίδιο pattern με υπόλοιπο schema)
-- ============================================================
ALTER TABLE call_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE live_calls DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- Enable Realtime on live_calls (απαραίτητο για push notifications)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE live_calls;
