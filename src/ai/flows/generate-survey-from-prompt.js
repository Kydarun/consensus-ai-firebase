'use server';
/**
 * @fileOverview A flow to generate a survey from a text prompt.
 *
 * - generateSurveyFromPrompt - A function that triggers the survey generation process.
 * - GenerateSurveyFromPromptInput - The input type for the generateSurveyFromPrompt function.
 * - GenerateSurveyFromPromptOutput - The return type for the generateSurveyFromPrompt function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

const GenerateSurveyFromPromptInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the survey to generate.'),
});

const GenerateSurveyFromPromptOutputSchema = z.object({
  survey: z.object({
    title: z.string().describe('The title of the generated survey.'),
    description: z.string().describe('A brief description of the survey.'),
    questions: z
      .array(
        z.object({
          question: z.string().describe('The text of the survey question.'),
          type: z.string().describe('The type of question (e.g., open-ended, multiple choice).'),
          options: z
            .array(z.string())
            .optional()
            .describe('Possible options for multiple choice questions.'),
        })
      )
      .describe('An array of survey questions.'),
  }),
});

export async function generateSurveyFromPrompt(input) {
  return generateSurveyFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSurveyFromPromptPrompt',
  input: {
    schema: z.object({
      prompt: z.string().describe('A text prompt describing the survey to generate.'),
    }),
  },
  output: {
    schema: z.object({
      survey: z.object({
        title: z.string().describe('The title of the generated survey.'),
        description: z.string().describe('A brief description of the survey.'),
        questions: z
          .array(
            z.object({
              question: z.string().describe('The text of the survey question.'),
              type: z.string().describe('The type of question (e.g., open-ended, multiple choice).'),
              options: z
                .array(z.string())
                .optional()
                .describe('Possible options for multiple choice questions.'),
            })
          )
          .describe('An array of survey questions.'),
      }),
    }),
  },
  prompt: `Generate a survey based on the following prompt: "{{prompt}}".
  
  The survey should have a title, a description, and a list of questions. Each question should have a question text, a question type, and optional multiple choice options if applicable.
  
  Output the survey in the following JSON format:
  {
    "survey": {
      "title": "Survey Title",
      "description": "A brief description of the survey.",
      "questions": [
        {
          "question": "What is your favorite color?",
          "type": "multiple choice",
          "options": ["Red", "Green", "Blue"]
        },
        {
          "question": "Please describe your experience.",
          "type": "open-ended"
        }
      ]
    }
  }`,
});

export const generateSurveyFromPromptFlow = ai.defineFlow(
  {
    name: 'generateSurveyFromPromptFlow',
    inputSchema: GenerateSurveyFromPromptInputSchema,
    outputSchema: GenerateSurveyFromPromptOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output;
  }
);