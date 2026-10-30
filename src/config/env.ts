import { wrapZodResult } from "@little-nebulae/zod";
import { NonEmptyStringSchema } from "@little-nebulae/zod-schemas";
import { z } from "zod";

const EnvSchema = z.object({
  GROQ_API_KEY: z.templateLiteral(["gsk_", NonEmptyStringSchema]),
});

export function getEnvVars() {
  const parseResult = EnvSchema.safeParse(process.env);
  return wrapZodResult(parseResult);
}
