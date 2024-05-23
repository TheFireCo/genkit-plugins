import * as z from "zod";

import {
  FLOW_NAME_INDEXER,
  FLOW_NAME_RETRIEVER,
  SCHEMA_PROMPT,
  SCHEMA_INDEX_PATH,
  SCHEMA_RESULT,
  SCHEMA_TRAINABLE_PATH,
  SCHEMA_INDEX_OUTPUT_PATH,
} from "./../constants";

export const indexerFlowConfig = {
  name: FLOW_NAME_INDEXER,
  inputSchema: z.object({
    dataPath: z.string().describe(SCHEMA_TRAINABLE_PATH),
    indexOutputPath: z.string().describe(SCHEMA_INDEX_OUTPUT_PATH),
  }),
  outputSchema: z.string().describe(SCHEMA_RESULT),
};

export const retrieverflowConfig = {
  name: FLOW_NAME_RETRIEVER,
  inputSchema: z.object({
    prompt: z.string().describe(SCHEMA_PROMPT),
    indexPath: z.string().describe(SCHEMA_INDEX_PATH),
  }),
  outputSchema: z.string().describe(SCHEMA_RESULT),
};
