import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import Handlebars from "handlebars";
import { aiClassifierChannel } from "@/inngest/channels/ai-classifier";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { CredentialType } from "@prisma/client";
import { z } from "zod";

type AiClassifierData = {
  variableName?: string;
  credentialId?: string;
  model?: string;
  routes?: Array<{ id: string; label: string }>;
  input?: string;
};

export const aiClassifierExecutor: NodeExecutor<AiClassifierData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
  publish,
}) => {
  await publish(
    aiClassifierChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.variableName || !data.credentialId || !data.routes || !data.input) {
    await publish(
      aiClassifierChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("SMART ROUTER: Missing required configuration");
  }

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
      aiClassifierChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("SMART ROUTER: Credential not found");
  }

  const credentialValue = decrypt(credential.value);
  const input = Handlebars.compile(data.input)(context);
  const routes = data.routes;

  const validRouteIds = routes.map((r) => r.id);

  const routerSchema = z.object({
    routeId: z.enum([validRouteIds[0], ...validRouteIds.slice(1)]),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
  });

  const systemPrompt = `You are an intelligent workflow router. 
Analyze the input text and route it to ONE of the following paths:
${routes.map((r) => `- ID: ${r.id}, Label: ${r.label}`).join("\n")}

Select the most appropriate path ID based on the input.
Provide a reasoning for your choice and a confidence score (0-1).`;

  let model;
  if (credential.type === CredentialType.GEMINI) {
    const google = createGoogleGenerativeAI({
      apiKey: credentialValue,
    });
    model = google(data.model || "gemini-2.5-flash");
  } else if (credential.type === CredentialType.OPENAI) {
    const openai = createOpenAI({
      apiKey: decrypt(credential.value),
      baseURL: "https://models.github.ai/inference",
    });
    model = openai.chat(data.model || "gpt-4.1");
  } else {
    await publish(
      aiClassifierChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("SMART ROUTER: Unsupported credential type");
  }

  try {
    const { object } = (await step.ai.wrap(
      "smart-router-decision",
      generateObject,
      {
        model,
        schema: routerSchema,
        system: systemPrompt,
        prompt: input,
        temperature: 0.1,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      }
    )) as any;

    const match = routes.find((r) => r.id === object.routeId);

    let nextHandle = "source-1";
    if (object.confidence > 0.4 && match) {
      nextHandle = `route-${match.id}`;
    }

    await publish(
      aiClassifierChannel().status({
        nodeId,
        status: "success",
      })
    );

    return {
      context: {
        ...context,
        [data.variableName]: {
          ...(object as Record<string, unknown>),
          selectedLabel: match?.label || "Default",
          originalText: input,
        },
      },
      nextHandle,
    };
  } catch (error) {
    await publish(
      aiClassifierChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
