import { createGroq } from "@ai-sdk/groq";
import { composeErrorMessage, UnexpectedError } from "@little-nebulae/error";
import { attemptAsync } from "@little-nebulae/result";
import { generateText } from "ai";

import type { Env } from "@/config/env";
import type { AIGenerationMetadata } from "@/features/ai/types";
import type { GitDiff } from "@/features/git/types";

import { SYSTEM_PROMPT } from "@/features/ai/system-prompt";

export async function generateCommitMessage({
  diff,
  env,
}: {
  diff: GitDiff;
  env: Env;
}) {
  return attemptAsync({
    tryFn: async () => {
      const groqProvider = createGroq({ apiKey: env.GROQ_API_KEY });

      const generation = await generateText({
        model: groqProvider("openai/gpt-oss-20b"),
        instructions: SYSTEM_PROMPT,
        prompt: `<diff>\n${diff}\n</diff>`,
      });

      return {
        message: generation.text.trim(),
        meta: {
          finishReason: generation.finishReason,
          usage: generation.usage,
          warnings: generation.warnings,
          finalStep: generation.finalStep,
        } satisfies AIGenerationMetadata,
      };
    },
    catchFn: (error) =>
      new UnexpectedError({
        message: composeErrorMessage({
          operation: "generate commit message",
        }),
        cause: error,
        meta: null,
      }),
  });
}
