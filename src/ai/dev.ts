/**
 * DEVELOPMENT ONLY
 *
 * This file is used to start Genkit in development mode.
 *
 * To start the Genkit development server run:
 * ```sh
 * genkit start
 * ```
 */

import {generateSurveyFromPromptFlow} from './flows/generate-survey-from-prompt';
import {analyzeOpenEndedResponsesFlow} from './flows/analyze-open-ended-responses';
import {summarizeSurveyResponsesFlow} from './flows/summarize-survey-responses';

export default {
  generateSurveyFromPromptFlow,
  analyzeOpenEndedResponsesFlow,
  summarizeSurveyResponsesFlow,
};
