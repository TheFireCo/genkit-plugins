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
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
var embedder_exports = {};
__export(embedder_exports, {
  SUPPORTED_EMBEDDING_MODELS: () => SUPPORTED_EMBEDDING_MODELS,
  TextEmbeddingConfigSchema: () => TextEmbeddingConfigSchema,
  TextEmbeddingInputSchema: () => TextEmbeddingInputSchema,
  openaiEmbedder: () => openaiEmbedder,
  textEmbedding3Large: () => textEmbedding3Large,
  textEmbedding3Small: () => textEmbedding3Small,
  textEmbeddingAda002: () => textEmbeddingAda002
});
module.exports = __toCommonJS(embedder_exports);
var import_embedder = require("@genkit-ai/ai/embedder");
var import_openai = __toESM(require("openai"));
var import_zod = require("zod");
const TextEmbeddingConfigSchema = import_zod.z.object({
  dimensions: import_zod.z.number().optional(),
  encodingFormat: import_zod.z.union([import_zod.z.literal("float"), import_zod.z.literal("base64")]).optional()
});
const TextEmbeddingInputSchema = import_zod.z.string();
const textEmbedding3Small = (0, import_embedder.embedderRef)({
  name: "openai/text-embedding-3-small",
  configSchema: TextEmbeddingConfigSchema,
  info: {
    dimensions: 1536,
    label: "Open AI - Text Embedding 3 Small",
    supports: {
      input: ["text"]
    }
  }
});
const textEmbedding3Large = (0, import_embedder.embedderRef)({
  name: "openai/text-embedding-3-large",
  configSchema: TextEmbeddingConfigSchema,
  info: {
    dimensions: 3072,
    label: "Open AI - Text Embedding 3 Large",
    supports: {
      input: ["text"]
    }
  }
});
const textEmbeddingAda002 = (0, import_embedder.embedderRef)({
  name: "openai/text-embedding-ada-002",
  configSchema: TextEmbeddingConfigSchema,
  info: {
    dimensions: 1536,
    label: "Open AI - Text Embedding ADA 002",
    supports: {
      input: ["text"]
    }
  }
});
const SUPPORTED_EMBEDDING_MODELS = {
  "text-embedding-3-small": textEmbedding3Small,
  "text-embedding-3-large": textEmbedding3Large,
  "text-embedding-ada-002": textEmbeddingAda002
};
function openaiEmbedder(name, options) {
  let apiKey = (options == null ? void 0 : options.apiKey) || process.env.OPENAI_API_KEY;
  if (!apiKey)
    throw new Error(
      "please pass in the API key or set the OPENAI_API_KEY environment variable"
    );
  const model = SUPPORTED_EMBEDDING_MODELS[name];
  if (!model)
    throw new Error(`Unsupported model: ${name}`);
  const client = new import_openai.default({ apiKey });
  return (0, import_embedder.defineEmbedder)(
    {
      info: model.info,
      configSchema: TextEmbeddingConfigSchema,
      name: model.name
    },
    (input, options2) => __async(this, null, function* () {
      const embeddings = yield client.embeddings.create({
        model: name,
        input: input.map((d) => d.text()),
        dimensions: options2 == null ? void 0 : options2.dimensions,
        encoding_format: options2 == null ? void 0 : options2.encodingFormat
      });
      return {
        embeddings: embeddings.data.map((d) => ({ embedding: d.embedding }))
      };
    })
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SUPPORTED_EMBEDDING_MODELS,
  TextEmbeddingConfigSchema,
  TextEmbeddingInputSchema,
  openaiEmbedder,
  textEmbedding3Large,
  textEmbedding3Small,
  textEmbeddingAda002
});
//# sourceMappingURL=embedder.js.map