'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid'; // To generate initial question ID if needed

export default function NewSurveyPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    } else if (user && isCreating) {
      createNewSurvey();
    }
  }, [user, loading, router, isCreating]);

  const createNewSurvey = async () => {
    if (!user) return;

    const initialQuestion = {
        id: uuidv4(),
        type: 'text',
        text: 'Your first question here...',
        options: [],
        commonAnswers: [],
        includeOther: false,
    };

    const surveyData = {
      title: 'Untitled Survey',
      questions: [initialQuestion],
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      responses: 0, // Initialize response count
    };

    try {
      const docRef = await addDoc(collection(db, 'surveys'), surveyData);
      toast({
        title: "Survey Created",
        description: "Redirecting to the editor...",
        className: "bg-accent text-accent-foreground",
      });
      // Redirect to the edit page for the newly created survey
      router.replace(`/survey/${docRef.id}/edit`); // Use replace to avoid back button going here
    } catch (error) {
      console.error("Error creating new survey: ", error);
      toast({
        title: "Error",
        description: "Could not create a new survey. Please try again.",
        variant: "destructive",
      });
      setIsCreating(false); // Allow retry or show error message
      router.push('/dashboard'); // Redirect back to dashboard on error
    }
     // No need to set isCreating false on success, as redirect happens
  };

  // Show loading state while creating and redirecting
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground">Creating your new survey...</p>
      </div>
    </div>
  );
}
