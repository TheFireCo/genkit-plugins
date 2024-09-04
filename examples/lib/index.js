"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.myFlow = void 0;
require("dotenv/config");
const dotprompt_1 = require("@genkit-ai/dotprompt");
const ai_1 = require("@genkit-ai/ai");
const flow_1 = require("@genkit-ai/flow");
const z = __importStar(require("zod"));
const genkitx_openai_1 = require("genkitx-openai");
const core_1 = require("@genkit-ai/core");
const genkit_config_1 = __importDefault(require("./genkit.config"));
(0, core_1.initializeGenkit)(genkit_config_1.default);
// Define standard prompts
const helloPrompt = (0, ai_1.definePrompt)({
    name: 'helloPrompt',
    inputSchema: z.object({ name: z.string() }),
}, async (input) => {
    const promptText = `You are a helpful AI assistant named Walt.
    Say hello to ${input.name}.`;
    return {
        messages: [{ role: 'user', content: [{ text: promptText }] }],
        config: { temperature: 0.3 },
    };
});
// Tool definition
const tool = (0, ai_1.defineTool)({
    name: 'myJoke',
    description: 'useful when you need a joke to tell.',
    inputSchema: z.string(),
    outputSchema: z.string(),
}, async (input) => `haha Just kidding no joke about for you! got you`);
// define Dotprompts
// export const greetingPrompt = prompt('basic');
// const multimodalPrompt = prompt('multimodalInput');
// const structuredOutputPrompt = prompt('structuredInputOutput');
// const customConfigPrompt = prompt('customConfig');
// Define a Dotprompt in code
const codeDotPrompt = (0, dotprompt_1.defineDotprompt)({
    name: 'exampleDotPrompt',
    model: genkitx_openai_1.gpt4o,
    input: {
        schema: z.object({
            object_name: z.string(),
            image_url: z.string(),
        }),
    },
    output: {
        schema: z.object({
            exist: z.boolean().describe('Whether the object exists in the image'),
            color: z.string().describe('The color of the object'),
            details: z.string().describe('Details about the object'),
        }),
    },
    config: {
        temperature: 1.0,
        topP: 0.9,
        maxOutputTokens: 100,
        topK: 20,
        stopSequences: ['abc'],
        visualDetailLevel: 'high',
    },
}, `Does the object {{object_name}} exist in the given image {{media url=image_url}}? If it does, what color is it and what are some details about it?`);
// Define flows
exports.myFlow = (0, flow_1.defineFlow)({
    name: 'menuSuggestionFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
}, async (subject) => {
    const llmResponse = await (0, ai_1.generate)({
        prompt: `Suggest an item for the menu of a ${subject} themed restaurant`,
        model: genkitx_openai_1.gpt4o,
    });
    return llmResponse.text();
});
(0, flow_1.startFlowsServer)();
// Tool use
// const createReminder = defineTool(
//   {
//     name: 'createReminder',
//     description: 'Use this to create reminders for things in the future',
//     inputSchema: z.object({
//       time: z
//         .string()
//         .describe('ISO timestamp string, e.g. 2024-04-03T12:23:00Z'),
//       reminder: z.string().describe('the content of the reminder'),
//     }),
//     outputSchema: z.number().describe('the ID of the created reminder'),
//   },
//   (reminder) => Promise.resolve(3)
// );
// const result = generate({
//   model: llama3x70b,
//   tools: [createReminder],
//   prompt: `
//   You are a reminder assistant.
//   If you create a reminder, describe in text the reminder you created as a response.
//   Query: I have a meeting with Anna at 3 for dinner - can you set a reminder for the time?
//   `,
// });
// console.log(result.then((res) => res.text()));
//# sourceMappingURL=index.js.map