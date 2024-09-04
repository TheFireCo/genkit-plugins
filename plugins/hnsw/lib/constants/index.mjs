const PLUGIN_NAME_INDEXER = "HNSW Indexer";
const PLUGIN_NAME_RETRIEVER = "HNSW Retriever";
const FLOW_NAME_INDEXER = "HNSW Indexer";
const FLOW_NAME_RETRIEVER = "HNSW Retriever";
const ERROR_NO_API_KEY = "Must supply either `options.apiKey` or set `GOOGLE_API_KEY` environment variable.";
const ERROR_INVALID_ARGUMENT = "INVALID_ARGUMENT";
const SCHEMA_PROMPT = "Type your prompt for the LLM Model and the HNSW Vector to process";
const SCHEMA_INDEX_PATH = "Define Vector Index path you wanna use, can be retrieved from genkitx-hnsw-indexer plugin";
const SCHEMA_RESULT = "The prompt result with more context from HNSW Vector";
const SCHEMA_TRAINABLE_PATH = "Your data and other documents path to be learned by the AI";
const SCHEMA_INDEX_OUTPUT_PATH = "Your expected output path for your Vector Store Index that is processed based on the data and documents you provided";
const EMBEDDING_MODEL_NAME = "Gemini Model embedding-001";
const EMBEDDING_MODEL = "embedding-001";
const EMBEDDING_TITLE = "Gemini embedding-001";
export {
  EMBEDDING_MODEL,
  EMBEDDING_MODEL_NAME,
  EMBEDDING_TITLE,
  ERROR_INVALID_ARGUMENT,
  ERROR_NO_API_KEY,
  FLOW_NAME_INDEXER,
  FLOW_NAME_RETRIEVER,
  PLUGIN_NAME_INDEXER,
  PLUGIN_NAME_RETRIEVER,
  SCHEMA_INDEX_OUTPUT_PATH,
  SCHEMA_INDEX_PATH,
  SCHEMA_PROMPT,
  SCHEMA_RESULT,
  SCHEMA_TRAINABLE_PATH
};
//# sourceMappingURL=index.mjs.map