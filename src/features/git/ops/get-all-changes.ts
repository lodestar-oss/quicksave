import { composeErrorMessage, UnexpectedError } from "@little-nebulae/error";
import { attemptAsync } from "@little-nebulae/result";
import { x } from "tinyexec";

import type { GitChange } from "@/features/git/types";

export async function getAllChanges({ cwd }: { cwd: string }) {
  return attemptAsync({
    tryFn: async () => {
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
        const staged = entry[0]!;
        const unstaged = entry[1]!;
        const path = entry.slice(3);
        // renames and copies are followed by an extra entry holding the original path
        if (staged === "R" || staged === "C") {
          i++;
        }
        changes.push({ path, status: { staged, unstaged } });
      }
      return changes;
    },
    catchFn: (error) =>
      new UnexpectedError({
        message: composeErrorMessage({
          operation: "get all changes made to the repo",
        }),
        cause: error,
        meta: null,
      }),
  });
}
