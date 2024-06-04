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
  modelRef,
  Part,
  Role,
  ToolDefinition,
  ToolRequestPart,
} from '@genkit-ai/ai/model';
import Groq from 'groq-sdk';
import { ChatCompletionChunk } from 'groq-sdk/lib/chat_completions_ext.mjs';
import { ChatCompletionCreateParamsBase } from 'groq-sdk/resources/chat/completions.mjs';
import {
  ChatCompletion,
  CompletionCreateParams,
} from 'groq-sdk/resources/chat/index.mjs';

import z from 'zod';

export const GroqConfigSchema = GenerationCommonConfigSchema.extend({
  stream: z.boolean().optional(),
  frequencyPenalty: z.number().optional(),
  logitBias: z.record(z.number()).optional(),
  seed: z.number().int().optional(),
  topLogprobs: z.number().optional(),
  user: z.string().optional(),
  toolChoice: z.string().optional(),
  //   responseFormat: z
  //     .object({
  //       type: z.literal("json_object"),
  //     })
  //     .optional(),
});

// Worst at JSON mode
export const llama3x8b = modelRef({
  name: 'groq/llama-3-8b',
  info: {
    versions: ['llama3-8b-8192'],
    label: 'Llama 3 8B',
    supports: {
      multiturn: true,
      tools: false, // Could be true but not recommended
      media: false,
      systemRole: true,
      output: ['text', 'json'], // JSON mode does not support streaming or stop sequences
    },
  },
  configSchema: GroqConfigSchema,
  version: 'llama3-8b-8192',
});

// Worst at JSON mode
// Only model recommended for Tool Use
export const llama3x70b = modelRef({
  name: 'groq/llama-3-70b',
  info: {
    versions: ['llama3-70b-8192'],
    label: 'Llama 3 70B',
    supports: {
      multiturn: true,
      tools: true,
      media: false,
      systemRole: true,
      output: ['text', 'json'], // JSON mode does not support streaming or stop sequences
    },
  },
  configSchema: GroqConfigSchema,
  version: 'llama3-70b-8192',
});

// Best at JSON mode
export const mixtral8x7b = modelRef({
  name: 'groq/mixtral-8x7b-32768',
  info: {
    versions: ['mixtral-8x7b-32768'],
    label: 'Mixtral 8 7B',
    supports: {
      multiturn: true,
      tools: false,
      media: false,
      systemRole: true,
      output: ['text', 'json'], // JSON mode does not support streaming or stop sequences
    },
  },
  configSchema: GroqConfigSchema,
  version: 'mixtral-8x7b-32768',
});

// Runner up at JSON mode
export const gemma7b = modelRef({
  name: 'groq/gemma-7b-it',
  info: {
    versions: ['gemma-7b-it'],
    label: 'Gemma 7B IT',
    supports: {
      multiturn: true,
      tools: false,
      media: false,
      systemRole: true,
      output: ['text', 'json'], // JSON mode does not support streaming or stop sequences
    },
  },
  configSchema: GroqConfigSchema,
  version: 'gemma-7b-it',
});

export const SUPPORTED_GROQ_MODELS = {
  'llama-3-8b': llama3x8b,
  'llama-3-70b': llama3x70b,
  'mixtral-8-7b': mixtral8x7b,
  'gemma-7b': gemma7b,
};

/**
 * Converts a Genkit message role to a Groq role.
 *
 * @param role - The Genkit message role.
 * @returns The converted Groq role. Note - the Groq SDK does not declare an explicit type for this.
 * @throws {Error} If the role doesn't map to a Groq role.
 */
export function toGroqRole(role: Role): 'system' | 'user' | 'assistant' {
  switch (role) {
    case 'user':
      return 'user';
    case 'model':
    case 'tool':
      return 'assistant';
    case 'system':
      return 'system';
    default:
      throw new Error(`role ${role} doesn't map to a Groq role.`);
  }
}

/**
 * Converts a Genkit tool definition into a Groq tool format suitable for API consumption.
 *
 * @param tool - The tool definition containing the name, description, and input schema.
 * @returns A Groq tool object formatted for use in completion creation parameters.
 */
export function toGroqTool(tool: ToolDefinition): CompletionCreateParams.Tool {
  return {
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  };
}

/**
 * Transforms a Genkit part into a corresponding Groq part.
 *
 * @param part - The Genkit part to be transformed.
 * @returns The equivalent Groq part.
 */
export function toGroqTextAndMedia(part: Part): string {
  if (part.text) {
    return part.text;
  } else if (part.media) {
    console.warn(
      `Media cannot be used in Groq completions. Passing media as raw URL: ${part.media.url}`
    );
    return part.media.url;
  }
  throw new Error(
    `Unsupported part type. Only text and media (url) parts are supported.`
  );
}

/**
 * Transforms a Genkit message into a corresponding Groq message.
 *
 * @param messages - The Genkit messages to be transformed.
 * @returns The equivalent Groq messages.
 */
export function toGroqMessages(
  messages: MessageData[]
): CompletionCreateParams.Message[] {
  const groqMsgs: CompletionCreateParams.Message[] = [];
  for (const message of messages) {
    const msg = new Message(message);
    switch (msg.role) {
      case 'user':
        groqMsgs.push({
          role: toGroqRole(message.role),
          content: msg.content.map(toGroqTextAndMedia).join(''),
        });
        break;
      case 'system':
        groqMsgs.push({
          role: toGroqRole(message.role),
          content: msg.text(),
        });
        break;
      case 'model':
        const toolCalls: CompletionCreateParams.Message.ToolCall[] = msg.content
          .filter((part) => part.toolRequest)
          .map((part) => {
            if (!part.toolRequest) {
              throw Error(
                'Mapping genkit message to Groq tool call content part but message.toolRequest not provided.'
              );
            }
            return {
              id: part.toolRequest.ref || '',
              type: 'function',
              function: {
                name: part.toolRequest.name,
                arguments: JSON.stringify(part.toolRequest.input),
              },
            };
          });
        if (toolCalls?.length > 0) {
          groqMsgs.push({
            content: msg.text(),
            role: toGroqRole(message.role),
            tool_calls: toolCalls,
          });
        } else {
          groqMsgs.push({
            role: toGroqRole(message.role),
            content: msg.text(),
          });
        }
        break;
      case 'tool':
        const toolResponseParts = msg.toolResponseParts();
        toolResponseParts.map((part) => {
          groqMsgs.push({
            role: toGroqRole(message.role),
            tool_call_id: part.toolResponse.ref || '',
            content:
              typeof part.toolResponse.output === 'string'
                ? part.toolResponse.output
                : JSON.stringify(part.toolResponse.output),
          });
        });
        break;
      default:
        throw new Error('unrecognized role');
    }
  }
  return groqMsgs;
}

const FINISH_REASON_MAP: Record<
  NonNullable<
    | ChatCompletion.Choice['finish_reason']
    | ChatCompletionChunk.Choice['finish_reason']
  >,
  CandidateData['finishReason']
> = {
  stop: 'stop',
  length: 'length',
  tool_calls: 'stop',
  function_call: 'stop',
  content_filter: 'blocked',
};

/**
 * Transforms a Groq tool call into a Genkit tool request part.
 *
 * @param toolCall - The Groq tool call to be transformed.
 * @returns The equivalent Genkit tool request part.
 */
function fromGroqToolCall(
  toolCall:
    | ChatCompletion.Choice.Message.ToolCall
    | ChatCompletionChunk.Choice.Delta.ToolCall
) {
  if (!toolCall.function) {
    throw Error(
      `Unexpected Groq chunk choice. tool_calls was provided but one or more tool_calls is missing.`
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

/**
 * Transforms a Groq choice into a Genkit candidate.
 *
 * @param choice - The Groq choice to be transformed.
 * @param jsonMode - Whether the response is in JSON mode.
 * @returns The equivalent Genkit candidate.
 */
function fromGroqChoice(
  choice: ChatCompletion.Choice,
  jsonMode = false
): CandidateData {
  const toolRequestParts = choice.message.tool_calls?.map(fromGroqToolCall);

  return {
    index: choice.index,
    finishReason: FINISH_REASON_MAP[choice.finish_reason] || 'unknown',
    message: {
      role: 'model',
      content: toolRequestParts
        ? (toolRequestParts as ToolRequestPart[])
        : [
            jsonMode
              ? { data: JSON.parse(choice.message.content) }
              : { text: choice.message.content },
          ],
    },
    custom: {},
  };
}

/**
 * Transforms a Groq chunk choice into a Genkit candidate.
 *
 * @param choice - The Groq chunk choice to be transformed.
 * @returns The equivalent Genkit candidate.
 */
function fromGroqChunkChoice(
  choice: ChatCompletionChunk.Choice
  // jsonMode = false // JSON mode does not support streaming or stop sequences
): CandidateData {
  const toolRequestParts = choice.delta.tool_calls?.map(fromGroqToolCall);
  return {
    index: 0,
    finishReason:
      choice.finish_reason && choice.finish_reason != null
        ? FINISH_REASON_MAP[choice.finish_reason]
        : 'unknown',
    message: {
      role: 'model',
      content: toolRequestParts
        ? (toolRequestParts as ToolRequestPart[])
        : [{ text: choice.delta.content! }],
    },
    custom: {},
  };
}

/**
 * Transforms a Genkit request into a corresponding Groq request.
 *
 * @param modelName - The name of the model to be transformed.
 * @param request - The Genkit request to be transformed.
 * @returns The equivalent Groq request.
 */
export function toGroqRequestBody(
  modelName: string,
  request: GenerateRequest
): ChatCompletionCreateParamsBase {
  const mapToSnakeCase = <T extends Record<string, any>>(
    obj: T
  ): Record<string, any> => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const snakeCaseKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
      );
      acc[snakeCaseKey] = value;
      return acc;
    }, {});
  };
  const model = SUPPORTED_GROQ_MODELS[modelName];
  if (!model) throw new Error(`Unsupported model: ${modelName}`);

  const body: ChatCompletionCreateParamsBase = {
    messages: toGroqMessages(request.messages),
    tools: request.tools?.map(toGroqTool),
    model: request.config?.version || model.version || modelName,
    temperature: request.config?.temperature,
    max_tokens: request.config?.maxOutputTokens,
    top_p: request.config?.topP,
    stop: request.config?.stopSequences,
    n: request.candidates,
    stream: request.config?.stream,
    frequency_penalty: request.config?.frequencyPenalty,
    logit_bias: request.config?.logitBias,
    seed: request.config?.seed,
    top_logprobs: request.config?.topLogprobs,
    user: request.config?.user,
    tool_choice: request.config?.toolChoice,
    // response_format: request.config?.responseFormat, // Being set automatically
  };

  const response_format = request.output?.format || 'text';
  if (
    response_format === 'json' &&
    model.info.supports?.output?.includes('json')
  ) {
    body.response_format = {
      type: 'json_object',
    };
  } else if (
    response_format === 'text' &&
    model.info.supports?.output?.includes('text')
  ) {
    body.response_format = {
      type: 'text',
    };
  } else {
    throw new Error(
      `${response_format} format is not supported for ${modelName} currently`
    );
  }

  for (const key in body) {
    if (!body[key] || (Array.isArray(body[key]) && !body[key].length))
      delete body[key];
  }
  return body;
}

/**
 * Defines a Groq model.
 *
 * @param name - The name of the model.
 * @param client - The Groq client.
 * @returns The model.
 */
export function groqModel(name: string, client: Groq) {
  const model = SUPPORTED_GROQ_MODELS[name];
  if (!model) throw new Error(`Unsupported model: ${name}`);
  const modelId = `groq/${name}`;

  return defineModel(
    {
      name: modelId,
      ...model.info,
      configSchema: model.configSchema,
    },
    async (request, streamingCallback) => {
      let response: ChatCompletion;
      const body = toGroqRequestBody(name, request);
      if (streamingCallback) {
        if (request.output?.format === 'json') {
          throw new Error(
            'JSON format is not supported for streaming responses.'
          );
        }
        const stream = await client.chat.completions.create({
          ...body,
          stream: true,
        });
        let fullContent: string = '';
        let totalPromptTokens = 0;
        let totalCompletionTokens = 0;
        let choices: ChatCompletion.Choice[] = [];
        let completionMetadata: {
          model: string;
          id: string;
          created: number;
          system_fingerprint?: string;
          object: string;
        } = {} as any;
        for await (const chunk of stream) {
          totalPromptTokens += chunk.x_groq?.usage?.prompt_tokens || 0;
          totalCompletionTokens += chunk.x_groq?.usage?.completion_tokens || 0;
          if (!completionMetadata.model) {
            completionMetadata.model = chunk.model;
            completionMetadata.id = chunk.id;
            completionMetadata.created = chunk.created;
            completionMetadata.system_fingerprint = chunk.system_fingerprint;
            completionMetadata.object = chunk.object;
          }
          chunk.choices.forEach((choice) => {
            choices.push({
              index: choice.index,
              logprobs: choice.logprobs as ChatCompletion.Choice.Logprobs,
              message: {
                content: choice.delta.content || '',
                role: 'model',
                tool_calls: choice.delta.tool_calls,
              },
              finish_reason: choice.finish_reason || 'unknown',
            });
            const c = fromGroqChunkChoice(choice);
            streamingCallback({
              index: c.index,
              content: c.message.content,
            });
            fullContent += choice.delta.content || '';
          });
        }
        response = {
          ...completionMetadata,
          choices: choices,
          usage: {
            prompt_tokens: totalPromptTokens,
            completion_tokens: totalCompletionTokens,
            total_tokens: totalPromptTokens + totalCompletionTokens,
          },
        };
        // TODO: find a way to get the final completion (current approach is a bit hacky) - issue here: https://github.com/groq/groq-typescript/issues/29
        // response = await stream.finalChatCompletion();
      } else {
        response = (await client.chat.completions.create(
          body
        )) as ChatCompletion;
      }

      return {
        candidates: response.choices.map((c) => {
          return fromGroqChoice(c, request.output?.format === 'json');
        }),
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
