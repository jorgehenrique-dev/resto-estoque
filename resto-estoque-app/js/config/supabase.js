

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';


const SUPABASE_URL      = 'https://zndzynaswziiuzqigcww.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZHp5bmFzd3ppaXV6cWlnY3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTUyODgsImV4cCI6MjA5MjAzMTI4OH0.8O6A8OTLwv72od5EySi9GG0VjS8veMftqabvjRCpkUA';
// ─────────────────────────────────────────────────────────────────────────────


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Cliente Supabase configurado!');
