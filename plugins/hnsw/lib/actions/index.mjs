import { saveVectorIndexer } from "./../indexer";
import { retrieveResponseWithVector } from "./../retriever";
const hnswIndexerAction = async (flowOptions, pluginOptions) => {
  try {
    return await saveVectorIndexer(flowOptions, pluginOptions);
  } catch (error) {
    return `Vector index saving error, ${error}`;
  }
};
const hnswRetrieverAction = async (flowOptions, pluginOptions) => {
  try {
    return await retrieveResponseWithVector(flowOptions, pluginOptions);
  } catch (error) {
    return `Error generating prompt response, ${error}`;
  }
};
export {
  hnswIndexerAction,
  hnswRetrieverAction
};
//# sourceMappingURL=index.mjs.map