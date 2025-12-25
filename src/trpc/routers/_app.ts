import { inngest } from "@/inngest/client";
import {
  protectedProcedure,
  createTRPCRouter,
  premiumProcedure,
} from "../init";
import { prisma } from "@/lib/db";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { TRPCError } from "@trpc/server";

export const appRouter = createTRPCRouter({
  testAI: premiumProcedure.mutation(async () => {
    await inngest.send({
      name: "execute/ai",
    });
    return { success: true, message: "Job queued!" };
  }),
  getWorkflows: protectedProcedure.query(({ ctx }) => {
    console.log({ userId: ctx.auth.user.id });

    return prisma.workflow.findMany();
  }),
  createWorkflow: protectedProcedure.mutation(async () => {
    await inngest.send({
      name: "test/hello.world",
      data: {
        email: "mrmayankmathur@gmail.com",
      },
    });
    return { success: true, message: "Job queued!" };
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
