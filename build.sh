#!/bin/bash
# build.sh
# Esse script roda antes do deploy e gera o supabase.js com as variáveis reais

cat > resto-estoque-app/js/config/supabase.js << EOF
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL      = '${SUPABASE_URL}';
const SUPABASE_ANON_KEY = '${SUPABASE_ANON_KEY}';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('✅ Supabase configurado!');
EOF

echo "✅ supabase.js gerado com sucesso!"