import { x } from "tinyexec";

import { cwd } from "@/config/cwd";
import { LOCKFILE_TUPLE } from "@/constants";

export async function getStagedDiff() {
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

  return result.stdout.trim();
}
