/**
 * Copyright 2024 The Fire Company
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

import dotenv from 'dotenv';
import { genkit, z } from 'genkit';
import AzureOpenAi, { gpt4o, textEmbeddingAda002 } from 'genkitx-azure-openai';

dotenv.config();

const ai = genkit({
  plugins: [
    AzureOpenAi({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT_ID,
      apiVersion: process.env.OPENAI_API_VERSION,
    }),
  ],
  model: gpt4o,
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
      embedder: textEmbeddingAda002,
      content: text,
    });

    return JSON.stringify(embedding);
  }
);
