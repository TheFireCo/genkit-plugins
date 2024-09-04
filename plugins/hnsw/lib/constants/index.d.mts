/**
 * Copyright 2024 The Fire Company
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
declare const PLUGIN_NAME_INDEXER = "HNSW Indexer";
declare const PLUGIN_NAME_RETRIEVER = "HNSW Retriever";
declare const FLOW_NAME_INDEXER = "HNSW Indexer";
declare const FLOW_NAME_RETRIEVER = "HNSW Retriever";
declare const ERROR_NO_API_KEY = "Must supply either `options.apiKey` or set `GOOGLE_API_KEY` environment variable.";
declare const ERROR_INVALID_ARGUMENT = "INVALID_ARGUMENT";
declare const SCHEMA_PROMPT = "Type your prompt for the LLM Model and the HNSW Vector to process";
declare const SCHEMA_INDEX_PATH = "Define Vector Index path you wanna use, can be retrieved from genkitx-hnsw-indexer plugin";
declare const SCHEMA_RESULT = "The prompt result with more context from HNSW Vector";
declare const SCHEMA_TRAINABLE_PATH = "Your data and other documents path to be learned by the AI";
declare const SCHEMA_INDEX_OUTPUT_PATH = "Your expected output path for your Vector Store Index that is processed based on the data and documents you provided";
declare const EMBEDDING_MODEL_NAME = "Gemini Model embedding-001";
declare const EMBEDDING_MODEL = "embedding-001";
declare const EMBEDDING_TITLE = "Gemini embedding-001";

export { EMBEDDING_MODEL, EMBEDDING_MODEL_NAME, EMBEDDING_TITLE, ERROR_INVALID_ARGUMENT, ERROR_NO_API_KEY, FLOW_NAME_INDEXER, FLOW_NAME_RETRIEVER, PLUGIN_NAME_INDEXER, PLUGIN_NAME_RETRIEVER, SCHEMA_INDEX_OUTPUT_PATH, SCHEMA_INDEX_PATH, SCHEMA_PROMPT, SCHEMA_RESULT, SCHEMA_TRAINABLE_PATH };
