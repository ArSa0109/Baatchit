import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Use environment variables for Supabase URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const STORAGE_URL = `${supabaseUrl}/storage/v1/object/public`;