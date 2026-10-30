#!/usr/bin/env node

import { parse, printErrors, printHelp, printVersion } from "@bomb.sh/router";
import { cancel, confirm, isCancel, log, outro } from "@clack/prompts";
import { nodeLoadEnvFileList } from "@little-nebulae/node-env";

import type { GitTreeId } from "@/features/git/types";

import { app } from "@/app";
import { generateCommitMessage } from "@/features/ai/ops/generate-commit-message";
import { commitStagedChanges } from "@/features/git/ops/commit-staged-changes";
import { getAllChanges } from "@/features/git/ops/get-all-changes";
import { getStagedDiff } from "@/features/git/ops/get-staged-diff";
import { restoreIndex } from "@/features/git/ops/restore-index";
import { snapshotIndex } from "@/features/git/ops/snapshot-index";
import { stageAllChanges } from "@/features/git/ops/stage-all-changes";

const result = parse(app, { argv: process.argv.slice(2) });

if (!result.ok) {
  log.error(printErrors(result));
  process.exit(1);
}

switch (result.method) {
  case "help":
    console.log(printHelp(result));
    break;

  case "version":
    console.log(printVersion(result));
    break;

  case "execute":
    switch (result.route) {
      case "/": {
        const { cwd, staged, all } = result.model;
        const isTTY = process.stdin.isTTY;

        if (staged && all) {
          log.error("Conflicting options: staged, all");
          process.exit(1);
        }

        if (!isTTY && !staged && !all) {
          log.error(
            "The staged or all flag is required in non-interactive terminals.",
          );
          process.exit(1);
        }

        nodeLoadEnvFileList({
          parentDirPath: cwd,
          envFileList: [".env.local", ".env"],
        });

        let treeId: GitTreeId | undefined = undefined;
        if (!staged) {
          const changes = await getAllChanges({ cwd });
          const hasUnstaged = changes.some(
            (change) => change.status.unstaged !== " ",
          );

          if (hasUnstaged) {
            let willStage = true;

            if (isTTY && !all) {
              const shouldStage = await confirm({
                message:
                  "You have unstaged changes. Do you want to add them all?",
              });
              if (isCancel(shouldStage)) {
                cancel("Operation cancelled.");
                process.exit(0);
              }
              willStage = shouldStage;
            }

            if (willStage) {
              treeId = await snapshotIndex({ cwd });
              await stageAllChanges({ cwd });
            }
          }
        }

        const diff = await getStagedDiff({ cwd });
        if (diff.length === 0) {
          log.warn("No staged changes to commit.");
          if (treeId) {
            await restoreIndex({ cwd, treeId });
            log.info("Unstaged the changes quicksave added.");
          }
          outro("Exit early.");
          process.exit(0);
        }

        log.info("Generating commit message...");
        const message = await generateCommitMessage({ diff });
        log.success("Commit message generated:");
        log.message(message);

        if (isTTY) {
          const shouldCommit = await confirm({
            message: "Do you want to commit with the above message?",
          });

          if (isCancel(shouldCommit)) {
            if (treeId) {
              await restoreIndex({ cwd, treeId });
              log.info("Unstaged the changes quicksave added.");
            }
            cancel("Operation cancelled.");
            process.exit(0);
          }

          if (!shouldCommit) {
            if (treeId) {
              await restoreIndex({ cwd, treeId });
              log.info("Unstaged the changes quicksave added.");
            }
            outro("Nothing was committed.");
            process.exit(0);
          }
        }

        await commitStagedChanges({ cwd, message });
        outro("Changes committed.");
        process.exit(0);
      }
    }
}
