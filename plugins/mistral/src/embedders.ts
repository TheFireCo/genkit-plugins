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

import MistralClient from '@mistralai/mistralai';
import type { Genkit } from 'genkit';
import { embedderRef, z } from 'genkit';

export const TextEmbeddingConfigSchema = z.object({
  embeddingTypes: z.literal('float').optional(),
  encodingFormat: z.union([z.literal('float'), z.literal('base64')]).optional(),
});

export type TextEmbeddingConfig = z.infer<typeof TextEmbeddingConfigSchema>;

export function mistralEmbedder(
  ai: Genkit,
  name: string,
  client: MistralClient
) {
  const model = SUPPORTED_EMBEDDING_MODELS[name];
  if (!model) throw new Error(`Unsupported model: ${name}`);

  ai.defineEmbedder(
    {
      info: model.info!,
      configSchema: TextEmbeddingConfigSchema,
      name: model.name,
    },
    async (input, _) => {
      const embeddings = await client.embeddings({
        model: name,
        input: input.map((d) => d.text),
      });
      return {
        embeddings: embeddings.data.map((d) => ({ embedding: d.embedding })),
      };
    }
  );
}

export const mistralembed = embedderRef({
  name: 'mistral/mistral-embed',
  configSchema: TextEmbeddingConfigSchema,
  info: {
    dimensions: 1024,
    label: 'Mistral - Mistral Embed',
    supports: {
      input: ['text'],
    },
  },
});
export const SUPPORTED_EMBEDDING_MODELS = {
  'mistral-embed': mistralembed,
};
