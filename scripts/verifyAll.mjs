import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Locate .env.local in root or parent
const envPath = fs.existsSync('.env.local')
  ? '.env.local'
  : path.resolve('..', '.env.local');

const envLocal = fs.readFileSync(envPath, 'utf8');
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

export const client = createClient(supabaseUrl, supabaseAnonKey);

export async function runVerification() {
  console.log('================================================================');
  console.log('SUPABASE POST-MIGRATION VERIFICATION AUDIT');
  console.log('================================================================');

  // TEST 1: Query profiles for bazighchohan@gmail.com
  console.log('\n[TEST 1] Querying public.profiles for bazighchohan@gmail.com:');
  const { data: profileData, error: profileErr } = await client
    .from('profiles')
    .select('*')
    .eq('email', 'bazighchohan@gmail.com');

  if (profileErr) {
    console.log('ERROR:', profileErr.message);
  } else {
    console.log('Result Row:', JSON.stringify(profileData, null, 2));
  }

  // TEST 2 & 3: Query published posts via anonymous client
  console.log('\n[TEST 2 & 3] Anonymous client query for published posts:');
  const { data: publishedPosts, error: pubErr } = await client
    .from('posts')
    .select('id, title, slug, status, content_type, author_id, published_at, created_at')
    .eq('status', 'published')
    .is('deleted_at', null);

  if (pubErr) {
    console.log('ERROR:', pubErr.message);
  } else {
    console.log(`Found ${publishedPosts?.length ?? 0} published post(s):`);
    console.log(JSON.stringify(publishedPosts, null, 2));
  }

  return { profileData, publishedPosts };
}

if (process.argv[1]?.endsWith('verifyAll.mjs')) {
  runVerification();
}
