import { generateText } from "ai";

import { groqProvider } from "@/config/ai/provider";
import { SYSTEM_PROMPT } from "@/config/ai/system-prompt";

export async function generateCommitMessage({ diff }: { diff: string }) {
  const { text } = await generateText({
    model: groqProvider("openai/gpt-oss-20b"),
    instructions: SYSTEM_PROMPT,
    prompt: `<diff>\n${diff}\n</diff>`,
  });
  return text.trim();
}
