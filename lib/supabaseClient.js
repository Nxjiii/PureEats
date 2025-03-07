import { createClient } from '@supabase/supabase-js';
import Config from 'react-native-config';

// Retrieve  Supabase URL and Anon Key from env
const SUPABASE_URL = Config.SUPABASE_URL;
const SUPABASE_ANON_KEY = Config.SUPABASE_ANON_KEY;

// Create and export the Supabase client instance using the environment variables
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// debugging log to confirm they're loading correctly
console.log('Supabase URL:', SUPABASE_URL);
console.log('Supabase Anon Key:', SUPABASE_ANON_KEY);