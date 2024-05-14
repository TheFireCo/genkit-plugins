<h1 align="center">
   Firebase Genkit <> OpenAI Plugin
</h1>

<h4 align="center">OpenAI Community Plugin for Google Firebase Genkit</h4>

<div align="center">
   <img alt="Github lerna version" src="https://img.shields.io/github/lerna-json/v/TheFireCo/genkit-plugins?label=version">
   <img alt="NPM Downloads" src="https://img.shields.io/npm/dw/genkitx-openai-plugin">
   <img alt="GitHub Org's stars" src="https://img.shields.io/github/stars/TheFireCo?style=social">
   <img alt="GitHub License" src="https://img.shields.io/github/license/TheFireCo/genkit-plugins">
   <img alt="Static Badge" src="https://img.shields.io/badge/yes-a?label=maintained">
</div>

<div align="center">
   <img alt="GitHub Issues or Pull Requests" src="https://img.shields.io/github/issues/TheFireCo/genkit-plugins?color=blue">
   <img alt="GitHub Issues or Pull Requests" src="https://img.shields.io/github/issues-pr/TheFireCo/genkit-plugins?color=blue">
   <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/TheFireCo/genkit-plugins">
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
  
### Basic examples

The simplest way to call the text generation model is by using the helper function `generate`:
```
// Basic usage of an LLM
const response = await generate({
    model: gpt35Turbo,
    prompt: 'Tell me a joke.',
});

console.log(await response.text());
```

Using the same interface, you can prompt a multimodal model:
```
const response = await generate({
  model: gpt4Turbo,
  prompt: [
    { text: 'What animal is in the photo?' },
    { media: { url: imageUrl} },
  ],
  config:{
    // control of the level of visual detail when processing image embeddings
    // Low detail level also decreases the token usage
    visualDetailLevel: 'low',
  }
});
console.log(await response.text());
```

For more detailed examples and the explanation of other functionalities, refer to the examples in the [official Github repo of the plugin](https://github.com/TheFireCo/genkit-plugins/blob/main/examples/README.md) or in the [official Genkit documentation](https://firebase.google.com/docs/genkit/get-started).
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
