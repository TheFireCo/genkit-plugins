import 'dotenv/config';

import { generate } from '@genkit-ai/ai';
import { configureGenkit } from '@genkit-ai/core';
import { defineFlow, startFlowsServer } from '@genkit-ai/flow';

import { llama_3_70b, llama_3_8b, gemma_7b, mixtral_8_7b, groq } from 'genkitx-groq';

import * as z from 'zod';


configureGenkit({
  plugins: [
    /* Add your plugins here. */
    groq({ apiKey: process.env.GROQ_API_KEY }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export const menuSuggestionFlow = defineFlow(
  {
    name: 'menuSuggestionFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (subject) => {
    const llmResponse = await generate({
      prompt: `Suggest an item for the menu of a ${subject} themed restaurant`,
      model: llama_3_70b,
      config: {
        temperature: 1,
      },
    });

    return llmResponse.text();
  }
);

startFlowsServer();
