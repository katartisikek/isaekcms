import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://japsfgsbyulflefnwkij.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphcHNmZ3NieXVsZmxlZm53a2lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzODEwMDUsImV4cCI6MjA5Nzk1NzAwNX0.UUaJu9IUKUzokUqMJW_MhC7wW0ain1WLXVvbiRjT1ss';

export const supabase = createClient(supabaseUrl, supabaseKey);
