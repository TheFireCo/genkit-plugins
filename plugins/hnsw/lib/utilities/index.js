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
var utilities_exports = {};
__export(utilities_exports, {
  checkApiKey: () => checkApiKey,
  throwError: () => throwError
});
module.exports = __toCommonJS(utilities_exports);
var import_core = require("@genkit-ai/core");
var import_constants = require("../constants");
const throwError = (status, message) => {
  throw new import_core.GenkitError({
    status,
    message
  });
};
const checkApiKey = (pluginOptions) => {
  const { apiKey } = pluginOptions;
  if (!apiKey)
    return throwError(import_constants.ERROR_INVALID_ARGUMENT, import_constants.ERROR_NO_API_KEY);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  checkApiKey,
  throwError
});
//# sourceMappingURL=index.js.map