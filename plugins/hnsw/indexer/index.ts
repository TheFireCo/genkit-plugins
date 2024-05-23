require("node-absolute-path");
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import glob from "glob";
import fs from "fs";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { HNSWLib } from "langchain/vectorstores";
import { TaskType } from "@google/generative-ai";

import { IndexerFlowOptions, PluginOptions } from "../interfaces";
import {
  EMBEDDING_MODEL_NAME,
  EMBEDDING_MODEL,
  EMBEDDING_TITLE,
} from "../constants";

const getFilesData = (files: string[]): string[] => {
  console.log(
    `Added ${files.length} files to data.  Splitting text into chunks...`
  );
  const filesData = [];
  for (const file of files) {
    filesData.push(fs.readFileSync(file, "utf-8"));
  }
  return filesData;
}

const getFiles = async (input: string): Promise<string[]> => {
  return await new Promise((resolve, reject) =>
    glob(input, (error: any, files: any) =>
      error ? reject(error) : resolve(files)
    )
  );
};

const getSplitter = (
  chunkSize: number | undefined,
  separator: string | undefined
) => {
  return new CharacterTextSplitter({
    chunkSize: chunkSize || 12720,
    separator: separator || "\n",
  });
};

const saveVectorStore = async (docs: string[], apiKey: string | undefined, output: string) => {
  console.log("Initializing Store...");
  const store = await HNSWLib.fromTexts(
    docs,
    docs.map((_: any, i: any) => ({ id: i })),
    new GoogleGenerativeAIEmbeddings({
      apiKey: apiKey || process.env.GOOGLE_API_KEY,
      model: EMBEDDING_MODEL,
      modelName: EMBEDDING_MODEL_NAME,
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      title: EMBEDDING_TITLE,
    })
  );
  console.log("Saving Vectorstore");
  await store.save(output);
  return `VectorStore saved to ${output}`;
};

const getVectorDocument = (filesData: string[], textSplitter: { splitText: (arg0: any) => any; }) => {
  let docs: string[] = [];
  for (const d of filesData) {
    const docOutput = textSplitter.splitText(d);
    docs = [...docs, ...docOutput];
  }
  return docs.splice(docs.length - 4, 4);
}

const saveVectorIndexer = async (
  flowOptions: IndexerFlowOptions,
  pluginOptions: PluginOptions
) => {
  const { dataPath, indexOutputPath, chunkSize, separator } = flowOptions;
  const { apiKey } = pluginOptions;

  const files: string[] = await getFiles(dataPath);
  const filesData = getFilesData(files);
  const textSplitter = getSplitter(chunkSize, separator);
  const vectorDocument = getVectorDocument(filesData, textSplitter);

  return saveVectorStore(vectorDocument, apiKey, indexOutputPath);
};

export { saveVectorIndexer };
