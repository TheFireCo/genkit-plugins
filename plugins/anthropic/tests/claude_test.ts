import assert from 'node:assert';
import { describe, it } from 'node:test';
import { type GenerateRequest, type MessageData } from '@genkit-ai/ai/model';
import type Anthropic from '@anthropic-ai/sdk';
import { toAnthropicMessages, toAnthropicRequestBody } from '../src/claude.js';

describe('toAnthropicMessages', () => {
  const testCases: {
    should: string;
    inputMessages: MessageData[];
    expectedOutput: {
      messages: Anthropic.Beta.Tools.ToolsBetaMessageParam[];
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
      should: 'should transform tool response content correctly',
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
                contentType: 'image/jpeg',
                url: 'https://img.freepik.com/free-photo/abstract-autumn-beauty-multi-colored-leaf-vein-pattern-generated-by-ai_188544-9871.jpg?size=626&ext=jpg&ga=GA1.1.735520172.1710720000&semt=ais',
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
                  data: 'https://img.freepik.com/free-photo/abstract-autumn-beauty-multi-colored-leaf-vein-pattern-generated-by-ai_188544-9871.jpg?size=626&ext=jpg&ga=GA1.1.735520172.1710720000&semt=ais',
                  media_type: 'image/jpeg',
                  type: 'base64',
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
      assert.deepStrictEqual(actualOutput, test.expectedOutput);
    });
  }
});

describe('toAnthropicRequestBody', () => {
  const testCases: {
    should: string;
    modelName: string;
    genkitRequest: GenerateRequest;
    expectedOutput: Anthropic.Beta.Tools.Messages.MessageCreateParams;
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
          custom: {
            metadata: {
              user_id: 'exampleUser123',
            },
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
          custom: {
            metadata: {
              user_id: 'exampleUser123',
            },
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
          custom: {
            metadata: {
              user_id: 'exampleUser123',
            },
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
        test.genkitRequest,
      );
      assert.deepStrictEqual(actualOutput, test.expectedOutput);
    });
  }
});
