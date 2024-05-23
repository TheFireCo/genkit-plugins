// retrieveResponseWithVector.test.js
const { HNSWLib } = require('langchain/vectorstores');
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
const { generate } = require('@genkit-ai/ai');
const { retrieveResponseWithVector } = require('./index'); // Adjust the path as necessary

jest.mock('langchain/vectorstores');
jest.mock('@langchain/google-genai');
jest.mock('@genkit-ai/ai');

describe('retrieveResponseWithVector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should retrieve a response based on vector similarity search', async () => {
    const mockPrompt = 'test prompt';
    const mockIndexPath = 'index/path';
    const mockApiKey = 'test-api-key';
    const mockFlowOptions = {
      prompt: mockPrompt,
      indexPath: mockIndexPath,
      temperature: 0.2,
      maxOutputTokens: 100,
      topK: 5,
      topP: 0.9,
      stopSequences: ['.']
    };
    const mockPluginOptions = { apiKey: mockApiKey };
    const mockContext = ['context1', 'context2'];
    const mockHistories = [
      { role: 'user', content: [{ text: 'context1' }] },
      { role: 'model', content: [{ text: 'Understood' }] },
      { role: 'user', content: [{ text: 'context2' }] },
      { role: 'model', content: [{ text: 'Understood' }] },
    ];
    const mockPromptResult = { text: jest.fn().mockReturnValue('mock response') };

    const mockStore = {
      similaritySearch: jest.fn().mockResolvedValue(mockContext.map(c => ({ pageContent: c }))),
    };

    HNSWLib.load.mockResolvedValue(mockStore);
    generate.mockResolvedValue(mockPromptResult);

    const result = await retrieveResponseWithVector(mockFlowOptions, mockPluginOptions);

    expect(HNSWLib.load).toHaveBeenCalledWith(mockIndexPath, expect.any(GoogleGenerativeAIEmbeddings));
    expect(mockStore.similaritySearch).toHaveBeenCalledWith(mockPrompt, 1);
    expect(generate).toHaveBeenCalledWith({
      history: mockHistories,
      prompt: mockPrompt,
      model: expect.anything(), // geminiProModel isn't actually used in the test, so we use anything()
      config: {
        temperature: 0.2,
        maxOutputTokens: 100,
        topK: 5,
        topP: 0.9,
        stopSequences: ['.'],
      }
    });
    expect(result).toBe('mock response');
  });
});
