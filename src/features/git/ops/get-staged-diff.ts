import { composeErrorMessage, UnexpectedError } from "@little-nebulae/error";
import { attemptAsync } from "@little-nebulae/result";
import { x } from "tinyexec";

import type { GitDiff } from "@/features/git/types";

import { LOCKFILE_TUPLE } from "@/constants";
import { EmptyDiffError } from "@/errors/empty-diff";

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

      const diff = result.stdout.trim() as GitDiff;
      if (diff.length === 0) {
        throw new EmptyDiffError();
      }
      return diff;
    },
    catchFn: (error) => {
      if (error instanceof EmptyDiffError) {
        return error;
      }
      return new UnexpectedError({
        message: composeErrorMessage({
          operation: "get staged diff",
        }),
        cause: error,
        meta: null,
      });
    },
  });
}
