import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { prisma } from "@/lib/db";
import { topologicalSort } from "./utils";
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
    retries: 0, // TODO: Remove in production
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

    const { nodes, connections } = await step.run(
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

    const { userId } = await step.run("get-user-id", async () => {
      return prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        select: { userId: true },
      });
    });

    // Initialize the context
    let context = event.data.initialData || {};

    // --- Graph Traversal Engine ---
    // 1. Find Entry Points (Triggers or Initial Node)
    // In a real app, we might check which node *triggered* this execution.
    // For now, we support Manual & Initial.
    // Future: The 'event' could carry the triggerNodeId.
    const entryNodes = nodes.filter(
      (n) =>
        n.type === NodeType.MANUAL_TRIGGER ||
        n.type === NodeType.INITIAL ||
        n.type === NodeType.GOOGLE_FORM_TRIGGER ||
        n.type === NodeType.STRIPE_TRIGGER
    );

    // Queue for BFS traversal
    // We store the ID of the node to execute next
    const executionQueue: string[] = entryNodes.map((n) => n.id);
    const visitedNodes = new Set<string>();

    // Limits to prevent infinite loops (simple safety)
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

      // In a more complex engine, we might allow revisiting nodes for loops,
      // but for this v1 router upgrade, let's keep it simple or allow it.
      // visitedNodes.add(currentNodeId);

      const node = nodes.find((n) => n.id === currentNodeId);
      if (!node) continue;

      const executor = getExecutor(node.type as NodeType);

      let executionResult;
      try {
        executionResult = await executor({
          data: node.data as Record<string, unknown>,
          nodeId: node.id,
          context,
          userId,
          step,
          publish,
        });
      } catch (err: any) {
        // Log error to execution log DB?
        // For now, rethrow to fail the step in Inngest
        throw err;
      }

      // Handle Result
      let nextHandle = "source-1"; // Default standard handle
      let stop = false;

      if (executionResult && typeof executionResult === "object") {
        // Check if it's the new ExecutionResult type (has 'nextHandle' or 'stop' or explicit 'context' property)
        // We assume branching nodes return ExecutionResult shape
        const res = executionResult as any;
        if (
          "nextHandle" in res ||
          "stop" in res ||
          ("context" in res && typeof res.context === "object")
        ) {
          if (res.context) {
            context = { ...context, ...(res.context as object) };
          }
          if (res.nextHandle) {
            nextHandle = res.nextHandle;
          }
          if (res.stop) {
            stop = true;
          }
        } else {
          // Legacy support: it just returned context
          context = { ...context, ...executionResult };
        }
      }

      if (stop) {
        continue; // Stop this branch
      }

      // Find Next Node(s) based on Handle
      // Look for connections where fromNodeId === currentNodeId AND fromOutput === nextHandle
      console.log(
        `[DEBUG] Node ${currentNodeId} executed. Next Handle: "${nextHandle}"`
      );
      const allOutgoing = connections.filter(
        (c) => c.fromNodeId === currentNodeId
      );
      console.log(
        `[DEBUG] Available outgoing connection handles:`,
        allOutgoing.map((c) => `"${c.fromOutput}"`)
      );

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
