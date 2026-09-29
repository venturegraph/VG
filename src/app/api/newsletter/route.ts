import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, consent, source_path, honeypot } = body;

    // Silent rejection if honeypot was filled by an automated bot
    if (honeypot && String(honeypot).trim() !== '') {
      return NextResponse.json({ success: true, message: 'Subscribed successfully' });
    }

    // Validate email format
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Validate consent
    if (consent !== true) {
      return NextResponse.json(
        { success: false, error: 'You must agree to receive the weekly email dispatch.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanSourcePath = typeof source_path === 'string' ? source_path.slice(0, 500) : null;

    const supabase = createClient();
    const { error } = await supabase.from('newsletter_subscribers').insert({
      email: cleanEmail,
      consent: true,
      source_path: cleanSourcePath,
    });

    if (error) {
      // Prevent user enumeration: duplicate emails return the same success payload
      if (
        error.code === '23505' ||
        error.message?.toLowerCase().includes('unique') ||
        error.message?.toLowerCase().includes('duplicate')
      ) {
        return NextResponse.json({ success: true, message: 'Subscribed successfully' });
      }

      console.error('Newsletter subscription database error:', error);
      return NextResponse.json(
        { success: false, error: 'Unable to process subscription. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Subscribed successfully' });
  } catch (err) {
    console.error('Newsletter API route error:', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
