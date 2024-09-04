"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var src_exports = {};
__export(src_exports, {
  hnswIndexer: () => hnswIndexer,
  hnswRetriever: () => hnswRetriever
});
module.exports = __toCommonJS(src_exports);
var import_core = require("@genkit-ai/core");
var import_flow = require("@genkit-ai/flow");
var import_actions = require("./actions");
var import_config = require("./config");
var import_utilities = require("./utilities");
var import_constants = require("./constants");
const hnswIndexer = (0, import_core.genkitPlugin)(
  import_constants.PLUGIN_NAME_INDEXER,
  async (pluginOptions) => {
    (0, import_utilities.checkApiKey)(pluginOptions);
    (0, import_flow.defineFlow)(
      import_config.indexerFlowConfig,
      (flowOptions) => (0, import_actions.hnswIndexerAction)(flowOptions, pluginOptions)
    );
  }
);
const hnswRetriever = (0, import_core.genkitPlugin)(
  import_constants.PLUGIN_NAME_RETRIEVER,
  async (pluginOptions) => {
    (0, import_utilities.checkApiKey)(pluginOptions);
    (0, import_flow.defineFlow)(
      import_config.retrieverflowConfig,
      (flowOptions) => (0, import_actions.hnswRetrieverAction)(flowOptions, pluginOptions)
    );
  }
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  hnswIndexer,
  hnswRetriever
});
//# sourceMappingURL=index.js.map