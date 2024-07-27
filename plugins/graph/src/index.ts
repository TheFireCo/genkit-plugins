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
  OutputSchema extends z.ZodTypeAny = z.ZodTypeAny,
>(config: {
  name: string;
  stateSchema?: StateSchema;
  outputSchema?: OutputSchema;
  experimentalDurable?: boolean;
  authPolicy?: FlowAuthPolicy<StateSchema>;
  middleware?: express.RequestHandler[];
}): {
  graph: Flow<StateSchema, OutputSchema>;
  addNode: (
    flow: Flow<StateSchema, StateReturnSchema<StateSchema> | OutputSchema>
  ) => void;
  setEntrypoint: (name: string) => void;
} {
  const nodes: Record<
    string,
    Flow<StateSchema, StateReturnSchema<StateSchema> | OutputSchema>
  > = {};
  let entrypoint: keyof typeof nodes | undefined;

  const addNode = (
    flow: Flow<StateSchema, StateReturnSchema<StateSchema> | OutputSchema>
  ) => {
    if (nodes[flow.name]) {
      throw new Error(`Node ${flow.name} already exists`);
    }

    nodes[flow.name] = flow;
  };

  const setEntrypoint = (name: string) => {
    if (!nodes[name]) {
      throw new Error(`Node ${name} does not exist`);
    }

    entrypoint = name;
  };

  const graph = defineFlow<StateSchema, OutputSchema>(
    {
      name: config.name,
      inputSchema: config.stateSchema,
      outputSchema: config.outputSchema,
      authPolicy: config.authPolicy,
      middleware: config.middleware,
    },
    async (input) => {
      if (entrypoint === undefined) {
        throw new Error('No entrypoint defined');
      }

      let state = input;

      let flowName = entrypoint;
      while (true) {
        const result = await runFlow(nodes[flowName], state);

        let parseResult = config.outputSchema!.safeParse(result);

        if (parseResult.success) {
          return result as z.infer<OutputSchema>;
        }

        parseResult = config.stateSchema!.safeParse(result);

        if (parseResult.success) {
          state = (result as z.infer<StateReturnSchema<StateSchema>>).state!;
          flowName = (result as z.infer<StateReturnSchema<StateSchema>>)
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
    graph,
    addNode,
    setEntrypoint,
  };
}
