import { x } from "tinyexec";

import { LOCKFILE_TUPLE } from "@/constants";

export async function getStagedDiff({ cwd = process.cwd() }: { cwd?: string }) {
  const result = await x(
    "git",
    [
      "diff",
      "--staged",
      "--no-color",
      "--no-ext-diff",
      "--find-renames",
      "--",
      ".",
      ...LOCKFILE_TUPLE.map((f) => `:(exclude)${f}`),
    ],
    { nodeOptions: { cwd }, throwOnError: true },
  );

  return result.stdout.trim();
}
