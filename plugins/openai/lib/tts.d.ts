import * as _genkit_ai_ai_model from '@genkit-ai/ai/model';
import { ModelAction } from '@genkit-ai/ai/model';
import OpenAI from 'openai';
import { z } from 'zod';

declare const TTSConfigSchema: z.ZodObject<z.objectUtil.extendShape<{
    version: z.ZodOptional<z.ZodString>;
    temperature: z.ZodOptional<z.ZodNumber>;
    maxOutputTokens: z.ZodOptional<z.ZodNumber>;
    topK: z.ZodOptional<z.ZodNumber>;
    topP: z.ZodOptional<z.ZodNumber>;
    stopSequences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, {
    voice: z.ZodDefault<z.ZodOptional<z.ZodEnum<["alloy", "echo", "fable", "onyx", "nova", "shimmer"]>>>;
    speed: z.ZodOptional<z.ZodNumber>;
    response_format: z.ZodOptional<z.ZodEnum<["mp3", "opus", "aac", "flac", "wav", "pcm"]>>;
}>, "strip", z.ZodTypeAny, {
    voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
    response_format?: "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm" | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    speed?: number | undefined;
}, {
    response_format?: "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm" | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" | undefined;
    speed?: number | undefined;
}>;
declare const tts1: _genkit_ai_ai_model.ModelReference<z.ZodObject<z.objectUtil.extendShape<{
    version: z.ZodOptional<z.ZodString>;
    temperature: z.ZodOptional<z.ZodNumber>;
    maxOutputTokens: z.ZodOptional<z.ZodNumber>;
    topK: z.ZodOptional<z.ZodNumber>;
    topP: z.ZodOptional<z.ZodNumber>;
    stopSequences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, {
    voice: z.ZodDefault<z.ZodOptional<z.ZodEnum<["alloy", "echo", "fable", "onyx", "nova", "shimmer"]>>>;
    speed: z.ZodOptional<z.ZodNumber>;
    response_format: z.ZodOptional<z.ZodEnum<["mp3", "opus", "aac", "flac", "wav", "pcm"]>>;
}>, "strip", z.ZodTypeAny, {
    voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
    response_format?: "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm" | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    speed?: number | undefined;
}, {
    response_format?: "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm" | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" | undefined;
    speed?: number | undefined;
}>>;
declare const tts1Hd: _genkit_ai_ai_model.ModelReference<z.ZodObject<z.objectUtil.extendShape<{
    version: z.ZodOptional<z.ZodString>;
    temperature: z.ZodOptional<z.ZodNumber>;
    maxOutputTokens: z.ZodOptional<z.ZodNumber>;
    topK: z.ZodOptional<z.ZodNumber>;
    topP: z.ZodOptional<z.ZodNumber>;
    stopSequences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, {
    voice: z.ZodDefault<z.ZodOptional<z.ZodEnum<["alloy", "echo", "fable", "onyx", "nova", "shimmer"]>>>;
    speed: z.ZodOptional<z.ZodNumber>;
    response_format: z.ZodOptional<z.ZodEnum<["mp3", "opus", "aac", "flac", "wav", "pcm"]>>;
}>, "strip", z.ZodTypeAny, {
    voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
    response_format?: "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm" | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    speed?: number | undefined;
}, {
    response_format?: "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm" | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" | undefined;
    speed?: number | undefined;
}>>;
declare const SUPPORTED_TTS_MODELS: {
    'tts-1': _genkit_ai_ai_model.ModelReference<z.ZodObject<z.objectUtil.extendShape<{
        version: z.ZodOptional<z.ZodString>;
        temperature: z.ZodOptional<z.ZodNumber>;
        maxOutputTokens: z.ZodOptional<z.ZodNumber>;
        topK: z.ZodOptional<z.ZodNumber>;
        topP: z.ZodOptional<z.ZodNumber>;
        stopSequences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, {
        voice: z.ZodDefault<z.ZodOptional<z.ZodEnum<["alloy", "echo", "fable", "onyx", "nova", "shimmer"]>>>;
        speed: z.ZodOptional<z.ZodNumber>;
        response_format: z.ZodOptional<z.ZodEnum<["mp3", "opus", "aac", "flac", "wav", "pcm"]>>;
    }>, "strip", z.ZodTypeAny, {
        voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
        response_format?: "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm" | undefined;
        version?: string | undefined;
        temperature?: number | undefined;
        maxOutputTokens?: number | undefined;
        topK?: number | undefined;
        topP?: number | undefined;
        stopSequences?: string[] | undefined;
        speed?: number | undefined;
    }, {
        response_format?: "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm" | undefined;
        version?: string | undefined;
        temperature?: number | undefined;
        maxOutputTokens?: number | undefined;
        topK?: number | undefined;
        topP?: number | undefined;
        stopSequences?: string[] | undefined;
        voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" | undefined;
        speed?: number | undefined;
    }>>;
    'tts-1-hd': _genkit_ai_ai_model.ModelReference<z.ZodObject<z.objectUtil.extendShape<{
        version: z.ZodOptional<z.ZodString>;
        temperature: z.ZodOptional<z.ZodNumber>;
        maxOutputTokens: z.ZodOptional<z.ZodNumber>;
        topK: z.ZodOptional<z.ZodNumber>;
        topP: z.ZodOptional<z.ZodNumber>;
        stopSequences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, {
        voice: z.ZodDefault<z.ZodOptional<z.ZodEnum<["alloy", "echo", "fable", "onyx", "nova", "shimmer"]>>>;
        speed: z.ZodOptional<z.ZodNumber>;
        response_format: z.ZodOptional<z.ZodEnum<["mp3", "opus", "aac", "flac", "wav", "pcm"]>>;
    }>, "strip", z.ZodTypeAny, {
        voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
        response_format?: "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm" | undefined;
        version?: string | undefined;
        temperature?: number | undefined;
        maxOutputTokens?: number | undefined;
        topK?: number | undefined;
        topP?: number | undefined;
        stopSequences?: string[] | undefined;
        speed?: number | undefined;
    }, {
        response_format?: "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm" | undefined;
        version?: string | undefined;
        temperature?: number | undefined;
        maxOutputTokens?: number | undefined;
        topK?: number | undefined;
        topP?: number | undefined;
        stopSequences?: string[] | undefined;
        voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" | undefined;
        speed?: number | undefined;
    }>>;
};
declare const RESPONSE_FORMAT_MEDIA_TYPES: {
    mp3: string;
    opus: string;
    aac: string;
    flac: string;
    wav: string;
    pcm: string;
};
declare function ttsModel(name: string, client: OpenAI): ModelAction<typeof TTSConfigSchema>;

export { RESPONSE_FORMAT_MEDIA_TYPES, SUPPORTED_TTS_MODELS, TTSConfigSchema, tts1, tts1Hd, ttsModel };
