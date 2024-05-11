import 'dotenv/config';

import { dotprompt, prompt } from '@genkit-ai/dotprompt';
import { generate, renderPrompt, definePrompt } from '@genkit-ai/ai';
import { configureGenkit } from '@genkit-ai/core';
import { defineFlow, startFlowsServer } from '@genkit-ai/flow';

import { gpt35Turbo, openAI } from 'genkitx-openai-plugin';

import * as z from 'zod';

configureGenkit({
  plugins: [
    /* Add your plugins here. */
    openAI({ apiKey: process.env.OPENAI_API_KEY }),
    dotprompt(),
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
      model: 'openai/gpt-3.5-turbo',
      config: {
        temperature: 1,
      },
    });

const helloPrompt = definePrompt(
  {
    name: 'helloPrompt',
    inputSchema: z.object({ name: z.string() }),
  },
  async (input) => {
    const promptText = `You are a helpful AI assistant named Walt.
    Say hello to ${input.name}.`;

    return {
      messages: [{ role: 'user', content: [{ text: promptText }] }],
      config: { temperature: 0.3 }
    }
  }
);

generate(
  renderPrompt({
    prompt: helloPrompt,
    input: { name: 'Fred' },
    model: 'openai/gpt-3.5-turbo',
  })
);
