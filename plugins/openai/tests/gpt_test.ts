import { GenerateRequest, MessageData } from '@genkit-ai/ai/model';
import assert from 'node:assert';
import { describe, it } from 'node:test';
import { toOpenAiMessages, toOpenAiRequestBody } from '../src/gpt.js';

describe('toOpenAiMessages', () => {
  const testCases = [
    {
      should: 'should transform tool request content correctly',
      inputMessages: [
        {
          role: 'model',
          content: [
            {
              toolRequest: {
                ref: 'call_SVDpFV2l2fW88QRFtv85FWwM',
                name: 'tellAFunnyJoke',
                input: { topic: 'bob' },
              },
            },
          ],
        },
      ],
      expectedOutput: [
        {
          role: 'assistant',
          tool_calls: [
            {
              id: 'call_SVDpFV2l2fW88QRFtv85FWwM',
              type: 'function',
              function: {
                name: 'tellAFunnyJoke',
                arguments: '{"topic":"bob"}',
              },
            },
          ],
        },
      ],
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
      expectedOutput: [
        {
          role: 'tool',
          tool_call_id: 'call_SVDpFV2l2fW88QRFtv85FWwM',
          content: 'Why did the bob cross the road?',
        },
      ],
    },
    {
      should: 'should transform text content correctly',
      inputMessages: [
        { role: 'user', content: [{ text: 'hi' }] },
        { role: 'model', content: [{ text: 'how can I help you?' }] },
        { role: 'user', content: [{ text: 'I am testing' }] },
      ],
      expectedOutput: [
        { role: 'user', content: [{ text: 'hi', type: 'text' }] },
        { role: 'assistant', content: 'how can I help you?' },
        { role: 'user', content: [{ text: 'I am testing', type: 'text' }] },
      ],
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
      expectedOutput: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'describe the following image:' },
            {
              type: 'image_url',
              image_url: {
                url: 'https://img.freepik.com/free-photo/abstract-autumn-beauty-multi-colored-leaf-vein-pattern-generated-by-ai_188544-9871.jpg?size=626&ext=jpg&ga=GA1.1.735520172.1710720000&semt=ais',
              },
            },
          ],
        },
      ],
    },
  ];
  for (const test of testCases) {
    it(test.should, () => {
      const actualOutput = toOpenAiMessages(
        test.inputMessages as MessageData[],
      );
      assert.deepStrictEqual(actualOutput, test.expectedOutput);
    });
  }
});

describe('toOpenAiRequestBody', () => {
  const testCases = [
    {
      should: '(gpt-3.5-turbo) handles request with text messages',
      modelName: 'gpt-3.5-turbo',
      genkitRequest: {
        messages: [
          { role: 'user', content: [{ text: 'Tell a joke about dogs.' }] },
        ],
        tools: [],
        output: { format: 'text' },
        config: {
          custom: {
            frequencyPenalty: 0.7,
            logitBias: {
              science: 12,
              technology: 8,
              politics: -5,
              sports: 3,
            },
            logProbs: true,
            presencePenalty: -0.3,
            seed: 42,
            topLogProbs: 10,
            user: 'exampleUser123',
          },
        },
      },
      expectedOutput: {
        messages: [
          {
            role: 'user',
            content: [{ type: 'text', text: 'Tell a joke about dogs.' }],
          },
        ],
        model: 'gpt-3.5-turbo',
        response_format: { type: 'text' },
        frequency_penalty: 0.7,
        logit_bias: {
          science: 12,
          technology: 8,
          politics: -5,
          sports: 3,
        },
        log_probs: true,
        presence_penalty: -0.3,
        seed: 42,
        top_log_probs: 10,
        user: 'exampleUser123',
      },
    },
    {
      should: '(gpt-3.5-turbo) handles request with text messages and tools',
      modelName: 'gpt-3.5-turbo',
      genkitRequest: {
        messages: [
          { role: 'user', content: [{ text: 'Tell a joke about dogs.' }] },
          {
            role: 'model',
            content: [
              {
                toolRequest: {
                  ref: 'call_yTnDw3xY3KH3pkvDvccCizn1',
                  name: 'tellAFunnyJoke',
                  input: { topic: 'dogs' },
                },
              },
            ],
          },
          {
            role: 'tool',
            content: [
              {
                toolResponse: {
                  ref: 'call_yTnDw3xY3KH3pkvDvccCizn1',
                  name: 'tellAFunnyJoke',
                  output: 'Why did the dogs cross the road?',
                },
              },
            ],
          },
        ],
        tools: [
          {
            name: 'tellAFunnyJoke',
            description:
              'Tells jokes about an input topic. Use this tool whenever user asks you to tell a joke.',
            inputSchema: {
              type: 'object',
              properties: { topic: { type: 'string' } },
              required: ['topic'],
              additionalProperties: false,
              $schema: 'http://json-schema.org/draft-07/schema#',
            },
            outputSchema: {
              type: 'string',
              $schema: 'http://json-schema.org/draft-07/schema#',
            },
          },
        ],
        output: { format: 'text' },
      },
      expectedOutput: {
        messages: [
          {
            role: 'user',
            content: [{ type: 'text', text: 'Tell a joke about dogs.' }],
          },
          {
            role: 'assistant',
            tool_calls: [
              {
                id: 'call_yTnDw3xY3KH3pkvDvccCizn1',
                type: 'function',
                function: {
                  name: 'tellAFunnyJoke',
                  arguments: '{"topic":"dogs"}',
                },
              },
            ],
          },
          {
            role: 'tool',
            tool_call_id: 'call_yTnDw3xY3KH3pkvDvccCizn1',
            content: 'Why did the dogs cross the road?',
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'tellAFunnyJoke',
              parameters: {
                type: 'object',
                properties: { topic: { type: 'string' } },
                required: ['topic'],
                additionalProperties: false,
                $schema: 'http://json-schema.org/draft-07/schema#',
              },
            },
          },
        ],
        model: 'gpt-3.5-turbo',
        response_format: {
          type: 'text',
        },
      },
    },
    {
      should: '(gpt-3.5-turbo) sets response_format if output.format=json',
      modelName: 'gpt-3.5-turbo',
      genkitRequest: {
        messages: [
          { role: 'user', content: [{ text: 'Tell a joke about dogs.' }] },
          {
            role: 'model',
            content: [
              {
                toolRequest: {
                  ref: 'call_yTnDw3xY3KH3pkvDvccCizn1',
                  name: 'tellAFunnyJoke',
                  input: { topic: 'dogs' },
                },
              },
            ],
          },
          {
            role: 'tool',
            content: [
              {
                toolResponse: {
                  ref: 'call_yTnDw3xY3KH3pkvDvccCizn1',
                  name: 'tellAFunnyJoke',
                  output: 'Why did the dogs cross the road?',
                },
              },
            ],
          },
        ],
        tools: [
          {
            name: 'tellAFunnyJoke',
            description:
              'Tells jokes about an input topic. Use this tool whenever user asks you to tell a joke.',
            inputSchema: {
              type: 'object',
              properties: { topic: { type: 'string' } },
              required: ['topic'],
              additionalProperties: false,
              $schema: 'http://json-schema.org/draft-07/schema#',
            },
            outputSchema: {
              type: 'string',
              $schema: 'http://json-schema.org/draft-07/schema#',
            },
          },
        ],
        output: { format: 'json' },
      },
      expectedOutput: {
        messages: [
          {
            role: 'user',
            content: [{ type: 'text', text: 'Tell a joke about dogs.' }],
          },
          {
            role: 'assistant',
            tool_calls: [
              {
                id: 'call_yTnDw3xY3KH3pkvDvccCizn1',
                type: 'function',
                function: {
                  name: 'tellAFunnyJoke',
                  arguments: '{"topic":"dogs"}',
                },
              },
            ],
          },
          {
            role: 'tool',
            tool_call_id: 'call_yTnDw3xY3KH3pkvDvccCizn1',
            content: 'Why did the dogs cross the road?',
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'tellAFunnyJoke',
              parameters: {
                type: 'object',
                properties: { topic: { type: 'string' } },
                required: ['topic'],
                additionalProperties: false,
                $schema: 'http://json-schema.org/draft-07/schema#',
              },
            },
          },
        ],
        model: 'gpt-3.5-turbo',
        response_format: { type: 'json_object' },
      },
    },
    {
      should: '(gpt-4-turbo) sets response_format if output.format=json',
      modelName: 'gpt-4-turbo',
      genkitRequest: {
        messages: [
          { role: 'user', content: [{ text: 'Tell a joke about dogs.' }] },
          {
            role: 'model',
            content: [
              {
                toolRequest: {
                  ref: 'call_yTnDw3xY3KH3pkvDvccCizn1',
                  name: 'tellAFunnyJoke',
                  input: { topic: 'dogs' },
                },
              },
            ],
          },
          {
            role: 'tool',
            content: [
              {
                toolResponse: {
                  ref: 'call_yTnDw3xY3KH3pkvDvccCizn1',
                  name: 'tellAFunnyJoke',
                  output: 'Why did the dogs cross the road?',
                },
              },
            ],
          },
        ],
        tools: [
          {
            name: 'tellAFunnyJoke',
            description:
              'Tells jokes about an input topic. Use this tool whenever user asks you to tell a joke.',
            inputSchema: {
              type: 'object',
              properties: { topic: { type: 'string' } },
              required: ['topic'],
              additionalProperties: false,
              $schema: 'http://json-schema.org/draft-07/schema#',
            },
            outputSchema: {
              type: 'string',
              $schema: 'http://json-schema.org/draft-07/schema#',
            },
          },
        ],
        output: { format: 'json' },
      },
      expectedOutput: {
        messages: [
          {
            role: 'user',
            content: [{ type: 'text', text: 'Tell a joke about dogs.' }],
          },
          {
            role: 'assistant',
            tool_calls: [
              {
                id: 'call_yTnDw3xY3KH3pkvDvccCizn1',
                type: 'function',
                function: {
                  name: 'tellAFunnyJoke',
                  arguments: '{"topic":"dogs"}',
                },
              },
            ],
          },
          {
            role: 'tool',
            tool_call_id: 'call_yTnDw3xY3KH3pkvDvccCizn1',
            content: 'Why did the dogs cross the road?',
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'tellAFunnyJoke',
              parameters: {
                type: 'object',
                properties: { topic: { type: 'string' } },
                required: ['topic'],
                additionalProperties: false,
                $schema: 'http://json-schema.org/draft-07/schema#',
              },
            },
          },
        ],
        model: 'gpt-4-turbo',
        response_format: { type: 'json_object' },
      },
    },
    {
      should: '(gpt-4o) sets response_format if output.format=json',
      modelName: 'gpt-4o',
      genkitRequest: {
        messages: [
          { role: 'user', content: [{ text: 'Tell a joke about dogs.' }] },
          {
            role: 'model',
            content: [
              {
                toolRequest: {
                  ref: 'call_yTnDw3xY3KH3pkvDvccCizn1',
                  name: 'tellAFunnyJoke',
                  input: { topic: 'dogs' },
                },
              },
            ],
          },
          {
            role: 'tool',
            content: [
              {
                toolResponse: {
                  ref: 'call_yTnDw3xY3KH3pkvDvccCizn1',
                  name: 'tellAFunnyJoke',
                  output: 'Why did the dogs cross the road?',
                },
              },
            ],
          },
        ],
        tools: [
          {
            name: 'tellAFunnyJoke',
            description:
              'Tells jokes about an input topic. Use this tool whenever user asks you to tell a joke.',
            inputSchema: {
              type: 'object',
              properties: { topic: { type: 'string' } },
              required: ['topic'],
              additionalProperties: false,
              $schema: 'http://json-schema.org/draft-07/schema#',
            },
            outputSchema: {
              type: 'string',
              $schema: 'http://json-schema.org/draft-07/schema#',
            },
          },
        ],
        output: { format: 'json' },
      },
      expectedOutput: {
        messages: [
          {
            role: 'user',
            content: [{ type: 'text', text: 'Tell a joke about dogs.' }],
          },
          {
            role: 'assistant',
            tool_calls: [
              {
                id: 'call_yTnDw3xY3KH3pkvDvccCizn1',
                type: 'function',
                function: {
                  name: 'tellAFunnyJoke',
                  arguments: '{"topic":"dogs"}',
                },
              },
            ],
          },
          {
            role: 'tool',
            tool_call_id: 'call_yTnDw3xY3KH3pkvDvccCizn1',
            content: 'Why did the dogs cross the road?',
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'tellAFunnyJoke',
              parameters: {
                type: 'object',
                properties: { topic: { type: 'string' } },
                required: ['topic'],
                additionalProperties: false,
                $schema: 'http://json-schema.org/draft-07/schema#',
              },
            },
          },
        ],
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
      },
    },
  ];
  for (const test of testCases) {
    it(test.should, () => {
      const actualOutput = toOpenAiRequestBody(
        test.modelName,
        test.genkitRequest as GenerateRequest,
      );
      assert.deepStrictEqual(actualOutput, test.expectedOutput);
    });
  }

  it('(gpt4) does NOT set response_format in openai request body', () => {
    // In either case - output.format='json' or output.format='text' - do NOT set response_format in the OpenAI request body explicitly.
    const modelName = 'gpt-4';
    const genkitRequestTextFormat = {
      messages: [
        { role: 'user', content: [{ text: 'Tell a joke about dogs.' }] },
        {
          role: 'model',
          content: [
            {
              toolRequest: {
                ref: 'call_yTnDw3xY3KH3pkvDvccCizn1',
                name: 'tellAFunnyJoke',
                input: { topic: 'dogs' },
              },
            },
          ],
        },
        {
          role: 'tool',
          content: [
            {
              toolResponse: {
                ref: 'call_yTnDw3xY3KH3pkvDvccCizn1',
                name: 'tellAFunnyJoke',
                output: 'Why did the dogs cross the road?',
              },
            },
          ],
        },
      ],
      tools: [
        {
          name: 'tellAFunnyJoke',
          description:
            'Tells jokes about an input topic. Use this tool whenever user asks you to tell a joke.',
          inputSchema: {
            type: 'object',
            properties: { topic: { type: 'string' } },
            required: ['topic'],
            additionalProperties: false,
            $schema: 'http://json-schema.org/draft-07/schema#',
          },
          outputSchema: {
            type: 'string',
            $schema: 'http://json-schema.org/draft-07/schema#',
          },
        },
      ],
      output: { format: 'text' },
    };
    const genkitRequestJsonFormat = {
      messages: [
        { role: 'user', content: [{ text: 'Tell a joke about dogs.' }] },
        {
          role: 'model',
          content: [
            {
              toolRequest: {
                ref: 'call_yTnDw3xY3KH3pkvDvccCizn1',
                name: 'tellAFunnyJoke',
                input: { topic: 'dogs' },
              },
            },
          ],
        },
        {
          role: 'tool',
          content: [
            {
              toolResponse: {
                ref: 'call_yTnDw3xY3KH3pkvDvccCizn1',
                name: 'tellAFunnyJoke',
                output: 'Why did the dogs cross the road?',
              },
            },
          ],
        },
      ],
      tools: [
        {
          name: 'tellAFunnyJoke',
          description:
            'Tells jokes about an input topic. Use this tool whenever user asks you to tell a joke.',
          inputSchema: {
            type: 'object',
            properties: { topic: { type: 'string' } },
            required: ['topic'],
            additionalProperties: false,
            $schema: 'http://json-schema.org/draft-07/schema#',
          },
          outputSchema: {
            type: 'string',
            $schema: 'http://json-schema.org/draft-07/schema#',
          },
        },
      ],
      output: { format: 'json' },
    };
    const expectedOutput = {
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: 'Tell a joke about dogs.' }],
        },
        {
          role: 'assistant',
          tool_calls: [
            {
              id: 'call_yTnDw3xY3KH3pkvDvccCizn1',
              type: 'function',
              function: {
                name: 'tellAFunnyJoke',
                arguments: '{"topic":"dogs"}',
              },
            },
          ],
        },
        {
          role: 'tool',
          tool_call_id: 'call_yTnDw3xY3KH3pkvDvccCizn1',
          content: 'Why did the dogs cross the road?',
        },
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'tellAFunnyJoke',
            parameters: {
              type: 'object',
              properties: { topic: { type: 'string' } },
              required: ['topic'],
              additionalProperties: false,
              $schema: 'http://json-schema.org/draft-07/schema#',
            },
          },
        },
      ],
      model: 'gpt-4',
    };
    const actualOutput1 = toOpenAiRequestBody(
      modelName,
      genkitRequestTextFormat as GenerateRequest,
    );
    const actualOutput2 = toOpenAiRequestBody(
      modelName,
      genkitRequestJsonFormat as GenerateRequest,
    );
    assert.deepStrictEqual(actualOutput1, expectedOutput);
    assert.deepStrictEqual(actualOutput2, expectedOutput);
  });
  it('(gpt4-vision) does NOT set response_format in openai request body', () => {
    // In either case - output.format='json' or output.format='text' - do NOT set response_format in the OpenAI request body explicitly.
    const modelName = 'gpt-4-vision';
    const genkitRequestTextFormat = {
      messages: [
        { role: 'user', content: [{ text: 'Tell a joke about dogs.' }] },
        {
          role: 'model',
          content: [
            {
              toolRequest: {
                ref: 'call_yTnDw3xY3KH3pkvDvccCizn1',
                name: 'tellAFunnyJoke',
                input: { topic: 'dogs' },
              },
            },
          ],
        },
        {
          role: 'tool',
          content: [
            {
              toolResponse: {
                ref: 'call_yTnDw3xY3KH3pkvDvccCizn1',
                name: 'tellAFunnyJoke',
                output: 'Why did the dogs cross the road?',
              },
            },
          ],
        },
      ],
      tools: [
        {
          name: 'tellAFunnyJoke',
          description:
            'Tells jokes about an input topic. Use this tool whenever user asks you to tell a joke.',
          inputSchema: {
            type: 'object',
            properties: { topic: { type: 'string' } },
            required: ['topic'],
            additionalProperties: false,
            $schema: 'http://json-schema.org/draft-07/schema#',
          },
          outputSchema: {
            type: 'string',
            $schema: 'http://json-schema.org/draft-07/schema#',
          },
        },
      ],
      output: { format: 'text' },
    };
    const genkitRequestJsonFormat = {
      messages: [
        { role: 'user', content: [{ text: 'Tell a joke about dogs.' }] },
        {
          role: 'model',
          content: [
            {
              toolRequest: {
                ref: 'call_yTnDw3xY3KH3pkvDvccCizn1',
                name: 'tellAFunnyJoke',
                input: { topic: 'dogs' },
              },
            },
          ],
        },
        {
          role: 'tool',
          content: [
            {
              toolResponse: {
                ref: 'call_yTnDw3xY3KH3pkvDvccCizn1',
                name: 'tellAFunnyJoke',
                output: 'Why did the dogs cross the road?',
              },
            },
          ],
        },
      ],
      tools: [
        {
          name: 'tellAFunnyJoke',
          description:
            'Tells jokes about an input topic. Use this tool whenever user asks you to tell a joke.',
          inputSchema: {
            type: 'object',
            properties: { topic: { type: 'string' } },
            required: ['topic'],
            additionalProperties: false,
            $schema: 'http://json-schema.org/draft-07/schema#',
          },
          outputSchema: {
            type: 'string',
            $schema: 'http://json-schema.org/draft-07/schema#',
          },
        },
      ],
      output: { format: 'json' },
    };
    const expectedOutput = {
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: 'Tell a joke about dogs.' }],
        },
        {
          role: 'assistant',
          tool_calls: [
            {
              id: 'call_yTnDw3xY3KH3pkvDvccCizn1',
              type: 'function',
              function: {
                name: 'tellAFunnyJoke',
                arguments: '{"topic":"dogs"}',
              },
            },
          ],
        },
        {
          role: 'tool',
          tool_call_id: 'call_yTnDw3xY3KH3pkvDvccCizn1',
          content: 'Why did the dogs cross the road?',
        },
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'tellAFunnyJoke',
            parameters: {
              type: 'object',
              properties: { topic: { type: 'string' } },
              required: ['topic'],
              additionalProperties: false,
              $schema: 'http://json-schema.org/draft-07/schema#',
            },
          },
        },
      ],
      model: 'gpt-4-vision',
    };
    const actualOutput1 = toOpenAiRequestBody(
      modelName,
      genkitRequestTextFormat as GenerateRequest,
    );
    const actualOutput2 = toOpenAiRequestBody(
      modelName,
      genkitRequestJsonFormat as GenerateRequest,
    );
    assert.deepStrictEqual(actualOutput1, expectedOutput);
    assert.deepStrictEqual(actualOutput2, expectedOutput);
  });
});
