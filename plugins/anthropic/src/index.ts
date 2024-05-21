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

import { genkitPlugin, type Plugin } from '@genkit-ai/core';
import Anthropic from '@anthropic-ai/sdk';
import {
  claude3Opus,
  claude3Sonnet,
  claude3Haiku,
  claudeModel,
  SUPPORTED_CLAUDE_MODELS,
} from './claude.js';
export { claude3Opus, claude3Sonnet, claude3Haiku };

export interface PluginOptions {
  apiKey?: string;
}

export const anthropic: Plugin<[PluginOptions] | []> = genkitPlugin(
  'anthropic',
  async (options?: PluginOptions) => {
    let apiKey = options?.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey)
      throw new Error(
        'please pass in the API key or set the ANTHROPIC_API_KEY environment variable'
      );
    const client = new Anthropic({ apiKey });
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
