---
id: genkitx-anthropic
title: genkitx-anthropic
---

<h1 align="center">Firebase Genkit - Anthropic AI Plugin</h1>

<h4 align="center">Anthropic AI Community Plugin for Google Firebase Genkit</h4>

<div align="center">
   <img alt="Github lerna version" src="https://img.shields.io/github/lerna-json/v/TheFireCo/genkit-plugins?label=version"/>
   <img alt="NPM Downloads" src="https://img.shields.io/npm/dw/genkitx-anthropic"/>
   <img alt="GitHub Org's stars" src="https://img.shields.io/github/stars/TheFireCo?style=social"/>
   <img alt="GitHub License" src="https://img.shields.io/github/license/TheFireCo/genkit-plugins"/>
   <img alt="Static Badge" src="https://img.shields.io/badge/yes-a?label=maintained"/>
</div>

<div align="center">
   <img alt="GitHub Issues or Pull Requests" src="https://img.shields.io/github/issues/TheFireCo/genkit-plugins?color=blue"/>
   <img alt="GitHub Issues or Pull Requests" src="https://img.shields.io/github/issues-pr/TheFireCo/genkit-plugins?color=blue"/>
   <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/TheFireCo/genkit-plugins"/>
</div>

`genkitx-anthropic` is a community plugin for using Anthropic AI and all its supported models with [Firebase GenKit](https://github.com/firebase/genkit).

## Installation

Install the plugin in your project with your favorite package manager:

- `npm install genkitx-anthropic`
- `yarn add genkitx-anthropic`

## Supported models

The plugin supports the most recent Anthropic models:
**Claude 3 Opus**, **Claude 3 Sonnet**, and **Claude 3 Haiku**.

## Usage

### Initialize

```typescript
import 'dotenv/config';

import { configureGenkit } from '@genkit-ai/core';
import { defineFlow, startFlowsServer } from '@genkit-ai/flow';
import { anthropic } from 'genkitx-anthropic';

configureGenkit({
  plugins: [
    // Anthropic API key is required and defaults to the ANTHROPIC_API_KEY environment variable
    anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
```

### Basic examples

The simplest way to call the text generation model is by using the helper function `generate`:

```typescript
// ...configure Genkit (as shown above)...

const response = await generate({
  model: claude3Haiku, // model imported from genkitx-anthropic
  prompt: 'Tell me a joke.',
});

console.log(await response.text());
```

### Multi-modal prompt

```typescript
// ...configure Genkit (as shown above)...

const response = await generate({
  model: claude3Haiku,
  prompt: [
    { text: 'What animal is in the photo?' },
    { media: { url: imageUrl } },
  ],
  config: {
    // control of the level of visual detail when processing image embeddings
    // Low detail level also decreases the token usage
    visualDetailLevel: 'low',
  },
});
console.log(await response.text());
```

### Within a flow

```typescript
// ...configure Genkit (as shown above)...

export const myFlow = defineFlow(
  {
    name: 'menuSuggestionFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (subject) => {
    const llmResponse = await generate({
      prompt: `Suggest an item for the menu of a ${subject} themed restaurant`,
      model: claude3Opus,
    });

    return llmResponse.text();
  }
);
startFlowsServer();
```

## Contributing

Want to contribute to the project? That's awesome! Head over to our [Contribution Guidelines](https://github.com/TheFireCo/genkit-plugins/blob/main/CONTRIBUTING.md).

## Need support?

:::info
This repository depends on Google's Firebase Genkit. For issues and questions related to GenKit, please refer to instructions available in [GenKit's repository](https://github.com/firebase/genkit).
:::

Reach out by opening a discussion on [Github Discussions](https://github.com/TheFireCo/genkitx-openai/discussions).

## Credits

This plugin is proudly maintained by the team at [**The Fire Company**](https://github.com/TheFireCo). 🔥

## License

This project is licensed under the [Apache 2.0 License](https://github.com/TheFireCo/genkitx-openai/blob/main/LICENSE).
