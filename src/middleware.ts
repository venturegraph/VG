import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // We only protect /admin routes
  if (pathname.startsWith('/admin')) {
    const { response, user } = await updateSession(request);

    // If user is trying to access login page (/admin)
    if (pathname === '/admin') {
      // If already authenticated, redirect to /admin/posts
      if (user) {
        return NextResponse.redirect(new URL('/admin/posts', request.url));
      }
      return response;
    }

    // For any other /admin/* route (e.g. /admin/posts, /admin/new, etc.)
    // If not authenticated, redirect to /admin
    if (!user) {
      const redirectUrl = new URL('/admin', request.url);
      // Optional: keep original intended destination
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths starting with /admin
     */
    '/admin/:path*',
  ],
};
