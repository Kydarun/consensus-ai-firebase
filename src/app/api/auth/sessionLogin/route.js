// src/app/api/auth/sessionLogin/route.js
import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

export async function POST(request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds

    // Create the session cookie. This will also verify the ID token.
    const sessionCookie = await auth().createSessionCookie(idToken, { expiresIn });

    // Set cookie policy options.
    const options = {
        name: '__session',
        value: sessionCookie,
        maxAge: expiresIn / 1000, // maxAge is in seconds
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        path: '/',
        sameSite: 'lax', // Recommended for session cookies
    };


     const response = NextResponse.json({ status: 'success' }, { status: 200 });
     response.cookies.set(options);

    return response;

  } catch (error) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json({ error: 'Failed to create session', details: error.message }, { status: 401 });
  }
}
