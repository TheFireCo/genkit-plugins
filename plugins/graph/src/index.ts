/**
 * Copyright 2024 The Fire Company
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { defineFlow, Flow, FlowAuthPolicy, runFlow } from '@genkit-ai/flow';
import * as express from 'express';
import * as z from 'zod';

const StateReturnSchema = <T extends z.ZodTypeAny>(stateSchema: T) => {
  return z.object({
    state: stateSchema,
    nextNode: z.string(),
  });
};
type StateReturnSchema<T extends z.ZodTypeAny> = ReturnType<
  typeof StateReturnSchema<T>
>;

export function defineGraph<
  StateSchema extends z.ZodTypeAny = z.ZodTypeAny,
  InputSchema extends z.ZodTypeAny = z.ZodTypeAny,
  OutputSchema extends z.ZodTypeAny = z.ZodTypeAny,
>(
  config: {
    name: string;
    stateSchema?: StateSchema;
    inputSchema?: InputSchema;
    outputSchema?: OutputSchema;
    initialState?: z.infer<StateSchema>;
    experimentalDurable?: boolean;
    authPolicy?: FlowAuthPolicy<InputSchema>;
    middleware?: express.RequestHandler[];
  },
  entrypoint: (
    input: z.infer<InputSchema>
  ) =>
    | Promise<z.infer<StateReturnSchema<StateSchema>>>
    | z.infer<StateReturnSchema<StateSchema>>
): {
  flow: Flow<InputSchema, OutputSchema>;
  addNode: (
    flow: Flow<StateSchema, StateReturnSchema<StateSchema> | OutputSchema>
  ) => void;
} {
  const nodes: Record<
    string,
    Flow<StateSchema, StateReturnSchema<StateSchema> | OutputSchema>
  > = {};

  const addNode = (
    flow: Flow<StateSchema, StateReturnSchema<StateSchema> | OutputSchema>
  ) => {
    if (nodes[flow.name]) {
      throw new Error(`Node ${flow.name} already exists`);
    }

    nodes[flow.name] = flow;
  };

  const flow = defineFlow<InputSchema, OutputSchema>(
    {
      name: config.name,
      inputSchema: config.inputSchema,
      outputSchema: config.outputSchema,
      authPolicy: config.authPolicy,
      middleware: config.middleware,
    },
    async (input) => {
      let { state, nextNode } = await entrypoint(input);

      let currentNode = nextNode;

      while (true) {
        if (!nodes[currentNode]) {
          throw new Error(`Node ${currentNode} does not exist`);
        }

        const result = await runFlow(nodes[currentNode], state);

        let parseResult = config.outputSchema!.safeParse(result);

        if (parseResult.success) {
          return result as z.infer<OutputSchema>;
        }

        parseResult = config.stateSchema!.safeParse(result);

        if (parseResult.success) {
          state = (result as z.infer<StateReturnSchema<StateSchema>>).state!;
          currentNode = (result as z.infer<StateReturnSchema<StateSchema>>)
            .nextNode;
          continue;
        } else {
          throw new Error(
            'Invalid output: outputSchema does not satisfy stateSchema or outputSchema'
          );
        }
      }
    }
  );

  return {
    flow,
    addNode,
  };
}
