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
var dalle_exports = {};
__export(dalle_exports, {
  DallE3ConfigSchema: () => DallE3ConfigSchema,
  dallE3: () => dallE3,
  dallE3Model: () => dallE3Model
});
module.exports = __toCommonJS(dalle_exports);
var import_ai = require("@genkit-ai/ai");
var import_model = require("@genkit-ai/ai/model");
var import_zod = require("zod");
const DallE3ConfigSchema = import_model.GenerationCommonConfigSchema.extend({
  size: import_zod.z.enum(["1024x1024", "1792x1024", "1024x1792"]).optional(),
  style: import_zod.z.enum(["vivid", "natural"]).optional(),
  user: import_zod.z.string().optional(),
  quality: import_zod.z.enum(["standard", "hd"]).optional(),
  response_format: import_zod.z.enum(["b64_json", "url"]).optional()
});
const dallE3 = (0, import_model.modelRef)({
  name: "openai/dall-e-3",
  info: {
    label: "OpenAI - DALL-E 3",
    supports: {
      media: false,
      output: ["media"],
      multiturn: false,
      systemRole: false,
      tools: false
    }
  },
  configSchema: DallE3ConfigSchema
});
function toDallE3Request(request) {
  var _a, _b, _c, _d, _e;
  const options = {
    model: "dall-e-3",
    prompt: new import_ai.Message(request.messages[0]).text(),
    n: request.candidates || 1,
    size: (_a = request.config) == null ? void 0 : _a.size,
    style: (_b = request.config) == null ? void 0 : _b.style,
    user: (_c = request.config) == null ? void 0 : _c.user,
    quality: (_d = request.config) == null ? void 0 : _d.quality,
    response_format: ((_e = request.config) == null ? void 0 : _e.response_format) || "b64_json"
  };
  for (const k in options) {
    if (options[k] === void 0) {
      delete options[k];
    }
  }
  return options;
}
function toGenerateResponse(result) {
  const candidates = result.data.map(
    (image, index) => ({
      index,
      finishReason: "stop",
      custom: { revisedPrompt: image.revised_prompt },
      message: {
        role: "model",
        content: [
          {
            media: {
              contentType: "image/png",
              url: image.url || `data:image/png;base64,${image.b64_json}`
            }
          }
        ]
      }
    })
  );
  return { candidates };
}
function dallE3Model(client) {
  return (0, import_model.defineModel)(
    __spreadProps(__spreadValues({
      name: dallE3.name
    }, dallE3.info), {
      configSchema: dallE3.configSchema
    }),
    (request) => __async(this, null, function* () {
      const result = yield client.images.generate(toDallE3Request(request));
      return toGenerateResponse(result);
    })
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DallE3ConfigSchema,
  dallE3,
  dallE3Model
});
//# sourceMappingURL=dalle.js.map