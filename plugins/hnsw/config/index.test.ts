// Verify that indexerFlowConfig correctly uses FLOW_NAME_INDEXER for its name
it("should use HNSW Indexer as the name for indexerFlowConfig", () => {
  const { indexerFlowConfig } = require("./index.ts");
  expect(indexerFlowConfig.name).toEqual("HNSW Indexer");
});

it("should use HNSW Retriever as the name for retrieverflowConfig", () => {
  const { retrieverflowConfig } = require("./index.ts");
  expect(retrieverflowConfig.name).toEqual("HNSW Retriever");
});
