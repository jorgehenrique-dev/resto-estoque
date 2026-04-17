// ============================================================================
// js/config/supabase.js
// RESPONSABILIDADE: Inicializar e exportar o cliente do Supabase.
//
// COMO PREENCHER:
//  1. Acesse https://supabase.com e abra seu projeto.
//  2. Vá em "Project Settings" > "API".
//  3. Copie a "Project URL" e cole em SUPABASE_URL.
//  4. Copie a chave "anon / public" e cole em SUPABASE_ANON_KEY.
// ============================================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ─── SUAS CREDENCIAIS ────────────────────────────────────────────────────────
const SUPABASE_URL      = 'https://zndzynaswziiuzqigcww.supabase.co';
const SUPABASE_ANON_KEY = 'CeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZHp5bmFzd3ppaXV6cWlnY3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTUyODgsImV4cCI6MjA5MjAzMTI4OH0.8O6A8OTLwv72od5EySi9GG0VjS8veMftqabvjRCpkUA';
// ─────────────────────────────────────────────────────────────────────────────

// Cria o cliente que será utilizado em todo o projeto
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Cliente Supabase configurado!');
