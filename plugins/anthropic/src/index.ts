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
import Anthropic from '@anthropic-ai/sdk';
import { 
  claude3Haiku,
  claude3Sonnet,
  claude3Opus,
  claudeModel, 
  SUPPORTED_CLAUDE_MODELS,
} from './claude';

export {
  claude3Haiku,
  claude3Sonnet,
  claude3Opus,
};

export interface PluginOptions {
  apiKey?: string;
}

/**
 * This module provides an interface to the Anthropic AI models through the Genkit plugin system.
 * It allows users to interact with various Claude models by providing an API key and optional configuration.
 * 
 * The main export is the `anthropic` plugin, which can be configured with an API key either directly or through
 * environment variables. It initializes the Anthropic client and makes available the Claude models for use.
 * 
 * Exports:
 * - claude3Haiku: Reference to the Claude 3 Haiku model.
 * - claude3Sonnet: Reference to the Claude 3 Sonnet model.
 * - claude3Opus: Reference to the Claude 3 Opus model.
 * - anthropic: The main plugin function to interact with the Anthropic AI.
 * 
 * Usage:
 * To use the Claude models, initialize the anthropic plugin inside `configureGenkit` and pass the configuration options. If no API key is provided in the options, the environment variable `ANTHROPIC_API_KEY` must be set.
 * 
 * Example:
 * ```
 * import anthropic from 'genkitx-anthropicai';
 * 
 * export default configureGenkit({
 *  plugins: [
 *    anthropic({ apiKey: 'your-api-key' })
 *    ... // other plugins
 *  ]
 * });
 * ```
 */
// TODO: add support for voyage embeddings and tool use (both not documented well in docs.anthropic.com) 
export const anthropic: Plugin<[PluginOptions] | []> = genkitPlugin(
  'anthropic',
  async (options?: PluginOptions) => {
    let apiKey = options?.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey)
      throw new Error(
        'Please pass in the API key or set the ANTHROPIC_API_KEY environment variable'
      );
    const client = new Anthropic({apiKey});
    return {
      models: [
        ...Object.keys(SUPPORTED_CLAUDE_MODELS).map((name) =>
          claudeModel(name, client)
        ),
      ],
    };
  }
);

export default anthropic;

