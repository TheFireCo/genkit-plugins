---
id: genkitx-groq
title: genkitx-groq
---

<h1 align="center">Firebase Genkit - Groq Plugin</h1>

<h4 align="center">Groq Community Plugin for Google Firebase Genkit</h4>

<div align="center">
   <img alt="Github lerna version" src="https://img.shields.io/github/lerna-json/v/TheFireCo/genkit-plugins?label=version"/>
   <img alt="NPM Downloads" src="https://img.shields.io/npm/dw/genkitx-groq"/>
   <img alt="GitHub Org's stars" src="https://img.shields.io/github/stars/TheFireCo?style=social"/>
   <img alt="GitHub License" src="https://img.shields.io/github/license/TheFireCo/genkit-plugins"/>
   <img alt="Static Badge" src="https://img.shields.io/badge/yes-a?label=maintained"/>
</div>

<div align="center">
   <img alt="GitHub Issues or Pull Requests" src="https://img.shields.io/github/issues/TheFireCo/genkit-plugins?color=blue"/>
   <img alt="GitHub Issues or Pull Requests" src="https://img.shields.io/github/issues-pr/TheFireCo/genkit-plugins?color=blue"/>
   <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/TheFireCo/genkit-plugins"/>
</div>

**`genkitx-groq`** is a community plugin for using OpenAI APIs with
[Firebase GenKit](https://github.com/firebase/genkit). Built by [**The Fire Company**](https://github.com/TheFireCo). 🔥

## Installation

Install the plugin in your project with your favorite package manager:

- `npm install genkitx-groq`
- `yarn add genkitx-groq`
- `pnpm add genkitx-groq`

## Usage

### Initialize

```typescript
import 'dotenv/config';

import { configureGenkit } from '@genkit-ai/core';
import { defineFlow, startFlowsServer } from '@genkit-ai/flow';
import { groq } from 'genkitx-groq';

configureGenkit({
  plugins: [
    // Groq API key is required and defaults to the GROQ_API_KEY environment variable
    groq({ apiKey: process.env.GROQ_API_KEY }),
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
  model: llama3x70b, // model imported from genkitx-groq
  prompt: 'Tell me a joke.',
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
      model: openMixtral8x22B,
    });

    return llmResponse.text();
  }
);
startFlowsServer();
```

### Tool use

```typescript
// ...configure Genkit (as shown above)...

const createReminder = defineTool(
  {
    name: 'createReminder',
    description: 'Use this to create reminders for things in the future',
    inputSchema: z.object({
      time: z
        .string()
        .describe('ISO timestamp string, e.g. 2024-04-03T12:23:00Z'),
      reminder: z.string().describe('the content of the reminder'),
    }),
    outputSchema: z.number().describe('the ID of the created reminder'),
  },
  (reminder) => Promise.resolve(3)
);

const result = generate({
  model: llama3x70b,
  tools: [createReminder],
  prompt: `
  You are a reminder assistant.
  If you create a reminder, describe in text the reminder you created as a response.

  Query: I have a meeting with Anna at 3 for dinner - can you set a reminder for the time?
  `,
});

console.log(result.then((res) => res.text()));
```

## Contributing

Want to contribute to the project? That's awesome! Head over to our [Contribution Guidelines](https://github.com/TheFireCo/genkit-plugins/blob/main/https://github.com/TheFireCo/genkit-plugins/blob/main/CONTRIBUTING.md).

## Need support?

:::info
This repository depends on Google's Firebase Genkit. For issues and questions related to GenKit, please refer to instructions available in [GenKit's repository](https://github.com/firebase/genkit).
:::

Reach out by opening a discussion on [Github Discussions](https://github.com/TheFireCo/genkit-plugins/discussions).

## Credits

This plugin is proudly maintained by the team at [**The Fire Company**](https://github.com/TheFireCo). 🔥

## License

This project is licensed under the [Apache 2.0 License](https://github.com/TheFireCo/genkit-plugins/blob/main/LICENSE).
