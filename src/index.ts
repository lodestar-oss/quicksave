#!/usr/bin/env node

import { parse, printErrors, printHelp, printVersion } from "@bomb.sh/router";
import { cancel, confirm, isCancel, log, outro } from "@clack/prompts";
import { ENV_FILE_NAME, loadDotEnvFile } from "@little-nebulae/node-env";

import { app } from "@/app";
import { generateCommitMessage } from "@/features/ai/ops/generate-commit-message";
import { commitStagedChanges } from "@/features/git/ops/commit-staged-changes";
import { getStagedDiff } from "@/features/git/ops/get-staged-diff";
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

        if (staged && all) {
          log.error("Conflicting options: staged, all");
          process.exit(1);
        }

        if (all) {
          await stageAllChanges({ cwd });
        }

        const diff = await getStagedDiff({ cwd });

        if (diff.length === 0) {
          log.warn("No staged changes to commit.");
          process.exit(0);
        }

        loadDotEnvFile({
          parentDirPath: cwd,
          envFileName: ENV_FILE_NAME.LOCAL,
        });
        loadDotEnvFile({
          parentDirPath: cwd,
          envFileName: ENV_FILE_NAME.DEFAULT,
        });

        log.info("Generating commit message...");
        const message = await generateCommitMessage({ diff });
        log.success("Commit message generated:");
        log.message(message);

        const shouldCommit = await confirm({
          message:
            "Do you want to commit your staged changes with the above message?",
        });

        if (isCancel(shouldCommit)) {
          cancel("Operation cancelled.");
          process.exit(0);
        }

        if (shouldCommit) {
          await commitStagedChanges({ cwd, message });
          outro("Staged changes committed.");
        } else {
          outro("Nothing was committed.");
        }
        process.exit(0);
      }
    }
}
