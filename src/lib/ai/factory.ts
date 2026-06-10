import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

export type AIProvider = "OPENAI" | "ANTHROPIC" | "GEMINI";

interface AIServiceParams {
  provider: AIProvider;
  apiKey: string;
  modelOverride?: string;
  baseURL?: string;
}

export function getAIModel(params: AIServiceParams): LanguageModel {
  const { provider, apiKey, modelOverride, baseURL } = params;

  switch (provider) {
    case "OPENAI": {
      const openai = createOpenAI({
        apiKey,
        ...(baseURL && { baseURL }),
      });
      return openai.chat(modelOverride || "gpt-4o");
    }
    case "ANTHROPIC": {
      const anthropic = createAnthropic({ apiKey });
      return anthropic(modelOverride || "claude-sonnet-4-6");
    }
    case "GEMINI": {
      const google = createGoogleGenerativeAI({ apiKey });
      return google(modelOverride || "gemini-3.5-flash");
    }
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}