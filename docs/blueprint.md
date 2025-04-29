# **App Name**: Consensus AI

## Core Features:

- Survey Designer: Enable users to design surveys with various question types: text, long text, single/multiple choice with 'Others' option and pre-defined 'Common Answers' bubbles. The prototype will use Javascript and React for the core logic and UI, and TailwindCSS for styling.
- Survey Sharing: Generate a unique, shareable URL for each survey, allowing public access for response collection.
- Real-time Results: Display real-time survey results in an easily understandable format. Support subscription tiers: Free (1 survey), Advanced (unlimited, max 100 answers), Pro (max 500 answers), Ultimate (unlimited answers).
- AI Analysis (Future): Use an AI tool (GenKit) to analyze survey responses, providing insights. This will be implemented later. This feature will use a tool to reason about survey responses.

## Style Guidelines:

- Primary color: Clean white or light gray for the background to ensure readability.
- Secondary color: Use a calming blue (#3498db) for primary actions and interactive elements.
- Accent: A vibrant green (#2ecc71) to highlight success states or important information.
- Use a clear and readable sans-serif font for all text elements.
- Employ a card-based layout for survey questions and results to maintain a clean and organized look.
- Utilize simple, intuitive icons to represent different question types and actions.
- Incorporate subtle transitions and animations to enhance user experience when navigating between survey sections.

## Original User Request:
I want to create an application that allows users to create survey, share the survey URL to public, and view survey result.

The type of the survey questions can be of text, long text, single & multiple choice with "Others" option. The question should allow users to specify "Common Answers", which will be appear as clickable bubbles in the actual question.

We will be using Cloud Firestore to store all information.

We will be using Firebase Auth UI for authentication. Only Google Sign in and Email sign in are supported for now.

We will implement a simple monthly subscription pricing plan where free users can create 1 survey, Advanced users can create unlimited number of surveys (with a maximum answer of 100), Pro users can accept a maximum answer of 500, Ultimate users will not have any limit of answers. Leave the actual price empty first, we only want to implement the Stripe payment gateway for now.

We will be using GenKit to analyze answers, which we will implement later. You only need to provide the skeleton structure for the AI part.

This app will be named "Consensus AI".

You can use any framework to create the app, but NOT Typescript. I repeat, DO NOT USE Typescript.
  