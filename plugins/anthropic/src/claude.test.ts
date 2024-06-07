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

import { describe, it, expect } from '@jest/globals';
import {
  type GenerateResponseData,
  type Part,
  type GenerateRequest,
  type MessageData,
  CandidateData,
} from '@genkit-ai/ai/model';
import {
  type Message,
  type MessageParam,
  type MessageCreateParams,
  type MessageStreamEvent,
} from '@anthropic-ai/sdk/resources/messages.mjs';
import {
  AnthropicConfigSchema,
  fromAnthropicContentBlockChunk,
  fromAnthropicResponse,
  fromAnthropicStopReason,
  toAnthropicMessages,
  toAnthropicRequestBody,
} from './claude';

describe('toAnthropicMessages', () => {
  const testCases: {
    should: string;
    inputMessages: MessageData[];
    expectedOutput: {
      messages: MessageParam[];
      system?: string;
    };
  }[] = [
    {
      should: 'should transform tool request content correctly',
      inputMessages: [
        {
          role: 'model',
          content: [
            {
              toolRequest: {
                ref: 'toolu_01A09q90qw90lq917835lq9',
                name: 'tellAFunnyJoke',
                input: { topic: 'bob' },
              },
            },
          ],
        },
      ],
      expectedOutput: {
        messages: [
          {
            role: 'assistant',
            content: [
              {
                type: 'tool_use',
                id: 'toolu_01A09q90qw90lq917835lq9',
                name: 'tellAFunnyJoke',
                input: { topic: 'bob' },
              },
            ],
          },
        ],
        system: undefined,
      },
    },
    {
      should: 'should transform tool response text content correctly',
      inputMessages: [
        {
          role: 'tool',
          content: [
            {
              toolResponse: {
                ref: 'call_SVDpFV2l2fW88QRFtv85FWwM',
                name: 'tellAFunnyJoke',
                output: 'Why did the bob cross the road?',
              },
            },
          ],
        },
      ],
      expectedOutput: {
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'tool_result',
                tool_use_id: 'call_SVDpFV2l2fW88QRFtv85FWwM',
                content: [
                  {
                    type: 'text',
                    text: 'Why did the bob cross the road?',
                  },
                ],
              },
            ],
          },
        ],
        system: undefined,
      },
    },
    {
      should: 'should transform tool response media content correctly',
      inputMessages: [
        {
          role: 'tool',
          content: [
            {
              toolResponse: {
                ref: 'call_SVDpFV2l2fW88QRFtv85FWwM',
                name: 'tellAFunnyJoke',
                output: {
                  url: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
                  contentType: 'image/gif',
                },
              },
            },
          ],
        },
      ],
      expectedOutput: {
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'tool_result',
                tool_use_id: 'call_SVDpFV2l2fW88QRFtv85FWwM',
                content: [
                  {
                    type: 'image',
                    source: {
                      type: 'base64',
                      data: 'R0lGODlhAQABAAAAACw=',
                      media_type: 'image/gif',
                    },
                  },
                ],
              },
            ],
          },
        ],
        system: undefined,
      },
    },
    {
      should:
        'should transform tool response base64 image url content correctly',
      inputMessages: [
        {
          role: 'tool',
          content: [
            {
              toolResponse: {
                ref: 'call_SVDpFV2l2fW88QRFtv85FWwM',
                name: 'tellAFunnyJoke',
                output: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
              },
            },
          ],
        },
      ],
      expectedOutput: {
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'tool_result',
                tool_use_id: 'call_SVDpFV2l2fW88QRFtv85FWwM',
                content: [
                  {
                    type: 'image',
                    source: {
                      type: 'base64',
                      data: 'R0lGODlhAQABAAAAACw=',
                      media_type: 'image/gif',
                    },
                  },
                ],
              },
            ],
          },
        ],
        system: undefined,
      },
    },
    {
      should: 'should transform text content correctly',
      inputMessages: [
        { role: 'user', content: [{ text: 'hi' }] },
        { role: 'model', content: [{ text: 'how can I help you?' }] },
        { role: 'user', content: [{ text: 'I am testing' }] },
      ],
      expectedOutput: {
        messages: [
          {
            content: [
              {
                text: 'hi',
                type: 'text',
              },
            ],
            role: 'user',
          },
          {
            content: [
              {
                text: 'how can I help you?',
                type: 'text',
              },
            ],
            role: 'assistant',
          },
          {
            content: [
              {
                text: 'I am testing',
                type: 'text',
              },
            ],
            role: 'user',
          },
        ],
        system: undefined,
      },
    },
    {
      should: 'should transform initial system prompt correctly',
      inputMessages: [
        { role: 'system', content: [{ text: 'You are an helpful assistant' }] },
        { role: 'user', content: [{ text: 'hi' }] },
      ],
      expectedOutput: {
        messages: [
          {
            content: [
              {
                text: 'hi',
                type: 'text',
              },
            ],
            role: 'user',
          },
        ],
        system: 'You are an helpful assistant',
      },
    },
    {
      should: 'should transform multi-modal (text + media) content correctly',
      inputMessages: [
        {
          role: 'user',
          content: [
            { text: 'describe the following image:' },
            {
              media: {
                url: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
                contentType: 'image/gif',
              },
            },
          ],
        },
      ],
      expectedOutput: {
        messages: [
          {
            content: [
              {
                text: 'describe the following image:',
                type: 'text',
              },
              {
                source: {
                  type: 'base64',
                  data: 'R0lGODlhAQABAAAAACw=',
                  media_type: 'image/gif',
                },
                type: 'image',
              },
            ],
            role: 'user',
          },
        ],
        system: undefined,
      },
    },
  ];
  for (const test of testCases) {
    it(test.should, () => {
      const actualOutput = toAnthropicMessages(test.inputMessages);
      expect(actualOutput).toStrictEqual(test.expectedOutput);
    });
  }
});

describe('fromAnthropicContentBlockChunk', () => {
  const testCases: {
    should: string;
    event: MessageStreamEvent;
    expectedOutput: Part | undefined;
  }[] = [
    {
      should: 'should return text part from content_block_start event',
      event: {
        index: 0,
        type: 'content_block_start',
        content_block: {
          type: 'text',
          text: 'Hello, World!',
        },
      },
      expectedOutput: { text: 'Hello, World!' },
    },
    {
      should: 'should return text delta part from content_block_delta event',
      event: {
        index: 0,
        type: 'content_block_delta',
        delta: {
          type: 'text_delta',
          text: 'Hello, World!',
        },
      },
      expectedOutput: { text: 'Hello, World!' },
    },
    {
      should: 'should return tool use requests',
      event: {
        index: 0,
        type: 'content_block_start',
        content_block: {
          type: 'tool_use',
          id: 'abc123',
          name: 'tellAJoke',
          input: { topic: 'dogs' },
        },
      },
      expectedOutput: {
        toolRequest: {
          name: 'tellAJoke',
          input: { topic: 'dogs' },
          ref: 'abc123',
        },
      },
    },
    {
      should: 'should return undefined for any other event',
      event: {
        type: 'message_stop',
      },
      expectedOutput: undefined,
    },
  ];

  for (const test of testCases) {
    it(test.should, () => {
      const actualOutput = fromAnthropicContentBlockChunk(test.event);
      expect(actualOutput).toStrictEqual(test.expectedOutput);
    });
  }
});

describe('fromAnthropicStopReason', () => {
  const testCases: {
    inputStopReason: Message['stop_reason'];
    expectedFinishReason: CandidateData['finishReason'];
  }[] = [
    {
      inputStopReason: 'max_tokens',
      expectedFinishReason: 'length',
    },
    {
      inputStopReason: 'end_turn',
      expectedFinishReason: 'stop',
    },
    {
      inputStopReason: 'stop_sequence',
      expectedFinishReason: 'stop',
    },
    {
      inputStopReason: 'tool_use',
      expectedFinishReason: 'stop',
    },
    {
      inputStopReason: null,
      expectedFinishReason: 'unknown',
    },
    {
      inputStopReason: 'unknown' as any,
      expectedFinishReason: 'other',
    },
  ];

  for (const test of testCases) {
    it(`should map Anthropic stop reason "${test.inputStopReason}" to Genkit finish reason "${test.expectedFinishReason}"`, () => {
      const actualOutput = fromAnthropicStopReason(test.inputStopReason);
      expect(actualOutput).toBe(test.expectedFinishReason);
    });
  }
});

describe('fromAnthropicResponse', () => {
  const testCases: {
    should: string;
    message: Message;
    expectedOutput: GenerateResponseData;
  }[] = [
    {
      should: 'should work with text content',
      message: {
        id: 'abc123',
        model: 'whatever',
        type: 'message',
        role: 'assistant',
        stop_reason: 'max_tokens',
        stop_sequence: null,
        content: [
          {
            type: 'text',
            text: 'Tell a joke about dogs.',
          },
        ],
        usage: {
          input_tokens: 10,
          output_tokens: 20,
        },
      },
      expectedOutput: {
        candidates: [
          {
            index: 0,
            finishReason: 'length',
            message: {
              role: 'model',
              content: [{ text: 'Tell a joke about dogs.' }],
            },
          },
        ],
        usage: {
          inputTokens: 10,
          outputTokens: 20,
        },
        custom: expect.any(Object),
      },
    },
    {
      should: 'should work with tool use content',
      message: {
        id: 'abc123',
        model: 'whatever',
        type: 'message',
        role: 'assistant',
        stop_reason: 'tool_use',
        stop_sequence: null,
        content: [
          {
            type: 'tool_use',
            id: 'abc123',
            name: 'tellAJoke',
            input: { topic: 'dogs' },
          },
        ],
        usage: {
          input_tokens: 10,
          output_tokens: 20,
        },
      },
      expectedOutput: {
        candidates: [
          {
            index: 0,
            finishReason: 'stop',
            message: {
              role: 'model',
              content: [
                {
                  toolRequest: {
                    name: 'tellAJoke',
                    input: { topic: 'dogs' },
                    ref: 'abc123',
                  },
                },
              ],
            },
          },
        ],
        usage: {
          inputTokens: 10,
          outputTokens: 20,
        },
        custom: expect.any(Object),
      },
    },
  ];

  for (const test of testCases) {
    it(test.should, () => {
      const actualOutput = fromAnthropicResponse(test.message);
      expect(actualOutput).toStrictEqual(test.expectedOutput);
    });
  }
});

describe('toAnthropicRequestBody', () => {
  const testCases: {
    should: string;
    modelName: string;
    genkitRequest: GenerateRequest<typeof AnthropicConfigSchema>;
    expectedOutput: MessageCreateParams;
  }[] = [
    {
      should: '(claude-3-opus) handles request with text messages',
      modelName: 'claude-3-opus',
      genkitRequest: {
        messages: [
          { role: 'user', content: [{ text: 'Tell a joke about dogs.' }] },
        ],
        output: { format: 'text' },
        config: {
          metadata: {
            user_id: 'exampleUser123',
          },
        },
      },
      expectedOutput: {
        max_tokens: 4096,
        messages: [
          {
            content: [
              {
                text: 'Tell a joke about dogs.',
                type: 'text',
              },
            ],
            role: 'user',
          },
        ],
        model: 'claude-3-opus-20240229',
        metadata: {
          user_id: 'exampleUser123',
        },
      },
    },
    {
      should: '(claude-3-haiku) handles request with text messages',
      modelName: 'claude-3-haiku',
      genkitRequest: {
        messages: [
          { role: 'user', content: [{ text: 'Tell a joke about dogs.' }] },
        ],
        output: { format: 'text' },
        config: {
          metadata: {
            user_id: 'exampleUser123',
          },
        },
      },
      expectedOutput: {
        max_tokens: 4096,
        messages: [
          {
            content: [
              {
                text: 'Tell a joke about dogs.',
                type: 'text',
              },
            ],
            role: 'user',
          },
        ],
        model: 'claude-3-haiku-20240307',
        metadata: {
          user_id: 'exampleUser123',
        },
      },
    },
    {
      should: '(claude-3-sonnet) handles request with text messages',
      modelName: 'claude-3-sonnet',
      genkitRequest: {
        messages: [
          { role: 'user', content: [{ text: 'Tell a joke about dogs.' }] },
        ],
        output: { format: 'text' },
        config: {
          metadata: {
            user_id: 'exampleUser123',
          },
        },
      },
      expectedOutput: {
        max_tokens: 4096,
        messages: [
          {
            content: [
              {
                text: 'Tell a joke about dogs.',
                type: 'text',
              },
            ],
            role: 'user',
          },
        ],
        model: 'claude-3-sonnet-20240229',
        metadata: {
          user_id: 'exampleUser123',
        },
      },
    },
  ];
  for (const test of testCases) {
    it(test.should, () => {
      const actualOutput = toAnthropicRequestBody(
        test.modelName,
        test.genkitRequest
      );
      expect(actualOutput).toStrictEqual(test.expectedOutput);
    });
  }
});
