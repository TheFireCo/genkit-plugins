"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var config_exports = {};
__export(config_exports, {
  indexerFlowConfig: () => indexerFlowConfig,
  retrieverflowConfig: () => retrieverflowConfig
});
module.exports = __toCommonJS(config_exports);
var z = __toESM(require("zod"));
var import_constants = require("./../constants");
const indexerFlowConfig = {
  name: import_constants.FLOW_NAME_INDEXER,
  inputSchema: z.object({
    dataPath: z.string().describe(import_constants.SCHEMA_TRAINABLE_PATH),
    indexOutputPath: z.string().describe(import_constants.SCHEMA_INDEX_OUTPUT_PATH)
  }),
  outputSchema: z.string().describe(import_constants.SCHEMA_RESULT)
};
const retrieverflowConfig = {
  name: import_constants.FLOW_NAME_RETRIEVER,
  inputSchema: z.object({
    prompt: z.string().describe(import_constants.SCHEMA_PROMPT),
    indexPath: z.string().describe(import_constants.SCHEMA_INDEX_PATH)
  }),
  outputSchema: z.string().describe(import_constants.SCHEMA_RESULT)
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  indexerFlowConfig,
  retrieverflowConfig
});
//# sourceMappingURL=index.js.map