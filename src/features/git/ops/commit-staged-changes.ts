import { composeErrorMessage, UnexpectedError } from "@little-nebulae/error";
import { attemptAsync } from "@little-nebulae/result";
import { x } from "tinyexec";

export async function commitStagedChanges({
  cwd,
  message,
}: {
  cwd: string;
  message: string;
}) {
  return attemptAsync({
    tryFn: async () => {
      await x("git", ["commit", "-m", message], {
        throwOnError: true,
        nodeOptions: { cwd },
      });
    },
    catchFn: (error) =>
      new UnexpectedError({
        message: composeErrorMessage({
          operation: "commit staged changes",
        }),
        cause: error,
        meta: null,
      }),
  });
}
