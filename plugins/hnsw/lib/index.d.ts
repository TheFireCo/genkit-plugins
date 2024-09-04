import * as _genkit_ai_core from '@genkit-ai/core';
import { PluginOptions } from './interfaces/index.js';

declare const hnswIndexer: _genkit_ai_core.Plugin<[pluginOptions: PluginOptions]>;
declare const hnswRetriever: _genkit_ai_core.Plugin<[pluginOptions: PluginOptions]>;

export { hnswIndexer, hnswRetriever };
