import * as _genkit_ai_ai_model from '@genkit-ai/ai/model';
import { Role, Part, MessageData, ToolRequestPart, CandidateData, GenerateRequest, GenerateResponseChunkData, GenerateResponseData, ModelAction } from '@genkit-ai/ai/model';
import { StreamingCallback } from '@genkit-ai/core';
import OpenAI from 'openai';
import { ChatCompletionRole, ChatCompletionContentPart, ChatCompletionMessageParam, ChatCompletionMessageToolCall, ChatCompletionChunk, ChatCompletion } from 'openai/resources/index.mjs';
import z from 'zod';

declare const OpenAiConfigSchema: z.ZodObject<z.objectUtil.extendShape<{
    version: z.ZodOptional<z.ZodString>;
    temperature: z.ZodOptional<z.ZodNumber>;
    maxOutputTokens: z.ZodOptional<z.ZodNumber>;
    topK: z.ZodOptional<z.ZodNumber>;
    topP: z.ZodOptional<z.ZodNumber>;
    stopSequences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, {
    frequencyPenalty: z.ZodOptional<z.ZodNumber>;
    logitBias: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    logProbs: z.ZodOptional<z.ZodBoolean>;
    presencePenalty: z.ZodOptional<z.ZodNumber>;
    seed: z.ZodOptional<z.ZodNumber>;
    topLogProbs: z.ZodOptional<z.ZodNumber>;
    user: z.ZodOptional<z.ZodString>;
    visualDetailLevel: z.ZodOptional<z.ZodEnum<["auto", "low", "high"]>>;
}>, "strip", z.ZodTypeAny, {
    user?: string | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    frequencyPenalty?: number | undefined;
    logitBias?: Record<string, number> | undefined;
    logProbs?: boolean | undefined;
    presencePenalty?: number | undefined;
    seed?: number | undefined;
    topLogProbs?: number | undefined;
    visualDetailLevel?: "auto" | "low" | "high" | undefined;
}, {
    user?: string | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    frequencyPenalty?: number | undefined;
    logitBias?: Record<string, number> | undefined;
    logProbs?: boolean | undefined;
    presencePenalty?: number | undefined;
    seed?: number | undefined;
    topLogProbs?: number | undefined;
    visualDetailLevel?: "auto" | "low" | "high" | undefined;
}>;
type VisualDetailLevel = z.infer<typeof OpenAiConfigSchema>['visualDetailLevel'];
declare const gpt4o: _genkit_ai_ai_model.ModelReference<z.ZodObject<z.objectUtil.extendShape<{
    version: z.ZodOptional<z.ZodString>;
    temperature: z.ZodOptional<z.ZodNumber>;
    maxOutputTokens: z.ZodOptional<z.ZodNumber>;
    topK: z.ZodOptional<z.ZodNumber>;
    topP: z.ZodOptional<z.ZodNumber>;
    stopSequences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, {
    frequencyPenalty: z.ZodOptional<z.ZodNumber>;
    logitBias: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    logProbs: z.ZodOptional<z.ZodBoolean>;
    presencePenalty: z.ZodOptional<z.ZodNumber>;
    seed: z.ZodOptional<z.ZodNumber>;
    topLogProbs: z.ZodOptional<z.ZodNumber>;
    user: z.ZodOptional<z.ZodString>;
    visualDetailLevel: z.ZodOptional<z.ZodEnum<["auto", "low", "high"]>>;
}>, "strip", z.ZodTypeAny, {
    user?: string | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    frequencyPenalty?: number | undefined;
    logitBias?: Record<string, number> | undefined;
    logProbs?: boolean | undefined;
    presencePenalty?: number | undefined;
    seed?: number | undefined;
    topLogProbs?: number | undefined;
    visualDetailLevel?: "auto" | "low" | "high" | undefined;
}, {
    user?: string | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    frequencyPenalty?: number | undefined;
    logitBias?: Record<string, number> | undefined;
    logProbs?: boolean | undefined;
    presencePenalty?: number | undefined;
    seed?: number | undefined;
    topLogProbs?: number | undefined;
    visualDetailLevel?: "auto" | "low" | "high" | undefined;
}>>;
declare const gpt4oMini: _genkit_ai_ai_model.ModelReference<z.ZodObject<z.objectUtil.extendShape<{
    version: z.ZodOptional<z.ZodString>;
    temperature: z.ZodOptional<z.ZodNumber>;
    maxOutputTokens: z.ZodOptional<z.ZodNumber>;
    topK: z.ZodOptional<z.ZodNumber>;
    topP: z.ZodOptional<z.ZodNumber>;
    stopSequences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, {
    frequencyPenalty: z.ZodOptional<z.ZodNumber>;
    logitBias: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    logProbs: z.ZodOptional<z.ZodBoolean>;
    presencePenalty: z.ZodOptional<z.ZodNumber>;
    seed: z.ZodOptional<z.ZodNumber>;
    topLogProbs: z.ZodOptional<z.ZodNumber>;
    user: z.ZodOptional<z.ZodString>;
    visualDetailLevel: z.ZodOptional<z.ZodEnum<["auto", "low", "high"]>>;
}>, "strip", z.ZodTypeAny, {
    user?: string | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    frequencyPenalty?: number | undefined;
    logitBias?: Record<string, number> | undefined;
    logProbs?: boolean | undefined;
    presencePenalty?: number | undefined;
    seed?: number | undefined;
    topLogProbs?: number | undefined;
    visualDetailLevel?: "auto" | "low" | "high" | undefined;
}, {
    user?: string | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    frequencyPenalty?: number | undefined;
    logitBias?: Record<string, number> | undefined;
    logProbs?: boolean | undefined;
    presencePenalty?: number | undefined;
    seed?: number | undefined;
    topLogProbs?: number | undefined;
    visualDetailLevel?: "auto" | "low" | "high" | undefined;
}>>;
declare const gpt4Turbo: _genkit_ai_ai_model.ModelReference<z.ZodObject<z.objectUtil.extendShape<{
    version: z.ZodOptional<z.ZodString>;
    temperature: z.ZodOptional<z.ZodNumber>;
    maxOutputTokens: z.ZodOptional<z.ZodNumber>;
    topK: z.ZodOptional<z.ZodNumber>;
    topP: z.ZodOptional<z.ZodNumber>;
    stopSequences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, {
    frequencyPenalty: z.ZodOptional<z.ZodNumber>;
    logitBias: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    logProbs: z.ZodOptional<z.ZodBoolean>;
    presencePenalty: z.ZodOptional<z.ZodNumber>;
    seed: z.ZodOptional<z.ZodNumber>;
    topLogProbs: z.ZodOptional<z.ZodNumber>;
    user: z.ZodOptional<z.ZodString>;
    visualDetailLevel: z.ZodOptional<z.ZodEnum<["auto", "low", "high"]>>;
}>, "strip", z.ZodTypeAny, {
    user?: string | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    frequencyPenalty?: number | undefined;
    logitBias?: Record<string, number> | undefined;
    logProbs?: boolean | undefined;
    presencePenalty?: number | undefined;
    seed?: number | undefined;
    topLogProbs?: number | undefined;
    visualDetailLevel?: "auto" | "low" | "high" | undefined;
}, {
    user?: string | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    frequencyPenalty?: number | undefined;
    logitBias?: Record<string, number> | undefined;
    logProbs?: boolean | undefined;
    presencePenalty?: number | undefined;
    seed?: number | undefined;
    topLogProbs?: number | undefined;
    visualDetailLevel?: "auto" | "low" | "high" | undefined;
}>>;
declare const gpt4Vision: _genkit_ai_ai_model.ModelReference<z.ZodObject<z.objectUtil.extendShape<{
    version: z.ZodOptional<z.ZodString>;
    temperature: z.ZodOptional<z.ZodNumber>;
    maxOutputTokens: z.ZodOptional<z.ZodNumber>;
    topK: z.ZodOptional<z.ZodNumber>;
    topP: z.ZodOptional<z.ZodNumber>;
    stopSequences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, {
    frequencyPenalty: z.ZodOptional<z.ZodNumber>;
    logitBias: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    logProbs: z.ZodOptional<z.ZodBoolean>;
    presencePenalty: z.ZodOptional<z.ZodNumber>;
    seed: z.ZodOptional<z.ZodNumber>;
    topLogProbs: z.ZodOptional<z.ZodNumber>;
    user: z.ZodOptional<z.ZodString>;
    visualDetailLevel: z.ZodOptional<z.ZodEnum<["auto", "low", "high"]>>;
}>, "strip", z.ZodTypeAny, {
    user?: string | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    frequencyPenalty?: number | undefined;
    logitBias?: Record<string, number> | undefined;
    logProbs?: boolean | undefined;
    presencePenalty?: number | undefined;
    seed?: number | undefined;
    topLogProbs?: number | undefined;
    visualDetailLevel?: "auto" | "low" | "high" | undefined;
}, {
    user?: string | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    frequencyPenalty?: number | undefined;
    logitBias?: Record<string, number> | undefined;
    logProbs?: boolean | undefined;
    presencePenalty?: number | undefined;
    seed?: number | undefined;
    topLogProbs?: number | undefined;
    visualDetailLevel?: "auto" | "low" | "high" | undefined;
}>>;
declare const gpt4: _genkit_ai_ai_model.ModelReference<z.ZodObject<z.objectUtil.extendShape<{
    version: z.ZodOptional<z.ZodString>;
    temperature: z.ZodOptional<z.ZodNumber>;
    maxOutputTokens: z.ZodOptional<z.ZodNumber>;
    topK: z.ZodOptional<z.ZodNumber>;
    topP: z.ZodOptional<z.ZodNumber>;
    stopSequences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, {
    frequencyPenalty: z.ZodOptional<z.ZodNumber>;
    logitBias: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    logProbs: z.ZodOptional<z.ZodBoolean>;
    presencePenalty: z.ZodOptional<z.ZodNumber>;
    seed: z.ZodOptional<z.ZodNumber>;
    topLogProbs: z.ZodOptional<z.ZodNumber>;
    user: z.ZodOptional<z.ZodString>;
    visualDetailLevel: z.ZodOptional<z.ZodEnum<["auto", "low", "high"]>>;
}>, "strip", z.ZodTypeAny, {
    user?: string | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    frequencyPenalty?: number | undefined;
    logitBias?: Record<string, number> | undefined;
    logProbs?: boolean | undefined;
    presencePenalty?: number | undefined;
    seed?: number | undefined;
    topLogProbs?: number | undefined;
    visualDetailLevel?: "auto" | "low" | "high" | undefined;
}, {
    user?: string | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    frequencyPenalty?: number | undefined;
    logitBias?: Record<string, number> | undefined;
    logProbs?: boolean | undefined;
    presencePenalty?: number | undefined;
    seed?: number | undefined;
    topLogProbs?: number | undefined;
    visualDetailLevel?: "auto" | "low" | "high" | undefined;
}>>;
declare const gpt35Turbo: _genkit_ai_ai_model.ModelReference<z.ZodObject<z.objectUtil.extendShape<{
    version: z.ZodOptional<z.ZodString>;
    temperature: z.ZodOptional<z.ZodNumber>;
    maxOutputTokens: z.ZodOptional<z.ZodNumber>;
    topK: z.ZodOptional<z.ZodNumber>;
    topP: z.ZodOptional<z.ZodNumber>;
    stopSequences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, {
    frequencyPenalty: z.ZodOptional<z.ZodNumber>;
    logitBias: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    logProbs: z.ZodOptional<z.ZodBoolean>;
    presencePenalty: z.ZodOptional<z.ZodNumber>;
    seed: z.ZodOptional<z.ZodNumber>;
    topLogProbs: z.ZodOptional<z.ZodNumber>;
    user: z.ZodOptional<z.ZodString>;
    visualDetailLevel: z.ZodOptional<z.ZodEnum<["auto", "low", "high"]>>;
}>, "strip", z.ZodTypeAny, {
    user?: string | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    frequencyPenalty?: number | undefined;
    logitBias?: Record<string, number> | undefined;
    logProbs?: boolean | undefined;
    presencePenalty?: number | undefined;
    seed?: number | undefined;
    topLogProbs?: number | undefined;
    visualDetailLevel?: "auto" | "low" | "high" | undefined;
}, {
    user?: string | undefined;
    version?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
    frequencyPenalty?: number | undefined;
    logitBias?: Record<string, number> | undefined;
    logProbs?: boolean | undefined;
    presencePenalty?: number | undefined;
    seed?: number | undefined;
    topLogProbs?: number | undefined;
    visualDetailLevel?: "auto" | "low" | "high" | undefined;
}>>;
declare const SUPPORTED_GPT_MODELS: {
    'gpt-4o': _genkit_ai_ai_model.ModelReference<z.ZodObject<z.objectUtil.extendShape<{
        version: z.ZodOptional<z.ZodString>;
        temperature: z.ZodOptional<z.ZodNumber>;
        maxOutputTokens: z.ZodOptional<z.ZodNumber>;
        topK: z.ZodOptional<z.ZodNumber>;
        topP: z.ZodOptional<z.ZodNumber>;
        stopSequences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, {
        frequencyPenalty: z.ZodOptional<z.ZodNumber>;
        logitBias: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        logProbs: z.ZodOptional<z.ZodBoolean>;
        presencePenalty: z.ZodOptional<z.ZodNumber>;
        seed: z.ZodOptional<z.ZodNumber>;
        topLogProbs: z.ZodOptional<z.ZodNumber>;
        user: z.ZodOptional<z.ZodString>;
        visualDetailLevel: z.ZodOptional<z.ZodEnum<["auto", "low", "high"]>>;
    }>, "strip", z.ZodTypeAny, {
        user?: string | undefined;
        version?: string | undefined;
        temperature?: number | undefined;
        maxOutputTokens?: number | undefined;
        topK?: number | undefined;
        topP?: number | undefined;
        stopSequences?: string[] | undefined;
        frequencyPenalty?: number | undefined;
        logitBias?: Record<string, number> | undefined;
        logProbs?: boolean | undefined;
        presencePenalty?: number | undefined;
        seed?: number | undefined;
        topLogProbs?: number | undefined;
        visualDetailLevel?: "auto" | "low" | "high" | undefined;
    }, {
        user?: string | undefined;
        version?: string | undefined;
        temperature?: number | undefined;
        maxOutputTokens?: number | undefined;
        topK?: number | undefined;
        topP?: number | undefined;
        stopSequences?: string[] | undefined;
        frequencyPenalty?: number | undefined;
        logitBias?: Record<string, number> | undefined;
        logProbs?: boolean | undefined;
        presencePenalty?: number | undefined;
        seed?: number | undefined;
        topLogProbs?: number | undefined;
        visualDetailLevel?: "auto" | "low" | "high" | undefined;
    }>>;
    'gpt-4o-mini': _genkit_ai_ai_model.ModelReference<z.ZodObject<z.objectUtil.extendShape<{
        version: z.ZodOptional<z.ZodString>;
        temperature: z.ZodOptional<z.ZodNumber>;
        maxOutputTokens: z.ZodOptional<z.ZodNumber>;
        topK: z.ZodOptional<z.ZodNumber>;
        topP: z.ZodOptional<z.ZodNumber>;
        stopSequences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, {
        frequencyPenalty: z.ZodOptional<z.ZodNumber>;
        logitBias: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        logProbs: z.ZodOptional<z.ZodBoolean>;
        presencePenalty: z.ZodOptional<z.ZodNumber>;
        seed: z.ZodOptional<z.ZodNumber>;
        topLogProbs: z.ZodOptional<z.ZodNumber>;
        user: z.ZodOptional<z.ZodString>;
        visualDetailLevel: z.ZodOptional<z.ZodEnum<["auto", "low", "high"]>>;
    }>, "strip", z.ZodTypeAny, {
        user?: string | undefined;
        version?: string | undefined;
        temperature?: number | undefined;
        maxOutputTokens?: number | undefined;
        topK?: number | undefined;
        topP?: number | undefined;
        stopSequences?: string[] | undefined;
        frequencyPenalty?: number | undefined;
        logitBias?: Record<string, number> | undefined;
        logProbs?: boolean | undefined;
        presencePenalty?: number | undefined;
        seed?: number | undefined;
        topLogProbs?: number | undefined;
        visualDetailLevel?: "auto" | "low" | "high" | undefined;
    }, {
        user?: string | undefined;
        version?: string | undefined;
        temperature?: number | undefined;
        maxOutputTokens?: number | undefined;
        topK?: number | undefined;
        topP?: number | undefined;
        stopSequences?: string[] | undefined;
        frequencyPenalty?: number | undefined;
        logitBias?: Record<string, number> | undefined;
        logProbs?: boolean | undefined;
        presencePenalty?: number | undefined;
        seed?: number | undefined;
        topLogProbs?: number | undefined;
        visualDetailLevel?: "auto" | "low" | "high" | undefined;
    }>>;
    'gpt-4-turbo': _genkit_ai_ai_model.ModelReference<z.ZodObject<z.objectUtil.extendShape<{
        version: z.ZodOptional<z.ZodString>;
        temperature: z.ZodOptional<z.ZodNumber>;
        maxOutputTokens: z.ZodOptional<z.ZodNumber>;
        topK: z.ZodOptional<z.ZodNumber>;
        topP: z.ZodOptional<z.ZodNumber>;
        stopSequences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, {
        frequencyPenalty: z.ZodOptional<z.ZodNumber>;
        logitBias: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        logProbs: z.ZodOptional<z.ZodBoolean>;
        presencePenalty: z.ZodOptional<z.ZodNumber>;
        seed: z.ZodOptional<z.ZodNumber>;
        topLogProbs: z.ZodOptional<z.ZodNumber>;
        user: z.ZodOptional<z.ZodString>;
        visualDetailLevel: z.ZodOptional<z.ZodEnum<["auto", "low", "high"]>>;
    }>, "strip", z.ZodTypeAny, {
        user?: string | undefined;
        version?: string | undefined;
        temperature?: number | undefined;
        maxOutputTokens?: number | undefined;
        topK?: number | undefined;
        topP?: number | undefined;
        stopSequences?: string[] | undefined;
        frequencyPenalty?: number | undefined;
        logitBias?: Record<string, number> | undefined;
        logProbs?: boolean | undefined;
        presencePenalty?: number | undefined;
        seed?: number | undefined;
        topLogProbs?: number | undefined;
        visualDetailLevel?: "auto" | "low" | "high" | undefined;
    }, {
        user?: string | undefined;
        version?: string | undefined;
        temperature?: number | undefined;
        maxOutputTokens?: number | undefined;
        topK?: number | undefined;
        topP?: number | undefined;
        stopSequences?: string[] | undefined;
        frequencyPenalty?: number | undefined;
        logitBias?: Record<string, number> | undefined;
        logProbs?: boolean | undefined;
        presencePenalty?: number | undefined;
        seed?: number | undefined;
        topLogProbs?: number | undefined;
        visualDetailLevel?: "auto" | "low" | "high" | undefined;
    }>>;
    'gpt-4-vision': _genkit_ai_ai_model.ModelReference<z.ZodObject<z.objectUtil.extendShape<{
        version: z.ZodOptional<z.ZodString>;
        temperature: z.ZodOptional<z.ZodNumber>;
        maxOutputTokens: z.ZodOptional<z.ZodNumber>;
        topK: z.ZodOptional<z.ZodNumber>;
        topP: z.ZodOptional<z.ZodNumber>;
        stopSequences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, {
        frequencyPenalty: z.ZodOptional<z.ZodNumber>;
        logitBias: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        logProbs: z.ZodOptional<z.ZodBoolean>;
        presencePenalty: z.ZodOptional<z.ZodNumber>;
        seed: z.ZodOptional<z.ZodNumber>;
        topLogProbs: z.ZodOptional<z.ZodNumber>;
        user: z.ZodOptional<z.ZodString>;
        visualDetailLevel: z.ZodOptional<z.ZodEnum<["auto", "low", "high"]>>;
    }>, "strip", z.ZodTypeAny, {
        user?: string | undefined;
        version?: string | undefined;
        temperature?: number | undefined;
        maxOutputTokens?: number | undefined;
        topK?: number | undefined;
        topP?: number | undefined;
        stopSequences?: string[] | undefined;
        frequencyPenalty?: number | undefined;
        logitBias?: Record<string, number> | undefined;
        logProbs?: boolean | undefined;
        presencePenalty?: number | undefined;
        seed?: number | undefined;
        topLogProbs?: number | undefined;
        visualDetailLevel?: "auto" | "low" | "high" | undefined;
    }, {
        user?: string | undefined;
        version?: string | undefined;
        temperature?: number | undefined;
        maxOutputTokens?: number | undefined;
        topK?: number | undefined;
        topP?: number | undefined;
        stopSequences?: string[] | undefined;
        frequencyPenalty?: number | undefined;
        logitBias?: Record<string, number> | undefined;
        logProbs?: boolean | undefined;
        presencePenalty?: number | undefined;
        seed?: number | undefined;
        topLogProbs?: number | undefined;
        visualDetailLevel?: "auto" | "low" | "high" | undefined;
    }>>;
    'gpt-4': _genkit_ai_ai_model.ModelReference<z.ZodObject<z.objectUtil.extendShape<{
        version: z.ZodOptional<z.ZodString>;
        temperature: z.ZodOptional<z.ZodNumber>;
        maxOutputTokens: z.ZodOptional<z.ZodNumber>;
        topK: z.ZodOptional<z.ZodNumber>;
        topP: z.ZodOptional<z.ZodNumber>;
        stopSequences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, {
        frequencyPenalty: z.ZodOptional<z.ZodNumber>;
        logitBias: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        logProbs: z.ZodOptional<z.ZodBoolean>;
        presencePenalty: z.ZodOptional<z.ZodNumber>;
        seed: z.ZodOptional<z.ZodNumber>;
        topLogProbs: z.ZodOptional<z.ZodNumber>;
        user: z.ZodOptional<z.ZodString>;
        visualDetailLevel: z.ZodOptional<z.ZodEnum<["auto", "low", "high"]>>;
    }>, "strip", z.ZodTypeAny, {
        user?: string | undefined;
        version?: string | undefined;
        temperature?: number | undefined;
        maxOutputTokens?: number | undefined;
        topK?: number | undefined;
        topP?: number | undefined;
        stopSequences?: string[] | undefined;
        frequencyPenalty?: number | undefined;
        logitBias?: Record<string, number> | undefined;
        logProbs?: boolean | undefined;
        presencePenalty?: number | undefined;
        seed?: number | undefined;
        topLogProbs?: number | undefined;
        visualDetailLevel?: "auto" | "low" | "high" | undefined;
    }, {
        user?: string | undefined;
        version?: string | undefined;
        temperature?: number | undefined;
        maxOutputTokens?: number | undefined;
        topK?: number | undefined;
        topP?: number | undefined;
        stopSequences?: string[] | undefined;
        frequencyPenalty?: number | undefined;
        logitBias?: Record<string, number> | undefined;
        logProbs?: boolean | undefined;
        presencePenalty?: number | undefined;
        seed?: number | undefined;
        topLogProbs?: number | undefined;
        visualDetailLevel?: "auto" | "low" | "high" | undefined;
    }>>;
    'gpt-3.5-turbo': _genkit_ai_ai_model.ModelReference<z.ZodObject<z.objectUtil.extendShape<{
        version: z.ZodOptional<z.ZodString>;
        temperature: z.ZodOptional<z.ZodNumber>;
        maxOutputTokens: z.ZodOptional<z.ZodNumber>;
        topK: z.ZodOptional<z.ZodNumber>;
        topP: z.ZodOptional<z.ZodNumber>;
        stopSequences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, {
        frequencyPenalty: z.ZodOptional<z.ZodNumber>;
        logitBias: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        logProbs: z.ZodOptional<z.ZodBoolean>;
        presencePenalty: z.ZodOptional<z.ZodNumber>;
        seed: z.ZodOptional<z.ZodNumber>;
        topLogProbs: z.ZodOptional<z.ZodNumber>;
        user: z.ZodOptional<z.ZodString>;
        visualDetailLevel: z.ZodOptional<z.ZodEnum<["auto", "low", "high"]>>;
    }>, "strip", z.ZodTypeAny, {
        user?: string | undefined;
        version?: string | undefined;
        temperature?: number | undefined;
        maxOutputTokens?: number | undefined;
        topK?: number | undefined;
        topP?: number | undefined;
        stopSequences?: string[] | undefined;
        frequencyPenalty?: number | undefined;
        logitBias?: Record<string, number> | undefined;
        logProbs?: boolean | undefined;
        presencePenalty?: number | undefined;
        seed?: number | undefined;
        topLogProbs?: number | undefined;
        visualDetailLevel?: "auto" | "low" | "high" | undefined;
    }, {
        user?: string | undefined;
        version?: string | undefined;
        temperature?: number | undefined;
        maxOutputTokens?: number | undefined;
        topK?: number | undefined;
        topP?: number | undefined;
        stopSequences?: string[] | undefined;
        frequencyPenalty?: number | undefined;
        logitBias?: Record<string, number> | undefined;
        logProbs?: boolean | undefined;
        presencePenalty?: number | undefined;
        seed?: number | undefined;
        topLogProbs?: number | undefined;
        visualDetailLevel?: "auto" | "low" | "high" | undefined;
    }>>;
};
declare function toOpenAIRole(role: Role): ChatCompletionRole;
/**
 * Converts a Genkit Part to the corresponding OpenAI ChatCompletionContentPart.
 * @param part The Genkit Part to convert.
 * @param visualDetailLevel The visual detail level to use for media parts.
 * @returns The corresponding OpenAI ChatCompletionContentPart.
 * @throws Error if the part contains unsupported fields for the current message role.
 */
declare function toOpenAiTextAndMedia(part: Part, visualDetailLevel: VisualDetailLevel): ChatCompletionContentPart;
/**
 * Converts a Genkit MessageData array to an OpenAI ChatCompletionMessageParam array.
 * @param messages The Genkit MessageData array to convert.
 * @param visualDetailLevel The visual detail level to use for media parts.
 * @returns The converted OpenAI ChatCompletionMessageParam array.
 */
declare function toOpenAiMessages(messages: MessageData[], visualDetailLevel?: VisualDetailLevel): ChatCompletionMessageParam[];
/**
 * Converts an OpenAI tool call to a Genkit ToolRequestPart.
 * @param toolCall The OpenAI tool call to convert.
 * @returns The converted Genkit ToolRequestPart.
 */
declare function fromOpenAiToolCall(toolCall: ChatCompletionMessageToolCall | ChatCompletionChunk.Choice.Delta.ToolCall): ToolRequestPart;
/**
 * Converts an OpenAI message event to a Genkit CandidateData object.
 * @param choice The OpenAI message event to convert.
 * @param jsonMode Whether the event is a JSON response.
 * @returns The converted Genkit CandidateData object.
 */
declare function fromOpenAiChoice(choice: ChatCompletion.Choice, jsonMode?: boolean): CandidateData;
/**
 * Converts an OpenAI message stream event to a Genkit CandidateData object.
 * @param choice The OpenAI message stream event to convert.
 * @param jsonMode Whether the event is a JSON response.
 * @returns The converted Genkit CandidateData object.
 */
declare function fromOpenAiChunkChoice(choice: ChatCompletionChunk.Choice, jsonMode?: boolean): CandidateData;
/**
 * Converts an OpenAI request to an OpenAI API request body.
 * @param modelName The name of the OpenAI model to use.
 * @param request The Genkit GenerateRequest to convert.
 * @returns The converted OpenAI API request body.
 * @throws An error if the specified model is not supported or if an unsupported output format is requested.
 */
declare function toOpenAiRequestBody(modelName: string, request: GenerateRequest<typeof OpenAiConfigSchema>): OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming;
/**
 * Creates the runner used by Genkit to interact with the GPT model.
 * @param name The name of the GPT model.
 * @param client The OpenAI client instance.
 * @returns The runner that Genkit will call when the model is invoked.
 */
declare function gptRunner(name: string, client: OpenAI): (request: GenerateRequest<typeof OpenAiConfigSchema>, streamingCallback?: StreamingCallback<GenerateResponseChunkData>) => Promise<GenerateResponseData>;
/**
 * Defines a GPT model with the given name and OpenAI client.
 * @param name The name of the GPT model.
 * @param client The OpenAI client instance.
 * @returns The defined GPT model.
 * @throws An error if the specified model is not supported.
 */
declare function gptModel(name: string, client: OpenAI): ModelAction<typeof OpenAiConfigSchema>;

export { OpenAiConfigSchema, SUPPORTED_GPT_MODELS, fromOpenAiChoice, fromOpenAiChunkChoice, fromOpenAiToolCall, gpt35Turbo, gpt4, gpt4Turbo, gpt4Vision, gpt4o, gpt4oMini, gptModel, gptRunner, toOpenAIRole, toOpenAiMessages, toOpenAiRequestBody, toOpenAiTextAndMedia };
