'use server';
/**
 * @fileOverview A flow to analyze open-ended survey responses, identify common themes, and assess sentiments.
 *
 * - analyzeOpenEndedResponses - A function that triggers the analysis process.
 * - AnalyzeOpenEndedResponsesInput - The input type for the analyzeOpenEndedResponses function.
 * - AnalyzeOpenEndedResponsesOutput - The return type for the analyzeOpenEndedResponses function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeOpenEndedResponsesInputSchema = z.object({
  question: z.string().describe('The open-ended survey question.'),
  responses: z.array(z.string()).describe('An array of open-ended text responses to the question.'),
});
export type AnalyzeOpenEndedResponsesInput = z.infer<
  typeof AnalyzeOpenEndedResponsesInputSchema
>;

const AnalyzeOpenEndedResponsesOutputSchema = z.object({
  themes: z
    .array(z.string())
    .describe('A list of common themes identified in the responses.'),
  sentimentAnalysis: z
    .record(z.string(), z.number())
    .describe(
      'A sentiment analysis of the responses, with themes as keys and sentiment scores (ranging from -1.0 to 1.0) as values.'
    ),
  summary: z.string().describe('A concise summary of the open-ended responses.'),
});
export type AnalyzeOpenEndedResponsesOutput = z.infer<
  typeof AnalyzeOpenEndedResponsesOutputSchema
>;

export async function analyzeOpenEndedResponses(
  input: AnalyzeOpenEndedResponsesInput
): Promise<AnalyzeOpenEndedResponsesOutput> {
  return analyzeOpenEndedResponsesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeOpenEndedResponsesPrompt',
  input: {
    schema: z.object({
      question: z.string().describe('The open-ended survey question.'),
      responses: z.array(z.string()).describe('An array of open-ended text responses.'),
    }),
  },
  output: {
    schema: z.object({
      themes: z
        .array(z.string())
        .describe('A list of common themes identified in the responses.'),
      sentimentAnalysis: z
        .record(z.string(), z.number())
        .describe(
          'A sentiment analysis of the responses, with themes as keys and sentiment scores as values (must be between -1.0 and 1.0).'
        ),
      summary: z.string().describe('A concise summary of the open-ended responses.'),
    }),
  },
  prompt: `Analyze the following open-ended survey responses to the question: "{{question}}".\n\nResponses:\n{{#each responses}}- {{{this}}}\n{{/each}}\n\nIdentify common themes, perform sentiment analysis for each theme, and provide a concise summary of the responses.\n\nOutput the themes as a list of strings, sentiment analysis as a dictionary mapping each theme to its sentiment score (a number between -1.0 for very negative and 1.0 for very positive), and a concise summary string.\n\nStrictly adhere to the output format and ensure sentiment scores are within the -1.0 to 1.0 range. Example format:\n{
  "themes": ["Customer Service", "Product Quality", "Pricing"],
  "sentimentAnalysis": {
    "Customer Service": 0.85,
    "Product Quality": -0.5,
    "Pricing": 0.2
  },
  "summary": "Overall, customers are highly satisfied with the customer service but somewhat dissatisfied with the product quality. Pricing feedback is mixed but leans slightly positive."
}`,
});

export const analyzeOpenEndedResponsesFlow = ai.defineFlow<
  typeof AnalyzeOpenEndedResponsesInputSchema,
  typeof AnalyzeOpenEndedResponsesOutputSchema
>(
  {
    name: 'analyzeOpenEndedResponsesFlow',
    inputSchema: AnalyzeOpenEndedResponsesInputSchema,
    outputSchema: AnalyzeOpenEndedResponsesOutputSchema,
  },
  async input => {
     // Add basic validation or handling for empty responses
    if (!input.responses || input.responses.length === 0) {
      return {
        themes: [],
        sentimentAnalysis: {},
        summary: "No responses provided for analysis."
      };
    }
    const {output} = await prompt(input);
     // Add post-processing validation if needed (e.g., ensure scores are within range)
     if (output?.sentimentAnalysis) {
         for (const theme in output.sentimentAnalysis) {
             if (output.sentimentAnalysis[theme] < -1 || output.sentimentAnalysis[theme] > 1) {
                 console.warn(`Sentiment score for theme "${theme}" (${output.sentimentAnalysis[theme]}) is outside the expected range (-1 to 1). Clamping value.`);
                 output.sentimentAnalysis[theme] = Math.max(-1, Math.min(1, output.sentimentAnalysis[theme]));
             }
         }
     }
    return output!;
  }
);
