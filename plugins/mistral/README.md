![Firebase Genkit + Mistral AI](https://github.com/TheFireCo/genkit-plugins/blob/main/assets/genkit-mistral.png?raw=true)

<h1 align="center">Firebase Genkit <> Mistral AI Plugin</h1>

<h4 align="center">Mistral AI Community Plugin for Google Firebase Genkit</h4>

<div align="center">
   <img alt="Github lerna version" src="https://img.shields.io/github/lerna-json/v/TheFireCo/genkit-plugins?label=version">
   <img alt="NPM Downloads" src="https://img.shields.io/npm/dw/genkitx-mistral">
   <img alt="GitHub Org's stars" src="https://img.shields.io/github/stars/TheFireCo?style=social">
   <img alt="GitHub License" src="https://img.shields.io/github/license/TheFireCo/genkit-plugins">
   <img alt="Static Badge" src="https://img.shields.io/badge/yes-a?label=maintained">
</div>

<div align="center">
   <img alt="GitHub Issues or Pull Requests" src="https://img.shields.io/github/issues/TheFireCo/genkit-plugins?color=blue">
   <img alt="GitHub Issues or Pull Requests" src="https://img.shields.io/github/issues-pr/TheFireCo/genkit-plugins?color=blue">
   <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/TheFireCo/genkit-plugins">
</div>

**`genkitx-mistral`** is a community plugin for using OpenAI APIs with
[Firebase GenKit](https://github.com/firebase/genkit). Built by [**The Fire Company**](https://github.com/TheFireCo). 🔥

## Installation

Install the plugin in your project with your favorite package manager:

- `npm install genkitx-mistral`
- `yarn add genkitx-mistral`
- `pnpm add genkitx-mistral`

## Usage

### Initialize

```typescript
import 'dotenv/config';

import { configureGenkit } from '@genkit-ai/core';
import { defineFlow, startFlowsServer } from '@genkit-ai/flow';
import { mistral } from 'genkitx-mistral';

configureGenkit({
  plugins: [
    // Mistral API key is required and defaults to the MISTRAL_API_KEY environment variable
    mistral({ apiKey: process.env.MISTRAL_API_KEY }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
```

### Basic examples

The simplest way to call the text generation model is by using the helper function `generate`:

```typescript
// Basic usage of an LLM
const response = await generate({
  model: openMixtral8x22B, // model imported from genkitx-mistral
  prompt: 'Tell me a joke.',
});

console.log(await response.text());
```

### Within a flow

```typescript
export const myFlow = defineFlow(
  {
    name: 'menuSuggestionFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (subject) => {
    const llmResponse = await generate({
      prompt: `Suggest an item for the menu of a ${subject} themed restaurant`,
      model: openMixtral8x22B,
    });

    return llmResponse.text();
  }
);
startFlowsServer();
```

## Contributing

Want to contribute to the project? That's awesome! Head over to our [Contribution Guidelines](https://github.com/TheFireCo/genkit-plugins/blob/main/CONTRIBUTING.md).

## Need support?

> \[!NOTE\]\
> This repository depends on Google's Firebase Genkit. For issues and questions related to GenKit, please refer to instructions available in [GenKit's repository](https://github.com/firebase/genkit).

Reach out by opening a discussion on [Github Discussions](https://github.com/TheFireCo/genkit-plugins/discussions).

## Credits

This plugin is proudly maintained by the team at [**The Fire Company**](https://github.com/TheFireCo). 🔥

## License

This project is licensed under the [Apache 2.0 License](https://github.com/TheFireCo/genkit-plugins/blob/main/LICENSE).
