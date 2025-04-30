import { ai } from '../ai-instance.js';

export const analyzeOpenEndedResponsesFlow = ai
  .flow('analyze-open-ended-responses')
  .define({
    prompt: (input) => `
      You are a helpful assistant for analyzing open-ended survey responses.
      You are given a survey question and a list of responses to that question.
      Provide a summary of the responses. Focus on identifying any trends, common themes, and overall sentiment.
      If there are any negative responses, explain them.
      If there are any positive responses, explain them.

      Question: ${input.question}
      Responses: ${JSON.stringify(input.responses)}

      Summary:
    `,
    inputSchema: {
      type: 'object',
      properties: {
        question: { type: 'string' },
        responses: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['question', 'responses'],
    },
    outputSchema: { type: 'string' },
  });