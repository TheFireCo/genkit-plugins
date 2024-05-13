<h1 align="center">
   Firebase Genkit <> OpenAI Plugin
</h1>

<h4 align="center">OpenAI Community Plugin for Google Firebase Genkit</h4>

<div align="center">
    
</div>
      
</br>

**`genkitx-openai-plugin`** is a community plugin for using OpenAI APIs with 
[Firebase GenKit](https://github.com/firebase/genkit). Built by [**The Fire Company**](https://github.com/TheFireCo). 🔥


## Installation

Install the plugin in your project with your favorite package manager:

* `npm install genkitx-openai-plugin`
* `yarn add genkitx-openai-plugin`
* `pnpm add genkitx-openai-plugin`

## Usage
        
### Set up Genkit packages and DevUI
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

### Basic examples

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

For more detailed examples and the explanation of other functionalities, refer to the `examples` folder in the [official Github repo of the plugin](https://github.com/TheFireCo/genkit-plugins) or in the [official Genkit documentation](Add Genkit docs link).
## Contributing

Want to contribute to the project? That's awesome! Head over to our [Contribution Guidelines](https://github.com/TheFireCo/genkit-plugins/blob/main/CONTRIBUTING.md).

## Need support?

> [!NOTE]  
> This repository depends on Google's Firebase Genkit. For issues and questions related to GenKit, please refer to instructions available in [GenKit's repository](https://github.com/firebase/genkit).

Reach out by opening a discussion on [Github Discussions](https://github.com/TheFireCo/genkit-plugins/discussions).
        
## Credits

This plugin is proudly maintained by the team at [**The Fire Company**](https://github.com/TheFireCo). 🔥

## License

This project is licensed under the [Apache 2.0 License](https://github.com/TheFireCo/genkit-plugins/blob/main/LICENSE).

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202%2E0-lightgrey.svg)](https://github.com/TheFireCo/genkit-plugins/blob/main/LICENSE)
