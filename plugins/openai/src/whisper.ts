import { Message } from '@genkit-ai/ai';
import {
  defineModel,
  modelRef,
  type GenerateRequest,
  type GenerateResponseData,
  type ModelAction,
} from '@genkit-ai/ai/model';
import OpenAI from 'openai';
import {
  type TranscriptionCreateParams,
  type Transcription,
} from 'openai/resources/audio/index.mjs';
import { z } from 'zod';

export const Whisper1ConfigSchema = z.object({
  language: z.string().optional(),
  timestamp_granularities: z.array(z.enum(['word', 'segment'])).optional(),
  response_format: z
    .enum(['json', 'text', 'srt', 'verbose_json', 'vtt'])
    .optional(),
});

export const whisper1 = modelRef({
  name: 'openai/whisper-1',
  info: {
    label: 'OpenAI - Whisper',
    supports: {
      media: true,
      output: ['text', 'json'],
      multiturn: false,
      systemRole: false,
      tools: false,
    },
  },
  configSchema: Whisper1ConfigSchema,
});

function toWhisper1Request(
  request: GenerateRequest & {
    config?: { custom?: z.infer<typeof Whisper1ConfigSchema> };
  },
): TranscriptionCreateParams {
  const message = new Message(request.messages[0]);
  const media = message.media();
  if (!media?.url) {
    throw new Error('No media found in the request');
  }
  const mediaBuffer = Buffer.from(
    media.url.slice(media.url.indexOf(',') + 1),
    'base64',
  );
  const mediaFile = new File([mediaBuffer], 'input', {
    type:
      media.contentType ??
      media.url.slice('data:'.length, media.url.indexOf(';')),
  });
  const options: TranscriptionCreateParams = {
    model: 'whisper-1',
    file: mediaFile,
    prompt: message.text(),
    temperature: request.config?.temperature,
    language: request.config?.custom?.language,
    timestamp_granularities: request.config?.custom?.timestamp_granularities,
  };
  const outputFormat = request.output?.format;
  const customFormat = request.config?.custom?.response_format;
  if (outputFormat && customFormat) {
    if (
      outputFormat === 'json' &&
      customFormat !== 'json' &&
      customFormat !== 'json_verbose'
    ) {
      throw new Error(
        `Custom response format ${customFormat} is not compatible with output format ${outputFormat}`,
      );
    }
  }
  options.response_format = customFormat || outputFormat || 'text';
  for (const k in options) {
    if (options[k] === undefined) {
      delete options[k];
    }
  }
  return options;
}

function toGenerateResponse(
  result: Transcription | string,
): GenerateResponseData {
  return {
    candidates: [
      {
        index: 0,
        finishReason: 'stop',
        message: {
          role: 'model',
          content: [
            {
              text: typeof result === 'string' ? result : result.text,
            },
          ],
        },
      },
    ],
  };
}

export function whisper1Model(
  client: OpenAI,
): ModelAction<typeof Whisper1ConfigSchema> {
  return defineModel<typeof Whisper1ConfigSchema>(
    {
      name: whisper1.name,
      ...whisper1.info,
      configSchema: whisper1.configSchema,
    },
    async request => {
      const result = await client.audio.transcriptions.create(
        toWhisper1Request(request),
      );
      return toGenerateResponse(result);
    },
  );
}
