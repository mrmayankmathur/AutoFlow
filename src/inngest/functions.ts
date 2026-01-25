import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { prisma } from "@/lib/db";
import { ExecutionStatus, NodeType } from "@prisma/client";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { geminiChannel } from "./channels/gemini";
import { openAIChannel } from "./channels/openai";
import { anthropicChannel } from "./channels/anthropic";
import { discordChannel } from "./channels/discord";
import { slackChannel } from "./channels/slack";
import { aiClassifierChannel } from "./channels/ai-classifier";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: process.env.NODE_ENV === "production" ? 3 : 0,
    onFailure: async ({ event, step }) => {
      return prisma.execution.update({
        where: {
          inngestEventId: event.data.event.id,
        },
        data: {
          status: ExecutionStatus.FAILED,
          error: event.data.error.message,
          errorStack: event.data.error.stack,
        },
      });
    },
  },
  {
    event: "workflows/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel(),
      openAIChannel(),
      anthropicChannel(),
      discordChannel(),
      slackChannel(),
      aiClassifierChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const inngestEventId = event.id;
    const workflowId = event.data.workflowId;

    if (!inngestEventId || !workflowId) {
      throw new NonRetriableError(
        "Inngest event ID or Workflow ID is required"
      );
    }

    await step.run("create-execution", async () => {
      await prisma.execution.create({
        data: {
          workflowId,
          inngestEventId,
        },
      });
    });

    const { nodes, connections, userId } = await step.run(
      "fetch-workflow-data",
      async () => {
        return prisma.workflow.findUniqueOrThrow({
          where: {
            id: workflowId,
          },
          include: {
            nodes: true,
            connections: true,
          },
        });
      }
    );

    let context = event.data.initialData || {};

    const entryNodes = nodes.filter(
      (n) =>
        n.type === NodeType.MANUAL_TRIGGER ||
        n.type === NodeType.INITIAL ||
        n.type === NodeType.GOOGLE_FORM_TRIGGER ||
        n.type === NodeType.STRIPE_TRIGGER
    );

    const executionQueue: string[] = entryNodes.map((n) => n.id);

    let executionSteps = 0;
    const MAX_STEPS = 100;

    while (executionQueue.length > 0) {
      if (executionSteps >= MAX_STEPS) {
        console.warn(
          "Workflow execution exceeded max steps (infinite loop protection)"
        );
        break;
      }
      executionSteps++;

      const currentNodeId = executionQueue.shift();
      if (!currentNodeId) break;

      const node = nodes.find((n) => n.id === currentNodeId);
      if (!node) continue;

      const executor = getExecutor(node.type as NodeType);

      let executionResult = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        userId,
        step,
        publish,
      });

      let nextHandle = "source-1";
      let stop = false;

      // Type guard for structured execution results
      const isStructuredResult = (
        res: unknown
      ): res is {
        nextHandle?: string;
        stop?: boolean;
        context?: Record<string, unknown>;
      } => {
        return (
          typeof res === "object" &&
          res !== null &&
          ("nextHandle" in res || "stop" in res || "context" in res)
        );
      };

      if (executionResult && typeof executionResult === "object") {
        if (isStructuredResult(executionResult)) {
          if (executionResult.context) {
            context = { ...context, ...executionResult.context };
          }
          if (executionResult.nextHandle) {
            nextHandle = executionResult.nextHandle;
          }
          if (executionResult.stop) {
            stop = true;
          }
        } else {
          context = { ...context, ...executionResult };
        }
      }

      // NOTE: The stop flag only halts THIS branch/node processing.
      // Other nodes already in the executionQueue will still be processed.
      // To stop the entire workflow, use `break` or `return` instead of `continue`.
      if (stop) {
        continue;
      }

      const outgoingConnections = connections.filter(
        (c) => c.fromNodeId === currentNodeId && c.fromOutput === nextHandle
      );

      for (const connection of outgoingConnections) {
        executionQueue.push(connection.toNodeId);
      }
    }

    await step.run("update-execution", async () => {
      await prisma.execution.update({
        where: {
          inngestEventId,
          workflowId,
        },
        data: {
          status: ExecutionStatus.SUCCESS,
          completedAt: new Date(),
          output: context,
        },
      });
    });

    return { workflowId, result: context };
  }
);
