import { composeErrorMessage, UnexpectedError } from "@little-nebulae/error";
import { attemptAsync } from "@little-nebulae/result";
import { x } from "tinyexec";

import type { GitTreeId } from "@/features/git/types";

export async function restoreIndex({
  cwd,
  treeId,
}: {
  cwd: string;
  treeId: GitTreeId;
}) {
  return attemptAsync({
    tryFn: async () => {
      await x("git", ["read-tree", treeId], {
        nodeOptions: { cwd },
        throwOnError: true,
      });
    },
    catchFn: (error) =>
      new UnexpectedError({
        message: composeErrorMessage({
          operation: "unstaged the added changes",
        }),
        cause: error,
        meta: null,
      }),
  });
}
