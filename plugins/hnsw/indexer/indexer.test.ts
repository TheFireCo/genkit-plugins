export {}
// saveVectorIndexer.test.js
const fs = require('fs');
const glob = require('glob');
const { CharacterTextSplitter } = require('langchain/text_splitter');
const { HNSWLib } = require('langchain/vectorstores');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');

const { saveVectorIndexer } = require('./index'); // Adjust the path as necessary

jest.mock('fs');
jest.mock('glob');
jest.mock('langchain/text_splitter');
jest.mock('langchain/vectorstores');
jest.mock('@langchain/google-genai');

describe('saveVectorIndexer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process files and save the vector store', async () => {
    const mockFiles = ['file1.txt', 'file2.txt'];
    const mockFileData = ['content of file1', 'content of file2'];
    const mockChunks = ['chunk1', 'chunk2', 'chunk3', 'chunk4'];
    const mockApiKey = 'test-api-key';
    const mockOutputPath = 'output/path';
    const mockFlowOptions = {
      dataPath: 'some/path',
      indexOutputPath: mockOutputPath,
      chunkSize: 1024,
      separator: '\n'
    };
    const mockPluginOptions = { apiKey: mockApiKey };

    glob.mockImplementation((_pattern: any, callback: (arg0: null, arg1: string[]) => void) => {
      callback(null, mockFiles);
    });

    fs.readFileSync.mockImplementation((path: string) => {
      return mockFileData[mockFiles.indexOf(path)];
    });

    CharacterTextSplitter.mockImplementation(() => {
      return {
        splitText: jest.fn().mockImplementation((text) => {
          return [text]; // Simple mock, return the text as single chunk
        })
      };
    });

    HNSWLib.fromTexts = jest.fn().mockResolvedValue({
        save: jest.fn()
      });

    const result = await saveVectorIndexer(mockFlowOptions, mockPluginOptions);

    expect(glob).toHaveBeenCalledWith(mockFlowOptions.dataPath, expect.any(Function));
    expect(fs.readFileSync).toHaveBeenCalledTimes(mockFiles.length);
    expect(CharacterTextSplitter).toHaveBeenCalledWith({
      chunkSize: mockFlowOptions.chunkSize,
      separator: mockFlowOptions.separator
    });
    expect(HNSWLib.fromTexts).toHaveBeenCalledWith(
      expect.arrayContaining(mockFileData),
      expect.arrayContaining(mockFileData.map((_, i) => ({ id: i }))),
      expect.any(GoogleGenerativeAIEmbeddings)
    );
    expect(result).toBe(`VectorStore saved to ${mockOutputPath}`);
  });
});
