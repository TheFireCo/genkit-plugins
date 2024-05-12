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

import { Message } from "@genkit-ai/ai";
import {
  CandidateData,
  defineModel,
  GenerateRequest,
  MessageData,
  modelRef,
  Part,
  Role,
  TextPart,
  ToolDefinition,
  ToolRequestPart,
} from "@genkit-ai/ai/model";
import Groq from "groq-sdk";
import { ChatCompletionChunk } from "groq-sdk/lib/chat_completions_ext.mjs";
import { ChatCompletionCreateParamsBase } from "groq-sdk/resources/chat/completions.mjs";
import {
  ChatCompletion,
  CompletionCreateParams,
} from "groq-sdk/resources/chat/index.mjs";

import z from "zod";

export const GroqConfigSchema = z.object({
  temperature: z.number().min(0).max(1).optional(),
  maxTokens: z.number().int().min(1).max(2048).optional(),
  topP: z.number().min(0).max(1).optional(),
  stop: z.string().optional(),
  stream: z.boolean().optional(),
  responseFormat: z
    .object({
      type: z.literal("json_object"),
    })
    .optional(),
});

// Worst at JSON mode
export const llama_3_8b = modelRef({
  name: "groq/llama-3-8b",
  info: {
    versions: ["llama3-8b-8192"],
    label: "Llama 3 8B",
    supports: {
      multiturn: true,
      tools: false,
      media: false,
      output: ["text", "json"], // JSON mode does not support streaming or stop sequences
    },
  },
  configSchema: GroqConfigSchema,
});

// Worst at JSON mode
// Only model recommended for Tool Use
export const llama_3_70b = modelRef({
  name: "groq/llama-3-70b",
  info: {
    versions: ["llama3-70b-8192"],
    label: "Llama 3 70B",
    supports: {
      multiturn: true,
      tools: false,
      media: false,
      output: ["text", "json"], // JSON mode does not support streaming or stop sequences
    },
  },
  configSchema: GroqConfigSchema,
});

// Best at JSON mode
export const mixtral_8_7b = modelRef({
  name: "groq/mixtral-8x7b-32768",
  info: {
    versions: ["mixtral-8x7b-32768"],
    label: "Mixtral 8 7B",
    supports: {
      multiturn: true,
      tools: false,
      media: false,
      output: ["text", "json"], // JSON mode does not support streaming or stop sequences
    },
  },
  configSchema: GroqConfigSchema,
});

// Runner up at JSON mode
export const gemma_7b = modelRef({
  name: "groq/gemma-7b-it",
  info: {
    versions: ["gemma-7b-it"],
    label: "Gemma 7B IT",
    supports: {
      multiturn: true,
      tools: false,
      media: false,
      output: ["text", "json"], // JSON mode does not support streaming or stop sequences
    },
  },
  configSchema: GroqConfigSchema,
});

export const SUPPORTED_GROQ_MODELS = {
  "llama-3-8b": llama_3_8b,
  "llama-3-70b": llama_3_70b,
  "mixtral-8-7b": mixtral_8_7b,
  "gemma-7b": gemma_7b,
};

/**
 * Converts a Genkit message role to a Groq role.
 *
 * @param role - The Genkit message role.
 * @returns The converted Groq role. Note - the Groq SDK does not declare an explicit type for this.
 * @throws {Error} If the role doesn't map to a Groq role.
 */
function toGroqRole(role: Role): "system" | "user" | "assistant" {
  switch (role) {
    case "user":
      return "user";
    case "model":
      return "assistant";
    case "system":
      return "system";
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
function toGroqTool(tool: ToolDefinition): CompletionCreateParams.Tool {
  return {
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  };
}

function toGroqMessages(
  messages: MessageData[]
): CompletionCreateParams.Message[] {
  const groqMsgs: CompletionCreateParams.Message[] = [];
  for (const message of messages) {
    const msg = new Message(message);
    switch (msg.role) {
      case "user":
        groqMsgs.push({
          role: toGroqRole(message.role),
          content: msg.text(),
        });
        break;
      case "system":
        groqMsgs.push({
          role: toGroqRole(message.role),
          content: msg.text(),
        });
        break;
      case "model":
      // TODO: tool use
    }
    groqMsgs.push({
      role: toGroqRole(message.role),
      content: new Message(message).text(),
    });
  }
  return groqMsgs;
}

const FINISH_REASON_MAP: Record<
  NonNullable<
    | ChatCompletion.Choice["finish_reason"]
    | ChatCompletionChunk.Choice["finish_reason"]
  >,
  CandidateData["finishReason"]
> = {
  stop: "stop",
  length: "length",
  tool_calls: "stop",
  function_call: "stop",
  content_filter: "blocked",
};

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

function fromGroqChoice(
  choice: ChatCompletion.Choice,
  jsonMode = false
): CandidateData {
  const toolRequestParts = choice.message.tool_calls?.map(fromGroqToolCall);

  return {
    index: choice.index,
    finishReason: FINISH_REASON_MAP[choice.finish_reason] || "unknown",
    message: {
      role: "model",
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
        : "unknown",
    message: {
      role: "model",
      content: toolRequestParts
        ? (toolRequestParts as ToolRequestPart[])
        : [{ text: choice.delta.content! }],
    },
    custom: {},
  };
}

function toGroqRequestBody(
  modelName: string,
  request: GenerateRequest
): ChatCompletionCreateParamsBase {
  const model = groqModel;
  if (!model) throw new Error(`Unsupported model: ${modelName}`);

  const body: ChatCompletionCreateParamsBase = {
    messages: toGroqMessages(request.messages),
    model: request.config?.version || modelName,
    temperature: request.config?.temperature,
    max_tokens: request.config?.maxTokens,
    top_p: request.config?.topP,
    stop: request.config?.stopSequences,
    stream: request.config?.stream,
  };

  const response_format = request.output?.format;
  if (
    response_format === "json" &&
    model.info.supports?.output?.includes("json")
  ) {
    body.response_format = {
      type: "json_object",
    };
  }

  return body;
}

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
        if (request.output?.format === "json") {
          throw new Error(
            "JSON format is not supported for streaming responses."
          );
        }
        const stream = await client.chat.completions.create({
          ...body,
          stream: true,
        });
        let fullContent: string = "";
        let totalPromptTokens = 0;
        let totalCompletionTokens = 0;
        let choices: ChatCompletion.Choice[] = [];
        let model: string;
        let id: string;
        let created: number;
        let system_fingerprint: string;
        let object: string;
        let chunkIdx: number = 0;
        for await (const chunk of stream) {
          totalPromptTokens += chunk.x_groq?.usage?.prompt_tokens || 0;
          totalCompletionTokens += chunk.x_groq?.usage?.completion_tokens || 0;
          if (chunkIdx === 0) {
            model = chunk.model || "";
            id = chunk.id || "";
            created = chunk.created || 0;
            system_fingerprint = chunk.system_fingerprint || "";
            object = chunk.object || "";
            chunkIdx++;
          }
          chunk.choices.forEach((choice) => {
            choices.push({
                index: choice.index,
                logprobs: choice.logprobs as ChatCompletion.Choice.Logprobs, 
                message: {
                    content: choice.delta.content || "",
                    role: "model",
                    tool_calls: choice.delta.tool_calls,
                },
                finish_reason: choice.finish_reason || "unknown",
            });
            const c = fromGroqChunkChoice(choice);
            streamingCallback({
              index: c.index,
              content: c.message.content,
            });
            fullContent += choice.delta.content || "";
            
          });
        }
        response = {
            id: id,
            created: created,
            system_fingerprint: system_fingerprint,
            model: model,
            object: object,
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
          return fromGroqChoice(c, request.output?.format === "json");
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
