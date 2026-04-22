import { createClient } from '@supabase/supabase-js'

// Validate environment variables (Vite uses import.meta.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('SUPABASE URL:', supabaseUrl);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file for:\n' +
    '- VITE_SUPABASE_URL\n' +
    '- VITE_SUPABASE_ANON_KEY\n\n' +
    'Copy .env.example to .env and add your Supabase credentials.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
