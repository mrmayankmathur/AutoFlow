import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGateway, generateText } from "ai";

/* ---------------- Providers ---------------- */

const google = createGoogleGenerativeAI();

export const openai = createOpenAI({
  apiKey: process.env.GITHUB_TOKEN!,
  baseURL: "https://models.github.ai/inference",
});

const anthropic = createAnthropic();

/* ---------------- Inngest Function ---------------- */

export const execute = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai" },
  async ({ step }) => {
    await step.sleep("pretend", "5s");

    const { steps: geminiSteps } = await step.ai.wrap(
      "gemini-generate-text",
      generateText,
      {
        model: google("gemini-3-flash-preview"),
        system: "You are a helpful assistant.",
        prompt: "What is 2 + 2?",
      }
    );

    const { steps: openaiSteps } = await step.ai.wrap(
      "github-openai",
      generateText,
      {
        model: openai.chat("gpt-4.1"),
        system: "You are a helpful assistant.",
        prompt: "What is 2 + 2?",
      }
    );

    const { steps: anthropicSteps } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      {
        model: anthropic("claude-sonnet-4-5"),
        system: "You are a helpful assistant.",
        prompt: "What is 2 + 2?",
      }
    );

    return {
      geminiSteps,
      openaiSteps,
      anthropicSteps,
    };
  }
);
