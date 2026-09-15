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

async function testAuth() {
  const email = `writer_test_${Date.now()}@example.com`;
  const password = 'Password123!@#Test';
  const { data, error } = await client.auth.signUp({
    email,
    password,
  });

  console.log('SignUp result:', {
    user: data?.user ? { id: data.user.id, email: data.user.email, confirmed_at: data.user.confirmed_at } : null,
    session: data?.session ? 'HAS_SESSION' : 'NO_SESSION',
    error: error?.message,
  });
}

testAuth();
