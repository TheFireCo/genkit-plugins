import {
  __async
} from "./chunk-WFI2LP4G.mjs";
import { genkitPlugin } from "@genkit-ai/core";
import OpenAI from "openai";
import { dallE3, dallE3Model } from "./dalle.js";
import {
  openaiEmbedder,
  SUPPORTED_EMBEDDING_MODELS,
  textEmbedding3Large,
  textEmbedding3Small,
  textEmbeddingAda002
} from "./embedder.js";
import {
  gpt35Turbo,
  gpt4,
  gpt4Turbo,
  gpt4Vision,
  gpt4o,
  gpt4oMini,
  gptModel,
  SUPPORTED_GPT_MODELS
} from "./gpt.js";
import { SUPPORTED_TTS_MODELS, ttsModel, tts1, tts1Hd } from "./tts.js";
import { whisper1, whisper1Model } from "./whisper.js";
const openAI = genkitPlugin(
  "openai",
  (options) => __async(void 0, null, function* () {
    let apiKey = (options == null ? void 0 : options.apiKey) || process.env.OPENAI_API_KEY;
    if (!apiKey)
      throw new Error(
        "please pass in the API key or set the OPENAI_API_KEY environment variable"
      );
    const client = new OpenAI({ apiKey });
    return {
      models: [
        ...Object.keys(SUPPORTED_GPT_MODELS).map(
          (name) => gptModel(name, client)
        ),
        ...Object.keys(SUPPORTED_TTS_MODELS).map(
          (name) => ttsModel(name, client)
        ),
        dallE3Model(client),
        whisper1Model(client)
      ],
      embedders: Object.keys(SUPPORTED_EMBEDDING_MODELS).map(
        (name) => openaiEmbedder(name, options)
      )
    };
  })
);
var src_default = openAI;
export {
  dallE3,
  src_default as default,
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
};
//# sourceMappingURL=index.mjs.map