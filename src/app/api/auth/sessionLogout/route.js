// src/app/api/auth/sessionLogout/route.js
import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

export async function POST(request) {
  const sessionCookie = request.cookies.get('__session')?.value || '';

  if (!sessionCookie) {
    // No session cookie, nothing to revoke, consider it a success
    return NextResponse.json({ status: 'success' }, { status: 200 });
  }

  try {
    // Verify the cookie and get the decoded claims
    const decodedClaims = await auth().verifySessionCookie(sessionCookie);

    // Revoke the refresh tokens for the user
    await auth().revokeRefreshTokens(decodedClaims.sub); // sub is the user's UID

    // Clear the session cookie on the client
     const response = NextResponse.json({ status: 'success' }, { status: 200 });
     response.cookies.set({
       name: '__session',
       value: '',
       maxAge: -1, // Expire the cookie immediately
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       path: '/',
       sameSite: 'lax',
     });

    return response;

  } catch (error) {
    console.error('Error revoking session cookie:', error);
     // Even if revocation fails (e.g., cookie already invalid), clear the cookie
     const response = NextResponse.json({ error: 'Failed to revoke session', details: error.message }, { status: 500 });
     response.cookies.set({
       name: '__session',
       value: '',
       maxAge: -1,
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       path: '/',
       sameSite: 'lax',
     });
     return response;
  }
}
