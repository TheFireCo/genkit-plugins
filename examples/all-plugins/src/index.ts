import 'dotenv/config';

import { Genkit } from 'genkit';
// import { generate, definePrompt, defineTool } from '@genkit-ai/ai';

import { defineFlow, startFlowsServer } from '@genkit-ai/flow';

import { gpt4o, openAI } from 'genkitx-openai';
import { genkit, z } from 'genkit';
import groq, { llama3x70b } from 'genkitx-groq';
import mistral from 'genkitx-mistral';
import anthropic from 'genkitx-anthropic';
import { cohere } from 'genkitx-cohere';
const ai = genkit({
  plugins: [openAI(), groq(), cohere(), anthropic(), mistral()],
  promptDir: '../prompts',
});
// Define standard prompts
const helloPrompt = ai.definePrompt(
  {
    name: 'helloPrompt',
    input: {
      schema: z.object({ name: z.string() }),
    },
  },
  async (input) => {
    const promptText = `You are a helpful AI assistant named Walt.
    Say hello to ${input.name}.`;

    return {
      messages: [{ role: 'user', content: [{ text: promptText }] }],
      config: { temperature: 0.3 },
    };
  }
);

// Tool definition
const tool = ai.defineTool(
  {
    name: 'myJoke',
    description: 'useful when you need a joke to tell.',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (input) => `haha Just kidding no joke about for you! got you`
);

// define Dotprompts
// export const greetingPrompt = prompt('basic');
// const multimodalPrompt = prompt('multimodalInput');
// const structuredOutputPrompt = prompt('structuredInputOutput');
// const customConfigPrompt = prompt('customConfig');

// Define a Dotprompt in code
const codeDotPrompt = ai.definePrompt(
  {
    name: 'exampleDotPrompt',
    model: gpt4o,
    input: {
      schema: z.object({
        object_name: z.string(),
        image_url: z.string(),
      }),
    },
    output: {
      schema: z.object({
        exist: z.boolean().describe('Whether the object exists in the image'),
        color: z.string().describe('The color of the object'),
        details: z.string().describe('Details about the object'),
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
    const llmResponse = await ai.generate({
      prompt: `Suggest an item for the menu of a ${subject} themed restaurant`,
      model: gpt4o,
    });

    return llmResponse.text;
  }
);
startFlowsServer();

// Tool use
// const createReminder = defineTool(
//   {
//     name: 'createReminder',
//     description: 'Use this to create reminders for things in the future',
//     inputSchema: z.object({
//       time: z
//         .string()
//         .describe('ISO timestamp string, e.g. 2024-04-03T12:23:00Z'),
//       reminder: z.string().describe('the content of the reminder'),
//     }),
//     outputSchema: z.number().describe('the ID of the created reminder'),
//   },
//   (reminder) => Promise.resolve(3)
// );

// const result = generate({
//   model: llama3x70b,
//   tools: [createReminder],
//   prompt: `
//   You are a reminder assistant.
//   If you create a reminder, describe in text the reminder you created as a response.

//   Query: I have a meeting with Anna at 3 for dinner - can you set a reminder for the time?
//   `,
// });

// console.log(result.then((res) => res.text()));
