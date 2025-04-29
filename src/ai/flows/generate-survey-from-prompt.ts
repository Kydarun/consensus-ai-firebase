'use server';
/**
 * @fileOverview A survey generation AI agent.
 *
 * - generateSurveyFromPrompt - A function that handles the survey generation process.
 * - GenerateSurveyFromPromptInput - The input type for the generateSurveyFromPrompt function.
 * - GenerateSurveyFromPromptOutput - The return type for the generateSurveyFromPrompt function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateSurveyFromPromptInputSchema = z.object({
  prompt: z.string().describe('The prompt to generate a survey from.'),
});
export type GenerateSurveyFromPromptInput = z.infer<typeof GenerateSurveyFromPromptInputSchema>;

const GenerateSurveyFromPromptOutputSchema = z.object({
  surveyDefinition: z.string().describe('The generated survey definition in JSON format.'),
});
export type GenerateSurveyFromPromptOutput = z.infer<typeof GenerateSurveyFromPromptOutputSchema>;

export async function generateSurveyFromPrompt(input: GenerateSurveyFromPromptInput): Promise<GenerateSurveyFromPromptOutput> {
  return generateSurveyFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSurveyFromPromptPrompt',
  input: {
    schema: z.object({
      prompt: z.string().describe('The prompt to generate a survey from.'),
    }),
  },
  output: {
    schema: z.object({
      // Adjust schema to match the desired survey structure (JS/JSON)
      surveyDefinition: z.string().describe(`The generated survey definition as a JSON string.
       Example structure:
       {
         "title": "Survey Title",
         "questions": [
           { "id": "uuid1", "type": "text", "text": "Question 1?", "commonAnswers": [{ "id": "ans1", "value": "Common Ans 1" }] },
           { "id": "uuid2", "type": "single-choice", "text": "Choose one:", "options": [{ "id": "opt1", "value": "Option A"}, { "id": "opt2", "value": "Option B"}], "includeOther": true }
         ]
       }
      `),
    }),
  },
  prompt: `You are an expert survey designer.

You will use the following prompt to generate a survey definition as a JSON string.

Prompt: {{{prompt}}}

The survey definition JSON should have a 'title' (string) and an array of 'questions'. Each question object must have:
- 'id': A unique identifier string (you can generate UUIDs or use placeholders like "uuid1", "uuid2").
- 'type': A string, one of 'text', 'long-text', 'single-choice', 'multiple-choice'.
- 'text': The question text (string).
- 'options' (optional): An array of objects for 'single-choice' or 'multiple-choice' types. Each option object should have 'id' (string, unique within the question) and 'value' (string).
- 'commonAnswers' (optional): An array of objects for 'text' or 'long-text' types. Each answer object should have 'id' (string, unique within the question) and 'value' (string).
- 'includeOther' (optional): A boolean (true/false) for 'single-choice' or 'multiple-choice' to indicate if an 'Other' free-text field should be included. Defaults to false if omitted.

Generate valid JSON. Ensure all IDs are unique strings.
`,
});

export const generateSurveyFromPromptFlow = ai.defineFlow<
  typeof GenerateSurveyFromPromptInputSchema,
  typeof GenerateSurveyFromPromptOutputSchema
>(
  {
    name: 'generateSurveyFromPromptFlow',
    inputSchema: GenerateSurveyFromPromptInputSchema,
    outputSchema: GenerateSurveyFromPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Consider adding validation here to ensure the output is valid JSON
    // before returning, potentially using try-catch with JSON.parse.
    return output!;
  }
);
