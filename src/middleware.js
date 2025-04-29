import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin'; // Use Admin SDK for server-side auth check

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session')?.value || '';

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/survey/[surveyId]/edit', '/survey/new', '/survey/[surveyId]/results', '/settings', '/pricing']; // Add /pricing if needed

  // Check if the current path matches any protected route pattern
   const isProtectedRoute = protectedRoutes.some(route => {
     if (route.includes('[')) {
       // Handle dynamic routes like /survey/[surveyId]/edit
       const pattern = new RegExp(`^${route.replace(/\[.*?\]/g, '[^/]+')}$`);
       return pattern.test(pathname);
     }
     return pathname.startsWith(route);
   });


  if (isProtectedRoute) {
    try {
       // Verify the session cookie using Firebase Admin SDK
      await auth().verifySessionCookie(sessionCookie, true /** checkRevoked */);
      // User is authenticated, allow request to proceed
      return NextResponse.next();
    } catch (error) {
       // Session cookie is invalid or expired. Redirect to login page.
      console.log('Middleware: Auth check failed, redirecting to /auth.', error.code);
      const loginUrl = new URL('/auth', request.url);
      loginUrl.searchParams.set('redirect', pathname); // Add redirect query param
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow request to proceed for public routes
  return NextResponse.next();
}

// Define matcher for routes that should run through the middleware
export const config = {
   // Apply middleware to all routes except API, _next/static, _next/image, favicon.ico, and the auth page itself
   matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
};
