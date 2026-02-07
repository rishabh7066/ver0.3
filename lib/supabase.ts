
import { createClient } from '@supabase/supabase-js';

// Safe environment access helper to prevent "process is not defined" crashes in browser
const getEnv = (key: string, fallback: string) => {
  // Check for Vite/Modern browsers
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  // Check for Node.js/Webpack
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

// --- SUPABASE CONFIGURATION ---
// Project: blacksky
// Using the specific credentials provided
const SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://tzphgwhwfepmxrpitgkg.supabase.co');
const SUPABASE_ANON_KEY = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6cGhnd2h3ZmVwbXhycGl0Z2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MzY2NjIsImV4cCI6MjA4NjAxMjY2Mn0.wJQ2kprowIQ0qWI0Ldz-JlrZNN98JRxvwyFS_dguX0g');

// Helper to check if key looks like a JWT (contains 2 dots)
const isValidSupabaseKey = (key: string) => {
  return key && key.split('.').length === 3;
};

const hasValidConfig = 
  SUPABASE_URL !== '' && 
  SUPABASE_ANON_KEY !== '' && 
  !SUPABASE_URL.includes('YOUR_SUPABASE_URL');

export const isSupabaseConfigured = hasValidConfig && isValidSupabaseKey(SUPABASE_ANON_KEY);

if (hasValidConfig && !isSupabaseConfigured) {
  console.warn("⚠️ CRITICAL: The provided Supabase Key does not look like a valid Anon Key (JWT). Supabase has been disabled to prevent app crashes.");
}

export const supabase = isSupabaseConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;
