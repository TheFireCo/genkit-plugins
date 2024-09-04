import {
  __async
} from "./chunk-WFI2LP4G.mjs";
import { defineEmbedder, embedderRef } from "@genkit-ai/ai/embedder";
import OpenAI from "openai";
import { z } from "zod";
const TextEmbeddingConfigSchema = z.object({
  dimensions: z.number().optional(),
  encodingFormat: z.union([z.literal("float"), z.literal("base64")]).optional()
});
const TextEmbeddingInputSchema = z.string();
const textEmbedding3Small = embedderRef({
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
const textEmbedding3Large = embedderRef({
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
const textEmbeddingAda002 = embedderRef({
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
  const client = new OpenAI({ apiKey });
  return defineEmbedder(
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
export {
  SUPPORTED_EMBEDDING_MODELS,
  TextEmbeddingConfigSchema,
  TextEmbeddingInputSchema,
  openaiEmbedder,
  textEmbedding3Large,
  textEmbedding3Small,
  textEmbeddingAda002
};
//# sourceMappingURL=embedder.mjs.map