import * as _genkit_ai_ai_embedder from '@genkit-ai/ai/embedder';
import { z } from 'zod';
import { Plugin } from '@genkit-ai/core';
import './dalle.mjs';
import './gpt.mjs';
import './tts.mjs';
import './whisper.mjs';

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

interface PluginOptions {
    apiKey?: string;
}
/**
 * This module provides an interface to the OpenAI models through the Genkit
 * plugin system. It allows users to interact with various models by providing
 * an API key and optional configuration.
 *
 * The main export is the `openai` plugin, which can be configured with an API
 * key either directly or through environment variables. It initializes the
 * OpenAI client and makes available the models for use.
 *
 * Exports:
 * - gpt4o: Reference to the GPT-4o model.
 * - gpt4oMini: Reference to the GPT-4o-mini model.
 * - gpt4Turbo: Reference to the GPT-4 Turbo model.
 * - gpt4Vision: Reference to the GPT-4 Vision model.
 * - gpt4: Reference to the GPT-4 model.
 * - gpt35Turbo: Reference to the GPT-3.5 Turbo model.
 * - dallE3: Reference to the DALL-E 3 model.
 * - tts1: Reference to the Text-to-speech 1 model.
 * - tts1Hd: Reference to the Text-to-speech 1 HD model.
 * - whisper: Reference to the Whisper model.
 * - textEmbedding3Large: Reference to the Text Embedding Large model.
 * - textEmbedding3Small: Reference to the Text Embedding Small model.
 * - textEmbeddingAda002: Reference to the Ada model.
 * - openai: The main plugin function to interact with OpenAI.
 *
 * Usage:
 * To use the models, initialize the openai plugin inside `configureGenkit` and
 * pass the configuration options. If no API key is provided in the options, the
 * environment variable `OPENAI_API_KEY` must be set.
 *
 * Example:
 * ```
 * import openai from 'genkitx-openai';
 *
 * export default configureGenkit({
 *  plugins: [
 *    openai({ apiKey: 'your-api-key' })
 *    ... // other plugins
 *  ]
 * });
 * ```
 */
declare const openAI: Plugin<[PluginOptions] | []>;

declare const TextEmbeddingConfigSchema: z.ZodObject<{
    dimensions: z.ZodOptional<z.ZodNumber>;
    encodingFormat: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"float">, z.ZodLiteral<"base64">]>>;
}, "strip", z.ZodTypeAny, {
    dimensions?: number | undefined;
    encodingFormat?: "float" | "base64" | undefined;
}, {
    dimensions?: number | undefined;
    encodingFormat?: "float" | "base64" | undefined;
}>;
type TextEmbeddingGeckoConfig = z.infer<typeof TextEmbeddingConfigSchema>;
declare const TextEmbeddingInputSchema: z.ZodString;
declare const textEmbedding3Small: _genkit_ai_ai_embedder.EmbedderReference<z.ZodObject<{
    dimensions: z.ZodOptional<z.ZodNumber>;
    encodingFormat: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"float">, z.ZodLiteral<"base64">]>>;
}, "strip", z.ZodTypeAny, {
    dimensions?: number | undefined;
    encodingFormat?: "float" | "base64" | undefined;
}, {
    dimensions?: number | undefined;
    encodingFormat?: "float" | "base64" | undefined;
}>>;
declare const textEmbedding3Large: _genkit_ai_ai_embedder.EmbedderReference<z.ZodObject<{
    dimensions: z.ZodOptional<z.ZodNumber>;
    encodingFormat: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"float">, z.ZodLiteral<"base64">]>>;
}, "strip", z.ZodTypeAny, {
    dimensions?: number | undefined;
    encodingFormat?: "float" | "base64" | undefined;
}, {
    dimensions?: number | undefined;
    encodingFormat?: "float" | "base64" | undefined;
}>>;
declare const textEmbeddingAda002: _genkit_ai_ai_embedder.EmbedderReference<z.ZodObject<{
    dimensions: z.ZodOptional<z.ZodNumber>;
    encodingFormat: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"float">, z.ZodLiteral<"base64">]>>;
}, "strip", z.ZodTypeAny, {
    dimensions?: number | undefined;
    encodingFormat?: "float" | "base64" | undefined;
}, {
    dimensions?: number | undefined;
    encodingFormat?: "float" | "base64" | undefined;
}>>;
declare const SUPPORTED_EMBEDDING_MODELS: {
    'text-embedding-3-small': _genkit_ai_ai_embedder.EmbedderReference<z.ZodObject<{
        dimensions: z.ZodOptional<z.ZodNumber>;
        encodingFormat: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"float">, z.ZodLiteral<"base64">]>>;
    }, "strip", z.ZodTypeAny, {
        dimensions?: number | undefined;
        encodingFormat?: "float" | "base64" | undefined;
    }, {
        dimensions?: number | undefined;
        encodingFormat?: "float" | "base64" | undefined;
    }>>;
    'text-embedding-3-large': _genkit_ai_ai_embedder.EmbedderReference<z.ZodObject<{
        dimensions: z.ZodOptional<z.ZodNumber>;
        encodingFormat: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"float">, z.ZodLiteral<"base64">]>>;
    }, "strip", z.ZodTypeAny, {
        dimensions?: number | undefined;
        encodingFormat?: "float" | "base64" | undefined;
    }, {
        dimensions?: number | undefined;
        encodingFormat?: "float" | "base64" | undefined;
    }>>;
    'text-embedding-ada-002': _genkit_ai_ai_embedder.EmbedderReference<z.ZodObject<{
        dimensions: z.ZodOptional<z.ZodNumber>;
        encodingFormat: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"float">, z.ZodLiteral<"base64">]>>;
    }, "strip", z.ZodTypeAny, {
        dimensions?: number | undefined;
        encodingFormat?: "float" | "base64" | undefined;
    }, {
        dimensions?: number | undefined;
        encodingFormat?: "float" | "base64" | undefined;
    }>>;
};
declare function openaiEmbedder(name: string, options?: PluginOptions): _genkit_ai_ai_embedder.EmbedderAction<z.ZodObject<{
    dimensions: z.ZodOptional<z.ZodNumber>;
    encodingFormat: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"float">, z.ZodLiteral<"base64">]>>;
}, "strip", z.ZodTypeAny, {
    dimensions?: number | undefined;
    encodingFormat?: "float" | "base64" | undefined;
}, {
    dimensions?: number | undefined;
    encodingFormat?: "float" | "base64" | undefined;
}>>;

export { type PluginOptions as P, SUPPORTED_EMBEDDING_MODELS as S, TextEmbeddingConfigSchema as T, textEmbedding3Small as a, textEmbeddingAda002 as b, type TextEmbeddingGeckoConfig as c, TextEmbeddingInputSchema as d, openaiEmbedder as e, openAI as o, textEmbedding3Large as t };
