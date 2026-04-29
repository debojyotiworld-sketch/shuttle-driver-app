import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecdfjpnxcbhsbugyxlkd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZGZqcG54Y2Joc2J1Z3l4bGtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3ODA3MzYsImV4cCI6MjA5MjM1NjczNn0.Xwp4RCrocJpKso-lChBpSHmxmNJ2wJY3AWVNe-FJ8BM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
