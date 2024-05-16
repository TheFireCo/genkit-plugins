import { GenerateRequest, MessageData } from '@genkit-ai/ai/model';
import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  fromAnthropicContentBlock,
  fromAnthropicContentBlockChunk,
  toAnthropicMessages,
  toAnthropicRequestBody,
} from '../src/claude.ts';
import {
  ContentBlockStartEvent,
  TextBlock,
} from '@anthropic-ai/sdk/resources/messages';

describe('toAnthropicMessages', () => {
  it('should correctly convert simple text messages', () => {
    const inputMessages: MessageData[] = [
      { role: 'user', content: [{ text: 'Hello' }] },
      { role: 'model', content: [{ text: 'Welcome!' }] },
    ];
    const expected = {
      messages: [
        { role: 'user', content: [{ type: 'text', text: 'Hello' }] },
        { role: 'assistant', content: 'Welcome!' },
      ],
      system: undefined,
    };
    const result = toAnthropicMessages(inputMessages);
    assert.deepStrictEqual(result, expected);
  });

  it('should handle system messages and convert subsequent user message', () => {
    const inputMessages: MessageData[] = [
      { role: 'system', content: [{ text: 'System initialization' }] },
      { role: 'user', content: [{ text: 'System test' }] },
    ];
    const expected = {
      messages: [
        { role: 'user', content: [{ type: 'text', text: 'System test' }] },
      ],
      system: 'System initialization',
    };
    const result = toAnthropicMessages(inputMessages);
    assert.deepStrictEqual(result, expected);
  });
});

describe('toAnthropicRequestBody', () => {
  it('should create a valid request body for a simple text message', () => {
    const modelName = 'claude-3-haiku';
    const genkitRequest: GenerateRequest = {
      messages: [{ role: 'user', content: [{ text: 'What is AI?' }] }],
      output: { format: 'text' },
    };
    const expected = {
      max_tokens: 4096,
      messages: [
        { role: 'user', content: [{ type: 'text', text: 'What is AI?' }] },
      ],
      model: 'claude-3-haiku-20240307',
    };
    const result = toAnthropicRequestBody(modelName, genkitRequest);
    assert.deepStrictEqual(result, expected);
  });

  it('should handle custom configuration and metadata', () => {
    const modelName = 'claude-3-opus';
    const genkitRequest: GenerateRequest = {
      messages: [
        { role: 'user', content: [{ text: 'Explain quantum computing.' }] },
      ],
      output: { format: 'text' },
      config: {
        maxOutputTokens: 500,
        custom: { metadata: { user_id: 'user123' } },
      },
    };
    const expected = {
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: 'Explain quantum computing.' }],
        },
      ],
      model: 'claude-3-opus-20240229',
      metadata: { user_id: 'user123' },
    };
    const result = toAnthropicRequestBody(modelName, genkitRequest);
    assert.deepStrictEqual(result, expected);
  });
});

it('should handle streaming requests correctly', () => {
  const modelName = 'claude-3-sonnet';
  const genkitRequest: GenerateRequest = {
    messages: [{ role: 'user', content: [{ text: 'Narrate a story.' }] }],
    output: { format: 'text' },
    config: {
      maxOutputTokens: 1000,
    },
  };
  const expected = {
    max_tokens: 1000,
    messages: [
      { role: 'user', content: [{ type: 'text', text: 'Narrate a story.' }] },
    ],
    model: 'claude-3-sonnet-20240229',
    stream: true,
  };
  const result = toAnthropicRequestBody(modelName, genkitRequest, true);
  assert.deepStrictEqual(result, expected);
});

it('should throw an error for unsupported model names', () => {
  const modelName = 'claude-3-unknown';
  const genkitRequest: GenerateRequest = {
    messages: [{ role: 'user', content: [{ text: 'Hello' }] }],
    output: { format: 'text' },
  };
  assert.throws(() => {
    toAnthropicRequestBody(modelName, genkitRequest);
  }, new Error('Unsupported model: claude-3-unknown'));
});

describe('fromAnthropicContentBlock', () => {
  it('should convert content blocks to candidate data correctly', () => {
    const contentBlock = {
      text: 'Sample response text',
      type: 'text',
    } as TextBlock;
    const expected = {
      finishReason: 'stop',
      index: 0,
      message: {
        role: 'model',
        content: [{ text: 'Sample response text' }],
      },
    };
    const result = fromAnthropicContentBlock(contentBlock, 0, 'end_turn');
    assert.deepStrictEqual(result, expected);
  });

  it('should handle undefined stop reasons', () => {
    const contentBlock = {
      text: 'Another sample text',
      type: 'text',
    } as TextBlock;
    const expected = {
      finishReason: 'other',
      index: 1,
      message: {
        role: 'model',
        content: [{ text: 'Another sample text' }],
      },
    };
    const stopReason = undefined;
    const result = fromAnthropicContentBlock(
      contentBlock,
      1,
      stopReason as any
    );
    assert.deepStrictEqual(result, expected);
  });
});

describe('fromAnthropicContentBlockChunk', () => {
  it('should convert content block start events to candidate data', () => {
    const event: ContentBlockStartEvent = {
      type: 'content_block_start',
      index: 0,
      content_block: { text: 'Start of content block', type: 'text' },
    };
    const expected = {
      finishReason: 'unknown',
      index: 0,
      message: {
        role: 'model',
        content: [{ text: 'Start of content block' }],
      },
    };
    const result = fromAnthropicContentBlockChunk(event);
    assert.deepStrictEqual(result, expected);
  });

  it('should return undefined for non-content block events', () => {
    const event = {
      type: 'non_content_event',
      index: 0,
      content_block: { text: 'Should not process' },
    };
    const result = fromAnthropicContentBlockChunk(event as any);
    assert.strictEqual(result, undefined);
  });
});
