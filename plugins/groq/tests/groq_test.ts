import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  GenerateRequest,
  MessageData,
  Role,
  ToolDefinition,
} from '@genkit-ai/ai/model';
import {
  toGroqRequestBody,
  toGroqRole,
  toGroqTool,
  toGroqMessages,
  groqModel,
} from '../src/groq_models';
import { ChatCompletionCreateParamsBase } from 'groq-sdk/resources/chat/completions.mjs';

describe('toGroqRole', () => {
  it('should convert user role correctly', () => {
    assert.strictEqual(toGroqRole('user'), 'user');
  });

  it('should convert model role to assistant', () => {
    assert.strictEqual(toGroqRole('model'), 'assistant');
  });

  it('should convert system role correctly', () => {
    assert.strictEqual(toGroqRole('system'), 'system');
  });

  it('should convert tool role correctly', () => {
    assert.strictEqual(toGroqRole('tool'), 'assistant');
  });

  it('should throw error for unsupported roles', () => {
    assert.throws(() => toGroqRole('unknown' as Role), {
      message: "role unknown doesn't map to a Groq role.",
    });
  });
});

describe('toGroqTool', () => {
  const tool: ToolDefinition = {
    name: 'exampleTool',
    description: 'An example tool',
    inputSchema: {
      type: 'object',
      properties: { param: { type: 'string' } },
      required: ['param'],
      additionalProperties: false,
      $schema: 'http://json-schema.org/draft-07/schema#',
    },
  };

  it('should convert tool definition to Groq tool format', () => {
    const expected = {
      type: 'function',
      function: {
        name: 'exampleTool',
        description: 'An example tool',
        parameters: tool.inputSchema,
      },
    };
    assert.deepStrictEqual(toGroqTool(tool), expected);
  });
});

describe('toGroqMessages', () => {
  const messages: MessageData[] = [
    {
      role: 'user',
      content: [{ text: 'Hello, world!' }],
    },
    {
      role: 'model',
      content: [{ text: 'How can I assist you today?' }],
    },
    {
      role: 'tool',
      content: [
        {
          toolResponse: {
            ref: 'ref123',
            name: 'getResponse',
            output: 'Sample response',
          },
        },
      ],
    },
  ];

  it('should convert message data to Groq message format', () => {
    const expectedOutput = [
      {
        role: 'user',
        content: 'Hello, world!',
      },
      {
        role: 'assistant',
        content: 'How can I assist you today?',
      },
      {
        role: 'assistant',
        tool_call_id: 'ref123',
        content: 'Sample response',
      },
    ];
    assert.deepStrictEqual(toGroqMessages(messages), expectedOutput);
  });
});

describe('toGroqRequestBody', () => {
  const request: GenerateRequest = {
    messages: [
      { role: 'user', content: [{ text: 'Tell a joke about dogs.' }] },
    ],
    tools: [],
    output: { format: 'text' },
    config: {
      temperature: 0.7,
      stopSequences: ['\n'],
      maxTokens: 100,
      topP: 0.9,
      frequencyPenalty: 0.5,
      logitBias: {
        science: 12,
        technology: 8,
        politics: -5,
        sports: 3,
      },
      seed: 42,
      topLogprobs: 10,
      user: 'exampleUser123',
      custom: {
        someCamelCase: 'someValue',
      },
    },
  };

  it('should convert GenerateRequest to Groq request body', () => {
    const expectedOutput: ChatCompletionCreateParamsBase = {
      messages: [
        {
          role: 'user',
          content: 'Tell a joke about dogs.',
        },
      ],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 100,
      top_p: 0.9,
      stop: ['\n'],
      frequency_penalty: 0.5,
      logit_bias: {
        science: 12,
        technology: 8,
        politics: -5,
        sports: 3,
      },
      seed: 42,
      top_logprobs: 10,
      user: 'exampleUser123',
      response_format: {
        type: 'text',
      },
    };
    const actualOutput = toGroqRequestBody('llama-3-8b', request);
    console.log(`actualOutput.stop: ${actualOutput.stop}`);
    assert.deepStrictEqual(actualOutput, expectedOutput);
  });

  it('should handle unsupported models', () => {
    assert.throws(() => toGroqRequestBody('unsupported-model', request), {
      message: 'Unsupported model: unsupported-model',
    });
  });
});
