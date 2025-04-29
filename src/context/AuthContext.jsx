'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const AuthContext = createContext({
  user: null,
  loading: true,
  signOutUser: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to call API route to set session cookie
   const setSessionCookie = useCallback(async (currentUser) => {
        if (currentUser) {
            try {
                const idToken = await currentUser.getIdToken(true); // Force refresh the token
                await fetch('/api/auth/sessionLogin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ idToken }),
                });
                 console.log("Session cookie set successfully.");
            } catch (error) {
                console.error("Failed to set session cookie:", error);
                // Handle error appropriately, maybe sign out user?
                await firebaseSignOut(auth); // Sign out if cookie setting fails
            }
        } else {
            // User signed out, call logout API to clear cookie
            try {
                await fetch('/api/auth/sessionLogout', { method: 'POST' });
                 console.log("Session cookie cleared successfully.");
            } catch (error) {
                console.error("Failed to clear session cookie:", error);
            }
        }
   }, []);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        await setSessionCookie(currentUser); // Create/clear cookie on auth state change
        setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [setSessionCookie]);

  const signOutUser = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth); // This triggers onAuthStateChanged, which calls setSessionCookie(null)
       setUser(null); // Explicitly set user to null immediately
    } catch (error) {
      console.error("Error signing out: ", error);
    } finally {
       // No need to call setSessionCookie here again, onAuthStateChanged handles it.
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signOutUser,
  };

  // Don't render children until loading is false to ensure correct auth state
  return (
      <AuthContext.Provider value={value}>
          {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
