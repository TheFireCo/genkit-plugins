const { saveVectorIndexer } = require('../indexer');

jest.mock("../indexer", () => ({
  saveVectorIndexer: jest.fn(),
}));

describe("checkApiKey on HNSW Indexer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should successfully save vector indexer data when provided valid options", async () => {
    const mockFlowOptions = {
      dataPath: "valid/path",
      indexOutputPath: "output/path",
    };
    const mockPluginOptions = { apiKey: "valid-api-key" };
    saveVectorIndexer.mockResolvedValue("Indexing completed");
    const { hnswIndexerAction } = require("./index");
    const result = await hnswIndexerAction(mockFlowOptions, mockPluginOptions);
    expect(saveVectorIndexer).toHaveBeenCalledWith(
      mockFlowOptions,
      mockPluginOptions
    );
    expect(result).toEqual("Indexing completed");
  });

  it("should handle errors when dataPath is missing or invalid", async () => {
    const mockFlowOptions = { dataPath: "", indexOutputPath: "output/path" };
    const mockPluginOptions = { apiKey: "valid-api-key" };
    const error = new Error("Invalid data path");
    saveVectorIndexer.mockRejectedValue(error);
    const { hnswIndexerAction } = require("./index");
    const result = await hnswIndexerAction(mockFlowOptions, mockPluginOptions);
    expect(saveVectorIndexer).toHaveBeenCalledWith(
      mockFlowOptions,
      mockPluginOptions
    );
    expect(result).toEqual(`Vector index saving error, ${error}`);
  });
});
