import { composeErrorMessage, UnexpectedError } from "@little-nebulae/error";
import { attemptAsync } from "@little-nebulae/result";
import { x } from "tinyexec";

export async function stageAllChanges({ cwd }: { cwd: string }) {
  return attemptAsync({
    tryFn: async () => {
      await x("git", ["add", "-A"], {
        nodeOptions: { cwd },
        throwOnError: true,
      });
    },
    catchFn: (error) =>
      new UnexpectedError({
        message: composeErrorMessage({
          operation: "add all unstaged changes",
        }),
        cause: error,
        meta: null,
      }),
  });
}
