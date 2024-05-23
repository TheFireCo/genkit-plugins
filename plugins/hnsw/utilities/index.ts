import { GenkitError } from "@genkit-ai/core";
import { StatusName } from "@genkit-ai/core/lib/statusTypes";

import { PluginOptions } from "./../interfaces";

import { ERROR_INVALID_ARGUMENT, ERROR_NO_API_KEY } from "./../constants";

export const throwError = (status: StatusName, message: string) => {
  throw new GenkitError({
    status,
    message,
  });
};

export const checkApiKey = (pluginOptions: PluginOptions) => {
  const { apiKey } = pluginOptions;
  if (!apiKey) return throwError(ERROR_INVALID_ARGUMENT, ERROR_NO_API_KEY);
};
