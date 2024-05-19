import { Message } from '@genkit-ai/ai';
import {
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

const API_NAME_MAP: Record<string, string> = {
  'claude-3-opus': 'claude-3-opus-20240229',
  'claude-3-sonnet': 'claude-3-sonnet-20240229',
  'claude-3-haiku': 'claude-3-haiku-20240307',
};

const AnthropicConfigSchema = z.object({
  tool_choice: z.union([
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
  ]),
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
});

export const SUPPORTED_CLAUDE_MODELS: Record<
  string,
  ModelReference<typeof AnthropicConfigSchema>
> = {
  'claude-3-opus': claude3Opus,
  'claude-3-sonnet': claude3Sonnet,
  'claude-3-haiku': claude3Haiku,
};

function toAnthropicRole(
  role: Role,
  toolMessageType?: 'tool_use' | 'tool_result',
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

export function toAnthropicMessageContent(
  part: Part,
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
    return {
      type: 'image',
      source: {
        type: 'base64',
        data: part.media.url.slice(part.media.url.indexOf(',') + 1),
        // @ts-expect-error
        media_type:
          part.media.contentType ??
          part.media.url.slice('data:'.length, part.media.url.indexOf(';')),
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
      content: [
        {
          type: 'text',
          text: part.toolResponse.output as string,
        },
      ],
    };
  }
  throw Error(
    `Unsupported genkit part fields encountered for current message role: ${part}.`,
  );
}

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
      c => c.type === 'tool_use' || c.type === 'tool_result',
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

export function toAnthropicTool(
  tool: ToolDefinition,
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

function fromAnthropicContentBlock(
  choice: Anthropic.Beta.Tools.Messages.ToolsBetaContentBlock,
  index: number,
  stopReason: Anthropic.Beta.Tools.Messages.ToolsBetaMessage['stop_reason'],
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

function fromAnthropicContentBlockChunk(
  choice: Anthropic.Beta.Tools.Messages.ToolsBetaMessageStreamEvent,
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

export function toAnthropicRequestBody(
  modelName: string,
  request: GenerateRequest,
  stream?: boolean,
): Anthropic.Beta.Tools.Messages.MessageCreateParams {
  const model = SUPPORTED_CLAUDE_MODELS[modelName];
  if (!model) throw new Error(`Unsupported model: ${modelName}`);
  const { system, messages } = toAnthropicMessages(request.messages);
  const mappedModelName = API_NAME_MAP[modelName] || modelName;
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
    stream,
    ...(request.config?.custom || {}),
  };

  if (request.output?.format && request.output.format !== 'text') {
    throw new Error(
      `Only text output format is supported for Claude models currently`,
    );
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
export function claudeModel(name: string, client: Anthropic) {
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
          body,
        )) as Anthropic.Beta.Tools.ToolsBetaMessage;
      }
      return {
        candidates: response.content.map((content, index) =>
          fromAnthropicContentBlock(content, index, response.stop_reason),
        ),
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        custom: response,
      };
    },
  );
}
