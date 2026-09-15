import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const envLocal = fs.readFileSync('.env.local', 'utf8');
let supabaseUrl = '';
let supabaseAnonKey = '';

for (const line of envLocal.split('\n')) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    supabaseUrl = line.replace('NEXT_PUBLIC_SUPABASE_URL=', '').trim();
  }
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    supabaseAnonKey = line.replace('NEXT_PUBLIC_SUPABASE_ANON_KEY=', '').trim();
  }
}

const client = createClient(supabaseUrl, supabaseAnonKey);

async function testAnonAuth() {
  const { data, error } = await client.auth.signInAnonymously();
  console.log('Anonymous sign-in result:', data, 'Error:', error);
}

testAnonAuth();
