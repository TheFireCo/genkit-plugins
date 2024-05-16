import { Message } from '@genkit-ai/ai';
import {
  defineModel,
  modelRef,
  type GenerateRequest,
  type GenerateResponseData,
  type ModelAction,
} from '@genkit-ai/ai/model';
import OpenAI from 'openai';
import { type SpeechCreateParams } from 'openai/resources/audio/index.mjs';
import { z } from 'zod';

export const TTSConfigSchema = z.object({
  voice: z
    .enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'])
    .optional()
    .default('alloy'),
  speed: z.number().min(0.25).max(4.0).optional(),
  response_format: z
    .enum(['mp3', 'opus', 'aac', 'flac', 'wav', 'pcm'])
    .optional(),
});

export const tts1 = modelRef({
  name: 'openai/tts-1',
  info: {
    label: 'OpenAI - Text-to-speech 1',
    supports: {
      media: false,
      output: ['media'],
      multiturn: false,
      systemRole: false,
      tools: false,
    },
  },
  configSchema: TTSConfigSchema,
});

export const tts1Hd = modelRef({
  name: 'openai/tts-1-hd',
  info: {
    label: 'OpenAI - Text-to-speech 1 HD',
    supports: {
      media: false,
      output: ['media'],
      multiturn: false,
      systemRole: false,
      tools: false,
    },
  },
  configSchema: TTSConfigSchema,
});

export const SUPPORTED_TTS_MODELS = {
  'tts-1': tts1,
  'tts-1-hd': tts1Hd,
};

export const RESPONSE_FORMAT_MEDIA_TYPES = {
  mp3: 'audio/mpeg',
  opus: 'audio/opus',
  aac: 'audio/aac',
  flac: 'audio/flac',
  wav: 'audio/wav',
  pcm: 'audio/L16',
};

function toTTSRequest(
  modelName: string,
  request: GenerateRequest & {
    config?: { custom?: z.infer<typeof TTSConfigSchema> };
  },
): SpeechCreateParams {
  const mappedModelName = request.config?.version || modelName;
  const options: SpeechCreateParams = {
    model: mappedModelName,
    input: new Message(request.messages[0]).text(),
    voice: request.config?.custom?.voice ?? 'alloy',
    speed: request.config?.custom?.speed,
    response_format: request.config?.custom?.response_format,
  };
  for (const k in options) {
    if (options[k] === undefined) {
      delete options[k];
    }
  }
  return options;
}

function toGenerateResponse(
  result: Buffer,
  responseFormat: z.infer<typeof TTSConfigSchema>['response_format'] = 'mp3',
): GenerateResponseData {
  const mediaType = RESPONSE_FORMAT_MEDIA_TYPES[responseFormat];
  return {
    candidates: [
      {
        index: 0,
        finishReason: 'stop',
        message: {
          role: 'model',
          content: [
            {
              media: {
                contentType: mediaType,
                url: `data:${mediaType};base64,${result.toString('base64')}`,
              },
            },
          ],
        },
      },
    ],
  };
}

export function ttsModel(
  name: string,
  client: OpenAI,
): ModelAction<typeof TTSConfigSchema> {
  const modelId = `openai/${name}`;
  const model = SUPPORTED_TTS_MODELS[name];
  if (!model) throw new Error(`Unsupported model: ${name}`);

  return defineModel<typeof TTSConfigSchema>(
    {
      name: modelId,
      ...model.info,
      configSchema: model.configSchema,
    },
    async request => {
      const ttsRequest = toTTSRequest(name, request);
      const result = await client.audio.speech.create(ttsRequest);
      const resultArrayBuffer = await result.arrayBuffer();
      const resultBuffer = Buffer.from(new Uint8Array(resultArrayBuffer));
      return toGenerateResponse(resultBuffer, ttsRequest.response_format);
    },
  );
}
