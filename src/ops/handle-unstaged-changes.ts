import type {
  ClackIsCancelledError,
  ClackNonInteractiveError,
} from "@little-nebulae/clack";
import type { UnexpectedError } from "@little-nebulae/error";
import type { AsyncResult } from "@little-nebulae/result";

import { clackConfirm } from "@little-nebulae/clack";
import { succeed } from "@little-nebulae/result";

import type { GitTreeId } from "@/features/git/types";

import { getAllChanges } from "@/features/git/ops/get-all-changes";
import { snapshotIndex } from "@/features/git/ops/snapshot-index";
import { stageAllChanges } from "@/features/git/ops/stage-all-changes";

export async function handleUnstagedChanges({
  cwd,
  all,
  isTTY,
}: {
  cwd: string;
  all: boolean;
  isTTY: boolean;
}): AsyncResult<
  GitTreeId | undefined,
  ClackNonInteractiveError | ClackIsCancelledError | UnexpectedError
> {
  let treeId: GitTreeId | undefined = undefined;

  const getAllChangesResult = await getAllChanges({ cwd });
  if (!getAllChangesResult.success) {
    return getAllChangesResult;
  }
  const changes = getAllChangesResult.data;
  const hasUnstaged = changes.some((change) => change.status.unstaged !== " ");

  if (hasUnstaged) {
    let willStage = true;

    if (!all) {
      const confirmStageResult = await clackConfirm({
        isTTY,
        message: "You have unstaged changes. Do you want to add them all?",
      });
      if (!confirmStageResult.success) {
        return confirmStageResult;
      }
      willStage = confirmStageResult.data;
    }

    if (willStage) {
      const snapshotIndexResult = await snapshotIndex({ cwd });
      if (!snapshotIndexResult.success) {
        return snapshotIndexResult;
      }
      treeId = snapshotIndexResult.data;

      const stageAllChangesResult = await stageAllChanges({ cwd });
      if (!stageAllChangesResult.success) {
        return stageAllChangesResult;
      }
    }
  }

  return succeed(treeId);
}
