"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@genkit-ai/core");
const genkitx_groq_1 = __importDefault(require("genkitx-groq"));
const genkitx_cohere_1 = __importDefault(require("genkitx-cohere"));
const genkitx_anthropic_1 = __importDefault(require("genkitx-anthropic"));
const genkitx_mistral_1 = __importDefault(require("genkitx-mistral"));
const genkitx_openai_1 = __importDefault(require("genkitx-openai"));
const dotprompt_1 = require("@genkit-ai/dotprompt");
exports.default = (0, core_1.configureGenkit)({
    plugins: [(0, genkitx_openai_1.default)(), (0, genkitx_groq_1.default)(), (0, genkitx_cohere_1.default)(), (0, genkitx_anthropic_1.default)(), (0, genkitx_mistral_1.default)(), (0, dotprompt_1.dotprompt)()],
    logLevel: 'debug',
    enableTracingAndMetrics: true,
    promptDir: '../prompts',
});
//# sourceMappingURL=genkit.config.js.map