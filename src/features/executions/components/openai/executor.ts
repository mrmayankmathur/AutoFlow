import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { openAIChannel } from "@/inngest/channels/openai";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { getAIModel } from "@/lib/ai/factory";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type OpenAIData = {
  variableName?: string;
  credentialId?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const openAIExecutor: NodeExecutor<OpenAIData> = async ({
  data,
  nodeId,
  userId,
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

  if (!data.credentialId) {
    await publish(
      openAIChannel().status({
        nodeId,
        status: "error",
      })
    );

    throw new NonRetriableError("OPENAI NODE: Credential is required");
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

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({
      where: {
        id: data.credentialId,
        userId,
      },
    });
  });

  if (!credential) {
    await publish(
      openAIChannel().status({
        nodeId,
        status: "error",
      })
    );

    throw new NonRetriableError("OPENAI NODE: Credential not found");
  }

  const model = getAIModel({
    provider: "OPENAI",
    apiKey: decrypt(credential.value),
    modelOverride: data.model,

  });

  try {
    const { steps } = await step.ai.wrap("openai-generate-text", generateText, {
      model,
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
