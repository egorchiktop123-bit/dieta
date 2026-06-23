import { createClient } from '@supabase/supabase-js'

// Ключи берутся из .env (см. .env.example). В git не коммитятся.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('[Supabase] Не заданы VITE_SUPABASE_URL / VITE_SUPABASE_KEY. Скопируй .env.example в .env и впиши ключи.')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
