import { prisma } from "@/lib/db";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    // fetching data from an API
    await step.sleep("fetching-data", "5s");
    // transcribing data from an API
    await step.sleep("transcribing-data", "5s");
    // sending it to AI
    await step.sleep("sending-to-ai", "5s");

    await step.run("create-workflow", () => {
      return prisma.workflow.create({
        data: {
          name: "workflow-from-inngest",
        },
      });
    });
  }
);
