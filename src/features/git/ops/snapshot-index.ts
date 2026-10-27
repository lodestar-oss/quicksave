import { x } from "tinyexec";

import type { GitTreeId } from "@/features/git/types";

export async function snapshotIndex({ cwd }: { cwd: string }) {
  const result = await x("git", ["write-tree"], {
    nodeOptions: { cwd },
    throwOnError: true,
  });
  return result.stdout.trim() as GitTreeId;
}
