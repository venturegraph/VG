import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

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

const writerEmail = 'writer.test.venturegraph@gmail.com';
const writerPassword = 'Password123!@#Test';

async function testAuthenticatedUpdate() {
  console.log('================================================================');
  console.log('TEST 2: AUTHENTICATED NON-ADMIN STATUS ESCALATION UPDATE');
  console.log('================================================================');

  const client = createClient(supabaseUrl, supabaseAnonKey);

  // 1. Authenticate as non-admin writer
  console.log(`\nAttempting sign-in as writer: ${writerEmail}...`);
  const { data: authData, error: authErr } = await client.auth.signInWithPassword({
    email: writerEmail,
    password: writerPassword,
  });

  if (authErr) {
    console.error('Writer Authentication Failed:', {
      message: authErr.message,
      status: authErr.status,
    });
    console.log('\nNOTE: If "Email not confirmed", run in Supabase SQL Editor:');
    console.log(`UPDATE auth.users SET email_confirmed_at = now() WHERE email = '${writerEmail}';`);
    return;
  }

  const user = authData.user;
  console.log(`Authenticated successfully as user ID: ${user.id} (${user.email})`);

  // Verify role in public.profiles
  const { data: profile } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  console.log(`Verified user role in public.profiles: "${profile?.role}"`);

  // 2. Insert or retrieve an existing pending_review post authored by this writer
  console.log('\nCreating/verifying an existing pending_review post authored by writer...');
  const testSlug = `pending-audit-${Date.now()}`;
  const { data: insertedPost, error: insertErr } = await client
    .from('posts')
    .insert([
      {
        title: 'Draft Autopsy by Writer',
        slug: testSlug,
        content_type: 'case_study',
        content: 'This post is pending editorial review.',
        status: 'pending_review',
        author_id: user.id,
      },
    ])
    .select('id, title, slug, status, author_id')
    .single();

  if (insertErr) {
    console.error('Failed to create pending_review test post:', insertErr);
    return;
  }

  console.log('Target post for update test:', insertedPost);

  // 3. Now attempt the unauthorized status escalation:
  // As a writer, update status to 'published'
  console.log('\nAttempting: client.from("posts").update({ status: "published" }).eq("id", ...)');
  const { data: updateData, error: updateErr } = await client
    .from('posts')
    .update({ status: 'published' })
    .eq('id', insertedPost.id)
    .select();

  console.log('\n--- ACTUAL QUERY RESULT ---');
  console.log('Update Data Returned:', updateData);
  console.log('Update Error Object:', updateErr ? {
    message: updateErr.message,
    code: updateErr.code,
    details: updateErr.details,
    hint: updateErr.hint,
  } : 'UNEXPECTED: No error returned (Security Vulnerability)');

  if (updateErr?.code === '42501') {
    console.log('\n[PASS] Successfully verified 42501 RLS WITH CHECK violation for non-admin status escalation.');
  }
}

testAuthenticatedUpdate();
