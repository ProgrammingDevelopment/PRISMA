import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Check if variables are defined to avoid runtime crashes during build if env is missing
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project-id.supabase.co';

export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
