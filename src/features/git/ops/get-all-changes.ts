import { x } from "tinyexec";

import type { GitChange } from "@/features/git/types";

type GetAllChangesResult =
  | { isDirty: false }
  | { isDirty: true; changes: GitChange[] };

export async function getAllChanges({
  cwd,
}: {
  cwd: string;
}): Promise<GetAllChangesResult> {
  const { stdout } = await x(
    "git",
    ["status", "--porcelain=v1", "-z", "--untracked-files=all"],
    { nodeOptions: { cwd }, throwOnError: true },
  );

  if (stdout.trim().length === 0) {
    return { isDirty: false };
  }

  const parts = stdout.split("\0").filter((part) => part.length > 0);
  const changes: GitChange[] = [];

  for (let i = 0; i < parts.length; i++) {
    const entry = parts[i]!;
    const x = entry[0]!;
    const y = entry[1]!;
    const path = entry.slice(3);
    // renames and copies are followed by an extra entry holding the original path
    if (x === "R" || x === "C") {
      i++;
    }
    changes.push({ path, status: { staged: x, unstaged: y } });
  }

  return { isDirty: true, changes };
}
