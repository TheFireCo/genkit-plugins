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

// Import necessary types and modules for AI and configuration functionality.
// `genkit` provides structures and methods to work with AI model messages and configurations,
// while `groq-sdk` enables interaction with the Groq chat API.
import {
  Message,
  Genkit,
  z,
  GenerateRequest,
  Part,
  Role,
  MessageData,
} from 'genkit';
import Groq from 'groq-sdk';
import {
  ChatCompletion,
  CompletionCreateParams,
} from 'groq-sdk/resources/chat/index.mjs';

// Define the configuration schema for Groq-based models with additional options specific to Groq's capabilities.
export const GroqConfigSchema = z.object({
  stream: z.boolean().optional(), // Optional: Enables streaming responses for real-time updates.
  frequencyPenalty: z.number().optional(), // Optional: Penalizes high frequency of certain tokens to reduce repetition.
  logitBias: z.record(z.number()).optional(), // Optional: Allows biases to adjust probabilities on specific tokens.
  seed: z.number().int().optional(), // Optional: Sets a random seed for deterministic results.
  topLogprobs: z.number().optional(), // Optional: Returns the top probabilities at each token step.
  user: z.string().optional(), // Optional: Custom user identifier for personalized context.
  toolChoice: z.string().optional(), // Optional: Chooses specific tools for certain model responses.
});

// Define a local equivalent of the Groq Message type if not available directly
interface LocalGroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_call_id?: string;
}

/**
 * Defines supported models in Groq's environment, specifying each model’s unique characteristics.
 * Each model configuration includes attributes such as version, support capabilities, and schema.
 */
export const SUPPORTED_GROQ_MODELS = {
  'llama-3-8b': {
    name: 'groq/llama-3-8b',
    versions: ['llama3-8b-8192'],
    label: 'Llama 3 8B',
    supports: {
      multiturn: true, // Supports multi-turn conversations for richer interactions.
      tools: false, // This model does not support tool-based responses.
      media: false, // Media responses are unsupported for this model.
      systemRole: true, // Allows specification of a system role in interactions.
      output: ['text', 'json'], // Supports both text and JSON formatted outputs.
    },
    configSchema: GroqConfigSchema,
    version: 'llama3-8b-8192',
  },
  'llama-3-70b': {
    name: 'groq/llama-3-70b',
    versions: ['llama3-70b-8192'],
    label: 'Llama 3 70B',
    supports: {
      multiturn: true,
      tools: true, // This model supports tool-based responses, unlike `llama-3-8b`.
      media: false,
      systemRole: true,
      output: ['text', 'json'],
    },
    configSchema: GroqConfigSchema,
    version: 'llama3-70b-8192',
  },
  'mixtral-8x7b': {
    name: 'groq/mixtral-8x7b-32768',
    versions: ['mixtral-8x7b-32768'],
    label: 'Mixtral 8 7B',
    supports: {
      multiturn: true,
      tools: false,
      media: false,
      systemRole: true,
      output: ['text', 'json'], // Best for JSON outputs without streaming or stop sequences.
    },
    configSchema: GroqConfigSchema,
    version: 'mixtral-8x7b-32768',
  },
  'gemma-7b': {
    name: 'groq/gemma-7b-it',
    versions: ['gemma-7b-it'],
    label: 'Gemma 7B IT',
    supports: {
      multiturn: true,
      tools: false,
      media: false,
      systemRole: true,
      output: ['text', 'json'], // Good with JSON mode, best suited for multi-turn scenarios.
    },
    configSchema: GroqConfigSchema,
    version: 'gemma-7b-it',
  },
};

// Define individual model exports
export const llama3x70b = SUPPORTED_GROQ_MODELS['llama-3-70b'];
export const llama3x8b = SUPPORTED_GROQ_MODELS['llama-3-8b'];
export const gemma7b = SUPPORTED_GROQ_MODELS['gemma-7b'];
export const mixtral8x7b = SUPPORTED_GROQ_MODELS['mixtral-8x7b'];
/**
 * Model configurations for additional Groq models:
 * - Mixtral 8 7B: Designed to handle multi-turn conversations, excels in JSON output mode.
 * - Gemma 7B IT: Supports JSON output as well, performing well with more complex outputs.
 */

/**
 * Integrates these models within the Groq API configuration by adding their parameters,
 * including multi-turn and JSON output compatibility.
 *
 * Example usage:
 * - `mixtral-8x7b` and `gemma-7b` work best for applications requiring structured JSON responses.
 */

// Define the custom `ChatCompletionCreateParams` interfaces to resolve import issues
interface ChatCompletionCreateParamsBase {
  messages: Array<CompletionCreateParams.Message>;
  model: string;
  frequency_penalty?: number;
  logit_bias?: Record<string, number>;
  logprobs?: boolean;
  max_tokens?: number;
  n?: number;
  presence_penalty?: number;
  response_format?: CompletionCreateParams.ResponseFormat;
  seed?: number;
  stop?: string | null | Array<string>;
  stream?: boolean;
  temperature?: number;
  tool_choice?: CompletionCreateParams.ToolChoice;
  tools?: Array<CompletionCreateParams.Tool>;
  top_logprobs?: number;
  top_p?: number;
  user?: string;
}

// Define the two versions for streaming and non-streaming
interface ChatCompletionCreateParamsStreaming
  extends ChatCompletionCreateParamsBase {
  stream: true;
}

interface ChatCompletionCreateParamsNonStreaming
  extends ChatCompletionCreateParamsBase {
  stream?: false;
}

/**
 * Converts the role specified by Genkit (e.g., 'user', 'tool') to Groq's accepted format (e.g., 'assistant').
 * This function ensures compatibility between the two SDKs.
 *
 * @param role - The role identifier from Genkit's messaging format.
 * @returns The corresponding role for Groq (either 'system', 'user', or 'assistant').
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
      throw new Error(`Role ${role} does not map to any Groq role.`);
  }
}

/**
 * Processes each part of a Genkit message and converts it into a Groq-compatible format.
 * If the part contains text, it’s directly transferred; if it’s media, it will warn about unsupported formats.
 *
 * @param part - The message part to convert, containing either text or media content.
 * @returns The converted message part, suitable for Groq's API.
 */
export function toGroqTextAndMedia(part: Part): string {
  if (part.text) {
    return part.text;
  } else if (part.media) {
    console.warn(`Media part passed as raw URL: ${part.media.url}`);
    return part.media.url;
  }
  return ''; // Return null for unsupported types instead of throwing an error
}

/**
 * Converts a series of Genkit message data into an array formatted for Groq's API.
 * This function is used to adapt complex multi-part messages to a simple, compatible format.
 *
 * @param messages - An array of Genkit message data to be processed.
 * @returns An array of messages formatted for Groq's API consumption.
 */
export function toGroqMessages(messages: MessageData[]): LocalGroqMessage[] {
  return messages.map((message) => {
    const msg = new Message(message);
    return {
      role: toGroqRole(message.role),
      content: msg.content.map(toGroqTextAndMedia).join(''),
      tool_call_id:
        msg.toolResponseParts()?.[0]?.toolResponse?.ref || undefined,
    };
  });
}

/**
 * Constructs the request body for Groq's API using data from a Genkit `GenerateRequest`.
 * It maps various configuration options, such as temperature and stop sequences, to Groq's format.
 *
 * @param modelName - Name of the model to target for the request.
 * @param request - The structured request data from Genkit to be converted.
 * @returns The structured API request body, ready for Groq's API.
 */
export function toGroqRequestBody(
  modelName: string,
  request: GenerateRequest
): Record<string, any> {
  const model = SUPPORTED_GROQ_MODELS[modelName];
  if (!model) throw new Error(`Unsupported model: ${modelName}`);

  const body: Record<string, any> = {
    messages: toGroqMessages(request.messages),
    model: request.config?.version || model.version || modelName,
    temperature: request.config?.temperature,
    max_tokens: request.config?.maxOutputTokens,
    top_p: request.config?.topP,
    stop: request.config?.stopSequences || undefined,
    stream: request.config?.stream ?? undefined,
    frequency_penalty: request.config?.frequencyPenalty ?? undefined,
    logit_bias: request.config?.logitBias ?? undefined,
    seed: request.config?.seed ?? undefined,
    top_logprobs: request.config?.topLogprobs ?? undefined,
    user: request.config?.user ?? undefined,
  };

  const responseFormat = request.output?.format || 'text';
  if (responseFormat === 'json' && model.supports.output.includes('json')) {
    body.response_format = { type: 'json_object' };
  } else if (
    responseFormat === 'text' &&
    model.supports.output.includes('text')
  ) {
    body.response_format = { type: 'text' };
  } else {
    throw new Error(
      `${responseFormat} format is not supported for ${modelName} currently`
    );
  }

  return body;
}

/**
 * Defines a Groq model with the specified client, allowing it to process both regular and streaming requests.
 * This function returns a model with a method to process requests and handle streaming callbacks when required.
 *
 * @param name - The name of the model being configured.
 * @param client - Instance of the Groq client to handle API interactions.
 * @returns An object representing the model, with a method for processing requests.
 */
export function groqModel(ai: Genkit, name: string, client: Groq) {
  const model = SUPPORTED_GROQ_MODELS[name];
  if (!model) throw new Error(`Unsupported model: ${name}`);

  return {
    name: `groq/${name}`,
    ...model,

    async processRequest(
      request: GenerateRequest,
      streamingCallback?: (data: any) => void
    ) {
      // Construct the base request body with required parameters
      const bodyBase = {
        messages: toGroqMessages(request.messages),
        model: request.config?.version || model.version || name,
        temperature: request.config?.temperature,
        max_tokens: request.config?.maxOutputTokens,
        top_p: request.config?.topP,
        stop: request.config?.stopSequences,
        frequency_penalty: request.config?.frequencyPenalty,
        logit_bias: request.config?.logitBias,
        seed: request.config?.seed,
        top_logprobs: request.config?.topLogprobs,
        user: request.config?.user,
      };

      // Determine request body type based on whether streaming is enabled
      const isStreaming = !!streamingCallback;
      const body:
        | ChatCompletionCreateParamsStreaming
        | ChatCompletionCreateParamsNonStreaming = {
        ...bodyBase,
        ...(isStreaming ? { stream: true } : { stream: false }),
      };

      // Execute different API calls based on streaming requirement
      if (isStreaming) {
        // Validate output format compatibility with streaming
        if (request.output?.format === 'json') {
          throw new Error(
            'JSON format is not supported for streaming responses.'
          );
        }

        // Streaming API request
        const stream = await client.chat.completions.create(
          body as ChatCompletionCreateParamsStreaming
        );
        for await (const chunk of stream) {
          chunk.choices.forEach((choice) => {
            streamingCallback({ content: choice.delta.content || '' });
          });
        }
      } else {
        // Non-streaming API request
        const response = (await client.chat.completions.create(
          body as ChatCompletionCreateParamsNonStreaming
        )) as ChatCompletion;
        return {
          candidates: [
            {
              message: {
                role: 'model',
                content: response.choices[0]?.message?.content || '',
              },
            },
          ],
        };
      }
    },
  };
}
