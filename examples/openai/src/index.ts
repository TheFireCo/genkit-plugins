import 'dotenv/config';

import { defineDotprompt, dotprompt, prompt } from '@genkit-ai/dotprompt';
import { generate, definePrompt, renderPrompt } from '@genkit-ai/ai';
import { configureGenkit } from '@genkit-ai/core';
import { defineFlow, startFlowsServer } from '@genkit-ai/flow';

import { gpt35Turbo, openAI } from 'genkitx-openai-plugin';

import * as z from 'zod';

export default configureGenkit({
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

// Run the standard prompt 
// generate(
//   renderPrompt({
//     prompt: helloPrompt,
//     input: { name: 'Fred' },
//     model: 'openai/gpt-3.5-turbo',
//   })
// );

// define Dotprompts
const greetingPrompt = prompt('basic');
const multimodalPrompt = prompt('multimodalInput');
const structuredOutputPrompt = prompt('structuredInputOutput');
const customConfigPrompt = prompt('customConfig');

// Obtain the prompt with 
// const greetingPrompt = await prompt('greeting');

// Define a Dotprompt in code
const codeDotPrompt = defineDotprompt(
  {
    name: 'exampleDotPrompt',
    model: 'openai/gpt-3.5-turbo',
    input: {
      schema: z.object({
        name: z.string(),
      }),
    },
  },
  `Hello {{name}}, how are you today?`
);

// Run the dotprompt
// const response = codeDotPrompt.generate({
//  input:{
//       name: 'Fred',
//     }
//   }
// );
// For the response, you can use the following to get the text
// console.log(response.text());
// Or you can use the following to get the structured output, if you specified it
// console.log(response.output());


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
      model: 'openai/gpt-3.5-turbo',
      config: {
        temperature: 1,
      },
    });

    return llmResponse.text();
  }
);
startFlowsServer();

// Run the flow
//const response = runFlow(myFlow, 'mexican' );

// Text embedder
// import { textEmbedding3Small } from 'genkitx-openai-plugin'; 
// import { embed } from '@genkit-ai/ai/embedder';
// const embedding = embed({
//   embedder: textEmbedding3Small,
//   content: "Embed this text.",
// });

