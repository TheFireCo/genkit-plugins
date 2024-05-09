import { genkitPlugin, Plugin } from '@genkit-ai/core';
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
        'please pass in the API key or set the ANTHROPIC_API_KEY environment variable',
      );
    const client = new Anthropic({ apiKey });
    return {
      models: [
        ...Object.keys(SUPPORTED_CLAUDE_MODELS).map(name =>
          claudeModel(name, client),
        ),
      ],
    };
  },
);

export default anthropic;
