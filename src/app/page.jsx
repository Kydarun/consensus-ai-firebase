'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import Link from 'next/link';
import { FileText, Share2, BarChart } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-12">
      <h1 className="text-5xl font-bold mb-6 text-center">Welcome to Consensus AI</h1>
      <p className="text-xl text-muted-foreground mb-12 text-center max-w-2xl">
        Effortlessly create, share, and analyze surveys. Gain valuable insights with the power of AI.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl w-full">
        <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="mx-auto bg-accent rounded-full p-3 w-fit mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Design Surveys</CardTitle>
            <CardDescription>Create beautiful surveys with various question types in minutes.</CardDescription>
          </CardHeader>
        </Card>
        <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
             <div className="mx-auto bg-accent rounded-full p-3 w-fit mb-4">
              <Share2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Share Easily</CardTitle>
            <CardDescription>Get a unique link to share your survey publicly and collect responses.</CardDescription>
          </CardHeader>
        </Card>
        <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
             <div className="mx-auto bg-accent rounded-full p-3 w-fit mb-4">
              <BarChart className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>View Results</CardTitle>
            <CardDescription>Analyze responses in real-time and gain insights (AI analysis coming soon!).</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {user ? (
        <div className="flex flex-col items-center space-y-4">
           <p className="text-lg">You are signed in as {user.displayName || user.email}.</p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">Go to Dashboard</Button>
          </Link>
        </div>
      ) : (
         <div className="flex flex-col items-center space-y-4">
           <p className="text-lg mb-4">Sign in to start creating surveys.</p>
          <Link href="/auth">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
