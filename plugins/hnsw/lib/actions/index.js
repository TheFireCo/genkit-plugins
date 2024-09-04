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
var actions_exports = {};
__export(actions_exports, {
  hnswIndexerAction: () => hnswIndexerAction,
  hnswRetrieverAction: () => hnswRetrieverAction
});
module.exports = __toCommonJS(actions_exports);
var import_indexer = require("./../indexer");
var import_retriever = require("./../retriever");
const hnswIndexerAction = async (flowOptions, pluginOptions) => {
  try {
    return await (0, import_indexer.saveVectorIndexer)(flowOptions, pluginOptions);
  } catch (error) {
    return `Vector index saving error, ${error}`;
  }
};
const hnswRetrieverAction = async (flowOptions, pluginOptions) => {
  try {
    return await (0, import_retriever.retrieveResponseWithVector)(flowOptions, pluginOptions);
  } catch (error) {
    return `Error generating prompt response, ${error}`;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  hnswIndexerAction,
  hnswRetrieverAction
});
//# sourceMappingURL=index.js.map