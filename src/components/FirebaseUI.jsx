'use client';

import { useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

const FirebaseUI = ({ uiConfig }) => {
  const { user, loading } = useAuth(); // Get user and loading state
  const elementRef = useRef(null);
  const uiInstanceRef = useRef(null); // Ref to store the UI instance

  useEffect(() => {
    // Initialize or get the UI instance only once
    if (!uiInstanceRef.current) {
      uiInstanceRef.current = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
    }
    const uiInstance = uiInstanceRef.current;

    // Render the widget only if:
    // 1. We are not loading the auth state.
    // 2. The user is not logged in.
    // 3. The container element exists.
    if (!loading && !user && elementRef.current) {
       console.log("Starting FirebaseUI...")
      uiInstance.start(elementRef.current, uiConfig);
    }

    // Cleanup is handled by the component unmounting or dependencies changing
    // No need for auth state listener here as AuthContext handles it
     return () => {
       // Optional: Consider if reset is needed. Resetting might cause issues
       // if the component remounts quickly (e.g., due to HMR).
       // It's generally safer to let the instance persist.
       // uiInstance?.reset(); // Might cause issues if unmounted/remounted quickly
       // console.log("FirebaseUI cleanup ran");
    };
  // Depend on loading and user state to re-evaluate rendering
  }, [uiConfig, loading, user]);

  // Conditionally render the div container only when needed
  return !loading && !user ? <div ref={elementRef} /> : null;
};

export default FirebaseUI;
