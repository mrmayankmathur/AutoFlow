import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { geminiChannel } from "@/inngest/channels/gemini";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { getAIModel, type AIProvider } from "@/lib/ai/factory";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type GeminiData = {
  variableName?: string;
  model?: string;
  credentialId?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
  publish,
}) => {
  await publish(
    geminiChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.variableName) {
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );

    throw new NonRetriableError("GEMINI NODE: Variable name is required");
  }

  if (!data.credentialId) {
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );

    throw new NonRetriableError("GEMINI NODE: Credential is required");
  }

  if (!data.userPrompt) {
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );

    throw new NonRetriableError("GEMINI NODE: User prompt is required");
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
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );

    throw new NonRetriableError("GEMINI NODE: Credential not found");
  }

  const credentialValue = decrypt(credential.value);

  const model = getAIModel({
    provider: "GEMINI",
    apiKey: credentialValue,
    modelOverride: data.model,
  });

  try {
    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model,
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    const firstContentPart = steps?.[0]?.content?.[0];
    const text = firstContentPart?.type === "text" ? firstContentPart.text : "";

    if (!text) {
      console.warn(
        "Gemini Executor: No text generated.",
        `Steps count: ${steps?.length ?? 0}, First step content types: ${steps?.[0]?.content?.map((c: { type: string }) => c.type).join(", ") ?? "none"}`
      );
    }

    await publish(
      geminiChannel().status({
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
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );

    throw error;
  }
};
