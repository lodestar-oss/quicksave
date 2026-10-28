import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

import type { GitDiff } from "@/features/git/types";

import { getEnvVars } from "@/config/env";
import { SYSTEM_PROMPT } from "@/features/ai/system-prompt";

export async function generateCommitMessage({ diff }: { diff: GitDiff }) {
  const env = getEnvVars();
  const groqProvider = createGroq({ apiKey: env.GROQ_API_KEY });

  const { text } = await generateText({
    model: groqProvider("openai/gpt-oss-20b"),
    instructions: SYSTEM_PROMPT,
    prompt: `<diff>\n${diff}\n</diff>`,
  });
  return text.trim();
}
