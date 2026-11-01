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
  | { snapshotted: true; treeId: GitTreeId }
  | { snapshotted: false; reason: "the repo has no unstaged changes" }
  | {
      snapshotted: false;
      reason: "the user doesn't want to add all unstaged changes";
    },
  ClackNonInteractiveError | ClackIsCancelledError | UnexpectedError
> {
  const getAllChangesResult = await getAllChanges({ cwd });
  if (!getAllChangesResult.success) {
    return getAllChangesResult;
  }
  const changes = getAllChangesResult.data;
  const hasUnstaged = changes.some((change) => change.status.unstaged !== " ");

  if (!hasUnstaged) {
    return succeed({
      snapshotted: false,
      reason: "the repo has no unstaged changes",
    });
  }

  if (!all) {
    const confirmStageResult = await clackConfirm({
      isTTY,
      message: "You have unstaged changes. Do you want to add them all?",
    });
    if (!confirmStageResult.success) {
      return confirmStageResult;
    }
    const shouldStage = confirmStageResult.data;
    if (!shouldStage) {
      return succeed({
        snapshotted: false,
        reason: "the user doesn't want to add all unstaged changes",
      });
    }
  }

  const snapshotIndexResult = await snapshotIndex({ cwd });
  if (!snapshotIndexResult.success) {
    return snapshotIndexResult;
  }
  const treeId = snapshotIndexResult.data;

  const stageAllChangesResult = await stageAllChanges({ cwd });
  if (!stageAllChangesResult.success) {
    return stageAllChangesResult;
  }

  return succeed({ snapshotted: true, treeId });
}
