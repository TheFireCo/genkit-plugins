import { Message } from '@genkit-ai/ai';
import {
  defineModel,
  modelRef,
  type CandidateData,
  type GenerateRequest,
  type MessageData,
  type Part,
  type Role,
  type ToolDefinition,
  type ToolRequestPart,
} from '@genkit-ai/ai/model';
import OpenAI from 'openai';
import {
  type ChatCompletion,
  type ChatCompletionChunk,
  type ChatCompletionContentPart,
  type ChatCompletionCreateParamsNonStreaming,
  type ChatCompletionMessageParam,
  type ChatCompletionMessageToolCall,
  type ChatCompletionRole,
  type ChatCompletionTool,
  type CompletionChoice,
} from 'openai/resources/index.mjs';
import z from 'zod';

const API_NAME_MAP = {
  'gpt-4-turbo': 'gpt-4-turbo-preview',
  'gpt-4-vision': 'gpt-4-vision-preview',
};

const MODELS_SUPPORTING_OPENAI_RESPONSE_FORMAT = [
  'gpt-4-turbo-preview',
  'gpt-4-1106-preview',
  'gpt-3.5-turbo-0125',
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-1106',
];

export const OpenAiConfigSchema = z.object({
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  logitBias: z.record(z.string(), z.number().min(-100).max(100)).optional(),
  logProbs: z.boolean().optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  seed: z.number().int().optional(),
  topLogProbs: z.number().int().min(0).max(20).optional(),
  user: z.string().optional(),
});

export const gpt4Turbo = modelRef({
  name: 'openai/gpt-4-turbo',
  info: {
    versions: [
      'gpt-4-turbo-preview',
      'gpt-4-0125-preview',
      'gpt-4-1106-prevew',
    ],
    label: 'OpenAI - GPT-4 Turbo',
    supports: {
      multiturn: true,
      tools: true,
      media: false,
      output: ['text', 'json'],
    },
  },
  configSchema: OpenAiConfigSchema,
});

export const gpt4Vision = modelRef({
  name: 'openai/gpt-4-vision',
  info: {
    versions: ['gpt-4-vision-preview', 'gpt-4-1106-vision-preview'],
    label: 'OpenAI - GPT-4 Vision',
    supports: {
      multiturn: true,
      tools: false,
      media: true,
      output: ['text'],
    },
  },
  configSchema: OpenAiConfigSchema,
});

export const gpt4 = modelRef({
  name: 'openai/gpt-4',
  info: {
    versions: ['gpt-4', 'gpt-4-0613', 'gpt-4-32k', 'gpt-4-32k-0613'],
    label: 'OpenAI - GPT-4',
    supports: {
      multiturn: true,
      tools: true,
      media: false,
      output: ['text'],
    },
  },
  configSchema: OpenAiConfigSchema,
});

export const gpt35Turbo = modelRef({
  name: 'openai/gpt-3.5-turbo',
  info: {
    versions: ['gpt-3.5-turbo-0125', 'gpt-3.5-turbo', 'gpt-3.5-turbo-1106'],
    label: 'OpenAI - GPT-3.5 Turbo',
    supports: {
      multiturn: true,
      tools: true,
      media: false,
      output: ['json', 'text'],
    },
  },
  configSchema: OpenAiConfigSchema,
});

export const SUPPORTED_GPT_MODELS = {
  'gpt-4-turbo': gpt4Turbo,
  'gpt-4-vision': gpt4Vision,
  'gpt-4': gpt4,
  'gpt-3.5-turbo': gpt35Turbo,
};

function toOpenAIRole(role: Role): ChatCompletionRole {
  switch (role) {
    case 'user':
      return 'user';
    case 'model':
      return 'assistant';
    case 'system':
      return 'system';
    case 'tool':
      return 'tool';
    default:
      throw new Error(`role ${role} doesn't map to an OpenAI role.`);
  }
}

function toOpenAiTool(tool: ToolDefinition): ChatCompletionTool {
  return {
    type: 'function',
    function: {
      name: tool.name,
      parameters: tool.inputSchema,
    },
  };
}

export function toOpenAiTextAndMedia(part: Part): ChatCompletionContentPart {
  if (part.text) {
    return {
      type: 'text',
      text: part.text,
    };
  } else if (part.media) {
    return {
      type: 'image_url',
      image_url: {
        url: part.media.url,
      },
    };
  }
  throw Error(
    `Unsupported genkit part fields encountered for current message role: ${part}.`,
  );
}

export function toOpenAiMessages(
  messages: MessageData[],
): ChatCompletionMessageParam[] {
  const openAiMsgs: ChatCompletionMessageParam[] = [];
  for (const message of messages) {
    const msg = new Message(message);
    const role = toOpenAIRole(message.role);
    switch (role) {
      case 'user':
        openAiMsgs.push({
          role: role,
          content: msg.content.map(toOpenAiTextAndMedia),
        });
        break;
      case 'system':
        openAiMsgs.push({
          role: role,
          content: msg.text(),
        });
        break;
      case 'assistant':
        const toolCalls: ChatCompletionMessageToolCall[] = msg.content
          .filter(part => part.toolRequest)
          .map(part => {
            if (!part.toolRequest) {
              throw Error(
                'Mapping genkit message to openai tool call content part but message.toolRequest not provided.',
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
          openAiMsgs.push({
            role: role,
            tool_calls: toolCalls,
          });
        } else {
          openAiMsgs.push({
            role: role,
            content: msg.text(),
          });
        }
        break;
      case 'tool':
        const toolResponseParts = msg.toolResponseParts();
        toolResponseParts.map(part => {
          openAiMsgs.push({
            role: role,
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
  return openAiMsgs;
}

const finishReasonMap: Record<
  // OpenAI Node SDK doesn't support tool_call in the enum, but it is returned from the API
  CompletionChoice['finish_reason'] | 'tool_calls',
  CandidateData['finishReason']
> = {
  length: 'length',
  stop: 'stop',
  tool_calls: 'stop',
  content_filter: 'blocked',
};

function fromOpenAiToolCall(
  toolCall:
    | ChatCompletionMessageToolCall
    | ChatCompletionChunk.Choice.Delta.ToolCall,
) {
  if (!toolCall.function) {
    throw Error(
      `Unexpected openAI chunk choice. tool_calls was provided but one or more tool_calls is missing.`,
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

function fromOpenAiChoice(
  choice: ChatCompletion['choices'][0],
  jsonMode = false,
): CandidateData {
  const toolRequestParts = choice.message.tool_calls?.map(fromOpenAiToolCall);
  return {
    index: choice.index,
    finishReason: finishReasonMap[choice.finish_reason] || 'other',
    message: {
      role: 'model',
      content: toolRequestParts
        ? // Note: Not sure why I have to cast here exactly.
          // Otherwise it thinks toolRequest must be 'undefined' if provided
          (toolRequestParts as ToolRequestPart[])
        : [
            jsonMode
              ? { data: JSON.parse(choice.message.content!) }
              : { text: choice.message.content! },
          ],
    },
    custom: {},
  };
}

function fromOpenAiChunkChoice(
  choice: ChatCompletionChunk['choices'][0],
  jsonMode = false,
): CandidateData {
  const toolRequestParts = choice.delta.tool_calls?.map(fromOpenAiToolCall);
  return {
    index: choice.index,
    finishReason: choice.finish_reason
      ? finishReasonMap[choice.finish_reason] || 'other'
      : 'unknown',
    message: {
      role: 'model',
      content: toolRequestParts
        ? // Note: Not sure why I have to cast here exactly.
          // Otherwise it thinks toolRequest must be 'undefined' if provided
          (toolRequestParts as ToolRequestPart[])
        : [
            jsonMode
              ? { data: JSON.parse(choice.delta.content!) }
              : { text: choice.delta.content! },
          ],
    },
    custom: {},
  };
}

export function toOpenAiRequestBody(
  modelName: string,
  request: GenerateRequest,
) {
  const mapToSnakeCase = <T extends Record<string, any>>(
    obj: T,
  ): Record<string, any> => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const snakeCaseKey = key.replace(
        /[A-Z]/g,
        letter => `_${letter.toLowerCase()}`,
      );
      acc[snakeCaseKey] = value;
      return acc;
    }, {});
  };
  const model = SUPPORTED_GPT_MODELS[modelName];
  if (!model) throw new Error(`Unsupported model: ${modelName}`);
  const openAiMessages = toOpenAiMessages(request.messages);
  const mappedModelName =
    request.config?.version || API_NAME_MAP[modelName] || modelName;
  const body = {
    messages: openAiMessages,
    tools: request.tools?.map(toOpenAiTool),
    model: mappedModelName,
    max_tokens: request.config?.maxOutputTokens,
    temperature: request.config?.temperature,
    top_p: request.config?.topP,
    n: request.candidates,
    stop: request.config?.stopSequences,
    ...mapToSnakeCase(request.config?.custom || {}),
  } as ChatCompletionCreateParamsNonStreaming;

  const response_format = request.output?.format;
  if (
    response_format &&
    MODELS_SUPPORTING_OPENAI_RESPONSE_FORMAT.includes(mappedModelName)
  ) {
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
        `${response_format} format is not supported for GPT models currently`,
      );
    }
  }
  for (const key in body) {
    if (!body[key] || (Array.isArray(body[key]) && !body[key].length))
      delete body[key];
  }
  return body;
}

/**
 *
 */
export function gptModel(name: string, client: OpenAI) {
  const modelId = `openai/${name}`;
  const model = SUPPORTED_GPT_MODELS[name];
  if (!model) throw new Error(`Unsupported model: ${name}`);

  return defineModel(
    {
      name: modelId,
      ...model.info,
      configSchema: SUPPORTED_GPT_MODELS[name].configSchema,
    },
    async (request, streamingCallback) => {
      let response;
      const body = toOpenAiRequestBody(name, request);
      if (streamingCallback) {
        const stream = await client.beta.chat.completions.stream({
          ...body,
          stream: true,
        });
        for await (const chunk of stream) {
          chunk.choices?.forEach(chunk => {
            const c = fromOpenAiChunkChoice(chunk);
            streamingCallback({
              index: c.index,
              content: c.message.content,
            });
          });
        }
        response = await stream.finalChatCompletion();
      } else {
        response = await client.chat.completions.create(body);
      }
      return {
        candidates: response.choices.map(c =>
          fromOpenAiChoice(c, request.output?.format === 'json'),
        ),
        usage: {
          inputTokens: response.usage?.prompt_tokens,
          outputTokens: response.usage?.completion_tokens,
          totalTokens: response.usage?.total_tokens,
        },
        custom: response,
      };
    },
  );
}
