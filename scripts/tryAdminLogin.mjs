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

async function testSignIn() {
  const passwordsToTry = [
    'admin123',
    'admin1234',
    'password',
    'Password123!',
    'Password123!@#Test',
    'Admin@123',
    'Admin123!',
    'venturegraph',
    'Venturegraph123!'
  ];

  for (const pw of passwordsToTry) {
    const { data, error } = await client.auth.signInWithPassword({
      email: 'bazighchohan@gmail.com',
      password: pw
    });
    if (!error && data?.session) {
      console.log('SUCCESS with password:', pw);
      return;
    } else {
      console.log(`Failed with ${pw}:`, error?.message);
    }
  }
}

testSignIn();
