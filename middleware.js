// middleware.js
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const isAdmin = token?.role === 'admin';
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin');

  if (isAdminPage) {
    if (!isAuth) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  // For protected routes that aren't admin-specific
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') || 
                          req.nextUrl.pathname.startsWith('/profile');
  
  if (isProtectedRoute && !isAuth) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Allow public routes
  const isPublicRoute = req.nextUrl.pathname.startsWith('/login') || 
                        req.nextUrl.pathname.startsWith('/register') || 
                        req.nextUrl.pathname === '/';
  
  if (isPublicRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Define which paths should be processed by this middleware
export const config = {
  matcher: [
    '/admin/:path*', 
    '/dashboard/:path*', 
    '/profile/:path*',
    '/login',
    '/register',
    '/'
  ],
};