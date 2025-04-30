'use server';
/**
 * @fileOverview A flow to summarize survey responses, offering both overall and question-specific summaries.
 *
 * - summarizeSurveyResponses - A function that triggers the summarization process.
 * - SummarizeSurveyResponsesInput - The input type for the summarizeSurveyResponses function.
 * - SummarizeSurveyResponsesOutput - The return type for the summarizeSurveyResponses function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeSurveyResponsesInputSchema = z.object({
  surveyTitle: z.string().describe('The title of the survey.'),
  responses: z.array(
    z.object({
      question: z.string().describe('The survey question.'),
      answer: z.string().describe('The response to the question.'),
    })
  ).describe('An array of responses to the survey questions.'),
});

const SummarizeSurveyResponsesOutputSchema = z.object({
  overallSummary: z.string().describe('A summary of the overall survey responses.'),
  questionSummaries: z.array(
    z.object({
      question: z.string().describe('The question.'),
      summary: z.string().describe('A summary of responses to the specific question.'),
    })
  ).describe('Summaries of responses per question.'),
});

export async function summarizeSurveyResponses(input) {
  return summarizeSurveyResponsesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSurveyResponsesPrompt',
  input: {
    schema: z.object({
      surveyTitle: z.string().describe('The title of the survey.'),
      responses: z.array(
        z.object({
          question: z.string().describe('The survey question.'),
          answer: z.string().describe('The response to the question.'),
        })
      ).describe('An array of responses to the survey questions.'),
    }),
  },
  output: {
    schema: SummarizeSurveyResponsesOutputSchema,
  },
  prompt: `Summarize the following survey responses for the survey titled "{{surveyTitle}}".\n\nSurvey Responses:\n{{#each responses}}- Question: {{this.question}}, Answer: {{this.answer}}\n{{/each}}\n\nProvide an overall summary of the survey responses. Also provide summaries for each question asked, indicating the overall responses for each question.\n\nEnsure that your response has an "overallSummary" string and a "questionSummaries" array.\n\nStrictly adhere to the output format.\n`,
});

export const summarizeSurveyResponsesFlow = ai.defineFlow(
  {
    name: 'summarizeSurveyResponsesFlow',
    inputSchema: SummarizeSurveyResponsesInputSchema,
    outputSchema: SummarizeSurveyResponsesOutputSchema,
  },
  async input => {
    if (!input.responses || input.responses.length === 0) {
      return {
        overallSummary: "No responses provided for summarization.",
        questionSummaries: [],
      };
    }
    const {output} = await prompt(input);
    return output;
  }
);