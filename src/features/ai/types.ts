import type { generateText } from "ai";

export type AIGenerationMetadata = Pick<
  Awaited<ReturnType<typeof generateText>>,
  "finishReason" | "usage" | "warnings" | "finalStep"
>;
