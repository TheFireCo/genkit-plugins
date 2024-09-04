import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { HNSWLib } from "langchain/vectorstores";
import { generate } from "@genkit-ai/ai";
import { geminiPro as geminiProModel } from "@genkit-ai/googleai";
const generateHistories = (contexts) => {
  const histories = [];
  contexts.forEach((context) => {
    histories.push({
      role: "user",
      content: [{ text: context }]
    });
    histories.push({
      role: "model",
      content: [{ text: "Understood" }]
    });
  });
  return histories;
};
const initializeStore = async (vectorStorePath, apiKey) => {
  const store = await HNSWLib.load(
    vectorStorePath,
    new GoogleGenerativeAIEmbeddings({
      apiKey
    })
  );
  return store;
};
const getContextBasedOnPrompt = async (store, prompt) => {
  const data = await store.similaritySearch(prompt, 1);
  const context = [];
  data.forEach((item, i) => {
    context.push(`${item.pageContent}`);
  });
  return context;
};
const retrieveResponseWithVector = async (flowOptions, pluginOptions) => {
  const {
    prompt,
    indexPath,
    temperature,
    maxOutputTokens,
    topK,
    topP,
    stopSequences
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
    stopSequences: stopSequences || []
  };
  const promptResult = await generate({
    history: histories,
    prompt,
    model: geminiProModel,
    config: retrievalConfig
  });
  return promptResult.text();
};
export {
  retrieveResponseWithVector
};
//# sourceMappingURL=index.mjs.map