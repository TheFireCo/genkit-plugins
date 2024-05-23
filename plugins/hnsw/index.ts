import { genkitPlugin } from "@genkit-ai/core";
import { defineFlow } from "@genkit-ai/flow";

import { PluginOptions } from "./interfaces";
import { hnswIndexerAction, hnswRetrieverAction } from "./actions";
import { indexerFlowConfig, retrieverflowConfig } from "./config";
import { checkApiKey } from "./utilities";
import { PLUGIN_NAME_INDEXER, PLUGIN_NAME_RETRIEVER } from "./constants";

export const hnswIndexer = genkitPlugin(
  PLUGIN_NAME_INDEXER,
  async (pluginOptions: PluginOptions) => {
    checkApiKey(pluginOptions);
    defineFlow(indexerFlowConfig, (flowOptions) =>
      hnswIndexerAction(flowOptions, pluginOptions)
    );
  }
);

export const hnswRetriever = genkitPlugin(
  PLUGIN_NAME_RETRIEVER,
  async (pluginOptions: PluginOptions) => {
    checkApiKey(pluginOptions);
    defineFlow(retrieverflowConfig, (flowOptions) =>
      hnswRetrieverAction(flowOptions, pluginOptions)
    );
  }
);
