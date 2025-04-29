'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EmailAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import FirebaseUI from '@/components/FirebaseUI';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


const AuthPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard'); // Redirect to dashboard if already logged in
    }
  }, [user, loading, router]);

  // FirebaseUI config
  const uiConfig = {
    signInFlow: 'popup',
    signInOptions: [
      GoogleAuthProvider.PROVIDER_ID,
      EmailAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      signInSuccessWithAuthResult: () => {
        router.push('/dashboard'); // Redirect after successful sign-in
        return false; // Prevent default redirect by FirebaseUI
      },
      uiShown: function() {
        // The widget is rendered.
        // Hide the loader.
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'none';
        }
      }
    },
    signInSuccessUrl: '/dashboard', // Fallback redirect URL
  };

  if (loading) {
     return (
        <div className="flex justify-center items-center min-h-screen">
             <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
     )
  }

   if (user) {
    // User is already logged in, show nothing or a message while redirecting
    return null;
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
       <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign In / Sign Up</CardTitle>
          <CardDescription>Access your Consensus AI dashboard</CardDescription>
        </CardHeader>
        <CardContent>
           <div id="loader" className="flex justify-center items-center py-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
           </div>
           <FirebaseUI uiConfig={uiConfig} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
