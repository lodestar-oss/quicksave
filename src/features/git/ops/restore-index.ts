import { x } from "tinyexec";

import type { TreeObjectId } from "@/features/git/types";

export async function restoreIndex({
  cwd,
  treeObjectId,
}: {
  cwd: string;
  treeObjectId: TreeObjectId;
}) {
  await x("git", ["read-tree", treeObjectId], {
    nodeOptions: { cwd },
    throwOnError: true,
  });
}
