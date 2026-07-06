-- Εκτελέστε το παρακάτω SQL στο SQL Editor του Supabase
-- για να δημιουργηθεί ο πίνακας ιστορικού πληρωμών.

CREATE TABLE IF NOT EXISTS payment_records (
  id text PRIMARY KEY,
  "studentId" text NOT NULL,
  amount numeric NOT NULL,
  "paymentDate" date NOT NULL,
  notes text,
  "createdAt" timestamp with time zone DEFAULT now(),
  "createdBy" text
);

ALTER TABLE payment_records DISABLE ROW LEVEL SECURITY;
