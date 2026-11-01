export const MODE_ENUM = {
  STAGED: "staged",
  ALL: "all",
  ASK: "ask",
} as const;

export const LOCKFILE_TUPLE = [
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "deno.lock",
  "bun.lock",
] as const;
