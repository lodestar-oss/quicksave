import { x } from "tinyexec";

import type { GitChange } from "@/features/git/types";

export async function getAllChanges({ cwd }: { cwd: string }) {
  const { stdout } = await x(
    "git",
    ["status", "--porcelain=v1", "-z", "--untracked-files=all"],
    { nodeOptions: { cwd }, throwOnError: true },
  );
  const changes: GitChange[] = [];
  if (stdout.trim().length === 0) {
    return changes;
  }
  const parts = stdout.split("\0").filter((part) => part.length > 0);
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
  return changes;
}
