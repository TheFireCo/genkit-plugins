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
const TTSConfigSchema = GenerationCommonConfigSchema.extend({
  voice: z.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]).optional().default("alloy"),
  speed: z.number().min(0.25).max(4).optional(),
  response_format: z.enum(["mp3", "opus", "aac", "flac", "wav", "pcm"]).optional()
});
const tts1 = modelRef({
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
const tts1Hd = modelRef({
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
    input: new Message(request.messages[0]).text(),
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
  return defineModel(
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
export {
  RESPONSE_FORMAT_MEDIA_TYPES,
  SUPPORTED_TTS_MODELS,
  TTSConfigSchema,
  tts1,
  tts1Hd,
  ttsModel
};
//# sourceMappingURL=tts.mjs.map