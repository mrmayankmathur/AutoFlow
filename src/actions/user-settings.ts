"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function getRecentExecutions(limit: number = 20) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  // Validate and sanitize limit
  const MIN_LIMIT = 1;
  const MAX_LIMIT = 100;
  const DEFAULT_LIMIT = 20;

  let sanitizedLimit = DEFAULT_LIMIT;
  if (
    typeof limit === "number" &&
    Number.isFinite(limit) &&
    Number.isInteger(limit)
  ) {
    sanitizedLimit = Math.max(MIN_LIMIT, Math.min(MAX_LIMIT, limit));
  } else if (typeof limit !== "number") {
    throw new Error("Invalid limit: must be a number");
  }

  try {
    const executions = await prisma.execution.findMany({
      where: {
        workflow: {
          userId: session.user.id,
        },
      },
      orderBy: {
        startedAt: "desc",
      },
      take: sanitizedLimit,
      include: {
        workflow: {
          select: {
            name: true,
          },
        },
      },
    });

    return { success: true, data: executions };
  } catch (error) {
    console.error("Failed to fetch executions:", error);
    return { success: false, error: "Failed to fetch activity log" };
  }
}

export async function getActiveSessions() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const sessions = await prisma.session.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Mark the current session
    const sessionsWithCurrent = sessions.map((s) => ({
      ...s,
      isCurrent: s.token === session.session.token,
    }));

    return { success: true, data: sessionsWithCurrent };
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return { success: false, error: "Failed to fetch sessions" };
  }
}

export async function revokeSession(sessionId: string) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    // Ensure we only delete sessions belonging to the user
    await prisma.session.delete({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to revoke session:", error);
    return { success: false, error: "Failed to revoke session" };
  }
}

export async function deleteAccount() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.user.delete({
      where: {
        id: session.user.id,
      },
    });

    redirect("/");
  } catch (error) {
    console.error("Failed to delete account:", error);
    return { success: false, error: "Failed to delete account" };
  }
}

export async function getUserStats() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const [workflowCount, credentialCount] = await Promise.all([
      prisma.workflow.count({
        where: {
          userId: session.user.id,
        },
      }),
      prisma.credential.count({
        where: {
          userId: session.user.id,
        },
      }),
    ]);

    // Fetch subscription status from Polar
    let subscriptionStatus = "Free Plan";
    try {
      const { polarClient } = await import("@/lib/polar");
      const customer = await polarClient.customers.getStateExternal({
        externalId: session.user.id,
      });

      if (
        customer.activeSubscriptions &&
        customer.activeSubscriptions.length > 0
      ) {
        // Get the first active subscription's product name
        const activeSub = customer.activeSubscriptions[0];
        // Access product name safely - the structure may vary by SDK version
        subscriptionStatus =
          (activeSub as any).product?.name ||
          (activeSub as any).productName ||
          "Premium Plan";
      }
    } catch (polarError) {
      console.warn("Could not fetch Polar subscription status:", polarError);
      // Fall back to Free Plan if Polar API fails
    }

    return {
      success: true,
      data: {
        workflows: workflowCount,
        credentials: credentialCount,
        subscription: subscriptionStatus,
      },
    };
  } catch (error) {
    console.error("Failed to fetch user stats:", error);
    return { success: false, error: "Failed to fetch user stats" };
  }
}
