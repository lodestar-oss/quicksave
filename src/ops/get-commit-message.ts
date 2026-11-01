import type { AsyncResult, DataOfFn, ErrorOfFn } from "@little-nebulae/result";

import type { Env } from "@/config/env";

import { generateCommitMessage } from "@/features/ai/ops/generate-commit-message";
import { getStagedDiff } from "@/features/git/ops/get-staged-diff";

export async function getCommitMessage({
  cwd,
  env,
}: {
  cwd: string;
  env: Env;
}): AsyncResult<
  DataOfFn<typeof generateCommitMessage>,
  ErrorOfFn<typeof getStagedDiff | typeof generateCommitMessage>
> {
  const getStagedDiffResult = await getStagedDiff({ cwd });
  if (!getStagedDiffResult.success) {
    return getStagedDiffResult;
  }
  const diff = getStagedDiffResult.data;

  return await generateCommitMessage({
    diff,
    env,
  });
}
