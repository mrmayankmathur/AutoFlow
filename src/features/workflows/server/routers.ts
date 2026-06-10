import { generateSlug } from "random-word-slugs";
import { prisma } from "@/lib/db";
import { polarClient } from "@/lib/polar";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { z } from "zod";
import { PAGINATION } from "@/config/constants";
import { NodeType } from "@prisma/client";
import type { Node, Edge } from "@xyflow/react";
import { inngest } from "@/inngest/client";
import { sendWorkflowExecution } from "@/inngest/utils";

const createWorkflowSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const workflowsRouter = createTRPCRouter({
  execute: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });

      await sendWorkflowExecution({
        workflowId: input.id,
      });

      return workflow;
    }),
  create: protectedProcedure
    .input(createWorkflowSchema)
    .mutation(async ({ ctx, input }) => {
      // Allow up to 3 workflows for users without an active subscription
      const customer = await polarClient.customers.getStateExternal({
        externalId: ctx.auth.user.id,
      });

      const hasActiveSubscription =
        customer.activeSubscriptions &&
        customer.activeSubscriptions.length > 0;

      if (!hasActiveSubscription) {
        const workflowCount = await prisma.workflow.count({
          where: { userId: ctx.auth.user.id },
        });

        if (workflowCount >= 3) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Free plan is limited to 3 workflows. Upgrade to premium for unlimited workflows.",
          });
        }
      }

      return prisma.workflow.create({
        data: {
          name: input.name,
          userId: ctx.auth.user.id,
          nodes: {
            create: {
              type: NodeType.INITIAL,
              position: {
                x: 0,
                y: 0,
              },
              name: NodeType.INITIAL,
            },
          },
        },
      });
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return prisma.workflow.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nodes: z.array(
          z.object({
            id: z.string(),
            type: z.nativeEnum(NodeType),
            position: z.object({ x: z.number(), y: z.number() }),
            data: z.record(z.string(), z.any()).optional(),
          })
        ),
        edges: z.array(
          z.object({
            id: z.string().optional(),
            source: z.string(),
            target: z.string(),
            sourceHandle: z.string().nullish(),
            targetHandle: z.string().nullish(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, nodes, edges } = input;

      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id,
          userId: ctx.auth.user.id,
        },
      });

      return await prisma.$transaction(async (tx) => {
        // Delete connections that aren't in the incoming payload anymore
        if (edges.length > 0) {
          const incomingEdgeIds = edges.map(
            (e) => e.id || `conn_${e.source}_${e.target}`
          );
          await tx.connection.deleteMany({
            where: {
              workflowId: id,
              id: { notIn: incomingEdgeIds },
            },
          });
        } else {
          await tx.connection.deleteMany({ where: { workflowId: id } });
        }

        // Delete nodes that aren't in the incoming payload anymore
        if (nodes.length > 0) {
          await tx.node.deleteMany({
            where: {
              workflowId: id,
              id: { notIn: nodes.map((n) => n.id) },
            },
          });
        } else {
          await tx.node.deleteMany({ where: { workflowId: id } });
        }

        // Upsert nodes
        for (const node of nodes) {
          await tx.node.upsert({
            where: { id: node.id },
            update: {
              position: node.position,
              data: node.data || {},
            },
            create: {
              id: node.id,
              workflowId: id,
              type: node.type as NodeType,
              name: node.type || "unknown",
              position: node.position,
              data: node.data || {},
            },
          });
        }

        // Upsert connections
        for (const edge of edges) {
          const edgeId = edge.id || `conn_${edge.source}_${edge.target}`;
          await tx.connection.upsert({
            where: { id: edgeId },
            update: {
              fromOutput: edge.sourceHandle || "main",
              toInput: edge.targetHandle || "main",
            },
            create: {
              id: edgeId,
              workflowId: id,
              fromNodeId: edge.source,
              toNodeId: edge.target,
              fromOutput: edge.sourceHandle || "main",
              toInput: edge.targetHandle || "main",
            },
          });
        }

        await tx.workflow.update({
          where: {
            id,
          },
          data: {
            updatedAt: new Date(),
          },
        });

        return workflow;
      });
    }),

  updateName: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(({ ctx, input }) => {
      return prisma.workflow.update({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        data: {
          name: input.name,
        },
      });
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        include: {
          nodes: true,
          connections: true,
        },
      });

      // Transform server nodes to react-flow compatible nodes
      const nodes: Node[] = workflow.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position as { x: number; y: number },
        data: (node.data as Record<string, unknown>) || {},
      }));

      // Transform server connections to react-flow compatible edges
      const edges: Edge[] = workflow.connections.map((connection) => ({
        id: connection.id,
        source: connection.fromNodeId,
        target: connection.toNodeId,
        sourceHandle: connection.fromOutput,
        targetHandle: connection.toInput,
      }));

      return {
        id: workflow.id,
        name: workflow.name,
        nodes,
        edges,
      };
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;

      const [items, totalCount] = await Promise.all([
        prisma.workflow.findMany({
          skip: (page - 1) * pageSize,
          take: input.pageSize,
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        }),
        prisma.workflow.count({
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),
});
