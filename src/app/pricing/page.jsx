'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { initiateCheckout } from '@/services/payment'; // Assuming you have this service
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

const pricingPlans = [
  {
    name: "Free",
    monthlyPrice: 0,
    features: [
      "Create 1 Survey",
      "Unlimited Questions",
      "Basic Results View",
       "Up to 25 Responses", // Added response limit for clarity
    ],
    cta: "Current Plan",
    disabled: true, // Assuming everyone starts free
  },
  {
    name: "Advanced",
    monthlyPrice: null, // Price TBD
    features: [
      "Create Unlimited Surveys",
      "Unlimited Questions",
      "Real-time Results",
      "Up to 100 Responses per survey",
      "Email Support",
    ],
    cta: "Upgrade to Advanced",
  },
  {
    name: "Pro",
    monthlyPrice: null, // Price TBD
    features: [
      "All Advanced features",
      "Up to 500 Responses per survey",
       "Data Export (CSV)",
      "Priority Email Support",
      "AI Analysis Credits (Coming Soon)",
    ],
    cta: "Upgrade to Pro",
  },
  {
    name: "Ultimate",
    monthlyPrice: null, // Price TBD
    features: [
      "All Pro features",
      "Unlimited Responses per survey",
      "Advanced AI Analysis (Coming Soon)",
      "Dedicated Support Channel",
       "Custom Branding (Coming Soon)",
    ],
    cta: "Upgrade to Ultimate",
  },
];

export default function PricingPage() {
   const { user, loading } = useAuth();
   const router = useRouter();
   const { toast } = useToast();
   const [isProcessing, setIsProcessing] = useState(null); // Track which plan checkout is processing

   const handleCheckout = async (plan) => {
       if (!user) {
          router.push('/auth?redirect=/pricing'); // Redirect to login if not authenticated
           return;
       }

       if (!plan.monthlyPrice === null) {
            toast({ title: "Coming Soon", description: `Pricing for the ${plan.name} plan is not yet available.` });
            return;
       }

       setIsProcessing(plan.name);
       try {
           // Replace with actual Stripe checkout initiation
           console.log(`Initiating checkout for ${plan.name}`);
           // const checkoutUrl = await initiateCheckout(plan); // Call your backend/Stripe function
            // Mock URL for now:
           await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network request
           const checkoutUrl = 'https://buy.stripe.com/test_mock_session'; // Replace with actual URL

           if (checkoutUrl) {
               window.location.href = checkoutUrl; // Redirect to Stripe checkout
           } else {
               throw new Error('Could not initiate checkout.');
           }
       } catch (error) {
           console.error("Checkout failed:", error);
           toast({
               title: "Checkout Error",
               description: "Could not start the checkout process. Please try again.",
               variant: "destructive",
           });
            setIsProcessing(null);
       }
        // No need to set isProcessing back to null on success, as page redirects
   };


  // TODO: Determine user's current plan from Firestore user profile
  const currentUserPlan = "Free"; // Placeholder

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground">Simple, transparent pricing for creating insightful surveys.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {pricingPlans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 ${plan.name === "Pro" ? 'border-primary border-2' : ''}`}>
            <CardHeader className="text-center">
               <CardTitle className="text-2xl font-semibold">{plan.name}</CardTitle>
               {plan.monthlyPrice === 0 ? (
                   <p className="text-3xl font-bold my-4">Free</p>
               ) : plan.monthlyPrice === null ? (
                   <p className="text-3xl font-bold my-4">Coming Soon</p>
               ) : (
                    <p className="text-3xl font-bold my-4">
                        ${plan.monthlyPrice}<span className="text-sm font-normal text-muted-foreground">/month</span>
                    </p>
               )}
              <CardDescription>{
                  plan.name === "Free" ? "Perfect for getting started." :
                  plan.name === "Advanced" ? "For growing needs and more responses." :
                  plan.name === "Pro" ? "Ideal for professionals needing more capacity." :
                  "For power users needing unlimited scale."
              }</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                     <CheckCircle2 className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                 className="w-full"
                 onClick={() => handleCheckout(plan)}
                 disabled={plan.disabled || currentUserPlan === plan.name || isProcessing === plan.name || plan.monthlyPrice === null}
                 variant={plan.name === "Pro" ? 'default' : 'outline'}
              >
                 {isProcessing === plan.name ? 'Processing...' : (currentUserPlan === plan.name ? 'Current Plan' : plan.cta)}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
       <p className="text-center text-muted-foreground mt-8 text-sm">
            All prices are placeholders. Billing is not yet active. AI features coming soon.
        </p>
    </div>
  );
}
