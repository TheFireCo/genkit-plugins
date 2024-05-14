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
import Groq from "groq-sdk";
import {
  llama_3_70b,
  llama_3_8b,
  gemma_7b,
  mixtral_8_7b,
  groqModel,
  SUPPORTED_GROQ_MODELS,
} from "./groq_models";

export {
  llama_3_70b,
  llama_3_8b,
  gemma_7b,
  mixtral_8_7b,
};

export interface PluginOptions {
  /**
   * Defaults to process.env['GROQ_API_KEY'].
   */
  apiKey?: string | undefined;

  /**
   * Override the default base URL for the API, e.g., "https://api.example.com/v2/"
   *
   * Defaults to process.env['GROQ_BASE_URL'].
   */
  baseURL?: string | null | undefined;

  /**
   * The maximum amount of time (in milliseconds) that the client should wait for a response
   * from the server before timing out a single request.
   *
   * Note that request timeouts are retried by default, so in a worst-case scenario you may wait
   * much longer than this timeout before the promise succeeds or fails.
   */
  timeout?: number;

  /**
   * The maximum number of times that the client will retry a request in case of a
   * temporary failure, like a network error or a 5XX error from the server.
   *
   * @default 2
   */
  maxRetries?: number;

  // TODO: add additional options supported by the Groq SDK
}

export const groq: Plugin<[PluginOptions] | []> = genkitPlugin(
  "groq",
  async (options?: PluginOptions) => {
    const client = new Groq({
      baseURL: options?.baseURL || process.env.GROQ_BASE_URL,
      apiKey: options?.apiKey || process.env.GROQ_API_KEY,
      timeout: options?.timeout,
      maxRetries: options?.maxRetries,
    });
    return {
      models: [
        ...Object.keys(SUPPORTED_GROQ_MODELS).map((name) =>
          groqModel(name, client)
        ),
      ],
    };
  }
);

export default groq;
