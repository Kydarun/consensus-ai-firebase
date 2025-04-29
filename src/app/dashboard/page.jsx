'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, FileText, BarChart, Copy, Trash2, Edit, Share2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [surveys, setSurveys] = useState([]);
  const [isLoadingSurveys, setIsLoadingSurveys] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    } else if (user) {
      fetchSurveys();
    }
  }, [user, loading, router]);

   const fetchSurveys = async () => {
    if (!user) return;
    setIsLoadingSurveys(true);
    try {
      const q = query(collection(db, 'surveys'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const userSurveys = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSurveys(userSurveys);
    } catch (error) {
      console.error("Error fetching surveys: ", error);
       toast({
          title: "Error",
          description: "Could not fetch surveys. Please try again later.",
          variant: "destructive",
        });
    } finally {
      setIsLoadingSurveys(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
       toast({
          title: "Copied!",
          description: "Survey URL copied to clipboard.",
        });
    }).catch(err => {
      console.error('Failed to copy: ', err);
       toast({
          title: "Error",
          description: "Failed to copy URL.",
          variant: "destructive",
        });
    });
  };

 const handleDeleteSurvey = async (surveyId) => {
    try {
      await deleteDoc(doc(db, "surveys", surveyId));
      setSurveys(surveys.filter(survey => survey.id !== surveyId));
      toast({
        title: "Success",
        description: "Survey deleted successfully.",
        variant: "default",
         className: "bg-accent text-accent-foreground", // Use green accent for success
      });
    } catch (error) {
      console.error("Error deleting survey: ", error);
      toast({
        title: "Error",
        description: "Failed to delete survey.",
        variant: "destructive",
      });
    }
  };

  if (loading || isLoadingSurveys) {
    return (
         <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
             <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
    );
  }

   if (!user) {
    // Should be redirected, but return null as fallback
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Surveys</h1>
        <Link href="/survey/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Survey
          </Button>
        </Link>
      </div>

      {surveys.length === 0 ? (
        <Card className="text-center py-12">
           <CardHeader>
             <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
             <CardTitle className="text-2xl">No Surveys Yet</CardTitle>
             <CardDescription>Click "Create New Survey" to get started.</CardDescription>
           </CardHeader>
           <CardContent>
                <Link href="/survey/new">
                    <Button variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Survey
                    </Button>
                </Link>
           </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surveys.map((survey) => {
             const surveyUrl = `${window.location.origin}/survey/${survey.id}`;
             return (
                 <Card key={survey.id} className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle className="truncate">{survey.title || 'Untitled Survey'}</CardTitle>
                         <CardDescription>{survey.questions?.length || 0} questions</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        {/* Placeholder for response count or other info */}
                         <p className="text-sm text-muted-foreground mb-4">Created: {survey.createdAt ? new Date(survey.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                         <div className="flex items-center space-x-2 mb-4 p-2 border rounded-md bg-secondary">
                            <Share2 className="h-4 w-4 text-primary" />
                            <input
                                type="text"
                                readOnly
                                value={surveyUrl}
                                className="flex-1 text-xs bg-transparent outline-none text-muted-foreground truncate"
                                onClick={(e) => e.target.select()}
                            />
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(surveyUrl)}>
                                <Copy className="h-4 w-4" />
                                <span className="sr-only">Copy URL</span>
                            </Button>
                         </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                         <Link href={`/survey/${survey.id}/results`}>
                            <Button variant="outline" size="sm">
                                <BarChart className="mr-1 h-4 w-4" /> Results
                            </Button>
                        </Link>
                        <div className="flex space-x-2">
                             <Link href={`/survey/${survey.id}/edit`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                    <Edit className="h-4 w-4" />
                                     <span className="sr-only">Edit</span>
                                </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                   <span className="sr-only">Delete</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the survey
                                    and all its responses.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteSurvey(survey.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                        </div>
                    </CardFooter>
                </Card>
             )
          })}
        </div>
      )}
    </div>
  );
}
