import { NonEmptyStringSchema } from "@little-nebulae/zod-schemas";
import { z } from "zod";

const EnvSchema = z.object({
  GROQ_API_KEY: z.templateLiteral(["gsk_", NonEmptyStringSchema]),
});

export function getEnvVars() {
  const env = EnvSchema.parse(process.env);
  return env;
}
