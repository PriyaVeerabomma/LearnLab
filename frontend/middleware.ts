import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from the cookies
  const token = request.cookies.get('access_token')?.value 
               || request.headers.get('authorization')?.split(' ')[1] 
               || '';

  // Paths that don't require authentication
  const publicPaths = ['/', '/auth'];
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Check if token exists in localStorage
  const isAuthenticated = token || request.cookies.has('access_token');

  console.log('Middleware Check:', {
    pathname,
    isPublicPath,
    isAuthenticated,
    hasToken: !!token
  });

  // If not authenticated and trying to access protected route
  if (!isAuthenticated && !isPublicPath) {
    console.log('Redirecting to auth - Not authenticated');
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // If authenticated and trying to access auth pages
  if (isAuthenticated && pathname.startsWith('/auth')) {
    console.log('Redirecting to dashboard - Already authenticated');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};