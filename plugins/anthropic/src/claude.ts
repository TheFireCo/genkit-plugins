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

import { Message } from '@genkit-ai/ai';
import {
  CandidateData,
  defineModel,
  GenerateRequest,
  MessageData,
  modelRef,
  ModelReference,
  Part,
  Role,
} from '@genkit-ai/ai/model';
import Anthropic from '@anthropic-ai/sdk';
import z from 'zod';

const MODEL_VERSION_MAP: Record<string, string> = {
  'claude-3-opus': 'claude-3-opus-20240229',
  'claude-3-sonnet': 'claude-3-sonnet-20240229',
  'claude-3-haiku': 'claude-3-haiku-20240307',
};

const AnthropicConfigSchema = z.object({
  metadata: z
    .object({
      user_id: z.string().optional(),
    })
    .optional(),
});

export const claude3Haiku = modelRef({
  name: 'anthropic/claude-3-haiku',
  info: {
    versions: ['claude-3-haiku-20240307'],
    label: 'Anthropic - Claude 3 Haiku',
    supports: {
      multiturn: true,
      tools: false,
      media: true,
      output: ['text'],
    },
  },
  configSchema: AnthropicConfigSchema,
});

export const claude3Sonnet = modelRef({
  name: 'anthropic/claude-3-sonnet',
  info: {
    versions: ['claude-3-sonnet-20240229'],
    label: 'Anthropic - Claude 3 Sonnet',
    supports: {
      multiturn: true,
      tools: false,
      media: true,
      output: ['text'],
    },
  },
  configSchema: AnthropicConfigSchema,
});

export const claude3Opus = modelRef({
  name: 'anthropic/claude-3-opus',
  info: {
    versions: ['claude-3-opus-20240229'],
    label: 'Anthropic - Claude 3 Opus',
    supports: {
      multiturn: true,
      tools: false,
      media: true,
      output: ['text'],
    },
  },
  configSchema: AnthropicConfigSchema,
});

export const SUPPORTED_CLAUDE_MODELS: Record<
  string,
  ModelReference<z.ZodTypeAny>
> = {
  'claude-3-haiku': claude3Haiku,
  'claude-3-sonnet': claude3Sonnet,
  'claude-3-opus': claude3Opus,
};

/**
 * Converts a Genkit role to the corresponding Anthropic role.
 * @param role The Genkit role to convert.
 * @returns The corresponding Anthropic role.
 * @throws Error if the role doesn't map to an Anthropic role.
 */
function toAnthropicRole(role: Role): Anthropic.MessageParam['role'] {
  switch (role) {
    case 'user':
      return 'user';
    case 'model':
      return 'assistant';
    default:
      throw new Error(`Role ${role} doesn't map to an Anthropic role.`);
  }
}

/**
 * Converts a Genkit Part to the corresponding Anthropic TextBlock or ImageBlockParam.
 * @param part The Genkit Part to convert.
 * @returns The corresponding Anthropic TextBlock or ImageBlockParam.
 * @throws Error if the part contains unsupported fields for the current message role.
 */
export function toAnthropicTextAndMedia(
  part: Part
): Anthropic.TextBlock | Anthropic.ImageBlockParam {
  if (part.text) {
    return {
      type: 'text',
      text: part.text,
    } as Anthropic.TextBlock;
  } else if (part.media) {
    return {
      type: 'image',
      source: {
        type: 'base64',
        data: part.media.url.substring(part.media.url.indexOf(',') + 1),
        media_type:
          part.media.contentType ||
          part.media.url.substring('data:'.length, part.media.url.indexOf(';')),
      },
    } as Anthropic.ImageBlockParam;
  }
  throw Error(
    `Unsupported Genkit part fields encountered. Current message role does not support the provided part structure: ${JSON.stringify(
      part
    )}.`
  );
}

/**
 * Converts a Genkit MessageData array to an Anthropic system message and MessageParam array.
 * @param messages The Genkit MessageData array to convert.
 * @returns An object containing the optional Anthropic system message and the array of Anthropic MessageParam objects.
 */
export function toAnthropicMessages(messages: MessageData[]): {
  system?: string;
  messages: Anthropic.Messages.MessageParam[];
} {
  let systemMessage: string | undefined;
  if (messages[0]?.role === 'system') {
    systemMessage = messages[0].content?.[0]?.text;
  }
  const messagesToMap = systemMessage ? messages.slice(1) : messages;
  const mappedMessages: Anthropic.Messages.MessageParam[] = [];
  messagesToMap.forEach((message) => {
    const msg = new Message(message);
    const role = toAnthropicRole(message.role);
    switch (role) {
      case 'assistant':
        mappedMessages.push({
          role: role,
          content: msg.text(),
        });
        break;
      case 'user':
        mappedMessages.push({
          role: role,
          content: msg.content.map(toAnthropicTextAndMedia),
        });
        break;
      default:
        throw new Error(`Unrecognized role: ${role}`);
    }
  });
  return { system: systemMessage, messages: mappedMessages };
}

const FINISH_REASON_MAP: Record<
  NonNullable<Anthropic.Message['stop_reason']>,
  CandidateData['finishReason']
> = {
  end_turn: 'stop',
  max_tokens: 'length',
  stop_sequence: 'stop',
};

/**
 * Converts an Anthropic content block to a Genkit CandidateData object.
 * @param choice The Anthropic content block to convert.
 * @param index The index of the content block.
 * @param stopReason The reason the content block generation stopped.
 * @returns The converted Genkit CandidateData object.
 */
export function fromAnthropicContentBlock(
  choice: Anthropic.Messages.ContentBlock,
  index: number,
  stopReason: Anthropic.Message['stop_reason']
): CandidateData {
  return {
    finishReason: (stopReason && FINISH_REASON_MAP[stopReason]) || 'other',
    index,
    message: {
      role: 'model',
      content: [{ text: choice.text }],
    },
  };
}

/**
 * Converts an Anthropic message stream event to a Genkit CandidateData object.
 * @param choice The Anthropic message stream event to convert.
 * @returns The converted Genkit CandidateData object if the event is a content block start or delta, otherwise undefined.
 */
export function fromAnthropicContentBlockChunk(
  choice: Anthropic.MessageStreamEvent
): CandidateData | undefined {
  if (
    choice.type !== 'content_block_delta' &&
    choice.type !== 'content_block_start'
  ) {
    return;
  }
  return {
    finishReason: 'unknown',
    index: choice.index,
    message: {
      role: 'model',
      content: [
        {
          text:
            choice.type === 'content_block_start'
              ? choice.content_block.text
              : choice.delta.text,
        },
      ],
    },
  };
}

/**
 * Converts an Anthropic request to an Anthropic API request body.
 * @param modelName The name of the Anthropic model to use.
 * @param request The Genkit GenerateRequest to convert.
 * @param stream Whether to stream the response.
 * @returns The converted Anthropic API request body.
 * @throws An error if the specified model is not supported or if an unsupported output format is requested.
 */
export function toAnthropicRequestBody(
  modelName: string,
  request: GenerateRequest,
  stream?: boolean
): Anthropic.Messages.MessageCreateParams {
  const model = SUPPORTED_CLAUDE_MODELS[modelName];
  if (!model) throw new Error(`Unsupported model: ${modelName}`);
  const mappedModelName = MODEL_VERSION_MAP[modelName] || modelName;
  const { system, messages } = toAnthropicMessages(request.messages);
  const body: Anthropic.MessageCreateParams = {
    system,
    messages,
    max_tokens: request.config?.maxOutputTokens ?? 4096,
    model: mappedModelName,
    top_k: request.config?.topK,
    top_p: request.config?.topP,
    temperature: request.config?.temperature,
    stop_sequences: request.config?.stopSequences,
    stream,
    ...(request.config?.custom || {}),
  };

  if (request.output?.format && request.output.format !== 'text') {
    throw new Error(
      `Claude models currently support only the 'text' output format.`
    );
  }
  for (const key in body) {
    if (!body[key] || (Array.isArray(body[key]) && !body[key].length))
      delete body[key];
  }
  return body;
}

/**
 * Defines a Claude model with the given name and Anthropic client.
 * @param name The name of the Claude model.
 * @param client The Anthropic client instance.
 * @returns The defined Claude model.
 * @throws An error if the specified model is not supported.
 */
export function claudeModel(name: string, client: Anthropic) {
  const model = SUPPORTED_CLAUDE_MODELS[name];
  if (!model) throw new Error(`Unsupported model: ${name}`);

  const modelId = `anthropic/${name}`;

  return defineModel(
    {
      name: modelId,
      ...model.info,
      configSchema: SUPPORTED_CLAUDE_MODELS[name].configSchema,
    },
    async (request, streamingCallback) => {
      let response: Anthropic.Message;
      const body = toAnthropicRequestBody(name, request, !!streamingCallback);
      if (streamingCallback) {
        const stream = client.messages.stream(body);
        for await (const chunk of stream) {
          const c = fromAnthropicContentBlockChunk(chunk);
          if (c) {
            streamingCallback({
              index: c.index,
              content: c.message.content,
            });
          }
        }
        response = await stream.finalMessage();
      } else {
        response = (await client.messages.create(body)) as Anthropic.Message;
      }
      return {
        candidates: response.content.map((content, index) =>
          fromAnthropicContentBlock(content, index, response.stop_reason)
        ),
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        custom: response,
      };
    }
  );
}
