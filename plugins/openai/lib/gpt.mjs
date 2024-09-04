import {
  __async,
  __forAwait,
  __spreadProps,
  __spreadValues
} from "./chunk-WFI2LP4G.mjs";
import { Message } from "@genkit-ai/ai";
import {
  GenerationCommonConfigSchema,
  defineModel,
  modelRef
} from "@genkit-ai/ai/model";
import z from "zod";
const MODELS_SUPPORTING_OPENAI_RESPONSE_FORMAT = [
  "gpt-4o",
  "gpt-4o-2024-05-13",
  "gpt-4o-mini",
  "gpt-4o-mini-2024-07-18",
  "gpt-4-turbo",
  "gpt-4-turbo-2024-04-09",
  "gpt-4-turbo-preview",
  "gpt-4-0125-preview",
  "gpt-4-1106-preview",
  "gpt-3.5-turbo-0125",
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-1106"
];
const OpenAiConfigSchema = GenerationCommonConfigSchema.extend({
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  logitBias: z.record(z.string(), z.number().min(-100).max(100)).optional(),
  logProbs: z.boolean().optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  seed: z.number().int().optional(),
  topLogProbs: z.number().int().min(0).max(20).optional(),
  user: z.string().optional(),
  visualDetailLevel: z.enum(["auto", "low", "high"]).optional()
});
const gpt4o = modelRef({
  name: "openai/gpt-4o",
  info: {
    versions: ["gpt-4o", "gpt-4o-2024-05-13"],
    label: "OpenAI - GPT-4o",
    supports: {
      multiturn: true,
      tools: true,
      media: true,
      systemRole: true,
      output: ["text", "json"]
    }
  },
  configSchema: OpenAiConfigSchema
});
const gpt4oMini = modelRef({
  name: "openai/gpt-4o-mini",
  info: {
    versions: ["gpt-4o-mini", "gpt-4o-mini-2024-07-18"],
    label: "OpenAI - GPT-4o mini",
    supports: {
      multiturn: true,
      tools: true,
      media: true,
      systemRole: true,
      output: ["text", "json"]
    }
  },
  configSchema: OpenAiConfigSchema
});
const gpt4Turbo = modelRef({
  name: "openai/gpt-4-turbo",
  info: {
    versions: [
      "gpt-4-turbo",
      "gpt-4-turbo-2024-04-09",
      "gpt-4-turbo-preview",
      "gpt-4-0125-preview",
      "gpt-4-1106-preview"
    ],
    label: "OpenAI - GPT-4 Turbo",
    supports: {
      multiturn: true,
      tools: true,
      media: true,
      systemRole: true,
      output: ["text", "json"]
    }
  },
  configSchema: OpenAiConfigSchema
});
const gpt4Vision = modelRef({
  name: "openai/gpt-4-vision",
  info: {
    versions: ["gpt-4-vision-preview", "gpt-4-1106-vision-preview"],
    label: "OpenAI - GPT-4 Vision",
    supports: {
      multiturn: true,
      tools: false,
      media: true,
      systemRole: true,
      output: ["text"]
    }
  },
  configSchema: OpenAiConfigSchema
});
const gpt4 = modelRef({
  name: "openai/gpt-4",
  info: {
    versions: ["gpt-4", "gpt-4-0613", "gpt-4-32k", "gpt-4-32k-0613"],
    label: "OpenAI - GPT-4",
    supports: {
      multiturn: true,
      tools: true,
      media: false,
      systemRole: true,
      output: ["text"]
    }
  },
  configSchema: OpenAiConfigSchema
});
const gpt35Turbo = modelRef({
  name: "openai/gpt-3.5-turbo",
  info: {
    versions: ["gpt-3.5-turbo-0125", "gpt-3.5-turbo", "gpt-3.5-turbo-1106"],
    label: "OpenAI - GPT-3.5 Turbo",
    supports: {
      multiturn: true,
      tools: true,
      media: false,
      systemRole: true,
      output: ["json", "text"]
    }
  },
  configSchema: OpenAiConfigSchema
});
const SUPPORTED_GPT_MODELS = {
  "gpt-4o": gpt4o,
  "gpt-4o-mini": gpt4oMini,
  "gpt-4-turbo": gpt4Turbo,
  "gpt-4-vision": gpt4Vision,
  "gpt-4": gpt4,
  "gpt-3.5-turbo": gpt35Turbo
};
function toOpenAIRole(role) {
  switch (role) {
    case "user":
      return "user";
    case "model":
      return "assistant";
    case "system":
      return "system";
    case "tool":
      return "tool";
    default:
      throw new Error(`role ${role} doesn't map to an OpenAI role.`);
  }
}
function toOpenAiTool(tool) {
  return {
    type: "function",
    function: {
      name: tool.name,
      parameters: tool.inputSchema
    }
  };
}
function toOpenAiTextAndMedia(part, visualDetailLevel) {
  if (part.text) {
    return {
      type: "text",
      text: part.text
    };
  } else if (part.media) {
    return {
      type: "image_url",
      image_url: {
        url: part.media.url,
        detail: visualDetailLevel
      }
    };
  }
  throw Error(
    `Unsupported genkit part fields encountered for current message role: ${JSON.stringify(part)}.`
  );
}
function toOpenAiMessages(messages, visualDetailLevel = "auto") {
  const openAiMsgs = [];
  for (const message of messages) {
    const msg = new Message(message);
    const role = toOpenAIRole(message.role);
    switch (role) {
      case "user":
        openAiMsgs.push({
          role,
          content: msg.content.map(
            (part) => toOpenAiTextAndMedia(part, visualDetailLevel)
          )
        });
        break;
      case "system":
        openAiMsgs.push({
          role,
          content: msg.text()
        });
        break;
      case "assistant": {
        const toolCalls = msg.content.filter(
          (part) => Boolean(part.toolRequest)
        ).map((part) => {
          var _a;
          return {
            id: (_a = part.toolRequest.ref) != null ? _a : "",
            type: "function",
            function: {
              name: part.toolRequest.name,
              arguments: JSON.stringify(part.toolRequest.input)
            }
          };
        });
        if (toolCalls.length > 0) {
          openAiMsgs.push({
            role,
            tool_calls: toolCalls
          });
        } else {
          openAiMsgs.push({
            role,
            content: msg.text()
          });
        }
        break;
      }
      case "tool": {
        const toolResponseParts = msg.toolResponseParts();
        toolResponseParts.map((part) => {
          var _a;
          openAiMsgs.push({
            role,
            tool_call_id: (_a = part.toolResponse.ref) != null ? _a : "",
            content: typeof part.toolResponse.output === "string" ? part.toolResponse.output : JSON.stringify(part.toolResponse.output)
          });
        });
        break;
      }
    }
  }
  return openAiMsgs;
}
const finishReasonMap = {
  length: "length",
  stop: "stop",
  tool_calls: "stop",
  content_filter: "blocked"
};
function fromOpenAiToolCall(toolCall) {
  if (!toolCall.function) {
    throw Error(
      `Unexpected openAI chunk choice. tool_calls was provided but one or more tool_calls is missing.`
    );
  }
  const f = toolCall.function;
  return {
    toolRequest: {
      name: f.name,
      ref: toolCall.id,
      input: f.arguments ? JSON.parse(f.arguments) : f.arguments
    }
  };
}
function fromOpenAiChoice(choice, jsonMode = false) {
  var _a;
  const toolRequestParts = (_a = choice.message.tool_calls) == null ? void 0 : _a.map(fromOpenAiToolCall);
  return {
    index: choice.index,
    finishReason: finishReasonMap[choice.finish_reason] || "other",
    message: {
      role: "model",
      content: toolRequestParts && toolRequestParts.length > 0 ? (
        // Note: Not sure why I have to cast here exactly.
        // Otherwise it thinks toolRequest must be 'undefined' if provided
        toolRequestParts
      ) : [
        jsonMode ? { data: JSON.parse(choice.message.content) } : { text: choice.message.content }
      ]
    },
    custom: {}
  };
}
function fromOpenAiChunkChoice(choice, jsonMode = false) {
  var _a;
  const toolRequestParts = (_a = choice.delta.tool_calls) == null ? void 0 : _a.map(fromOpenAiToolCall);
  return {
    index: choice.index,
    finishReason: choice.finish_reason ? finishReasonMap[choice.finish_reason] || "other" : "unknown",
    message: {
      role: "model",
      content: toolRequestParts ? (
        // Note: Not sure why I have to cast here exactly.
        // Otherwise it thinks toolRequest must be 'undefined' if provided
        toolRequestParts
      ) : [
        jsonMode ? { data: JSON.parse(choice.delta.content) } : { text: choice.delta.content }
      ]
    },
    custom: {}
  };
}
function toOpenAiRequestBody(modelName, request) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s;
  const model = SUPPORTED_GPT_MODELS[modelName];
  if (!model)
    throw new Error(`Unsupported model: ${modelName}`);
  const openAiMessages = toOpenAiMessages(
    request.messages,
    (_a = request.config) == null ? void 0 : _a.visualDetailLevel
  );
  const mappedModelName = ((_b = request.config) == null ? void 0 : _b.version) || model.version || modelName;
  const body = {
    model: mappedModelName,
    messages: openAiMessages,
    temperature: (_c = request.config) == null ? void 0 : _c.temperature,
    max_tokens: (_d = request.config) == null ? void 0 : _d.maxOutputTokens,
    top_p: (_e = request.config) == null ? void 0 : _e.topP,
    stop: (_f = request.config) == null ? void 0 : _f.stopSequences,
    frequency_penalty: (_g = request.config) == null ? void 0 : _g.frequencyPenalty,
    logit_bias: (_h = request.config) == null ? void 0 : _h.logitBias,
    logprobs: (_i = request.config) == null ? void 0 : _i.logProbs,
    // logprobs not snake case!
    presence_penalty: (_j = request.config) == null ? void 0 : _j.presencePenalty,
    seed: (_k = request.config) == null ? void 0 : _k.seed,
    top_logprobs: (_l = request.config) == null ? void 0 : _l.topLogProbs,
    // logprobs not snake case!
    user: (_m = request.config) == null ? void 0 : _m.user,
    tools: (_n = request.tools) == null ? void 0 : _n.map(toOpenAiTool),
    n: request.candidates
  };
  const response_format = (_o = request.output) == null ? void 0 : _o.format;
  if (response_format && MODELS_SUPPORTING_OPENAI_RESPONSE_FORMAT.includes(mappedModelName)) {
    if (response_format === "json" && ((_q = (_p = model.info.supports) == null ? void 0 : _p.output) == null ? void 0 : _q.includes("json"))) {
      body.response_format = {
        type: "json_object"
      };
    } else if (response_format === "text" && ((_s = (_r = model.info.supports) == null ? void 0 : _r.output) == null ? void 0 : _s.includes("text"))) {
      body.response_format = {
        type: "text"
      };
    } else {
      throw new Error(
        `${response_format} format is not supported for GPT models currently`
      );
    }
  }
  for (const key in body) {
    if (!body[key] || Array.isArray(body[key]) && !body[key].length)
      delete body[key];
  }
  return body;
}
function gptRunner(name, client) {
  return (request, streamingCallback) => __async(this, null, function* () {
    var _a, _b, _c, _d;
    let response;
    const body = toOpenAiRequestBody(name, request);
    if (streamingCallback) {
      const stream = client.beta.chat.completions.stream(__spreadProps(__spreadValues({}, body), {
        stream: true
      }));
      try {
        for (var iter = __forAwait(stream), more, temp, error; more = !(temp = yield iter.next()).done; more = false) {
          const chunk = temp.value;
          (_a = chunk.choices) == null ? void 0 : _a.forEach((chunk2) => {
            const c = fromOpenAiChunkChoice(chunk2);
            streamingCallback({
              index: c.index,
              content: c.message.content
            });
          });
        }
      } catch (temp) {
        error = [temp];
      } finally {
        try {
          more && (temp = iter.return) && (yield temp.call(iter));
        } finally {
          if (error)
            throw error[0];
        }
      }
      response = yield stream.finalChatCompletion();
    } else {
      response = yield client.chat.completions.create(body);
    }
    return {
      candidates: response.choices.map(
        (c) => {
          var _a2;
          return fromOpenAiChoice(c, ((_a2 = request.output) == null ? void 0 : _a2.format) === "json");
        }
      ),
      usage: {
        inputTokens: (_b = response.usage) == null ? void 0 : _b.prompt_tokens,
        outputTokens: (_c = response.usage) == null ? void 0 : _c.completion_tokens,
        totalTokens: (_d = response.usage) == null ? void 0 : _d.total_tokens
      },
      custom: response
    };
  });
}
function gptModel(name, client) {
  const modelId = `openai/${name}`;
  const model = SUPPORTED_GPT_MODELS[name];
  if (!model)
    throw new Error(`Unsupported model: ${name}`);
  return defineModel(
    __spreadProps(__spreadValues({
      name: modelId
    }, model.info), {
      configSchema: model.configSchema
    }),
    gptRunner(name, client)
  );
}
export {
  OpenAiConfigSchema,
  SUPPORTED_GPT_MODELS,
  fromOpenAiChoice,
  fromOpenAiChunkChoice,
  fromOpenAiToolCall,
  gpt35Turbo,
  gpt4,
  gpt4Turbo,
  gpt4Vision,
  gpt4o,
  gpt4oMini,
  gptModel,
  gptRunner,
  toOpenAIRole,
  toOpenAiMessages,
  toOpenAiRequestBody,
  toOpenAiTextAndMedia
};
//# sourceMappingURL=gpt.mjs.map