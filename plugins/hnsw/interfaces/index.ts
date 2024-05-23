export interface RetrieverFlowOptions {
  prompt: string;
  indexPath: string;
  temperature?: number;
  maxOutputTokens?: number;
  topK?: number;
  topP?: number;
  stopSequences?: string[];
}

export interface IndexerFlowOptions {
  dataPath: string;
  indexOutputPath: string;
  chunkSize?: number;
  separator?: string;
}

export interface PluginOptions {
  apiKey?: string;
}