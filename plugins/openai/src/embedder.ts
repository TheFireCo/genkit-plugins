import { defineEmbedder, embedderRef } from '@genkit-ai/ai/embedder';
import OpenAI from 'openai';
import { z } from 'zod';
import { type PluginOptions } from './index.js';

export const TextEmbeddingConfigSchema = z.object({
  dimensions: z.number().optional(),
  encodingFormat: z.union([z.literal('float'), z.literal('base64')]).optional(),
});

export type TextEmbeddingGeckoConfig = z.infer<
  typeof TextEmbeddingConfigSchema
>;

export const TextEmbeddingInputSchema = z.string();

export const textEmbedding3Small = embedderRef({
  name: 'openai/text-embedding-3-small',
  configSchema: TextEmbeddingConfigSchema,
  info: {
    dimensions: 1536,
    label: 'Open AI - Text Embedding 3 Small',
    supports: {
      input: ['text'],
    },
  },
});

export const textEmbedding3Large = embedderRef({
  name: 'openai/text-embedding-3-large',
  configSchema: TextEmbeddingConfigSchema,
  info: {
    dimensions: 3072,
    label: 'Open AI - Text Embedding 3 Large',
    supports: {
      input: ['text'],
    },
  },
});

export const textEmbeddingAda002 = embedderRef({
  name: 'openai/text-embedding-ada-002',
  configSchema: TextEmbeddingConfigSchema,
  info: {
    dimensions: 1536,
    label: 'Open AI - Text Embedding ADA 002',
    supports: {
      input: ['text'],
    },
  },
});

export const SUPPORTED_EMBEDDING_MODELS = {
  'text-embedding-3-small': textEmbedding3Small,
  'text-embedding-3-large': textEmbedding3Large,
  'text-embedding-ada-002': textEmbeddingAda002,
};

export function openaiEmbedder(name: string, options?: PluginOptions) {
  let apiKey = options?.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey)
    throw new Error(
      'please pass in the API key or set the OPENAI_API_KEY environment variable',
    );
  const model = SUPPORTED_EMBEDDING_MODELS[name];
  if (!model) throw new Error(`Unsupported model: ${name}`);

  const client = new OpenAI({ apiKey });
  return defineEmbedder(
    {
      info: model.info!,
      configSchema: TextEmbeddingConfigSchema,
      name: model.name,
    },
    async (input, options) => {
      const embeddings = await client.embeddings.create({
        model: name,
        input: input.map(d => d.text()),
        dimensions: options?.dimensions,
        encoding_format: options?.encodingFormat,
      });
      return {
        embeddings: embeddings.data.map(d => ({ embedding: d.embedding })),
      };
    },
  );
}
