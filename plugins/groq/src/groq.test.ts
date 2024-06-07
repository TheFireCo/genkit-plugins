import { describe, it, expect } from '@jest/globals';
import {
  CandidateData,
  GenerateRequest,
  MessageData,
  Part,
  Role,
  ToolDefinition,
} from '@genkit-ai/ai/model';
import {
  toGroqRequestBody,
  toGroqRole,
  toGroqTool,
  toGroqMessages,
  toGroqTextAndMedia,
  fromGroqChoice,
  fromGroqChunkChoice,
} from './groq_models';
import {
  ChatCompletion,
  ChatCompletionCreateParamsBase,
} from 'groq-sdk/resources/chat/completions.mjs';
import { ChatCompletionChunk } from 'groq-sdk/lib/chat_completions_ext.mjs';

describe('toGroqRole', () => {
  it('should convert user role correctly', () => {
    expect(toGroqRole('user')).toBe('user');
  });

  it('should convert model role to assistant', () => {
    expect(toGroqRole('model')).toBe('assistant');
  });

  it('should convert system role correctly', () => {
    expect(toGroqRole('system')).toBe('system');
  });

  it('should convert tool role correctly', () => {
    expect(toGroqRole('tool')).toBe('assistant');
  });

  it('should throw error for unsupported roles', () => {
    expect(() => toGroqRole('unknown' as Role)).toThrowError(
      "role unknown doesn't map to a Groq role."
    );
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
    expect(toGroqTool(tool)).toStrictEqual(expected);
  });
});

describe('toGroqTextAndMedia', () => {
  it('should work with text parts', () => {
    expect(toGroqTextAndMedia({ text: 'Hello, world!' })).toBe('Hello, world!');
  });

  it('should work with media parts', () => {
    expect(
      toGroqTextAndMedia({ media: { url: 'https://www.example.com' } })
    ).toBe('https://www.example.com');
  });

  it('should throw error for unsupported part types', () => {
    expect(() => toGroqTextAndMedia({ unknown: 'value' } as Part)).toThrowError(
      'Unsupported part type. Only text and media (url) parts are supported.'
    );
  });
});

describe('toGroqMessages', () => {
  const messages: MessageData[] = [
    {
      role: 'system',
      content: [{ text: 'You are an helpful assistant' }],
    },
    {
      role: 'user',
      content: [{ text: 'Hello, world!' }],
    },
    {
      role: 'model',
      content: [
        { text: 'How can I assist you today?' },
        {
          toolRequest: {
            name: 'exampleTool',
            input: { param: 'value' },
            ref: 'ref123',
          },
        },
      ],
    },
    {
      role: 'tool',
      content: [
        {
          toolResponse: {
            ref: 'ref456',
            name: 'getResponse',
            output: 'Sample response with tools',
          },
        },
      ],
    },
    {
      role: 'model',
      content: [{ text: 'Sample response without tools' }],
    },
  ];

  it('should convert message data to Groq message format', () => {
    const expectedOutput = [
      {
        role: 'system',
        content: 'You are an helpful assistant',
      },
      {
        role: 'user',
        content: 'Hello, world!',
      },
      {
        role: 'assistant',
        content: 'How can I assist you today?',
        tool_calls: [
          {
            function: {
              arguments: JSON.stringify({ param: 'value' }),
              name: 'exampleTool',
            },
            id: 'ref123',
            type: 'function',
          },
        ],
      },
      {
        role: 'assistant',
        tool_call_id: 'ref456',
        content: 'Sample response with tools',
      },
      {
        role: 'assistant',
        content: 'Sample response without tools',
      },
    ];
    expect(toGroqMessages(messages)).toStrictEqual(expectedOutput);
  });
});

describe('fromGroqChoice', () => {
  const testCases: {
    should: string;
    choice: ChatCompletion.Choice;
    jsonMode?: boolean;
    expectedOutput: CandidateData;
  }[] = [
    {
      should: 'should work with text',
      choice: {
        index: 0,
        message: {
          role: 'assistant',
          content: 'Tell a joke about dogs.',
        },
        finish_reason: 'whatever',
        logprobs: {},
      },
      expectedOutput: {
        index: 0,
        finishReason: 'unknown',
        message: {
          role: 'model',
          content: [{ text: 'Tell a joke about dogs.' }],
        },
        custom: {},
      },
    },
    {
      should: 'should work with json',
      choice: {
        index: 0,
        message: {
          role: 'assistant',
          content: JSON.stringify({ json: 'test' }),
        },
        finish_reason: 'content_filter',
        logprobs: {},
      },
      jsonMode: true,
      expectedOutput: {
        index: 0,
        finishReason: 'blocked',
        message: {
          role: 'model',
          content: [{ data: { json: 'test' } }],
        },
        custom: {},
      },
    },
    {
      should: 'should work with tools',
      choice: {
        index: 0,
        message: {
          role: 'assistant',
          content: 'Tool call',
          tool_calls: [
            {
              id: 'ref123',
              function: {
                name: 'exampleTool',
                arguments: JSON.stringify({ param: 'value' }),
              },
            },
          ],
        },
        finish_reason: 'tool_calls',
        logprobs: {},
      },
      expectedOutput: {
        index: 0,
        message: {
          role: 'model',
          content: [
            {
              toolRequest: {
                name: 'exampleTool',
                input: { param: 'value' },
                ref: 'ref123',
              },
            },
          ],
        },
        finishReason: 'stop',
        custom: {},
      },
    },
  ];

  for (const test of testCases) {
    it(test.should, () => {
      const actualOutput = fromGroqChoice(test.choice, test.jsonMode);
      expect(actualOutput).toStrictEqual(test.expectedOutput);
    });
  }
});

describe('fromGroqChunkChoice', () => {
  const testCases: {
    should: string;
    chunkChoice: ChatCompletionChunk.Choice;
    expectedOutput: CandidateData;
  }[] = [
    {
      should: 'should work with text',
      chunkChoice: {
        index: 0,
        delta: {
          role: 'assistant',
          content: 'Tell a joke about dogs.',
        },
        finish_reason: 'whatever' as any,
      },
      expectedOutput: {
        index: 0,
        finishReason: 'unknown',
        message: {
          role: 'model',
          content: [{ text: 'Tell a joke about dogs.' }],
        },
        custom: {},
      },
    },
    {
      should: 'should work with tools',
      chunkChoice: {
        index: 0,
        delta: {
          role: 'assistant',
          content: 'Tool call',
          tool_calls: [
            {
              index: 0,
              id: 'ref123',
              function: {
                name: 'exampleTool',
                arguments: JSON.stringify({ param: 'value' }),
              },
            },
          ],
        },
        finish_reason: 'tool_calls',
      },
      expectedOutput: {
        index: 0,
        message: {
          role: 'model',
          content: [
            {
              toolRequest: {
                name: 'exampleTool',
                input: { param: 'value' },
                ref: 'ref123',
              },
            },
          ],
        },
        finishReason: 'stop',
        custom: {},
      },
    },
  ];

  for (const test of testCases) {
    it(test.should, () => {
      const actualOutput = fromGroqChunkChoice(test.chunkChoice);
      expect(actualOutput).toStrictEqual(test.expectedOutput);
    });
  }
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
      maxOutputTokens: 100,
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
    expect(actualOutput).toStrictEqual(expectedOutput);
  });

  it('should handle unsupported models', () => {
    expect(() => toGroqRequestBody('unsupported-model', request)).toThrowError(
      'Unsupported model: unsupported-model'
    );
  });
});
