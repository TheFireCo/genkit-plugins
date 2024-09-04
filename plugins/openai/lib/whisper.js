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
var whisper_exports = {};
__export(whisper_exports, {
  Whisper1ConfigSchema: () => Whisper1ConfigSchema,
  whisper1: () => whisper1,
  whisper1Model: () => whisper1Model
});
module.exports = __toCommonJS(whisper_exports);
var import_ai = require("@genkit-ai/ai");
var import_model = require("@genkit-ai/ai/model");
var import_zod = require("zod");
const Whisper1ConfigSchema = import_model.GenerationCommonConfigSchema.extend({
  language: import_zod.z.string().optional(),
  timestamp_granularities: import_zod.z.array(import_zod.z.enum(["word", "segment"])).optional(),
  response_format: import_zod.z.enum(["json", "text", "srt", "verbose_json", "vtt"]).optional()
});
const whisper1 = (0, import_model.modelRef)({
  name: "openai/whisper-1",
  info: {
    label: "OpenAI - Whisper",
    supports: {
      media: true,
      output: ["text", "json"],
      multiturn: false,
      systemRole: false,
      tools: false
    }
  },
  configSchema: Whisper1ConfigSchema
});
function toWhisper1Request(request) {
  var _a, _b, _c, _d, _e, _f;
  const message = new import_ai.Message(request.messages[0]);
  const media = message.media();
  if (!(media == null ? void 0 : media.url)) {
    throw new Error("No media found in the request");
  }
  const mediaBuffer = Buffer.from(
    media.url.slice(media.url.indexOf(",") + 1),
    "base64"
  );
  const mediaFile = new File([mediaBuffer], "input", {
    type: (_a = media.contentType) != null ? _a : media.url.slice("data:".length, media.url.indexOf(";"))
  });
  const options = {
    model: "whisper-1",
    file: mediaFile,
    prompt: message.text(),
    temperature: (_b = request.config) == null ? void 0 : _b.temperature,
    language: (_c = request.config) == null ? void 0 : _c.language,
    timestamp_granularities: (_d = request.config) == null ? void 0 : _d.timestamp_granularities
  };
  const outputFormat = (_e = request.output) == null ? void 0 : _e.format;
  const customFormat = (_f = request.config) == null ? void 0 : _f.response_format;
  if (outputFormat && customFormat) {
    if (outputFormat === "json" && customFormat !== "json" && customFormat !== "verbose_json") {
      throw new Error(
        `Custom response format ${customFormat} is not compatible with output format ${outputFormat}`
      );
    }
  }
  if (outputFormat === "media") {
    throw new Error(`Output format ${outputFormat} is not supported.`);
  }
  options.response_format = customFormat || outputFormat || "text";
  for (const k in options) {
    if (options[k] === void 0) {
      delete options[k];
    }
  }
  return options;
}
function toGenerateResponse(result) {
  return {
    candidates: [
      {
        index: 0,
        finishReason: "stop",
        message: {
          role: "model",
          content: [
            {
              text: typeof result === "string" ? result : result.text
            }
          ]
        }
      }
    ]
  };
}
function whisper1Model(client) {
  return (0, import_model.defineModel)(
    __spreadProps(__spreadValues({
      name: whisper1.name
    }, whisper1.info), {
      configSchema: whisper1.configSchema
    }),
    (request) => __async(this, null, function* () {
      const result = yield client.audio.transcriptions.create(
        toWhisper1Request(request)
      );
      return toGenerateResponse(result);
    })
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Whisper1ConfigSchema,
  whisper1,
  whisper1Model
});
//# sourceMappingURL=whisper.js.map