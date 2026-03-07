import { createClient } from '@supabase/supabase-js';

// Mengambil kunci rahasia dari brankas .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Menyalakan mesin penghubung
export const supabase = createClient(supabaseUrl, supabaseKey);