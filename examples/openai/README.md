# OpenAI plugin examples

This module provides examples of usage of OpenAI plugin for Genkit, which wraps around the
OpenAI API.
## Set up Genkit packages and DevUI
1. Rename .env.local to .env and add your OpenAI API key to it, or specify it in the environment variable `OPENAI_API_KEY`.
2. Run `npm install` to install the dependencies.
3. Run `npx genkit start` to launch the Genkit Dev UI.

Genkit is configured from the `index.ts`, where you can import and initialize the plugin and define prompts, flows, models and other tools which could be accessed directly through Gekit Dev UI:

```
import { configureGenkit } from '@genkit-ai/core';
import { openAI } from 'genkitx-openai-plugin';

export default configureGenkit({
  plugins: [
    openAI({ apiKey: process.env.OPENAI_API_KEY }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
```
List of all available OpenAI models as well as their pricing, specification and capabilities could be found in the official [OpenAI API documentation](https://platform.openai.com/docs/overview).

## Example usage

### Calling the model 
The simplest way to call the text generation model is by using the helper function `generate`:
```
import { generate } from '@genkit-ai/ai';
import {gpt35Turbo} from 'genkitx-openai-plugin';

// Basic usage of an LLM
const response = await generate({
    model: gpt35Turbo,
    prompt: 'Tell me a joke.',
});

console.log(await response.text());
```

Using the same interface, you can prompt a multimodal model:
```
import {gpt4Vision} from 'genkitx-openai-plugin';

const response = await generate({
  model: gpt4Vision,
  prompt: [
    { text: 'What animal is in the photo?' },
    { media: { url: imageUrl} },
  ],
});
console.log(await response.text());
```
or define a tool in Genkit,test in the dev UI and then use it in the code:
```
import {defineTool } from '@genkit-ai/ai';

// defining the tool
const tool = defineTool(
  {
    name: 'myTool',
    description: 'the tool welcoming the new users',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (input) => `Welcome to the Genkit OpenAI plugin!`
);
 
// using the tool in code
const response = await generate({
  model: gpt35Turbo,
  prompt: 'Greet the new plugin user',
  tools: [tool],
  config: {
    temperature: 0.5,
  },
});
console.log(await response.text());
```

### Defining the prompts

One of the main benefits of Genkit is the ability to define the prompt as code and register it with Genkit,and for that you can use `definePrompt` function:
```
import {definePrompt} from '@genkit-ai/ai';

const helloPrompt = definePrompt(
  {
    name: 'helloPrompt',
    inputSchema: z.object({ name: z.string() }),
  },
  async (input) => {
    const promptText = `You are a helpful AI assistant named Walt.
    Say hello to ${input.name}.`;

    return {
      messages: [{ role: 'user', content: [{ text: promptText }] }],
      config: { temperature: 0.3,
       }
    }
  }
);
```
In this way, you can test your prompts independently of the code, in the Genkit Dev UI. This also enables the 
definition of input schemas, which enable you to customize each prompt call with a specific set of arguments, or specify the output format, as showcased a bit later below. To use this prompt in your development, you can use the `renderPrompt` function:
``` 
import { generate, renderPrompt } from '@genkit-ai/ai';
const response = await generate(
   renderPrompt({
     prompt: helloPrompt,
     input: { name: 'Fred' },
     model: gpt4Turbo
    })
);
console.log(await response.text());
```
### Dotprompt plugin

Genkit introduced a concept of Dotprompt, which is a plugin that enables you to store prompts in dedicated files, track changes and organize them in a JSON format or as a code. To use it, you must enable the Dotprompt plugin first:
```
import {dotprompt} from '@genkit-ai/dotprompt';
export default configureGenkit({
  plugins: [
    dotprompt(),
  ],
});
```
After that, in the root of your project, create a folder named `prompts`, where you can store your prompts in a `.prompt` files. For this demo, we already provide you with a couple of examples in the aforementioned folder. This is an example of how the Dotprompt `.prompt` file could look like:
```
---
model: openai/gpt-3.5-turbo
input:
  schema:
    assistant_name: string
    guest_name: string
  default:
    assistant_name: John
---

You are the world's most welcoming AI assistant named {{assistant_name}}.

Greet a guest named {{name}}.
```

To register it with Genkit and use it in development, you could use a `prompt` helper function from Dotprompt plugin:
```
import {prompt} from '@genkit-ai/dotprompt';

const greetingPrompt = await prompt('basic');
```
where `basic` represents the name of the file, `/prompts/basic.prompt`, in which the Dotprompt is stored. 
This plugin also enables you to write prompts directly as a code:
```
import {defineDotprompt} from '@genkit-ai/dotprompt';

const codeDotPrompt = defineDotprompt(
  {
    name: 'exampleDotPrompt',
    model: gpt4Turbo,
    input: {
      schema: z.object({
        object_name: z.string(),
        image_url: z.string(),
      }),
    },
    output: {
      schema: z.object({
        exist: z.boolean(),
        color: z.string(),
        details: z.string(),
      }),
    },
    config: {
      temperature: 1.0,
      topP: 0.9,
      maxOutputTokens: 100,
      topK: 20,
      stopSequences: ['abc'],
    },
  },
  `Does the object {{object_name}} exist in the given image {{media url=image_url}}? If it does, what color is it and what are some details about it?`
);
```
Finally, you can use the same `generate` helper function to call the model with the given Dotprompt:

```
const response = await codeDotPrompt.generate({
 input:{
      object_name: 'Ball',
      image_url: 'https://example_url.jpg',
    }
  }
);
```

In this case, to obtain the structured output which we specified in a prompt, we can run:
```
console.log(await response.output());
```
### Flows
Flows are the enhanced version of the standard functions, which are strongly typed, streamable, and locally and remotely callable. They can also be registered and later tested in Genkit Dev UI. To define and run a flow, one can use `defineFlow` and `runFlow` functions:
```
import { defineFlow, runFlow } from '@genkit-ai/flow';

\\define Flow
export const myFlow = defineFlow(
  {
    name: 'menuSuggestionFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (subject) => {
    const llmResponse = await generate({
      prompt: `Suggest an item for the menu of a ${subject} themed restaurant`,
      model: gpt4Turbo,
    });

    return llmResponse.text();
  }
);

// Run the flow
const response = await runFlow(myFlow, 'mexican' );
console.log(await response.text());
```

### Embedders and retrievers

Apart from the text generation models, Genkit also features the access to the text embeddings models and 
implements retrievers which can retrieve documents, given a query. To use the text embedding models,
you should utilize the `embed` method:
```
import { textEmbedding3Small } from 'genkitx-openai-plugin'; 
import { embed } from '@genkit-ai/ai/embedder';

const embedding = embed({
  embedder: textEmbedding3Small,
  content: "Embed this text.",
});
```
Here, the variable `embedding` will be a vector of numbers, which is a latent space representation of the given text, which can find use in many downstream tasks. In this case, we can use the text embeddings in a retriever, to query similar documents from Firestore based on the extracted embeddings:
```
import { embed } from '@genkit-ai/ai/embedder';
import { Document, defineRetriever } from '@genkit-ai/ai/retriever';
import { textEmbedding3Small } from 'genkitx-openai-plugin';
import {
  FieldValue,
  VectorQuery,
  VectorQuerySnapshot,
} from '@google-cloud/firestore';
import { Firestore } from 'firebase-admin/firestore';
import * as z from 'zod';

const QueryOptions = z.object({
  k: z.number().optional(),
});

const firestoreArtifactsRetriever = defineRetriever(
  {
    name: 'firestore/artifacts',
    configSchema: QueryOptions,
  },
  async (input, options) => {
    const embedding = await embed({
      embedder: textEmbedding3Small,
      content: input,
    });

    const db = new Firestore();
    const coll = db.collection('vectors' /* your collection name */);

    const vectorQuery: VectorQuery = coll.findNearest(
      'embedding' /* the name of the field that contains the vector */,
      FieldValue.vector(embedding),
      {
        limit: options.k ?? 3,
        distanceMeasure: 'COSINE',
      }
    );

    const vectorQuerySnapshot: VectorQuerySnapshot = await vectorQuery.get();
    return {
      documents: vectorQuerySnapshot.docs.map((doc) =>
        // doc.data() represents the Firestore document. You may process
        // it as needed to generate a Genkit document object, depending on your
        // storage format.
        Document.fromText(doc.data().content.text)
      ),
    };
  }
);
```
In the [official Genkit documentation](Add Genkit docs link) you can find many more usage examples as well as detailed specification and full instructions of the usage of the Genkit framework.

## Contributing
If you want to contribute to the OpenAI plugin, you can link to a local instance of the plugin by running `npm link` in the plugin directory and `npm link genkitx-openai-plugin` in the examples directory.

