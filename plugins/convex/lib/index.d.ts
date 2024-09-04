import { EmbedderArgument } from '@genkit-ai/ai/embedder';
import { PluginProvider } from '@genkit-ai/core';
import * as z from 'zod';

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

interface Params<EmbedderCustomOptions extends z.ZodTypeAny> {
    indexName: string;
    embedder: EmbedderArgument<EmbedderCustomOptions>;
    embedderOptions?: z.infer<EmbedderCustomOptions>;
}
declare function convexVectorstore<EmbedderCustomOptions extends z.ZodTypeAny>(params: Params<EmbedderCustomOptions>[]): PluginProvider;

export { convexVectorstore, convexVectorstore as default };
