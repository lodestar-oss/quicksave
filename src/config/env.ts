import { NonEmptyStringSchema } from "@little-nebulae/zod-schemas";
import { z } from "zod";

export const EnvSchema = z.object({
  GROQ_API_KEY: z.templateLiteral(["gsk_", NonEmptyStringSchema]),
});
