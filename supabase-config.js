import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://sydswktememhjapothib.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5ZHN3a3RlbWVtaGphcG90aGliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MDkwNzUsImV4cCI6MjA5ODI4NTA3NX0._0lwAmNk8o0E6WBvqyubWlIS4Q3pYhUGIaiJ5Zzpdh4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
