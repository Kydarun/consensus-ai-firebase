'use server';

/**
 * @fileOverview Summarizes survey responses to provide key insights.
 *
 * - summarizeSurveyResponses - A function that handles the summarization of survey responses.
 * - SummarizeSurveyResponsesInput - The input type for the summarizeSurveyResponses function.
 * - SummarizeSurveyResponsesOutput - The return type for the summarizeSurveyResponses function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeSurveyResponsesInputSchema = z.object({
  responses: z.array(z.string()).describe('An array of survey responses.'),
  question: z.string().describe('The survey question being answered.'),
});
export type SummarizeSurveyResponsesInput = z.infer<
  typeof SummarizeSurveyResponsesInputSchema
>;

const SummarizeSurveyResponsesOutputSchema = z.object({
  summary: z.string().describe('A concise summary highlighting key insights from the survey responses.'),
});
export type SummarizeSurveyResponsesOutput = z.infer<
  typeof SummarizeSurveyResponsesOutputSchema
>;

export async function summarizeSurveyResponses(
  input: SummarizeSurveyResponsesInput
): Promise<SummarizeSurveyResponsesOutput> {
  return summarizeSurveyResponsesFlow(input);
}

const summarizeSurveyResponsesPrompt = ai.definePrompt({
  name: 'summarizeSurveyResponsesPrompt',
  input: {
    schema: z.object({
      responses: z.array(z.string()).describe('An array of survey responses.'),
      question: z.string().describe('The survey question being answered.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A concise summary highlighting key insights from the survey responses.'),
    }),
  },
  prompt: `Please provide a concise summary of the following survey responses for the question "{{question}}". Focus on extracting the main points, common opinions, and any notable outliers or strong sentiments.\n\nResponses:\n{{#each responses}}- {{{this}}}\n{{/each}}\n\nKey Insights Summary: `,
});

export const summarizeSurveyResponsesFlow = ai.defineFlow<
  typeof SummarizeSurveyResponsesInputSchema,
  typeof SummarizeSurveyResponsesOutputSchema
>(
  {
    name: 'summarizeSurveyResponsesFlow',
    inputSchema: SummarizeSurveyResponsesInputSchema,
    outputSchema: SummarizeSurveyResponsesOutputSchema,
  },
  async input => {
      // Handle empty responses
    if (!input.responses || input.responses.length === 0) {
      return { summary: "No responses provided to summarize." };
    }
    const {output} = await summarizeSurveyResponsesPrompt(input);
    return output!;
  }
);
