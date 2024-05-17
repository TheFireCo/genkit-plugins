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
import {
  AzureKeyCredential,
  OpenAIClient,
  OpenAIClientOptions,
} from '@azure/openai';
import { DefaultAzureCredential } from '@azure/identity';

// import { dallE3, dallE3Model } from './dalle.js';
// import {
//   openaiEmbedder,
//   SUPPORTED_EMBEDDING_MODELS,
//   textEmbedding3Large,
//   textEmbedding3Small,
// } from './embedder.js';
// import {
//   gpt35Turbo,
//   gpt4,
//   gpt4Turbo,
//   gpt4Vision,
//   gpt4o,
//   gptModel,
//   SUPPORTED_GPT_MODELS,
// } from './gpt.js';
// export {
//   dallE3,
//   gpt35Turbo,
//   gpt4,
//   gpt4Turbo,
//   gpt4Vision,
//   gpt4o,
//   textEmbedding3Large,
//   textEmbedding3Small,
// };

export interface PluginOptions {
  apiKey?: string;
  azureOpenAIEndpoint?: string;
  azureOpenAIApiDeploymentName?: string;
  credential?: AzureKeyCredential;
  clientOptions?: OpenAIClientOptions;
}

export const azureOpenAI: Plugin<[PluginOptions] | []> = genkitPlugin(
  'azure-openai',
  async (options?: PluginOptions) => {
    let apiKey = options?.apiKey || process.env.AZURE_OPENAI_API_KEY;
    let endpoint =
      options?.azureOpenAIEndpoint || process.env.AZURE_OPENAI_API_ENDPOINT;
    let deploymentName =
      options?.azureOpenAIApiDeploymentName ||
      process.env.AZURE_OPENAI_API_EMBEDDING_DEPLOYMENT_NAME;

    if (!apiKey && !options?.credential)
      throw new Error(
        'Please provide an API key or Azure credential or set the AZURE_OPENAI_API_KEY environment variable'
      );

    if (!endpoint)
      throw new Error(
        'Please provide the Azure OpenAI endpoint or set the AZURE_OPENAI_API_ENDPOINT environment variable'
      );

    const credential =
      options?.credential ||
      new AzureKeyCredential(apiKey!) ||
      new DefaultAzureCredential();

    const client = new OpenAIClient(
      endpoint,
      credential,
      options?.clientOptions
    );

    return {
      // TODO: WIP
      // models: [
      //   ...Object.keys(SUPPORTED_GPT_MODELS).map((name) =>
      //     gptModel(name, client)
      //   ),
      //   dallE3Model(client),
      // ],
      // embedders: Object.keys(SUPPORTED_EMBEDDING_MODELS).map((name) =>
      //   openaiEmbedder(name, options)
      // ),
    };
  }
);

export default azureOpenAI;
