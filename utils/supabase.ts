import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptkgstjgjdwnegsfcndo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0a2dzdGpnamR3bmVnc2ZjbmRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MjU5OTQsImV4cCI6MjA3ODUwMTk5NH0.HbdmtM25r2icFpKi1dlhe1dm5Rfiqe-ck7Cwwk_cHW8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
