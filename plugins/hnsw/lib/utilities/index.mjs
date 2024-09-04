import { GenkitError } from "@genkit-ai/core";
import { ERROR_INVALID_ARGUMENT, ERROR_NO_API_KEY } from "../constants";
const throwError = (status, message) => {
  throw new GenkitError({
    status,
    message
  });
};
const checkApiKey = (pluginOptions) => {
  const { apiKey } = pluginOptions;
  if (!apiKey)
    return throwError(ERROR_INVALID_ARGUMENT, ERROR_NO_API_KEY);
};
export {
  checkApiKey,
  throwError
};
//# sourceMappingURL=index.mjs.map