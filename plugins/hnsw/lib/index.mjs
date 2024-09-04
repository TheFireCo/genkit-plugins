import { genkitPlugin } from "@genkit-ai/core";
import { defineFlow } from "@genkit-ai/flow";
import { hnswIndexerAction, hnswRetrieverAction } from "./actions";
import { indexerFlowConfig, retrieverflowConfig } from "./config";
import { checkApiKey } from "./utilities";
import { PLUGIN_NAME_INDEXER, PLUGIN_NAME_RETRIEVER } from "./constants";
const hnswIndexer = genkitPlugin(
  PLUGIN_NAME_INDEXER,
  async (pluginOptions) => {
    checkApiKey(pluginOptions);
    defineFlow(
      indexerFlowConfig,
      (flowOptions) => hnswIndexerAction(flowOptions, pluginOptions)
    );
  }
);
const hnswRetriever = genkitPlugin(
  PLUGIN_NAME_RETRIEVER,
  async (pluginOptions) => {
    checkApiKey(pluginOptions);
    defineFlow(
      retrieverflowConfig,
      (flowOptions) => hnswRetrieverAction(flowOptions, pluginOptions)
    );
  }
);
export {
  hnswIndexer,
  hnswRetriever
};
//# sourceMappingURL=index.mjs.map