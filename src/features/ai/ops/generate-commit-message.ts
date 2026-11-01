import { createGroq } from "@ai-sdk/groq";
import { composeErrorMessage, UnexpectedError } from "@little-nebulae/error";
import { attemptAsync } from "@little-nebulae/result";
import { generateText } from "ai";

import type { Env } from "@/config/env";
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

      const { text } = await generateText({
        model: groqProvider("openai/gpt-oss-20b"),
        instructions: SYSTEM_PROMPT,
        prompt: `<diff>\n${diff}\n</diff>`,
      });
      return text.trim();
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
