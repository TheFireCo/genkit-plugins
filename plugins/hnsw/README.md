# Genkit Plugin HNSW Vector Database

![Genkit HNSW Logo](https://github.com/retzd-tech/genkitx-hnsw/blob/main/assets/genkit-hnsw-logo.png?raw=true)

You can contribute to this plugin in this [Repository](https://github.com/TheFireCo/genkit-plugins/tree/main/plugins/hnsw).

## Description
HNSW is Vector Database Hierarchical Navigable Small World (HNSW) graphs are among the top-performing indexes for vector similarity search. HNSW is a hugely popular technology that time and time again produces state-of-the-art performance with super fast search speeds and fantastic recall. learn more about [HNSW](https://www.pinecone.io/learn/series/faiss/hnsw).

You can prefer this vector database if you prefer
- A simple vector database setup
- Handle and manage your own vector index on your own server
- Managing vector index as a File
- Small size but fast performance

With this you can achieve a high performing Retrieval Augmentation Generation (RAG) in Generative AI so you do not need to build your own AI Model or retrain the AI Model to get more context or knowledge, instead you can add additional layer of context so that your AI Model can understand more knowledge than what the base AI Model knows. this is useful if you want to get more context or more knowledge based on specific informations or knowledge that you define.

### Example use case :
You have Restaurant application or website, you can add specific information about your restaurants, address, food menu list with its price and the other specific things, so that when your customer ask something to the AI about your Restaurant, your AI can answer it accurately. this can remove your effort to build a Chatbot, instead you can use Generative AI enriched with specific knowledge.

Example conversation :

`You` : What is the price list of my restaurant in Surabaya City ?

`AI` : Price list :
- Rawon Setan - Rp. 15.000
- Lontong Balap - Rp.12.000
- Rendang - Rp.15.000

## Installation
Before installing the plugin, ensure you have the following prerequisites installed:
- [Node.js](https://nodejs.org/) (version 12 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js installation)
- [TypeScript](https://www.typescriptlang.org/) (you can install it globally via npm: `npm install -g typescript`)

To install this plugin, you can run this command or with your prefered package manager

```bash
npm install genkitx-hnsw
```

## Plugin List
This plugin has several functionality as below :
- `HNSW Indexer`
  Used to create a Vector Index based on all the data and information you provided. this Vector Index will be used as a knowledge reference of HNSW Retriever.
- `HNSW Retriever`
  Used to get Generative AI response with Gemini Model as a base enriched with additional knowledge and context based on your Vector Index.

## Usage

## Usage HNSW Indexer plugin
This is a usage of Genkit plugin flow to save data into vector store with HNSW Vector Store, Gemini Embedder and Gemini LLM.

#### Data preparations
Prepare your data or documents in a Folder
![Restaurants data](https://github.com/retzd-tech/genkitx-hnsw/blob/main/assets/restaurants-data.png?raw=true)

#### Register HNSW Indexer Plugin
Import the plugin into your Genkit project
```bash
import { hnswIndexer } from "genkitx-hnsw";

export default configureGenkit({
  plugins: [
    hnswIndexer({ apiKey: "GOOGLE_API_KEY" })
  ]
});
```

#### Genkit UI HNSW Indexer flow running
Open Genkit UI and choose the registered plugin `HNSW Indexer`

Execute the flow with Input and Output required parameter
- `dataPath` : Your data and other documents path to be learned by the AI
- `indexOutputPath` : Your expected output path for your Vector Store Index that is processed based on the data and documents you provided

![Genkit UI HNSW Indexer Flow](https://github.com/retzd-tech/genkitx-hnsw/blob/main/assets/hnsw-indexer-flow.png?raw=true)

#### Vector Store Index Result
![HNSW Vector](https://github.com/retzd-tech/genkitx-hnsw/blob/main/assets/hnsw-indexer-result.png?raw=true)
Vector store will be saved in the defined output path. this index will be used for the prompt generation process with the HNSW Retriever plugin. you can continue the implementation by using the HNSW Retriever plugin 

### Optional Parameter
  - `chunkSize: number`
  How much data is processed at a time. It's like breaking a big task into smaller pieces to make it more manageable. By setting the chunk size, we decide how much information the AI handles in one go, which can affect both the speed and accuracy of the AI's learning process.

    `default value : 12720`
  - `separator: string`
  During the creation of a vector index is a symbol or character used to separate different pieces of information in the input data. It helps the AI understand where one unit of data ends and another begins, enabling it to process and learn from the data more effectively.

    `default value : "\n"`

## Usage HNSW Retriever plugin
This is a usage of Genkit plugin flow to process your prompt with Gemini LLM Model enriched with additional and specific information or knowledge within the HNSW Vector Database you provided. with this plugin you will get LLM response with additional specific context.


#### Register HNSW Retriever Plugin
Import the plugin into your Genkit project
```bash
import { googleAI } from "@genkit-ai/googleai";
import { hnswRetriever } from "genkitx-hnsw";

export default configureGenkit({
  plugins: [
    googleAI(),
    hnswRetriever({ apiKey: "GOOGLE_API_KEY" })
  ]
});
```
Make sure you import the GoogleAI plugin for the Gemini LLM Model provider, currently this plugin only supports Gemini, will provide more model soon!

#### Genkit UI HNSW Retriever flow running
Open Genkit UI and choose the registered Plugin `HNSW Retriever`
Execute the flow with the required parameter
- `prompt` : Type your prompt where you will get answers with more enriched context based on the vector you provided.
- `indexPath` : Define folder Vector Index path you wanna use as a knowledge reference, where you get this files path from HNSW Indexer plugin.

In this example, Let's try to ask about the price list information of a restaurant in Surabaya city, where it has been provided within the Vector Index.

We can type the prompt and run it, after the flow finished, you will get response enriched with specific knowledge based on your Vector Index.

![Genkit UI Prompt Result](https://github.com/retzd-tech/genkit-hnsw/blob/main/assets/hnsw-retriever-flow.png?raw=true)

### Optional Parameter
  - `temperature: number`
  temperature controls the randomness of the generated output. Lower temperatures result in more deterministic output, with the model selecting the most likely token at each step. Higher temperatures increase the randomness, allowing the model to explore less probable tokens, potentially generating more creative but less coherent text.

    `default value : 0.1`
  - `maxOutputTokens: number`
  This parameter specifies the maximum number of tokens (words or subwords) the model should generate in a single inference step. It helps control the length of the generated text.

    `default value : 500`
  - `topK: number`
  Top-K sampling restricts the model's choices to the top K most likely tokens at each step. This helps prevent the model from considering overly rare or unlikely tokens, improving the coherence of the generated text.

    `default value : 1`
  - `topP: number`
  Top-P sampling, also known as nucleus sampling, considers the cumulative probability distribution of tokens and selects the smallest set of tokens whose cumulative probability exceeds a predefined threshold (often denoted as P). This allows for dynamic selection of the number of tokens considered at each step, depending on the likelihood of the tokens.

    `default value : 0`
  - `stopSequences: string[]`
  These are sequences of tokens that, when generated, signal the model to stop generating text. This can be useful for controlling the length or content of the generated output, such as ensuring the model stops generating after reaching the end of a sentence or paragraph.

    `default value : []`

License : Apache 2.0