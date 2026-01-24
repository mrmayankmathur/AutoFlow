"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { aiClassifierChannel } from "@/inngest/channels/ai-classifier";
import { inngest } from "@/inngest/client";

export type AiClassifierToken = Realtime.Token<
  typeof aiClassifierChannel,
  ["status"]
>;

export async function fetchAiClassifierRealtimeToken(): Promise<AiClassifierToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: aiClassifierChannel(),
    topics: ["status"],
  });

  return token;
}
