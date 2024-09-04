import {
  __async,
  __spreadProps,
  __spreadValues
} from "./chunk-WFI2LP4G.mjs";
import { Message } from "@genkit-ai/ai";
import {
  GenerationCommonConfigSchema,
  defineModel,
  modelRef
} from "@genkit-ai/ai/model";
import { z } from "zod";
const DallE3ConfigSchema = GenerationCommonConfigSchema.extend({
  size: z.enum(["1024x1024", "1792x1024", "1024x1792"]).optional(),
  style: z.enum(["vivid", "natural"]).optional(),
  user: z.string().optional(),
  quality: z.enum(["standard", "hd"]).optional(),
  response_format: z.enum(["b64_json", "url"]).optional()
});
const dallE3 = modelRef({
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
    prompt: new Message(request.messages[0]).text(),
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
  return defineModel(
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
export {
  DallE3ConfigSchema,
  dallE3,
  dallE3Model
};
//# sourceMappingURL=dalle.mjs.map