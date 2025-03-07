/**
 * Copyright 2024
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { startFlowServer } from '@genkit-ai/express';
import dotenv from 'dotenv';
import { genkit, z } from 'genkit';
import mistral, {
  openMistral7B,
  mistralembed,
  openPixtral,
} from 'genkitx-mistral';
import { version } from 'uuid';
import { ocr } from '../../../plugins/mistral/src/ocr';

dotenv.config();

const ai = genkit({
  plugins: [mistral({ apiKey: process.env.MISTRAL_API_KEY })],
  model: openMistral7B,
});

export const jokeFlow = ai.defineFlow(
  {
    name: 'jokeFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (subject) => {
    const llmResponse = await ai.generate({
      prompt: `tell me a joke about ${subject}`,
    });
    return llmResponse.text;
  }
);

//  genkit flow:run embedFlow \"hello world\"

export const embedFlow = ai.defineFlow(
  {
    name: 'embedFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (text) => {
    const embedding = await ai.embed({
      embedder: mistralembed,
      content: text,
    });

    return JSON.stringify(embedding);
  }
);

export const visionFlow = ai.defineFlow(
  {
    name: 'visionFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (input) => {
    const { text } = await ai.generate({
      prompt: [{ media: { url: 'https://my-photo.jpg' } }, { text: input }],
      model: openPixtral,
      config: {
        version: 'pixtral-12b-2409',
      },
    });

    return JSON.stringify(text);
  }
);

export const ocrFlow = ai.defineFlow(
  {
    name: 'ocrFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (input) => {
    const { text } = await ai.generate({
      model: ocr,
      prompt: 'parse the document',
      config: {
        document: {
          documentUrl: input,
          type: 'document_url',
        },
      },
    });

    return JSON.stringify(text);
  }
);

startFlowServer({
  flows: [embedFlow, jokeFlow, visionFlow, ocrFlow],
});
