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
Part,
Role,
ToolDefinition,
ToolRequestPart,

} from '@genkit-ai/ai/model';
import type {Tool, Function, ChatCompletionResponseChoice, ChatCompletionResponseChunk, ToolCalls, ChatRequest, ChatCompletionResponse } from "@mistralai/mistralai";

import z from 'zod';

export const MistralConfigSchema = z.object({
temperature: z.number().min(0).max(1).optional(),
maxTokens: z.number().int().optional(),
topP: z.number().min(0).max(1).optional(),
stopSequences: z.array(z.string()).optional(),

});

export const openMistral7B = modelRef({
name: 'mistral/open-mistral-7b',
info: {
    versions: ['mistral-tiny-2312'],
    label: 'Mistral - Mistral 7B',
    supports: {
        multiturn: true,
        tools: true,
        media: false,
        output: ['text','json'], 
    },
},
configSchema: MistralConfigSchema,
});

export const mistralembed = modelRef({
    name: 'mistral/mistral-embed',
    info: {
        versions: ['mistral-embed'],
        label: 'Mistral - Mistral Embed',
        supports: {
            multiturn: true,
            tools: true,
            media: false,
            output: ['text','json'], 
        },
    },
    configSchema: MistralConfigSchema,
    });
    


function toMistralRole(role: Role):  string  {
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
): ChatRequest["messages"] {
const mistralMsgs: ChatRequest["messages"] = [];
for (const message of messages) {
    const msg = new Message(message);
    const role = toMistralRole(message.role);

    // In Mistral the Message comprises only role and content no need to differentiate between tool and message
    mistralMsgs.push({
        role: role,
        content: msg.text(),
    });}
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
    // 'open-mixtral-8x7b': gpt4Vision,
    // 'open-mixtral-8x22b': gpt4,
    // 'mistral-small-latest': gpt35Turbo,
    // 'mistral-medium-latest': gpt4o, 
    // 'mistral-large-latest': gpt4Turbo,
    // 'mistral-embed': mistralembed
  };


function fromMistralToolCall(
toolCall: ToolCalls
) {
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
        : [ 
            { text: choice.message.content! },
        ],
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
    content: [ 
            { text: choice.delta.content! },
        ],
    },
    custom: {},
};
}

export function toMistralRequestBody(
modelName: string,
request: GenerateRequest
) {
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
const model = SUPPORTED_MISTRAL_MODELS[modelName];
if (!model) throw new Error(`Unsupported model: ${modelName}`);
const mistralMessages = toMistralMessages(request.messages);
const mappedModelName =
    request.config?.version || modelName;
const body = {
    messages: mistralMessages,
    tools: request.tools?.map(toMistralTool),
    model: mappedModelName,
    max_tokens: request.config?.maxTokens,
    temperature: request.config?.temperature,
    top_p: request.config?.topP,
    n: request.candidates,
    stop_sequences: request.config?.stopSequences,
    ...mapToSnakeCase(request.config?.custom || {}),
} as ChatRequest;

for (const key in body) {
    if (!body[key] || (Array.isArray(body[key]) && !body[key].length))
    delete body[key];
}
return body;
}

// async combineChunks(request: ChatRequest, options?: ChatRequestOptions): Promise<ChatCompletionResponse> {
//     let fullResponse: ChatCompletionResponse = { text: "" };

//     for await (const chunk of this.chatStream(request, options)) {
//       fullResponse.text += chunk.text;
//     }

//     return fullResponse;
//   }

export function mistralModel(name: string, client: any) { //Ugly any type, should be MistralClient but cannot import it here
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
    let response: ChatCompletionResponse| ChatCompletionResponseChunk;
    const body = toMistralRequestBody(name, request);
    if (streamingCallback) {
        const stream = await client.chatStream( body);
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
        candidates: response.choices.map((c) =>
        fromMistralChoice(c )
        ),
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
