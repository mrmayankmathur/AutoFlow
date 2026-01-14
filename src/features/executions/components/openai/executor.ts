import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import Handlebars from "handlebars";
import { openAIChannel } from "@/inngest/channels/openai";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type OpenAIData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const openAIExecutor: NodeExecutor<OpenAIData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  console.log("Invoking OpenAI Executor for node:", nodeId);
  await publish(
    openAIChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.variableName) {
    await publish(
      openAIChannel().status({
        nodeId,
        status: "error",
      })
    );

    throw new NonRetriableError("OPENAI NODE: Variable name is required");
  }

  if (!data.userPrompt) {
    await publish(
      openAIChannel().status({
        nodeId,
        status: "error",
      })
    );

    throw new NonRetriableError("OPENAI NODE: User prompt is required");
  }

  // TODO: Throw if credential is missing

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  // TODO: Fetch credentials that user selected

  const credentialValue = process.env.GITHUB_TOKEN!;

  const openai = createOpenAI({
    apiKey: credentialValue,
    baseURL: "https://models.github.ai/inference",
  });

  try {
    const { steps } = await step.ai.wrap("openai-generate-text", generateText, {
      model: openai.chat(data.model || "gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await publish(
      openAIChannel().status({
        nodeId,
        status: "success",
      })
    );

    return {
      ...context,
      [data.variableName]: {
        text,
      },
    };
  } catch (error) {
    await publish(
      openAIChannel().status({
        nodeId,
        status: "error",
      })
    );

    throw error;
  }
};
