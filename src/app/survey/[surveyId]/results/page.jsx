'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart as PieChartIcon, MessageSquare, CheckSquare, Type, Hash, Users } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, Pie, Cell, ResponsiveContainer, Tooltip, Legend, XAxis, YAxis, CartesianGrid, PieChart, BarChart as RechartsBarChart } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// AI Import Placeholders (will be used later)
// import { analyzeOpenEndedResponses } from '@/ai/flows/analyze-open-ended-responses';
// import { summarizeSurveyResponses } from '@/ai/flows/summarize-survey-responses';

const COLORS = ['#3498db', '#2ecc71', '#f1c40f', '#e74c3c', '#9b59b6', '#34495e', '#1abc9c', '#e67e22'];

export default function SurveyResultsPage() {
    const { surveyId } = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const [survey, setSurvey] = useState(null);
    const [responses, setResponses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [aiAnalysis, setAiAnalysis] = useState({}); // Store AI results per question { questionId: { themes, sentiment, summary } }
    const [isAnalyzing, setIsAnalyzing] = useState({}); // Track analysis state per question

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth');
        } else if (user && surveyId) {
            fetchSurveyAndResponses();
        }
    }, [user, authLoading, surveyId, router]);

    const fetchSurveyAndResponses = async () => {
        setIsLoading(true);
        try {
            const surveyRef = doc(db, 'surveys', surveyId);
            const surveySnap = await getDoc(surveyRef);

            if (!surveySnap.exists() || surveySnap.data().userId !== user.uid) {
                toast({ title: "Error", description: "Survey not found or you don't have permission.", variant: "destructive" });
                router.push('/dashboard');
                return;
            }
            setSurvey({ id: surveySnap.id, ...surveySnap.data() });

            const responsesQuery = collection(db, 'surveys', surveyId, 'responses');
            const responsesSnap = await getDocs(responsesQuery);
            const fetchedResponses = responsesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setResponses(fetchedResponses);

        } catch (error) {
            console.error("Error fetching data: ", error);
            toast({ title: "Error", description: "Could not load survey results.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    // --- AI Analysis Placeholder Functions ---
    const handleAnalyzeTextResponses = async (question) => {
        // Check if already analyzed or currently analyzing
        if (aiAnalysis[question.id] || isAnalyzing[question.id]) return;

        setIsAnalyzing(prev => ({ ...prev, [question.id]: true }));
        toast({ title: "AI Analysis Started", description: `Analyzing responses for "${question.text}"...` });

        const openEndedResponses = responses
            .map(resp => resp.answers?.find(ans => ans.questionId === question.id)?.answer)
            .filter(Boolean); // Get non-empty text answers

         if (openEndedResponses.length === 0) {
             toast({ title: "No Responses", description: "No text responses to analyze for this question.", variant: "default" });
             setIsAnalyzing(prev => ({ ...prev, [question.id]: false }));
             return;
         }

        try {
            // ***** MOCK AI CALL - Replace with actual Genkit call *****
            console.log(`Simulating AI analysis for question: ${question.text}`);
            console.log("Responses:", openEndedResponses);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay

            const mockResult = {
                // Replace with actual result from analyzeOpenEndedResponses({ question: question.text, responses: openEndedResponses })
                themes: ["Mock Theme 1", "Mock Theme 2", "Repetitive Topic"],
                sentimentAnalysis: { "Mock Theme 1": 0.7, "Mock Theme 2": -0.3, "Repetitive Topic": 0.1 },
                summary: `This is a mock summary. Responses generally focused on Mock Theme 1 positively and Mock Theme 2 negatively, with mentions of Repetitive Topic.`,
            };
            // ***** END MOCK AI CALL *****


            setAiAnalysis(prev => ({ ...prev, [question.id]: mockResult }));
             toast({
                title: "Analysis Complete",
                description: `AI analysis finished for "${question.text}".`,
                className: "bg-accent text-accent-foreground",
            });

        } catch (error) {
            console.error("AI Analysis failed:", error);
            toast({ title: "AI Error", description: "Failed to analyze responses.", variant: "destructive" });
        } finally {
            setIsAnalyzing(prev => ({ ...prev, [question.id]: false }));
        }
    };
    // --- End AI Analysis Placeholders ---


    // --- Data Processing for Charts ---
    const processChartData = useMemo(() => {
        if (!survey || responses.length === 0) return {};

        const results = {};
        survey.questions?.forEach(q => {
            if (['single-choice', 'multiple-choice'].includes(q.type)) {
                const counts = {};
                // Initialize counts for all predefined options + Other
                 (q.options || []).forEach(opt => counts[opt.value] = 0);
                 if (q.includeOther) counts['Other'] = 0;

                responses.forEach(resp => {
                    const answerObj = resp.answers?.find(ans => ans.questionId === q.id);
                    if (answerObj) {
                        const answerValue = answerObj.answer;
                         const otherText = answerObj.otherAnswerText; // Get the 'Other' text if present

                        if (q.type === 'single-choice') {
                             if (answerValue === 'other' && q.includeOther) {
                                // Group specific 'Other' text or just count 'Other'
                                const key = otherText ? `Other: ${otherText}` : 'Other';
                                // counts[key] = (counts[key] || 0) + 1; // Option 1: Detail 'Other' responses
                                 counts['Other'] = (counts['Other'] || 0) + 1; // Option 2: Group all as 'Other'
                             } else if (counts.hasOwnProperty(answerValue)) {
                                counts[answerValue]++;
                            }
                        } else if (q.type === 'multiple-choice' && Array.isArray(answerValue)) {
                            answerValue.forEach(val => {
                                if (val === 'other' && q.includeOther) {
                                     // Group specific 'Other' text or just count 'Other'
                                    const key = otherText ? `Other: ${otherText}` : 'Other';
                                    // counts[key] = (counts[key] || 0) + 1; // Option 1: Detail 'Other' responses
                                    counts['Other'] = (counts['Other'] || 0) + 1; // Option 2: Group all as 'Other'
                                } else if (counts.hasOwnProperty(val)) {
                                    counts[val]++;
                                }
                            });
                        }
                    }
                });
                 // Filter out detailed 'Other:' keys if Option 2 was chosen above and 'Other' exists
                 // This is complex if mixing detailed and grouped 'Other'. Sticking to grouped 'Other' for simplicity.
                results[q.id] = Object.entries(counts)
                                    .map(([name, value]) => ({ name, value }))
                                     .filter(item => item.value > 0); // Optionally filter out zero counts
            }
        });
        return results;
    }, [survey, responses]);
    // --- End Data Processing ---

    if (isLoading || authLoading) {
        return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
             {/* Skeleton Loader */}
            <div className="w-full max-w-4xl mx-auto space-y-6 p-4">
                 <Skeleton className="h-10 w-1/2" />
                 <Skeleton className="h-8 w-1/4" />
                <div className="grid grid-cols-3 gap-4">
                     <Skeleton className="h-24 w-full" />
                     <Skeleton className="h-24 w-full" />
                     <Skeleton className="h-24 w-full" />
                </div>
                 <Skeleton className="h-10 w-full" />
                 <Card><CardContent className="pt-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
            </div>
        </div>;
    }

     if (!survey) {
        // Error handled by toast, maybe show a generic error message
        return <div className="text-center py-10">Could not load survey results.</div>;
     }

     const totalResponses = responses.length;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">{survey.title} - Results</CardTitle>
                     <CardDescription>Analysis of submitted responses.</CardDescription>
                </CardHeader>
                 <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <Card className="bg-secondary">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalResponses}</div>
                             <p className="text-xs text-muted-foreground">submissions received</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-secondary">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Questions</CardTitle>
                            <Hash className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{survey.questions?.length || 0}</div>
                             <p className="text-xs text-muted-foreground">in this survey</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-secondary">
                       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Created On</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">
                                {survey.createdAt ? new Date(survey.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                            </div>
                            <p className="text-xs text-muted-foreground">Survey creation date</p>
                        </CardContent>
                    </Card>
                 </CardContent>
            </Card>

             {totalResponses === 0 ? (
                <Card className="text-center py-12">
                    <CardHeader>
                        <BarChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <CardTitle className="text-2xl">No Responses Yet</CardTitle>
                        <CardDescription>Results will appear here once responses are collected.</CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="summary">Summary & Charts</TabsTrigger>
                        <TabsTrigger value="individual">Individual Responses</TabsTrigger>
                    </TabsList>

                    {/* Summary Tab */}
                    <TabsContent value="summary" className="space-y-6 mt-6">
                        {survey.questions?.map((q, index) => (
                            <Card key={q.id} className="shadow-sm">
                                <CardHeader>
                                     <div className="flex items-center justify-between">
                                        <CardTitle className="text-xl">{index + 1}. {q.text}</CardTitle>
                                         <Badge variant="outline" className="capitalize flex items-center gap-1">
                                            {q.type === 'text' && <Type className="h-3 w-3"/>}
                                            {q.type === 'long-text' && <MessageSquare className="h-3 w-3"/>}
                                            {q.type === 'single-choice' && <PieChartIcon className="h-3 w-3"/>}
                                            {q.type === 'multiple-choice' && <CheckSquare className="h-3 w-3"/>}
                                            {q.type.replace('-', ' ')}
                                        </Badge>
                                     </div>
                                </CardHeader>
                                <CardContent>
                                    {['single-choice', 'multiple-choice'].includes(q.type) && processChartData[q.id] && (
                                        <div className="h-[300px] w-full mt-4">
                                             <ResponsiveContainer width="100%" height="100%">
                                                 {/* Use Pie for single-choice, Bar for multiple-choice? Or always Bar? Let's use Bar for consistency */}
                                                 <RechartsBarChart data={processChartData[q.id]} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} /*angle={-30} textAnchor="end" height={50}*/ />
                                                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                                    <Tooltip contentStyle={{fontSize: 12, borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))' }} cursor={{ fill: 'hsl(var(--muted))' }}/>
                                                     {/* <Legend wrapperStyle={{ fontSize: 12 }} /> */}
                                                    <Bar dataKey="value" name="Responses" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} barSize={40}>
                                                         {/* {processChartData[q.id].map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))} */}
                                                    </Bar>
                                                </RechartsBarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                     {['text', 'long-text'].includes(q.type) && (
                                        <div className="mt-4 space-y-4">
                                            <Button
                                                onClick={() => handleAnalyzeTextResponses(q)}
                                                disabled={isAnalyzing[q.id] || !!aiAnalysis[q.id]}
                                                size="sm"
                                                variant="secondary"
                                            >
                                                {isAnalyzing[q.id] ? 'Analyzing...' : (aiAnalysis[q.id] ? 'Analysis Complete' : 'Analyze with AI')}
                                            </Button>
                                             {aiAnalysis[q.id] && (
                                                 <Card className="bg-secondary p-4">
                                                    <CardTitle className="text-lg mb-2">AI Analysis</CardTitle>
                                                     <div className="space-y-3">
                                                         <div>
                                                            <h4 className="font-semibold text-sm mb-1">Summary:</h4>
                                                            <p className="text-sm text-muted-foreground">{aiAnalysis[q.id].summary}</p>
                                                        </div>
                                                         <div>
                                                            <h4 className="font-semibold text-sm mb-1">Themes:</h4>
                                                             <div className="flex flex-wrap gap-2">
                                                                {aiAnalysis[q.id].themes.map(theme => <Badge key={theme} variant="outline">{theme}</Badge>)}
                                                            </div>
                                                         </div>
                                                          <div>
                                                            <h4 className="font-semibold text-sm mb-1">Sentiment (by Theme):</h4>
                                                            <ul className="list-disc list-inside text-sm text-muted-foreground">
                                                                {Object.entries(aiAnalysis[q.id].sentimentAnalysis).map(([theme, score]) => (
                                                                    <li key={theme}>
                                                                        {theme}: <span className={score > 0.1 ? 'text-green-600' : score < -0.1 ? 'text-red-600' : ''}>{score.toFixed(2)}</span>
                                                                     </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                     </div>
                                                 </Card>
                                            )}
                                            {/* Optional: Display a sample of text responses */}
                                             <p className="text-xs text-muted-foreground pt-2">Individual text responses can be viewed in the 'Individual Responses' tab.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                     {/* Individual Responses Tab */}
                    <TabsContent value="individual" className="space-y-4 mt-6">
                         {responses.map((response, respIndex) => (
                             <Card key={response.id} className="shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Response #{respIndex + 1}</CardTitle>
                                     <CardDescription>Submitted: {response.submittedAt ? new Date(response.submittedAt.seconds * 1000).toLocaleString() : 'N/A'}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     {response.answers?.map((answer) => {
                                         const question = survey.questions.find(q => q.id === answer.questionId);
                                         return (
                                            <div key={answer.questionId} className="border-t pt-3">
                                                <p className="font-semibold text-sm mb-1">{question?.text || 'Unknown Question'}</p>
                                                 <p className="text-sm text-muted-foreground break-words">
                                                     {Array.isArray(answer.answer)
                                                         ? answer.answer.map(a => a === 'other' && answer.otherAnswerText ? `Other: ${answer.otherAnswerText}`: a).join(', ')
                                                         : (answer.answer === 'other' && answer.otherAnswerText ? `Other: ${answer.otherAnswerText}` : answer.answer) || <i className="text-gray-400">No answer</i>
                                                    }
                                                 </p>
                                            </div>
                                         );
                                     })}
                                </CardContent>
                            </Card>
                         ))}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
