"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var indexer_exports = {};
__export(indexer_exports, {
  saveVectorIndexer: () => saveVectorIndexer
});
module.exports = __toCommonJS(indexer_exports);
var import_google_genai = require("@langchain/google-genai");
var import_glob = require("glob");
var import_fs = __toESM(require("fs"));
var import_text_splitter = require("langchain/text_splitter");
var import_vectorstores = require("langchain/vectorstores");
var import_generative_ai = require("@google/generative-ai");
var import_constants = require("../constants");
const getFilesData = (files) => {
  console.log(
    `Added ${files.length} files to data.  Splitting text into chunks...`
  );
  const filesData = [];
  for (const file of files) {
    filesData.push(import_fs.default.readFileSync(file, "utf-8"));
  }
  return filesData;
};
const getFiles = async (input) => {
  try {
    return (0, import_glob.glob)(input, { ignore: "node_modules/**" });
  } catch (error) {
    console.error("Error fetching files:", error);
    throw error;
  }
};
const getSplitter = (chunkSize, separator) => {
  return new import_text_splitter.CharacterTextSplitter({
    chunkSize: chunkSize || 12720,
    separator: separator || "\n"
  });
};
const saveVectorStore = async (docs, apiKey, output) => {
  console.log("Initializing Store...");
  const store = await import_vectorstores.HNSWLib.fromTexts(
    docs,
    docs.map((_, i) => ({ id: i })),
    new import_google_genai.GoogleGenerativeAIEmbeddings({
      apiKey: apiKey || process.env.GOOGLE_API_KEY,
      model: import_constants.EMBEDDING_MODEL,
      modelName: import_constants.EMBEDDING_MODEL_NAME,
      taskType: import_generative_ai.TaskType.RETRIEVAL_DOCUMENT,
      title: import_constants.EMBEDDING_TITLE
    })
  );
  console.log("Saving Vectorstore");
  await store.save(output);
  return `VectorStore saved to ${output}`;
};
const getVectorDocument = (filesData, textSplitter) => {
  let docs = [];
  for (const d of filesData) {
    const docOutput = textSplitter.splitText(d);
    docs = [...docs, ...docOutput];
  }
  return docs.splice(docs.length - 4, 4);
};
const saveVectorIndexer = async (flowOptions, pluginOptions) => {
  const { dataPath, indexOutputPath, chunkSize, separator } = flowOptions;
  const { apiKey } = pluginOptions;
  const files = await getFiles(dataPath);
  const filesData = getFilesData(files);
  const textSplitter = getSplitter(chunkSize, separator);
  const vectorDocument = getVectorDocument(filesData, textSplitter);
  return saveVectorStore(vectorDocument, apiKey, indexOutputPath);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  saveVectorIndexer
});
//# sourceMappingURL=index.js.map