"use strict";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
var tts_exports = {};
__export(tts_exports, {
  RESPONSE_FORMAT_MEDIA_TYPES: () => RESPONSE_FORMAT_MEDIA_TYPES,
  SUPPORTED_TTS_MODELS: () => SUPPORTED_TTS_MODELS,
  TTSConfigSchema: () => TTSConfigSchema,
  tts1: () => tts1,
  tts1Hd: () => tts1Hd,
  ttsModel: () => ttsModel
});
module.exports = __toCommonJS(tts_exports);
var import_ai = require("@genkit-ai/ai");
var import_model = require("@genkit-ai/ai/model");
var import_zod = require("zod");
const TTSConfigSchema = import_model.GenerationCommonConfigSchema.extend({
  voice: import_zod.z.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]).optional().default("alloy"),
  speed: import_zod.z.number().min(0.25).max(4).optional(),
  response_format: import_zod.z.enum(["mp3", "opus", "aac", "flac", "wav", "pcm"]).optional()
});
const tts1 = (0, import_model.modelRef)({
  name: "openai/tts-1",
  info: {
    label: "OpenAI - Text-to-speech 1",
    supports: {
      media: false,
      output: ["media"],
      multiturn: false,
      systemRole: false,
      tools: false
    }
  },
  configSchema: TTSConfigSchema
});
const tts1Hd = (0, import_model.modelRef)({
  name: "openai/tts-1-hd",
  info: {
    label: "OpenAI - Text-to-speech 1 HD",
    supports: {
      media: false,
      output: ["media"],
      multiturn: false,
      systemRole: false,
      tools: false
    }
  },
  configSchema: TTSConfigSchema
});
const SUPPORTED_TTS_MODELS = {
  "tts-1": tts1,
  "tts-1-hd": tts1Hd
};
const RESPONSE_FORMAT_MEDIA_TYPES = {
  mp3: "audio/mpeg",
  opus: "audio/opus",
  aac: "audio/aac",
  flac: "audio/flac",
  wav: "audio/wav",
  pcm: "audio/L16"
};
function toTTSRequest(modelName, request) {
  var _a, _b, _c, _d, _e;
  const mappedModelName = ((_a = request.config) == null ? void 0 : _a.version) || modelName;
  const options = {
    model: mappedModelName,
    input: new import_ai.Message(request.messages[0]).text(),
    voice: (_c = (_b = request.config) == null ? void 0 : _b.voice) != null ? _c : "alloy",
    speed: (_d = request.config) == null ? void 0 : _d.speed,
    response_format: (_e = request.config) == null ? void 0 : _e.response_format
  };
  for (const k in options) {
    if (options[k] === void 0) {
      delete options[k];
    }
  }
  return options;
}
function toGenerateResponse(result, responseFormat = "mp3") {
  const mediaType = RESPONSE_FORMAT_MEDIA_TYPES[responseFormat];
  return {
    candidates: [
      {
        index: 0,
        finishReason: "stop",
        message: {
          role: "model",
          content: [
            {
              media: {
                contentType: mediaType,
                url: `data:${mediaType};base64,${result.toString("base64")}`
              }
            }
          ]
        }
      }
    ]
  };
}
function ttsModel(name, client) {
  const modelId = `openai/${name}`;
  const model = SUPPORTED_TTS_MODELS[name];
  if (!model)
    throw new Error(`Unsupported model: ${name}`);
  return (0, import_model.defineModel)(
    __spreadProps(__spreadValues({
      name: modelId
    }, model.info), {
      configSchema: model.configSchema
    }),
    (request) => __async(this, null, function* () {
      const ttsRequest = toTTSRequest(name, request);
      const result = yield client.audio.speech.create(ttsRequest);
      const resultArrayBuffer = yield result.arrayBuffer();
      const resultBuffer = Buffer.from(new Uint8Array(resultArrayBuffer));
      return toGenerateResponse(resultBuffer, ttsRequest.response_format);
    })
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RESPONSE_FORMAT_MEDIA_TYPES,
  SUPPORTED_TTS_MODELS,
  TTSConfigSchema,
  tts1,
  tts1Hd,
  ttsModel
});
//# sourceMappingURL=tts.js.map