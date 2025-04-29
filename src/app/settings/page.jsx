'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
     return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>;
  }

   if (!user) {
    return null; // Or a message indicating redirection
  }

  // Placeholder for settings logic (e.g., update profile, manage subscription)
  const handleUpdateProfile = (e) => {
      e.preventDefault();
      console.log("Update profile logic goes here");
      // Use Firebase Auth updateProfile function
  }

  const handleManageSubscription = () => {
       console.log("Manage subscription logic goes here");
       // Redirect to Stripe customer portal or pricing page
       router.push('/pricing');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
                 <Avatar className="h-16 w-16">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                    <AvatarFallback className="text-xl">{user.email ? user.email[0].toUpperCase() : <User />}</AvatarFallback>
                  </Avatar>
                  {/* TODO: Add functionality to upload/change avatar */}
            </div>
           <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" defaultValue={user.displayName || ''} placeholder="Your Name" />
                </div>
                <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user.email || ''} disabled />
                 <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
                </div>
                {/* Add password change option if using email/password auth */}
                <Button type="submit" disabled>Update Profile (Coming Soon)</Button>
           </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
           <CardDescription>Manage your Consensus AI plan.</CardDescription>
        </CardHeader>
        <CardContent>
           {/* TODO: Display current plan based on user data */}
           <p className="mb-4">Your current plan: <span className="font-semibold">Free</span></p>
          <Button onClick={handleManageSubscription}>Manage Subscription</Button>
        </CardContent>
      </Card>

       {/* Add other settings sections as needed, e.g., Notifications, API Keys */}

    </div>
  );
}
