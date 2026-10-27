import { EnvSchema } from "@/config/env";

export function getEnvVars() {
  const env = EnvSchema.parse(process.env);
  return env;
}
