import type { ClackIsCancelledError } from "@little-nebulae/clack";
import type { UnexpectedError } from "@little-nebulae/error";
import type { AsyncResult } from "@little-nebulae/result";

import { clackConfirm } from "@little-nebulae/clack";
import { fail, succeed } from "@little-nebulae/result";

import { commitStagedChanges } from "@/features/git/ops/commit-staged-changes";

export async function handleCommit({
  isTTY,
  cwd,
  message,
}: {
  isTTY: boolean;
  cwd: string;
  message: string;
}): AsyncResult<
  {
    committed: boolean;
  },
  ClackIsCancelledError | UnexpectedError
> {
  const confirmCommitResult = await clackConfirm({
    message: "Do you want to commit with the generated message?",
    isTTY,
  });

  let shouldCommit = true;

  if (!confirmCommitResult.success) {
    if (confirmCommitResult.error.code !== "CLACK_NON_INTERACTIVE_ERROR") {
      return fail(confirmCommitResult.error);
    }
    // code === "CLACK_NON_INTERACTIVE_ERROR" -> shouldCommit = true
  } else {
    shouldCommit = confirmCommitResult.data;
  }

  if (!shouldCommit) {
    return succeed({ committed: false });
  }

  const commitStagedChangesResult = await commitStagedChanges({ cwd, message });
  if (!commitStagedChangesResult.success) {
    return commitStagedChangesResult;
  }
  return succeed({ committed: true });
}
