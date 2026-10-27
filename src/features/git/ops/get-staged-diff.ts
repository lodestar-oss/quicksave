import { x } from "tinyexec";

import type { GitDiff } from "@/features/git/types";

import { LOCKFILE_TUPLE } from "@/constants";

export async function getStagedDiff({ cwd }: { cwd: string }) {
  const result = await x(
    "git",
    [
      "diff",
      "--staged",
      "--no-color",
      "--no-ext-diff",
      "--find-renames",
      "--",
      ":/",
      ...LOCKFILE_TUPLE.map((f) => `:(exclude,glob)**/${f}`),
    ],
    { nodeOptions: { cwd }, throwOnError: true },
  );

  return result.stdout.trim() as GitDiff;
}
