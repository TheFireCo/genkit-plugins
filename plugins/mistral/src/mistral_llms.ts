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
  GenerationCommonConfigSchema,
  MessageData,
  ModelAction,
  modelRef,
  Part,
  Role,
  ToolDefinition,
  ToolRequestPart,
} from '@genkit-ai/ai/model';
import type {
  Tool,
  Function,
  ChatCompletionResponseChoice,
  ChatCompletionResponseChunk,
  ToolCalls,
  ChatRequest,
  ChatCompletionResponse,
} from '@mistralai/mistralai';

import z from 'zod';

export const openMistral7B = modelRef({
  name: 'mistral/open-mistral-7b',
  info: {
    versions: ['mistral-tiny-2312'],
    label: 'Mistral - Mistral 7B',
    supports: {
      multiturn: true,
      tools: false,
      media: false,
      systemRole: true,
      output: ['text', 'json'],
    },
  },
  configSchema: GenerationCommonConfigSchema,
});

export const openMistral8x7B = modelRef({
  name: 'mistral/open-mixtral-8x7b',
  info: {
    versions: ['mistral-small-2312'],
    label: 'Mistral - Mistral 8x7B',
    supports: {
      multiturn: true,
      tools: false,
      media: false,
      systemRole: true,
      output: ['text', 'json'],
    },
  },
});

export const openMixtral8x22B = modelRef({
  name: 'mistral/open-mixtral-8x22b',
  info: {
    versions: ['open-mixtral-8x22b-2404'],
    label: 'Mistral - Mistral 8x22B',
    supports: {
      multiturn: true,
      tools: true,
      media: false,
      systemRole: true,
      output: ['text', 'json'],
    },
  },
});

export const openMistralSmall = modelRef({
  name: 'mistral/mistral-small-latest',
  info: {
    versions: ['mistral-small-2402'],
    label: 'Mistral - Mistral Small',
    supports: {
      multiturn: true,
      tools: false,
      media: false,
      systemRole: true,
      output: ['text', 'json'],
    },
  },
  configSchema: GenerationCommonConfigSchema,
});

export const openMistralMedium = modelRef({
  name: 'mistral/mistral-medium-latest',
  info: {
    versions: ['istral-medium-231'],
    label: 'Mistral - Mistral Medium',
    supports: {
      multiturn: true,
      tools: false,
      media: false,
      systemRole: true,
      output: ['text', 'json'],
    },
  },
  configSchema: GenerationCommonConfigSchema,
});

export const openMistralLarge = modelRef({
  name: 'mistral/mistral-large-latest',
  info: {
    versions: ['mistral-large-2402'],
    label: 'Mistral - Mistral Large',
    supports: {
      multiturn: true,
      tools: false,
      media: false,
      systemRole: true,
      output: ['text', 'json'],
    },
  },
  configSchema: GenerationCommonConfigSchema,
});

function toMistralRole(role: Role): string {
  switch (role) {
    case 'user':
      return 'user';
    case 'model':
      return 'assistant';
    case 'system':
      return 'system';
    case 'tool':
      return 'assistant';
    default:
      throw new Error(`role ${role} doesn't map to an Mistral role.`);
  }
}

function toMistralTool(tool: ToolDefinition): Tool {
  return {
    type: 'function',
    function: {
      name: tool.name,
      parameters: tool.inputSchema,
      description: tool.description,
    } as Function,
  };
}

export function toMistralMessages(
  messages: MessageData[]
): ChatRequest['messages'] {
  const mistralMsgs: ChatRequest['messages'] = [];
  for (const message of messages) {
    const msg = new Message(message);
    const role = toMistralRole(message.role);

    // In Mistral the Message comprises only role and content no need to differentiate between tool and message
    mistralMsgs.push({
      role: role,
      content: msg.text(),
    });
  }
  return mistralMsgs;
}

const finishReasonMap: Record<
  NonNullable<string>,
  CandidateData['finishReason']
> = {
  length: 'length',
  stop: 'stop',
  tool_calls: 'stop',
  content_filter: 'blocked',
};

export const SUPPORTED_MISTRAL_MODELS = {
  'open-mistral-7b': openMistral7B,
  'open-mixtral-8x7b': openMistral8x7B,
  'open-mixtral-8x22b': openMixtral8x22B,
  'mistral-small': openMistralSmall,
  'mistral-medium': openMistralMedium,
  'mistral-large': openMistralLarge,
};

function fromMistralToolCall(toolCall: ToolCalls) {
  if (!toolCall.function) {
    throw Error(
      `Unexpected mistral chunk choice. tool_calls was provided but one or more tool_calls is missing.`
    );
  }
  const f = toolCall.function;
  return {
    toolRequest: {
      name: f.name,
      ref: toolCall.id,
      input: f.arguments ? JSON.parse(f.arguments) : f.arguments,
    },
  };
}

function fromMistralChoice(
  choice: ChatCompletionResponseChoice
): CandidateData {
  const toolRequestParts = choice.message.tool_calls?.map(fromMistralToolCall);
  return {
    index: choice.index,
    finishReason: finishReasonMap[choice.finish_reason] || 'other',
    message: {
      role: 'model',
      content: toolRequestParts
        ? // Note: Not sure why I have to cast here exactly.
          // Otherwise it thinks toolRequest must be 'undefined' if provided
          (toolRequestParts as ToolRequestPart[])
        : [{ text: choice.message.content! }],
    },
    custom: {},
  };
}

function fromMistralChunkChoice(
  choice: ChatCompletionResponseChunk['choices'][0]
): CandidateData {
  return {
    index: choice.index,
    finishReason: choice.finish_reason
      ? finishReasonMap[choice.finish_reason] || 'other'
      : 'unknown',
    message: {
      role: 'model',
      content: [{ text: choice.delta.content! }],
    },
    custom: {},
  };
}

export function toMistralRequestBody(
  modelName: string,
  request: GenerateRequest<typeof GenerationCommonConfigSchema>
) {
  const model = SUPPORTED_MISTRAL_MODELS[modelName];
  if (!model) throw new Error(`Unsupported model: ${modelName}`);
  const mistralMessages = toMistralMessages(request.messages);
  const mappedModelName = request.config?.version || model.version || modelName;

  let responseFormat;
  if (request.output?.format !== 'json') {
    responseFormat = { type: 'json_object' };
  } else {
    responseFormat = null;
  }
  const body = {
    messages: mistralMessages,
    tools: request.tools?.map(toMistralTool),
    model: mappedModelName,
    max_tokens: request.config?.maxOutputTokens,
    temperature: request.config?.temperature,
    top_p: request.config?.topP,
    n: request.candidates,
    stop_sequences: request.config?.stopSequences,
    responseFormat: responseFormat,
  } as ChatRequest;

  for (const key in body) {
    if (!body[key] || (Array.isArray(body[key]) && !body[key].length))
      delete body[key];
  }
  return body;
}

export function mistralModel(
  name: string,
  client: any
): ModelAction<typeof GenerationCommonConfigSchema> {
  //Ugly any type, should be MistralClient but cannot import it here
  const modelId = `mistral/${name}`;
  const model = SUPPORTED_MISTRAL_MODELS[name];
  if (!model) throw new Error(`Unsupported model: ${name}`);

  return defineModel(
    {
      name: modelId,
      ...model.info,
      configSchema: SUPPORTED_MISTRAL_MODELS[name].configSchema,
    },
    async (request, streamingCallback) => {
      let response: ChatCompletionResponse | ChatCompletionResponseChunk;
      const body = toMistralRequestBody(name, request);
      if (streamingCallback) {
        const stream = await client.chatStream(body);
        for await (const chunk of stream) {
          chunk.choices?.forEach((chunk) => {
            const c = fromMistralChunkChoice(chunk);
            streamingCallback({
              index: c.index,
              content: c.message.content,
            });
          });
        }

        response = await client.chat(body);
      } else {
        response = await client.chat(body);
      }
      return {
        candidates: response.choices.map((c) => fromMistralChoice(c)),
        usage: {
          inputTokens: response.usage?.prompt_tokens,
          outputTokens: response.usage?.completion_tokens,
          totalTokens: response.usage?.total_tokens,
        },
        custom: response,
      };
    }
  );
}
