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
var src_exports = {};
__export(src_exports, {
  dallE3: () => import_dalle.dallE3,
  default: () => src_default,
  gpt35Turbo: () => import_gpt.gpt35Turbo,
  gpt4: () => import_gpt.gpt4,
  gpt4Turbo: () => import_gpt.gpt4Turbo,
  gpt4Vision: () => import_gpt.gpt4Vision,
  gpt4o: () => import_gpt.gpt4o,
  gpt4oMini: () => import_gpt.gpt4oMini,
  openAI: () => openAI,
  textEmbedding3Large: () => import_embedder.textEmbedding3Large,
  textEmbedding3Small: () => import_embedder.textEmbedding3Small,
  textEmbeddingAda002: () => import_embedder.textEmbeddingAda002,
  tts1: () => import_tts.tts1,
  tts1Hd: () => import_tts.tts1Hd,
  whisper1: () => import_whisper.whisper1
});
module.exports = __toCommonJS(src_exports);
var import_core = require("@genkit-ai/core");
var import_openai = __toESM(require("openai"));
var import_dalle = require("./dalle.js");
var import_embedder = require("./embedder.js");
var import_gpt = require("./gpt.js");
var import_tts = require("./tts.js");
var import_whisper = require("./whisper.js");
const openAI = (0, import_core.genkitPlugin)(
  "openai",
  (options) => __async(void 0, null, function* () {
    let apiKey = (options == null ? void 0 : options.apiKey) || process.env.OPENAI_API_KEY;
    if (!apiKey)
      throw new Error(
        "please pass in the API key or set the OPENAI_API_KEY environment variable"
      );
    const client = new import_openai.default({ apiKey });
    return {
      models: [
        ...Object.keys(import_gpt.SUPPORTED_GPT_MODELS).map(
          (name) => (0, import_gpt.gptModel)(name, client)
        ),
        ...Object.keys(import_tts.SUPPORTED_TTS_MODELS).map(
          (name) => (0, import_tts.ttsModel)(name, client)
        ),
        (0, import_dalle.dallE3Model)(client),
        (0, import_whisper.whisper1Model)(client)
      ],
      embedders: Object.keys(import_embedder.SUPPORTED_EMBEDDING_MODELS).map(
        (name) => (0, import_embedder.openaiEmbedder)(name, options)
      )
    };
  })
);
var src_default = openAI;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  dallE3,
  gpt35Turbo,
  gpt4,
  gpt4Turbo,
  gpt4Vision,
  gpt4o,
  gpt4oMini,
  openAI,
  textEmbedding3Large,
  textEmbedding3Small,
  textEmbeddingAda002,
  tts1,
  tts1Hd,
  whisper1
});
//# sourceMappingURL=index.js.map