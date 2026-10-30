import {
  composeErrorMessage,
  isError,
  UnexpectedError,
} from "@little-nebulae/error";
import { attemptAsync } from "@little-nebulae/result";
import { x } from "tinyexec";

import type { GitTreeId } from "@/features/git/types";

export async function snapshotIndex({ cwd }: { cwd: string }) {
  return attemptAsync({
    tryFn: async () => {
      const result = await x("git", ["write-tree"], {
        nodeOptions: { cwd },
        throwOnError: true,
      });
      return result.stdout.trim() as GitTreeId;
    },
    catchFn: (error) =>
      new UnexpectedError({
        message: isError(error)
          ? error.message
          : composeErrorMessage({
              operation: "snapshot the current state of the repo",
            }),
        cause: error,
        meta: null,
      }),
  });
}
