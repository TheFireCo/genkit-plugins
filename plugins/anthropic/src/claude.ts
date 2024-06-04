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
  GenerationCommonConfigSchema,
  ModelAction,
  defineModel,
  modelRef,
  type CandidateData,
  type GenerateRequest,
  type MessageData,
  type ModelReference,
  type Part,
  type Role,
  type ToolDefinition,
} from '@genkit-ai/ai/model';
import Anthropic from '@anthropic-ai/sdk';
import z from 'zod';

const AnthropicConfigSchema = GenerationCommonConfigSchema.extend({
  tool_choice: z
    .union([
      z.object({
        type: z.literal('auto'),
      }),
      z.object({
        type: z.literal('any'),
      }),
      z.object({
        type: z.literal('tool'),
        name: z.string(),
      }),
    ])
    .optional(),
  metadata: z
    .object({
      user_id: z.string().optional(),
    })
    .optional(),
});

export const claude3Opus = modelRef({
  name: 'anthropic/claude-3-opus',
  info: {
    versions: ['claude-3-opus-20240229'],
    label: 'Anthropic - Claude 3 Opus',
    supports: {
      multiturn: true,
      tools: true,
      media: true,
      systemRole: true,
      output: ['text'],
    },
  },
  configSchema: AnthropicConfigSchema,
  version: 'claude-3-opus-20240229',
});

export const claude3Sonnet = modelRef({
  name: 'anthropic/claude-3-sonnet',
  info: {
    versions: ['claude-3-sonnet-20240229'],
    label: 'Anthropic - Claude 3 Sonnet',
    supports: {
      multiturn: true,
      tools: true,
      media: true,
      systemRole: true,
      output: ['text'],
    },
  },
  configSchema: AnthropicConfigSchema,
  version: 'claude-3-sonnet-20240229',
});

export const claude3Haiku = modelRef({
  name: 'anthropic/claude-3-haiku',
  info: {
    versions: ['claude-3-haiku-20240307'],
    label: 'Anthropic - Claude 3 Haiku',
    supports: {
      multiturn: true,
      tools: true,
      media: true,
      systemRole: true,
      output: ['text'],
    },
  },
  configSchema: AnthropicConfigSchema,
  version: 'claude-3-haiku-20240307',
});

export const SUPPORTED_CLAUDE_MODELS: Record<
  string,
  ModelReference<typeof AnthropicConfigSchema>
> = {
  'claude-3-opus': claude3Opus,
  'claude-3-sonnet': claude3Sonnet,
  'claude-3-haiku': claude3Haiku,
};

/**
 * Converts a Genkit role to the corresponding Anthropic role.
 * @param role The Genkit role to convert.
 * @param toolMessageType In case the message refers to the usage of a tool, the type of tool message (tool_use or tool_result).
 * @returns The corresponding Anthropic role.
 * @throws Error if the role doesn't map to an Anthropic role.
 */
function toAnthropicRole(
  role: Role,
  toolMessageType?: 'tool_use' | 'tool_result'
): Anthropic.Beta.Tools.ToolsBetaMessageParam['role'] {
  switch (role) {
    case 'user':
      return 'user';
    case 'model':
      return 'assistant';
    case 'tool':
      return toolMessageType === 'tool_use' ? 'assistant' : 'user';
    default:
      throw new Error(`role ${role} doesn't map to an Anthropic role.`);
  }
}

interface Media {
  url: string;
  contentType?: string;
}

const isMediaObject = (obj: unknown): obj is Media =>
  typeof obj === 'object' &&
  obj !== null &&
  'url' in obj &&
  typeof obj.url === 'string';

const extractDataFromBase64Url = (
  url: string
): { data: string; contentType: string } | null => {
  const match = url.match(/^data:([^;]+);base64,(.+)$/);
  return (
    match && {
      contentType: match[1],
      data: match[2],
    }
  );
};

/**
 * Converts a Genkit message Part to the corresponding Anthropic TextBlockParam or ImageBlockParam.
 * @param part The Genkit Part to convert.
 * @returns The corresponding Anthropic TextBlockParam or ImageBlockParam.
 * @throws Error if the part contains unsupported fields.
 */
export function toAnthropicToolResponseContent(
  part: Part
): Anthropic.TextBlockParam | Anthropic.ImageBlockParam {
  const isMedia = isMediaObject(part.toolResponse?.output);
  const isString = typeof part.toolResponse?.output === 'string';
  if (!isMedia && !isString) {
    throw Error(
      `Invalid genkit part provided to toAnthropicToolResponseContent: ${part}.`
    );
  }
  const base64Data = extractDataFromBase64Url(
    isMedia
      ? (part.toolResponse?.output as Media).url
      : (part.toolResponse?.output as string)
  );
  // @ts-expect-error TODO: improve these types
  return base64Data
    ? {
        type: 'image',
        source: {
          type: 'base64',
          data: base64Data.data,
          media_type:
            (part.toolResponse?.output as Media)?.contentType ??
            base64Data.contentType,
        },
      }
    : {
        type: 'text',
        text: part.toolResponse?.output as string,
      };
}

/**
 * Converts a Genkit Part to the corresponding Anthropic TextBlock or ImageBlockParam.
 * @param part The Genkit Part to convert.
 * @returns The corresponding Anthropic TextBlock, ImageBlockParam, ToolUseBlockParam, or ToolResultBlockParam.
 * @throws Error if the part contains unsupported fields for the current message role.
 */
export function toAnthropicMessageContent(
  part: Part
):
  | Anthropic.TextBlock
  | Anthropic.ImageBlockParam
  | Anthropic.Beta.Tools.ToolUseBlockParam
  | Anthropic.Beta.Tools.ToolResultBlockParam {
  if (part.text) {
    return {
      type: 'text',
      text: part.text,
    };
  }
  if (part.media) {
    const { data, contentType } =
      extractDataFromBase64Url(part.media.url) || {};
    if (!data) {
      throw Error(
        `Invalid genkit part media provided to toAnthropicMessageContent: ${part.media}.`
      );
    }
    return {
      type: 'image',
      source: {
        type: 'base64',
        data,
        // @ts-expect-error TODO: improve these types
        media_type: part.media.contentType ?? contentType,
      },
    };
  }
  if (part.toolRequest) {
    return {
      type: 'tool_use',
      id: part.toolRequest.ref!,
      name: part.toolRequest.name,
      input: part.toolRequest.input,
    };
  }
  if (part.toolResponse) {
    return {
      type: 'tool_result',
      tool_use_id: part.toolResponse.ref!,
      content: [toAnthropicToolResponseContent(part)],
    };
  }
  throw Error(
    `Unsupported genkit part fields encountered for current message role: ${part}.`
  );
}

/**
 * Converts a Genkit MessageData array to an Anthropic system message and MessageParam array.
 * @param messages The Genkit MessageData array to convert.
 * @returns An object containing the optional Anthropic system message and the array of Anthropic MessageParam objects.
 */
export function toAnthropicMessages(messages: MessageData[]): {
  system?: string;
  messages: Anthropic.Beta.Tools.ToolsBetaMessageParam[];
} {
  const system =
    messages[0]?.role === 'system' ? messages[0].content?.[0]?.text : undefined;
  const messagesToIterate = system ? messages.slice(1) : messages;
  const anthropicMsgs: Anthropic.Beta.Tools.ToolsBetaMessageParam[] = [];
  for (const message of messagesToIterate) {
    const msg = new Message(message);
    const content = msg.content.map(toAnthropicMessageContent);
    const toolMessageType = content.find(
      (c) => c.type === 'tool_use' || c.type === 'tool_result'
    ) as
      | Anthropic.Beta.Tools.ToolUseBlockParam
      | Anthropic.Beta.Tools.ToolResultBlockParam;
    const role = toAnthropicRole(message.role, toolMessageType?.type);
    anthropicMsgs.push({
      role: role,
      content,
    });
  }
  return { system, messages: anthropicMsgs };
}

/**
 * Converts a Genkit ToolDefinition to an Anthropic Tool object.
 * @param tool The Genkit ToolDefinition to convert.
 * @returns The converted Anthropic Tool object.
 */
export function toAnthropicTool(
  tool: ToolDefinition
): Anthropic.Beta.Tools.Tool {
  return {
    name: tool.name,
    description: tool.description,
    input_schema:
      tool.inputSchema as Anthropic.Beta.Tools.Messages.Tool.InputSchema,
  };
}

const finishReasonMap: Record<
  NonNullable<Anthropic.Beta.Tools.ToolsBetaMessage['stop_reason']>,
  CandidateData['finishReason']
> = {
  end_turn: 'stop',
  max_tokens: 'length',
  stop_sequence: 'stop',
  tool_use: 'stop',
};

/**
 * Converts an Anthropic content block to a Genkit CandidateData object.
 * @param choice The Anthropic content block to convert.
 * @param index The index of the content block.
 * @param stopReason The reason the content block generation stopped.
 * @returns The converted Genkit CandidateData object.
 */
function fromAnthropicContentBlock(
  choice: Anthropic.Beta.Tools.Messages.ToolsBetaContentBlock,
  index: number,
  stopReason: Anthropic.Beta.Tools.Messages.ToolsBetaMessage['stop_reason']
): CandidateData {
  return {
    index,
    finishReason: (stopReason && finishReasonMap[stopReason]) || 'other',
    message:
      choice.type === 'text'
        ? {
            role: 'model',
            content: [{ text: choice.text }],
          }
        : {
            role: 'tool',
            content: [
              {
                toolRequest: {
                  ref: choice.id,
                  name: choice.name,
                  input: choice.input,
                },
              },
            ],
          },
  };
}

/**
 * Converts an Anthropic message stream event to a Genkit CandidateData object.
 * @param choice The Anthropic message stream event to convert.
 * @returns The converted Genkit CandidateData object if the event is a content block start or delta, otherwise undefined.
 */
function fromAnthropicContentBlockChunk(
  choice: Anthropic.Beta.Tools.Messages.ToolsBetaMessageStreamEvent
): CandidateData | undefined {
  if (
    choice.type !== 'content_block_start' &&
    choice.type !== 'content_block_delta'
  ) {
    return;
  }
  const choiceField =
    choice.type === 'content_block_start' ? 'content_block' : 'delta';
  return {
    index: choice.index,
    finishReason: 'unknown',
    message: {
      role: 'model',
      content: [
        choice[choiceField].type === 'text'
          ? {
              text: choice[choiceField].text,
            }
          : {
              toolRequest: {
                ref: choice[choiceField].id,
                name: choice[choiceField].name,
                input: choice[choiceField].input,
              },
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
  request: GenerateRequest<typeof AnthropicConfigSchema>,
  stream?: boolean
): Anthropic.Beta.Tools.Messages.MessageCreateParams {
  const model = SUPPORTED_CLAUDE_MODELS[modelName];
  if (!model) throw new Error(`Unsupported model: ${modelName}`);
  const { system, messages } = toAnthropicMessages(request.messages);
  const mappedModelName = request.config?.version || model.version || modelName;
  const body: Anthropic.Beta.Tools.MessageCreateParams = {
    system,
    messages,
    tools: request.tools?.map(toAnthropicTool),
    max_tokens: request.config?.maxOutputTokens ?? 4096,
    model: mappedModelName,
    top_k: request.config?.topK,
    top_p: request.config?.topP,
    temperature: request.config?.temperature,
    stop_sequences: request.config?.stopSequences,
    metadata: request.config?.metadata,
    tool_choice: request.config?.tool_choice,
    stream,
  };

  if (request.output?.format && request.output.format !== 'text') {
    throw new Error(
      `Only text output format is supported for Claude models currently`
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
export function claudeModel(
  name: string,
  client: Anthropic
): ModelAction<typeof AnthropicConfigSchema> {
  const modelId = `anthropic/${name}`;
  const model = SUPPORTED_CLAUDE_MODELS[name];
  if (!model) throw new Error(`Unsupported model: ${name}`);

  return defineModel(
    {
      name: modelId,
      ...model.info,
      configSchema: model.configSchema,
    },
    async (request, streamingCallback) => {
      let response: Anthropic.Beta.Tools.ToolsBetaMessage;
      const body = toAnthropicRequestBody(name, request, !!streamingCallback);
      if (streamingCallback) {
        const stream = client.beta.tools.messages.stream(body);
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
        response = (await client.beta.tools.messages.create(
          body
        )) as Anthropic.Beta.Tools.ToolsBetaMessage;
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
