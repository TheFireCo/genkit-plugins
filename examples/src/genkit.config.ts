import 'dotenv/config';

import { configureGenkit } from '@genkit-ai/core';
import groq from 'genkitx-groq';
import cohere from 'genkitx-cohere';
import anthropic from 'genkitx-anthropicai';
import mistral from 'genkitx-mistral';
import openAI from 'genkitx-openai-plugin';
import { dotprompt } from '@genkit-ai/dotprompt';

export default configureGenkit({
  plugins: [openAI(), groq(), cohere(), anthropic(), mistral(), dotprompt()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
