import type { AsyncResult, DataOfFn, ErrorOfFn } from "@little-nebulae/result";

import { generateCommitMessage } from "@/features/ai/ops/generate-commit-message";
import { getStagedDiff } from "@/features/git/ops/get-staged-diff";

export async function getCommitMessage({
  cwd,
  apiKey,
}: {
  cwd: string;
  apiKey: string;
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
    apiKey,
  });
}
