import { x } from "tinyexec";

import type { GitTreeId } from "@/features/git/types";

export async function restoreIndex({
  cwd,
  treeId,
}: {
  cwd: string;
  treeId: GitTreeId;
}) {
  await x("git", ["read-tree", treeId], {
    nodeOptions: { cwd },
    throwOnError: true,
  });
}
