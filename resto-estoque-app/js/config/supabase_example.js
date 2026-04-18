import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL      = 'COLOQUE_AQUI_SUA_PROJECT_URL';
const SUPABASE_ANON_KEY = 'COLOQUE_AQUI_SUA_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);