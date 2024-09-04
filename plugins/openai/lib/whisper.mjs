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
const Whisper1ConfigSchema = GenerationCommonConfigSchema.extend({
  language: z.string().optional(),
  timestamp_granularities: z.array(z.enum(["word", "segment"])).optional(),
  response_format: z.enum(["json", "text", "srt", "verbose_json", "vtt"]).optional()
});
const whisper1 = modelRef({
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
  const message = new Message(request.messages[0]);
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
  return defineModel(
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
export {
  Whisper1ConfigSchema,
  whisper1,
  whisper1Model
};
//# sourceMappingURL=whisper.mjs.map