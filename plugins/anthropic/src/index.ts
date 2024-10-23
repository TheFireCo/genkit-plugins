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

import { Genkit } from 'genkit';
import { genkitPlugin } from 'genkit/plugin';
import Anthropic from '@anthropic-ai/sdk';
import {
  claude35Sonnet,
  claude3Opus,
  claude3Sonnet,
  claude3Haiku,
  claudeModel,
  SUPPORTED_CLAUDE_MODELS,
} from './claude.js';

export { claude35Sonnet, claude3Opus, claude3Sonnet, claude3Haiku };

export interface PluginOptions {
  apiKey?: string;
}

/**
 * This module provides an interface to the Anthropic AI models through the Genkit plugin system.
 * It allows users to interact with various Claude models by providing an API key and optional configuration.
 *
 * Exports:
 * - claude35Sonnet: Reference to the Claude 3.5 Sonnet model.
 * - claude3Haiku: Reference to the Claude 3 Haiku model.
 * - claude3Sonnet: Reference to the Claude 3 Sonnet model.
 * - claude3Opus: Reference to the Claude 3 Opus model.
 * - anthropic: The main plugin function to interact with the Anthropic AI.
 */

export const anthropic = (options?: PluginOptions) =>
  genkitPlugin('anthropic', async (ai: Genkit) => {
    let apiKey = options?.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        'Please pass in the API key or set the ANTHROPIC_API_KEY environment variable'
      );
    }
    const client = new Anthropic({ apiKey });

    for (const name of Object.keys(SUPPORTED_CLAUDE_MODELS)) {
      claudeModel(ai, name, client);
    }
  });

export default anthropic;
