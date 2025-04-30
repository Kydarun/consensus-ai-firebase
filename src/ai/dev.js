const { analyzeOpenEndedResponses } = require('./flows/analyze-open-ended-responses');
const { generateSurveyFromPrompt } = require('./flows/generate-survey-from-prompt');
const { summarizeSurveyResponses } = require('./flows/summarize-survey-responses');

console.log('Running Genkit development flows'); // No change needed

async function main() { // No change needed
  try {
    const generateSurveyResult = await generateSurveyFromPrompt({ // No change needed
      prompt:
        'Create a survey with 5 questions for a company that is interested in customer experience related to their customer service representatives.',
    });
    console.log( // No change needed
      'generateSurveyFromPrompt result:\n',
      JSON.stringify(generateSurveyResult, null, 2)
    );

    const summarizeSurveyResponsesResult = await summarizeSurveyResponses({ // No change needed
      survey: generateSurveyResult.survey,
      responses: [
        'I liked the service but it took a long time.', // No change needed
        'I am not happy with the representative.', // No change needed
        'The representative was very helpful.', // No change needed
        'The service was great!', // No change needed
        'The support staff was very helpful and friendly.', // No change needed
      ], // No change needed
    }); // No change needed

    console.log( // No change needed
      'summarizeSurveyResponses result:\n',
      JSON.stringify(summarizeSurveyResponsesResult, null, 2)
    );

    const analyzeOpenEndedResponsesResult = await analyzeOpenEndedResponses({ // No change needed
      responses: [
        'I liked the service but it took a long time.', // No change needed
        'I am not happy with the representative.', // No change needed
        'The representative was very helpful.', // No change needed
        'The service was great!', // No change needed
        'The support staff was very helpful and friendly.', // No change needed
      ], // No change needed
    }); // No change needed
    console.log( // No change needed
      'analyzeOpenEndedResponses result:\n',
      JSON.stringify(analyzeOpenEndedResponsesResult, null, 2)
    );
  } catch (error) {
    console.error('An error occurred:', error);
  }
}
main(); // No change needed