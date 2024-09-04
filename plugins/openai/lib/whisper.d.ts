import * as _genkit_ai_ai_model from '@genkit-ai/ai/model';
import { ModelAction } from '@genkit-ai/ai/model';
import OpenAI from 'openai';
import { z } from 'zod';

declare const Whisper1ConfigSchema: z.ZodObject<z.objectUtil.extendShape<{
    version: z.ZodOptional<z.ZodString>;
    temperature: z.ZodOptional<z.ZodNumber>;
    maxOutputTokens: z.ZodOptional<z.ZodNumber>;
    topK: z.ZodOptional<z.ZodNumber>;
    topP: z.ZodOptional<z.ZodNumber>;
    stopSequences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, {
    language: z.ZodOptional<z.ZodString>;
    timestamp_granularities: z.ZodOptional<z.ZodArray<z.ZodEnum<["word", "segment"]>, "many">>;
    response_format: z.ZodOptional<z.ZodEnum<["json", "text", "srt", "verbose_json", "vtt"]>>;
}>, "strip", z.ZodTypeAny, {
    response_format?: "text" | "json" | "srt" | "verbose_json" | "vtt" | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    language?: string | undefined;
    timestamp_granularities?: ("word" | "segment")[] | undefined;
}, {
    response_format?: "text" | "json" | "srt" | "verbose_json" | "vtt" | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    language?: string | undefined;
    timestamp_granularities?: ("word" | "segment")[] | undefined;
}>;
declare const whisper1: _genkit_ai_ai_model.ModelReference<z.ZodObject<z.objectUtil.extendShape<{
    version: z.ZodOptional<z.ZodString>;
    temperature: z.ZodOptional<z.ZodNumber>;
    maxOutputTokens: z.ZodOptional<z.ZodNumber>;
    topK: z.ZodOptional<z.ZodNumber>;
    topP: z.ZodOptional<z.ZodNumber>;
    stopSequences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, {
    language: z.ZodOptional<z.ZodString>;
    timestamp_granularities: z.ZodOptional<z.ZodArray<z.ZodEnum<["word", "segment"]>, "many">>;
    response_format: z.ZodOptional<z.ZodEnum<["json", "text", "srt", "verbose_json", "vtt"]>>;
}>, "strip", z.ZodTypeAny, {
    response_format?: "text" | "json" | "srt" | "verbose_json" | "vtt" | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    language?: string | undefined;
    timestamp_granularities?: ("word" | "segment")[] | undefined;
}, {
    response_format?: "text" | "json" | "srt" | "verbose_json" | "vtt" | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    language?: string | undefined;
    timestamp_granularities?: ("word" | "segment")[] | undefined;
}>>;
declare function whisper1Model(client: OpenAI): ModelAction<typeof Whisper1ConfigSchema>;

export { Whisper1ConfigSchema, whisper1, whisper1Model };
