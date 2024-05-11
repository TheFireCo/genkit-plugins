import { defineDotprompt } from '@genkit-ai/dotprompt';
import * as z from 'zod';

export const helloPrompt = defineDotprompt(
    {
      model: 'vertexai/gemini-1.0-pro',
      input: {
        schema: z.object({
          name: z.string(),
        }),
      },
    },
    `Hello {{name}}, how are you today?`
  );