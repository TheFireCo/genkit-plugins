import 'dotenv/config';

import { defineDotprompt, dotprompt, prompt } from '@genkit-ai/dotprompt';
import { generate, definePrompt, defineTool } from '@genkit-ai/ai';
import { configureGenkit } from '@genkit-ai/core';
import { defineFlow, startFlowsServer } from '@genkit-ai/flow';
import * as z from 'zod';

import { openAI, gpt4Turbo, gpt35Turbo } from 'genkitx-openai-plugin';
import groq from 'genkitx-groq';
import cohere from 'genkitx-cohere';
import anthropic from 'genkitx-anthropicai';
import mistral from 'genkitx-mistral';

export default configureGenkit({
  plugins: [
    openAI(),
    groq(),
    cohere(),
    anthropic(),
    
    // mistral(),
    dotprompt(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});


// Define standard prompts
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
      config: { temperature: 0.3,
       }
    }
  }
);

// Tool definition
const tool = defineTool(
  {
    name: 'myJoke',
    description: 'useful when you need a joke to tell.',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (input) => `haha Just kidding no joke about for you! got you`
);

// define Dotprompts
const greetingPrompt = prompt('basic');
const multimodalPrompt = prompt('multimodalInput');
const structuredOutputPrompt = prompt('structuredInputOutput');
const customConfigPrompt = prompt('customConfig');

// Define a Dotprompt in code
const codeDotPrompt = defineDotprompt(
  {
    name: 'exampleDotPrompt',
    model: gpt4Turbo,
    input: {
      schema: z.object({
        object_name: z.string(),
        image_url: z.string(),
      }),
    },
    output: {
      schema: z.object({
        exist: z.boolean(),
        color: z.string(),
        details: z.string(),
      }),
    },
    config: {
      temperature: 1.0,
      topP: 0.9,
      maxOutputTokens: 100,
      topK: 20,
      stopSequences: ['abc'],
      visualDetailLevel: 'high',
    },
  },
  `Does the object {{object_name}} exist in the given image {{media url=image_url}}? If it does, what color is it and what are some details about it?`
);


// Define flows
export const myFlow = defineFlow(
  {
    name: 'menuSuggestionFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (subject) => {
    const llmResponse = await generate({
      prompt: `Suggest an item for the menu of a ${subject} themed restaurant`,
      model: gpt4Turbo,
    });

    return llmResponse.text();
  }
);
startFlowsServer();

