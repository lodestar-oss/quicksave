import { createGroq } from "@ai-sdk/groq";
import { composeErrorMessage, UnexpectedError } from "@little-nebulae/error";
import { attemptAsync } from "@little-nebulae/result";
import { generateText } from "ai";

import type { AIGenerationMetadata } from "@/features/ai/types";
import type { GitDiff } from "@/features/git/types";

import { EmptyCommitMessageError } from "@/errors/empty-commit-message";
import { SYSTEM_PROMPT } from "@/features/ai/system-prompt";

export async function generateCommitMessage({
  diff,
  apiKey,
}: {
  diff: GitDiff;
  apiKey: string;
}) {
  return attemptAsync({
    tryFn: async () => {
      const groqProvider = createGroq({ apiKey });

      const generation = await generateText({
        model: groqProvider("openai/gpt-oss-20b"),
        instructions: SYSTEM_PROMPT,
        prompt: `<diff>\n${diff}\n</diff>`,
      });

      const message = generation.text.trim();
      const meta = {
        finishReason: generation.finishReason,
        usage: generation.usage,
        warnings: generation.warnings,
        finalStep: generation.finalStep,
      } satisfies AIGenerationMetadata;

      if (message.length === 0) {
        throw new EmptyCommitMessageError(meta);
      }

      return { message, meta };
    },
    catchFn: (error) => {
      if (error instanceof EmptyCommitMessageError) {
        return error;
      }
      return new UnexpectedError({
        message: composeErrorMessage({
          operation: "generate commit message",
        }),
        cause: error,
        meta: null,
      });
    },
  });
}
