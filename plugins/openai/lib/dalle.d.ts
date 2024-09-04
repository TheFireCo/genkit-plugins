import * as _genkit_ai_ai_model from '@genkit-ai/ai/model';
import { ModelAction } from '@genkit-ai/ai/model';
import OpenAI from 'openai';
import { z } from 'zod';

declare const DallE3ConfigSchema: z.ZodObject<z.objectUtil.extendShape<{
    version: z.ZodOptional<z.ZodString>;
    temperature: z.ZodOptional<z.ZodNumber>;
    maxOutputTokens: z.ZodOptional<z.ZodNumber>;
    topK: z.ZodOptional<z.ZodNumber>;
    topP: z.ZodOptional<z.ZodNumber>;
    stopSequences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, {
    size: z.ZodOptional<z.ZodEnum<["1024x1024", "1792x1024", "1024x1792"]>>;
    style: z.ZodOptional<z.ZodEnum<["vivid", "natural"]>>;
    user: z.ZodOptional<z.ZodString>;
    quality: z.ZodOptional<z.ZodEnum<["standard", "hd"]>>;
    response_format: z.ZodOptional<z.ZodEnum<["b64_json", "url"]>>;
}>, "strip", z.ZodTypeAny, {
    size?: "1024x1024" | "1792x1024" | "1024x1792" | undefined;
    style?: "vivid" | "natural" | undefined;
    user?: string | undefined;
    quality?: "standard" | "hd" | undefined;
    response_format?: "b64_json" | "url" | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
}, {
    size?: "1024x1024" | "1792x1024" | "1024x1792" | undefined;
    style?: "vivid" | "natural" | undefined;
    user?: string | undefined;
    quality?: "standard" | "hd" | undefined;
    response_format?: "b64_json" | "url" | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
}>;
declare const dallE3: _genkit_ai_ai_model.ModelReference<z.ZodObject<z.objectUtil.extendShape<{
    version: z.ZodOptional<z.ZodString>;
    temperature: z.ZodOptional<z.ZodNumber>;
    maxOutputTokens: z.ZodOptional<z.ZodNumber>;
    topK: z.ZodOptional<z.ZodNumber>;
    topP: z.ZodOptional<z.ZodNumber>;
    stopSequences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, {
    size: z.ZodOptional<z.ZodEnum<["1024x1024", "1792x1024", "1024x1792"]>>;
    style: z.ZodOptional<z.ZodEnum<["vivid", "natural"]>>;
    user: z.ZodOptional<z.ZodString>;
    quality: z.ZodOptional<z.ZodEnum<["standard", "hd"]>>;
    response_format: z.ZodOptional<z.ZodEnum<["b64_json", "url"]>>;
}>, "strip", z.ZodTypeAny, {
    size?: "1024x1024" | "1792x1024" | "1024x1792" | undefined;
    style?: "vivid" | "natural" | undefined;
    user?: string | undefined;
    quality?: "standard" | "hd" | undefined;
    response_format?: "b64_json" | "url" | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
}, {
    size?: "1024x1024" | "1792x1024" | "1024x1792" | undefined;
    style?: "vivid" | "natural" | undefined;
    user?: string | undefined;
    quality?: "standard" | "hd" | undefined;
    response_format?: "b64_json" | "url" | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
}>>;
declare function dallE3Model(client: OpenAI): ModelAction<typeof DallE3ConfigSchema>;

export { DallE3ConfigSchema, dallE3, dallE3Model };
