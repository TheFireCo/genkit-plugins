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

import { genkitPlugin, Plugin } from "@genkit-ai/core";
import { CohereClient } from "cohere-ai";
import {
  command,
  commandLight,
  commandR,
  commandRPlus,
  commandModel,
  SUPPORTED_COMMAND_MODELS,
} from "./command";

export { command, commandLight, commandR, commandRPlus };

export interface PluginOptions {
  apiKey?: string;
}

export const cohere: Plugin<[PluginOptions] | []> = genkitPlugin(
  "cohere",
  async (options?: PluginOptions) => {
    let apiKey = options?.apiKey || process.env.COHERE_API_KEY;
    if (!apiKey)
      throw new Error(
        "Please pass in the API key or set the COHERE_API_KEY environment variable"
      );
    const client = new CohereClient({ token: apiKey });
    return {
      models: [
        ...Object.keys(SUPPORTED_COMMAND_MODELS).map((name) =>
          commandModel(name, client)
        ),
      ],
    };
  }
);

export default cohere;
