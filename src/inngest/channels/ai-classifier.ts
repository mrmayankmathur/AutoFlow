import { channel, topic } from "@inngest/realtime";

export const AI_CLASSIFIER_CHANNEL_NAME = "ai-classifier-execution";

export const aiClassifierChannel = channel(AI_CLASSIFIER_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);
