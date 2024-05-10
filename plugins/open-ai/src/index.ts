
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

import { genkitPlugin, Plugin } from '@genkit-ai/core';
import OpenAI from 'openai';
import { dallE3, dallE3Model } from './dalle.js';
import {
  openaiEmbedder,
  SUPPORTED_EMBEDDING_MODELS,
  textEmbedding3Large,
  textEmbedding3Small,
} from './embedder.js';
import {
  gpt35Turbo,
  gpt4,
  gpt4Turbo,
  gpt4Vision,
  gptModel,
  SUPPORTED_GPT_MODELS,
} from './gpt.js';
export {
  dallE3,
  gpt35Turbo,
  gpt4,
  gpt4Turbo,
  gpt4Vision,
  textEmbedding3Large,
  textEmbedding3Small,
};

export interface PluginOptions {
  apiKey?: string;
}

export const openAI: Plugin<[PluginOptions] | []> = genkitPlugin(
  'openai',
  async (options?: PluginOptions) => {
    let apiKey = options?.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey)
      throw new Error(
        'please pass in the API key or set the OPENAI_API_KEY environment variable'
      );
    const client = new OpenAI({ apiKey });
    return {
      models: [
        ...Object.keys(SUPPORTED_GPT_MODELS).map((name) =>
          gptModel(name, client)
        ),
        dallE3Model(client),
      ],
      embedders: Object.keys(SUPPORTED_EMBEDDING_MODELS).map((name) =>
        openaiEmbedder(name, options)
      ),
    };
  }
);

export default openAI;
