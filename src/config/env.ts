import { log } from "@clack/prompts";
import { ENV_FILE_NAME, loadDotEnvFile } from "@little-nebulae/node-env";
import { NonEmptyStringSchema } from "@little-nebulae/zod-schemas";
import { z } from "zod";

import { cwd } from "@/config/cwd";

const loadLocalResult = loadDotEnvFile({
  parentDirPath: cwd,
  envFileName: ENV_FILE_NAME.LOCAL,
});
const loadDefaultResult = loadDotEnvFile({
  parentDirPath: cwd,
  envFileName: ENV_FILE_NAME.DEFAULT,
});

const EnvSchema = z.object({
  GROQ_API_KEY: z.templateLiteral(["gsk_", NonEmptyStringSchema]),
});
const parseEnvResult = EnvSchema.safeParse(process.env);

if (!parseEnvResult.success) {
  if (loadLocalResult.success || loadDefaultResult.success) {
    log.error(
      "Failed to find the required variables in your environment or dot env files.",
    );
  } else {
    log.error("Failed to find the required variables in your environment.");
    log.error("Failed to load your dot env files.");
  }
  process.exit(1);
}

export const env = parseEnvResult.data;
