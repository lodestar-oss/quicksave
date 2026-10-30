import {
  composeErrorMessage,
  isError,
  UnexpectedError,
} from "@little-nebulae/error";
import { attemptAsync } from "@little-nebulae/result";
import { x } from "tinyexec";

import type { GitDiff } from "@/features/git/types";

import { LOCKFILE_TUPLE } from "@/constants";

export async function getStagedDiff({ cwd }: { cwd: string }) {
  return attemptAsync({
    tryFn: async () => {
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

      return result.stdout.trim() as GitDiff;
    },
    catchFn: (error) =>
      new UnexpectedError({
        message: isError(error)
          ? error.message
          : composeErrorMessage({
              operation: "get staged diff",
            }),
        cause: error,
        meta: null,
      }),
  });
}
