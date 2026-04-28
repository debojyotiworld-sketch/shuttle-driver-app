import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

<<<<<<< HEAD
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';
=======
const supabaseUrl = 'https://ecdfjpnxcbhsbugyxlkd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZGZqcG54Y2Joc2J1Z3l4bGtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3ODA3MzYsImV4cCI6MjA5MjM1NjczNn0.Xwp4RCrocJpKso-lChBpSHmxmNJ2wJY3AWVNe-FJ8BM';
>>>>>>> 0196576 (Major update: Initial commit)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
