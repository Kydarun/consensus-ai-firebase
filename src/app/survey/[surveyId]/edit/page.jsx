'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, GripVertical } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs for questions/options

// TODO: Implement Drag and Drop functionality using a library like react-beautiful-dnd or dnd-kit

const questionTypes = [
  { value: 'text', label: 'Short Text' },
  { value: 'long-text', label: 'Long Text (Paragraph)' },
  { value: 'single-choice', label: 'Single Choice (Radio)' },
  { value: 'multiple-choice', label: 'Multiple Choice (Checkbox)' },
];

export default function EditSurveyPage() {
  const { surveyId } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [surveyTitle, setSurveyTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalSurveyData, setOriginalSurveyData] = useState(null);

   useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    } else if (user && surveyId !== 'new') {
      fetchSurveyData();
    } else if (surveyId === 'new') {
        // Initialize a new survey structure
        setSurveyTitle('Untitled Survey');
        setQuestions([{ id: uuidv4(), type: 'text', text: '', options: [], commonAnswers: [], includeOther: false }]);
        setIsLoading(false);
    }
  }, [user, loading, surveyId, router]);

 const fetchSurveyData = async () => {
    setIsLoading(true);
    try {
      const surveyRef = doc(db, 'surveys', surveyId);
      const surveySnap = await getDoc(surveyRef);

      if (surveySnap.exists()) {
        const data = surveySnap.data();
        // Ensure user owns the survey
        if (data.userId !== user.uid) {
          toast({ title: "Unauthorized", description: "You don't have permission to edit this survey.", variant: "destructive" });
          router.push('/dashboard');
          return;
        }
        setSurveyTitle(data.title || '');
        // Ensure questions and options have unique IDs if they don't already
        const questionsWithIds = (data.questions || []).map(q => ({
            ...q,
            id: q.id || uuidv4(),
            options: (q.options || []).map(opt => typeof opt === 'string' ? { id: uuidv4(), value: opt } : { ...opt, id: opt.id || uuidv4() }),
            commonAnswers: (q.commonAnswers || []).map(ans => typeof ans === 'string' ? { id: uuidv4(), value: ans } : { ...ans, id: ans.id || uuidv4() }),
            includeOther: q.includeOther || false,
        }));
        setQuestions(questionsWithIds);
        setOriginalSurveyData(data); // Store original data for comparison
      } else {
        toast({ title: "Not Found", description: "Survey not found.", variant: "destructive" });
        router.push('/dashboard');
      }
    } catch (error) {
      console.error("Error fetching survey: ", error);
      toast({ title: "Error", description: "Could not load survey data.", variant: "destructive" });
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

 const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    // Reset options/commonAnswers if type changes away from choice types
    if (field === 'type' && !['single-choice', 'multiple-choice'].includes(value)) {
        newQuestions[index].options = [];
        newQuestions[index].commonAnswers = [];
        newQuestions[index].includeOther = false;
    }
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { id: uuidv4(), type: 'text', text: '', options: [], commonAnswers: [], includeOther: false }]);
  };

  const removeQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optIndex].value = value;
    setQuestions(newQuestions);
  };

  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    if (!newQuestions[qIndex].options) newQuestions[qIndex].options = [];
    newQuestions[qIndex].options.push({ id: uuidv4(), value: '' });
    setQuestions(newQuestions);
  };

  const removeOption = (qIndex, optIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== optIndex);
    setQuestions(newQuestions);
  };

  const handleCommonAnswerChange = (qIndex, ansIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].commonAnswers[ansIndex].value = value;
    setQuestions(newQuestions);
  };

   const addCommonAnswer = (qIndex) => {
    const newQuestions = [...questions];
     if (!newQuestions[qIndex].commonAnswers) newQuestions[qIndex].commonAnswers = [];
    newQuestions[qIndex].commonAnswers.push({ id: uuidv4(), value: '' });
    setQuestions(newQuestions);
  };

    const removeCommonAnswer = (qIndex, ansIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].commonAnswers = newQuestions[qIndex].commonAnswers.filter((_, i) => i !== ansIndex);
    setQuestions(newQuestions);
  };

    const toggleOtherOption = (qIndex) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].includeOther = !newQuestions[qIndex].includeOther;
        setQuestions(newQuestions);
    }

  const handleSaveSurvey = async () => {
    if (!user) return;
    setIsSaving(true);

    // Basic validation
     if (!surveyTitle.trim()) {
      toast({ title: "Validation Error", description: "Survey title cannot be empty.", variant: "destructive" });
      setIsSaving(false);
      return;
    }
     if (questions.length === 0) {
      toast({ title: "Validation Error", description: "Survey must have at least one question.", variant: "destructive" });
      setIsSaving(false);
      return;
    }
     for (const question of questions) {
      if (!question.text.trim()) {
        toast({ title: "Validation Error", description: "All questions must have text.", variant: "destructive" });
        setIsSaving(false);
        return;
      }
      if (['single-choice', 'multiple-choice'].includes(question.type) && question.options.length === 0 && !question.includeOther) {
          toast({ title: "Validation Error", description: `Question "${question.text}" needs at least one option or an 'Other' field.`, variant: "destructive" });
          setIsSaving(false);
          return;
      }
      if (['single-choice', 'multiple-choice'].includes(question.type)) {
        for(const option of question.options) {
            if (!option.value.trim()) {
                 toast({ title: "Validation Error", description: `Options in question "${question.text}" cannot be empty.`, variant: "destructive" });
                setIsSaving(false);
                return;
            }
        }
      }
        if (question.commonAnswers) {
           for(const answer of question.commonAnswers) {
                if (!answer.value.trim()) {
                     toast({ title: "Validation Error", description: `Common answers in question "${question.text}" cannot be empty.`, variant: "destructive" });
                    setIsSaving(false);
                    return;
                }
           }
        }
    }


    // Prepare data for Firestore (remove temporary IDs if necessary or keep them)
    const surveyData = {
      title: surveyTitle,
      // Store only the 'value' for options and commonAnswers if IDs aren't needed long-term, or keep the objects.
       questions: questions.map(({ id, ...rest }) => ({
            ...rest,
            id: id, // Keep ID for consistency
            options: (rest.options || []).map(opt => ({ id: opt.id, value: opt.value })), // Keep structure
            commonAnswers: (rest.commonAnswers || []).map(ans => ({ id: ans.id, value: ans.value })), // Keep structure
            includeOther: rest.includeOther || false,
        })),
      userId: user.uid,
      updatedAt: serverTimestamp(),
    };

    try {
       if (surveyId === 'new') {
            // Create new survey (logic handled in /survey/new/page.jsx now)
             toast({ title: "Error", description: "Save logic should be in /survey/new.", variant: "destructive" });
       } else {
           // Update existing survey
            const surveyRef = doc(db, 'surveys', surveyId);
            await updateDoc(surveyRef, surveyData);
            setOriginalSurveyData(surveyData); // Update original data after save
            toast({
                title: "Success!",
                description: "Survey updated successfully.",
                className: "bg-accent text-accent-foreground",
             });
       }
        // Optionally redirect or stay on page
       // router.push('/dashboard');
    } catch (error) {
      console.error("Error saving survey: ", error);
      toast({ title: "Error", description: "Failed to save survey.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
      return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
           <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>;
  }

  if (!user) {
    // Should be redirected, but return null as fallback
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Edit Survey</h1>
         <Button onClick={handleSaveSurvey} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Survey'}
        </Button>
       </div>

      <Card>
        <CardHeader>
          <CardTitle>Survey Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="surveyTitle">Survey Title</Label>
          <Input
            id="surveyTitle"
            value={surveyTitle}
            onChange={(e) => setSurveyTitle(e.target.value)}
            placeholder="Enter survey title"
            className="text-lg"
          />
        </CardContent>
      </Card>

       {/* TODO: Implement Drag and Drop for questions */}
      <div className="space-y-6">
         <h2 className="text-2xl font-semibold">Questions</h2>
        {questions.map((question, qIndex) => (
          <Card key={question.id} className="relative group/question shadow-sm transition-shadow hover:shadow-md">
             <button className="absolute top-3 left-1 text-muted-foreground hover:text-foreground cursor-grab" aria-label="Drag to reorder">
                <GripVertical className="h-5 w-5"/>
            </button>
            <CardHeader className="flex flex-row items-start justify-between pl-8 pr-12"> {/* Adjust padding for grab handle and delete button */}

              <div className="flex-1 space-y-2 mr-4">
                 <Label htmlFor={`q-${question.id}-text`}>Question {qIndex + 1}</Label>
                 <Textarea
                    id={`q-${question.id}-text`}
                    value={question.text}
                    onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                    placeholder="Enter your question text"
                    rows={2}
                  />
              </div>
              <div>
                <Label htmlFor={`q-${question.id}-type`}>Type</Label>
                 <Select
                  value={question.type}
                  onValueChange={(value) => handleQuestionChange(qIndex, 'type', value)}
                >
                  <SelectTrigger id={`q-${question.id}-type`} className="w-[180px]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </CardHeader>
            <CardContent className="pl-8">
              {/* Options for Choice Questions */}
              {['single-choice', 'multiple-choice'].includes(question.type) && (
                <div className="space-y-3 mt-4">
                   <Label className="font-medium">Options</Label>
                  {(question.options || []).map((option, optIndex) => (
                    <div key={option.id} className="flex items-center space-x-2">
                       <Input
                        value={option.value}
                        onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                        placeholder={`Option ${optIndex + 1}`}
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeOption(qIndex, optIndex)} className="text-muted-foreground hover:text-destructive h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                         <span className="sr-only">Remove Option</span>
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2 pt-2">
                     <Button variant="outline" size="sm" onClick={() => addOption(qIndex)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                    </Button>
                     <div className="flex items-center space-x-2">
                         <input
                            type="checkbox"
                            id={`q-${question.id}-other`}
                            checked={question.includeOther || false}
                            onChange={() => toggleOtherOption(qIndex)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor={`q-${question.id}-other`} className="text-sm text-muted-foreground cursor-pointer">
                            Include "Other" option
                        </Label>
                    </div>
                  </div>

                </div>
              )}

                {/* Common Answers for Text Questions */}
                {['text', 'long-text'].includes(question.type) && (
                    <div className="space-y-3 mt-4">
                    <Label className="font-medium">Common Answers (Optional)</Label>
                    <p className="text-xs text-muted-foreground">Add predefined answers users can click.</p>
                    {(question.commonAnswers || []).map((answer, ansIndex) => (
                        <div key={answer.id} className="flex items-center space-x-2">
                        <Input
                            value={answer.value}
                            onChange={(e) => handleCommonAnswerChange(qIndex, ansIndex, e.target.value)}
                            placeholder={`Common Answer ${ansIndex + 1}`}
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeCommonAnswer(qIndex, ansIndex)} className="text-muted-foreground hover:text-destructive h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove Common Answer</span>
                        </Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addCommonAnswer(qIndex)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Common Answer
                    </Button>
                    </div>
                )}


            </CardContent>
             <Button
                variant="ghost"
                size="icon"
                onClick={() => removeQuestion(qIndex)}
                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover/question:opacity-100 transition-opacity h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
                 <span className="sr-only">Remove Question</span>
              </Button>
          </Card>
        ))}
      </div>

       <Button variant="secondary" onClick={addQuestion}>
        <PlusCircle className="mr-2 h-4 w-4" /> Add Question
      </Button>

       <CardFooter className="flex justify-end border-t pt-6">
            <Button onClick={handleSaveSurvey} disabled={isSaving}>
                 {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
        </CardFooter>
    </div>
  );
}
