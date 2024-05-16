import { genkitPlugin, type Plugin } from '@genkit-ai/core';
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
  gpt4o,
  gptModel,
  SUPPORTED_GPT_MODELS,
} from './gpt.js';
import { SUPPORTED_TTS_MODELS, ttsModel, tts1, tts1Hd } from './tts.js';
import { whisper1, whisper1Model } from './whisper.js';
export {
  dallE3,
  gpt35Turbo,
  gpt4,
  gpt4Turbo,
  gpt4Vision,
  gpt4o,
  tts1,
  tts1Hd,
  whisper1,
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
        'please pass in the API key or set the OPENAI_API_KEY environment variable',
      );
    const client = new OpenAI({ apiKey });
    return {
      models: [
        ...Object.keys(SUPPORTED_GPT_MODELS).map(name =>
          gptModel(name, client),
        ),
        ...Object.keys(SUPPORTED_TTS_MODELS).map(name =>
          ttsModel(name, client),
        ),
        dallE3Model(client),
        whisper1Model(client),
      ],
      embedders: Object.keys(SUPPORTED_EMBEDDING_MODELS).map(name =>
        openaiEmbedder(name, options),
      ),
    };
  },
);

export default openAI;
