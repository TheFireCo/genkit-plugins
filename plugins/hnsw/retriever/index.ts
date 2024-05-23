import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { HNSWLib } from "langchain/vectorstores";
import { generate } from "@genkit-ai/ai";
import { geminiPro as geminiProModel } from "@genkit-ai/googleai";

import { RetrieverFlowOptions, PluginOptions } from "../interfaces";

const generateHistories = (contexts: any[]) => {
  const histories: any[] = [];
  contexts.forEach((context: string) => {
    histories.push({
      role: "user",
      content: [{ text: context }],
    });
    histories.push({
      role: "model",
      content: [{ text: "Understood" }],
    });
  });
  return histories;
};

const initializeStore = async (
  vectorStorePath: string,
  apiKey: string | undefined
) => {
  const store = await HNSWLib.load(
    vectorStorePath,
    new GoogleGenerativeAIEmbeddings({
      apiKey,
    })
  );
  return store;
};

const getContextBasedOnPrompt = async (store: HNSWLib, prompt: string) => {
  const data = await store.similaritySearch(prompt, 1);
  const context: string[] = [];
  data.forEach((item: { pageContent: any }, i: any) => {
    context.push(`${item.pageContent}`);
  });
  return context;
};

const retrieveResponseWithVector = async (
  flowOptions: RetrieverFlowOptions,
  pluginOptions: PluginOptions
) => {
  const {
    prompt,
    indexPath,
    temperature,
    maxOutputTokens,
    topK,
    topP,
    stopSequences,
  } = flowOptions;
  const { apiKey } = pluginOptions;

  const store = await initializeStore(indexPath, apiKey);
  const context = await getContextBasedOnPrompt(store, prompt);
  const histories = generateHistories(context);
  const retrievalConfig = {
    temperature: temperature || 0.1,
    maxOutputTokens: maxOutputTokens || 500,
    topK: topK || 1,
    topP: topP || 0,
    stopSequences: stopSequences || [],
  };
  const promptResult = await generate({
    history: histories,
    prompt,
    model: geminiProModel,
    config: retrievalConfig,
  });

  return promptResult.text();
};

export { retrieveResponseWithVector };
