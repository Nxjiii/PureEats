import { createClient } from "@supabase/supabase-js";


const SUPABASE_URL = "https://enqgmnrcblvfseeainwf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVucWdtbnJjYmx2ZnNlZWFpbndmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4ODEyMzQsImV4cCI6MjA1NjQ1NzIzNH0.3rOXm3zRIK-PiUSOIBcgd37hlxidx0tGRSxE1sp417E";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

//supabaseClient.js
