'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, addDoc, collection, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function TakeSurveyPage() {
  const { surveyId } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [otherAnswers, setOtherAnswers] = useState({}); // Store 'Other' input values
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

   useEffect(() => {
    if (surveyId) {
      fetchSurvey();
    }
     // Check local storage if user has already submitted this survey
    const submittedSurveys = JSON.parse(localStorage.getItem('submittedSurveys') || '{}');
    if (submittedSurveys[surveyId]) {
        setHasSubmitted(true);
    }

  }, [surveyId]);

 const fetchSurvey = async () => {
    setIsLoading(true);
    try {
      const surveyRef = doc(db, 'surveys', surveyId);
      const surveySnap = await getDoc(surveyRef);

      if (surveySnap.exists()) {
        setSurvey({ id: surveySnap.id, ...surveySnap.data() });
        // Initialize answers state based on questions
        const initialAnswers = {};
         const initialOtherAnswers = {};
        (surveySnap.data().questions || []).forEach(q => {
          initialAnswers[q.id] = q.type === 'multiple-choice' ? [] : '';
           if(q.includeOther) {
               initialOtherAnswers[q.id] = '';
           }
        });
        setAnswers(initialAnswers);
         setOtherAnswers(initialOtherAnswers);
      } else {
        toast({ title: "Not Found", description: "Survey not found.", variant: "destructive" });
        // Consider redirecting to a 404 page or home
        router.push('/');
      }
    } catch (error) {
      console.error("Error fetching survey: ", error);
      toast({ title: "Error", description: "Could not load the survey.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

 const handleAnswerChange = (questionId, value, questionType) => {
    setAnswers(prev => {
      if (questionType === 'multiple-choice') {
        const currentSelection = prev[questionId] || [];
        const newSelection = currentSelection.includes(value)
          ? currentSelection.filter(item => item !== value)
          : [...currentSelection, value];
        return { ...prev, [questionId]: newSelection };
      } else {
        return { ...prev, [questionId]: value };
      }
    });
     // Clear 'Other' input if a predefined option is selected in single-choice
     if (questionType === 'single-choice' && value !== 'other') {
         handleOtherAnswerChange(questionId, '');
     }
  };

    const handleOtherAnswerChange = (questionId, value) => {
         setOtherAnswers(prev => ({ ...prev, [questionId]: value }));
         // If 'Other' is selected in single choice, update the main answer
         const question = survey?.questions.find(q => q.id === questionId);
         if (question?.type === 'single-choice') {
             setAnswers(prev => ({...prev, [questionId]: 'other'}));
         }
    };

     const handleCommonAnswerClick = (questionId, answerValue) => {
        setAnswers(prev => ({ ...prev, [questionId]: answerValue }));
    };

   const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic Validation (Optional: Add required fields check)
    // ...

    const submissionData = {
      surveyId: surveyId,
      submittedAt: serverTimestamp(),
      answers: survey.questions.map(q => {
        const baseAnswer = {
          questionId: q.id,
          questionText: q.text,
          type: q.type,
          answer: answers[q.id],
        };
        // Include 'Other' text if applicable
        if (q.includeOther && (
                (q.type === 'single-choice' && answers[q.id] === 'other') ||
                (q.type === 'multiple-choice' && answers[q.id]?.includes('other'))
            )) {
            baseAnswer.otherAnswerText = otherAnswers[q.id];
        }
        return baseAnswer;
      }),
    };

    try {
      // Add the response to a 'responses' subcollection or a main 'responses' collection
      const responsesCollectionRef = collection(db, 'surveys', surveyId, 'responses'); // Subcollection approach
      // const responsesCollectionRef = collection(db, 'responses'); // Separate collection approach (add surveyId to data)
      await addDoc(responsesCollectionRef, submissionData);

       // Increment response count on the survey document
      const surveyRef = doc(db, 'surveys', surveyId);
      await updateDoc(surveyRef, {
        responses: increment(1)
      });

        // Mark as submitted in local storage
       const submittedSurveys = JSON.parse(localStorage.getItem('submittedSurveys') || '{}');
       submittedSurveys[surveyId] = true;
       localStorage.setItem('submittedSurveys', JSON.stringify(submittedSurveys));
       setHasSubmitted(true);


      toast({
        title: "Success!",
        description: "Your response has been submitted. Thank you!",
        className: "bg-accent text-accent-foreground",
      });
      // Optionally redirect to a thank you page or disable the form
      // router.push(`/survey/${surveyId}/thankyou`);
    } catch (error) {
      console.error("Error submitting response: ", error);
      toast({ title: "Error", description: "Failed to submit your response. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoading) {
     return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
         <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>;
  }

  if (!survey) {
    // Survey not found or error occurred
    return <div className="text-center py-10">Survey not available.</div>;
  }

    if (hasSubmitted) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
                <Card className="w-full max-w-lg text-center shadow-lg">
                    <CardHeader>
                         <CardTitle className="text-2xl">Thank You!</CardTitle>
                         <CardDescription>You have already submitted this survey.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <p className="text-muted-foreground">Your response has been recorded.</p>
                         {/* Optionally link back to home or results if public */}
                         <Button onClick={() => router.push('/')} variant="link" className="mt-4">Go Home</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card className="shadow-xl">
        <CardHeader className="text-center border-b pb-6">
          <CardTitle className="text-3xl font-bold">{survey.title}</CardTitle>
          {survey.description && <CardDescription className="mt-2">{survey.description}</CardDescription>}
        </CardHeader>
         <form onSubmit={handleSubmit}>
            <CardContent className="space-y-8 pt-8">
                {survey.questions && survey.questions.map((question, index) => (
                <div key={question.id} className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
                    <Label htmlFor={`q-${question.id}`} className="text-lg font-semibold block">{index + 1}. {question.text}</Label>

                    {/* Render Common Answers for Text inputs */}
                    {['text', 'long-text'].includes(question.type) && question.commonAnswers && question.commonAnswers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2 mb-3">
                        {question.commonAnswers.map((ans) => (
                             <Badge
                                key={ans.id}
                                variant="secondary"
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => handleCommonAnswerClick(question.id, ans.value)}
                            >
                                {ans.value}
                            </Badge>
                        ))}
                        </div>
                    )}


                    {question.type === 'text' && (
                    <Input
                        id={`q-${question.id}`}
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value, question.type)}
                        placeholder="Your answer"
                        required // Add required if needed
                    />
                    )}
                    {question.type === 'long-text' && (
                    <Textarea
                        id={`q-${question.id}`}
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value, question.type)}
                        placeholder="Your detailed answer"
                        rows={4}
                        required // Add required if needed
                    />
                    )}
                    {question.type === 'single-choice' && (
                        <RadioGroup
                            value={answers[question.id] || ''}
                            onValueChange={(value) => handleAnswerChange(question.id, value, question.type)}
                            className="space-y-2"
                             required // Add required if needed
                        >
                             {question.options && question.options.map((option) => (
                                <div key={option.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={`q-${question.id}-opt-${option.id}`} />
                                <Label htmlFor={`q-${question.id}-opt-${option.id}`} className="font-normal cursor-pointer">{option.value}</Label>
                                </div>
                            ))}
                            {question.includeOther && (
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="other" id={`q-${question.id}-opt-other`} />
                                    <Label htmlFor={`q-${question.id}-opt-other`} className="font-normal cursor-pointer mr-2">Other:</Label>
                                    <Input
                                        type="text"
                                        value={otherAnswers[question.id] || ''}
                                        onChange={(e) => handleOtherAnswerChange(question.id, e.target.value)}
                                        placeholder="Please specify"
                                        className="flex-1 h-8"
                                        disabled={answers[question.id] !== 'other'} // Only enable when 'Other' is selected
                                        required={answers[question.id] === 'other'} // Required if 'Other' is selected
                                    />
                                </div>
                            )}
                        </RadioGroup>
                    )}
                    {question.type === 'multiple-choice' && (
                        <div className="space-y-2">
                            {question.options && question.options.map((option) => (
                                <div key={option.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`q-${question.id}-opt-${option.id}`}
                                    checked={(answers[question.id] || []).includes(option.value)}
                                    onCheckedChange={() => handleAnswerChange(question.id, option.value, question.type)}
                                />
                                <Label htmlFor={`q-${question.id}-opt-${option.id}`} className="font-normal cursor-pointer">{option.value}</Label>
                                </div>
                            ))}
                            {question.includeOther && (
                                 <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`q-${question.id}-opt-other`}
                                        checked={(answers[question.id] || []).includes('other')}
                                        onCheckedChange={() => handleAnswerChange(question.id, 'other', question.type)}
                                    />
                                     <Label htmlFor={`q-${question.id}-opt-other`} className="font-normal cursor-pointer mr-2">Other:</Label>
                                     <Input
                                        type="text"
                                        value={otherAnswers[question.id] || ''}
                                        onChange={(e) => handleOtherAnswerChange(question.id, e.target.value)}
                                        placeholder="Please specify"
                                        className="flex-1 h-8"
                                        disabled={!(answers[question.id] || []).includes('other')} // Only enable when 'Other' is checked
                                        required={(answers[question.id] || []).includes('other')} // Required if 'Other' is checked
                                    />
                                </div>
                            )}
                            {/* Add validation message if needed, e.g., check if at least one option is selected */}
                        </div>
                    )}
                </div>
                ))}
            </CardContent>
            <CardFooter className="border-t pt-6">
                 <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Response'}
                </Button>
            </CardFooter>
         </form>
      </Card>
    </div>
  );
}
