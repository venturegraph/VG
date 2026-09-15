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

async function main() {
  console.log('--- Inspecting DB & Auth ---');
  // Check profiles
  const { data: profiles, error: pErr } = await client.from('profiles').select('*');
  console.log('Profiles:', profiles, 'Error:', pErr);

  // Check posts
  const { data: posts, error: postErr } = await client.from('posts').select('*');
  console.log('Posts visible to anon:', posts, 'Error:', postErr);
}

main();
