import { generate, defineTool } from "@genkit-ai/ai";
import { gpt4, gpt4Turbo } from "genkitx-openai-plugin";
import { z } from "zod";

const promise = Promise.resolve(3);

const createReminder = defineTool({
		name: "createReminder",
		description: "Use this to create reminders for things in the future",
		inputSchema: z.object({
			time: z.string().describe('ISO timestamp string, e.g. 2024-04-03T12:23:00Z'),
			reminder: z.string().describe('the content of the reminder'),
		}),
		outputSchema: z.number().describe('the ID of the created reminder')
	},
	(reminder) => promise
);

const result = generate({
  model: gpt4Turbo,
  // tools: [createReminder],
  prompt: `
  You are a reminder assistant.
  If you create a reminder, describe in text the reminder you created as a response.

  Query: I have a meeting with Anna at 3 for dinner - can you set a reminder for the time?
  `
});

console.log(result.then(res => res.text()));

// console.log('hi');
// console.log('hi')