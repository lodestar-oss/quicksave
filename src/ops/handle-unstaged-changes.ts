import { cancel, confirm, isCancel, log } from "@clack/prompts";
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
}) {
  let treeId: GitTreeId | undefined = undefined;

  const getAllChangesResult = await getAllChanges({ cwd });
  if (!getAllChangesResult.success) {
    return getAllChangesResult;
  }
  const changes = getAllChangesResult.data;
  const hasUnstaged = changes.some((change) => change.status.unstaged !== " ");

  if (hasUnstaged) {
    let willStage = true;

    if (isTTY && !all) {
      const confirmStageResult = await clackConfirm({
        message: "You have unstaged changes. Do you want to add them all?",
      });
      if (!confirmStageResult.success) {
        return confirmStageResult;
      }
      const confirmStageData = confirmStageResult.data;
      if (confirmStageData.isCancelled) {
        return succeed(confirmStageData);
      }
      willStage = confirmStageData.value;
    }

    if (willStage) {
      const snapshotIndexResult = await snapshotIndex({ cwd });
      if (snapshotIndexResult.success) {
        treeId = snapshotIndexResult.data;
        await stageAllChanges({ cwd });
      } else {
        log.error(snapshotIndexResult.error.message);
        log.warn(
          "quicksave won't be able to unstage the changes it adds due to the above error.",
        );
        if (isTTY) {
          const shouldStageAnyways = await confirm({
            message: "Do you still want it to add them anyways?",
          });
          if (isCancel(shouldStageAnyways)) {
            cancel("Operation cancelled.");
            process.exit(0);
          }
          if (shouldStageAnyways) {
            await stageAllChanges({ cwd });
          }
        }
      }
    }
  }
}
