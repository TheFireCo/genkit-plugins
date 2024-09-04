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
var retriever_exports = {};
__export(retriever_exports, {
  retrieveResponseWithVector: () => retrieveResponseWithVector
});
module.exports = __toCommonJS(retriever_exports);
var import_google_genai = require("@langchain/google-genai");
var import_vectorstores = require("langchain/vectorstores");
var import_ai = require("@genkit-ai/ai");
var import_googleai = require("@genkit-ai/googleai");
const generateHistories = (contexts) => {
  const histories = [];
  contexts.forEach((context) => {
    histories.push({
      role: "user",
      content: [{ text: context }]
    });
    histories.push({
      role: "model",
      content: [{ text: "Understood" }]
    });
  });
  return histories;
};
const initializeStore = async (vectorStorePath, apiKey) => {
  const store = await import_vectorstores.HNSWLib.load(
    vectorStorePath,
    new import_google_genai.GoogleGenerativeAIEmbeddings({
      apiKey
    })
  );
  return store;
};
const getContextBasedOnPrompt = async (store, prompt) => {
  const data = await store.similaritySearch(prompt, 1);
  const context = [];
  data.forEach((item, i) => {
    context.push(`${item.pageContent}`);
  });
  return context;
};
const retrieveResponseWithVector = async (flowOptions, pluginOptions) => {
  const {
    prompt,
    indexPath,
    temperature,
    maxOutputTokens,
    topK,
    topP,
    stopSequences
  } = flowOptions;
  const { apiKey } = pluginOptions;
  const store = await initializeStore(indexPath, apiKey);
  const context = await getContextBasedOnPrompt(store, prompt);
  const histories = generateHistories(context);
  const retrievalConfig = {
    temperature: temperature || 0.1,
    maxOutputTokens: maxOutputTokens || 500,
    topK: topK || 1,
    topP: topP || 0,
    stopSequences: stopSequences || []
  };
  const promptResult = await (0, import_ai.generate)({
    history: histories,
    prompt,
    model: import_googleai.geminiPro,
    config: retrievalConfig
  });
  return promptResult.text();
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  retrieveResponseWithVector
});
//# sourceMappingURL=index.js.map