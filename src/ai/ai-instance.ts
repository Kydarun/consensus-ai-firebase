import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

genkit.config({
  plugins: [
    googleAI({
      // You may provide Google AI API key using an environment variable:
      // GOOGLE_API_KEY=<your API key>
      // apiKey: process.env.GOOGLE_API_KEY
    }),
  ],
  // Where to store flow state. Defaults to $GENKIT_HOME/state.json or ~/.genkit/state.json.
  // stateStore: ...,
  // Where to store traces. Defaults to $GENKIT_HOME/traces.json or ~/.genkit/traces.json.
  // traceStore: ...,
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export const ai = genkit;
