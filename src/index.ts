#!/usr/bin/env node

import { parse, printErrors, printHelp, printVersion } from "@bomb.sh/router";
import { cancel, log, outro } from "@clack/prompts";
import { DEFAULT_FAILURE_REASON, isError } from "@little-nebulae/error";
import { nodeLoadEnvFileList } from "@little-nebulae/node-env";
import { prettifyError } from "zod";

import { app } from "@/app";
import { EnvSchema } from "@/config/env";
import { CANCEL_EXIT_CODE } from "@/constants";
import { restoreIndex } from "@/features/git/ops/restore-index";
import { getCommitMessage } from "@/ops/get-commit-message";
import { handleCommit } from "@/ops/handle-commit";
import { handleUnstagedChanges } from "@/ops/handle-unstaged-changes";
import { resolveMode } from "@/ops/resolve-mode";

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

        const resolveModeResult = resolveMode({ staged, all, isTTY });
        if (!resolveModeResult.success) {
          log.error(resolveModeResult.error.message);
          process.exit(1);
        }
        const mode = resolveModeResult.data;

        nodeLoadEnvFileList({
          parentDirPath: cwd,
          envFileList: [".env.local", ".env"],
        });
        const parseEnvResult = EnvSchema.safeParse(process.env);
        if (!parseEnvResult.success) {
          log.error("Invalid GROQ_API_KEY environment variable:");
          log.message(prettifyError(parseEnvResult.error));
          outro("Please fix the above issue to continue.");
          process.exit(1);
        }
        const env = parseEnvResult.data;

        const handleUnstagedChangesResult = await handleUnstagedChanges({
          cwd,
          mode,
        });
        if (!handleUnstagedChangesResult.success) {
          const handleUnstagedChangesError = handleUnstagedChangesResult.error;
          if (handleUnstagedChangesError.code === "CLACK_IS_CANCELLED_ERROR") {
            cancel(handleUnstagedChangesError.message);
            process.exit(CANCEL_EXIT_CODE);
          }
          log.error(handleUnstagedChangesError.message);
          log.message(
            isError(handleUnstagedChangesError.cause)
              ? handleUnstagedChangesError.cause.message
              : DEFAULT_FAILURE_REASON,
          );
          process.exit(1);
        }
        const snapshotStatus = handleUnstagedChangesResult.data;
        if (
          !snapshotStatus.snapshotted &&
          snapshotStatus.reason === "the repo has no unstaged changes"
        ) {
          log.warn(snapshotStatus.reason);
        }

        log.info("Generating commit message...");
        const getCommitMessageResult = await getCommitMessage({ cwd, env });
        if (!getCommitMessageResult.success) {
          // Report error from getCommitMessage
          const getCommitMessageError = getCommitMessageResult.error;
          log.error(getCommitMessageError.message);
          if (getCommitMessageError.code === "UNEXPECTED_ERROR") {
            log.message(
              isError(getCommitMessageError.cause)
                ? getCommitMessageError.cause.message
                : DEFAULT_FAILURE_REASON,
            );
          }
          // Attempt to rollback if there's a snapshot
          if (snapshotStatus.snapshotted) {
            const restoreIndexResult = await restoreIndex({
              cwd,
              treeId: snapshotStatus.treeId,
            });
            if (!restoreIndexResult.success) {
              const restoreIndexError = restoreIndexResult.error;
              log.error(restoreIndexError.message);
              log.message(
                isError(restoreIndexError.cause)
                  ? restoreIndexError.cause.message
                  : DEFAULT_FAILURE_REASON,
              );
            }
          }
          process.exit(1);
        }
        log.success("Commit message generated:");
        const { message } = getCommitMessageResult.data;
        log.message(message);

        const handleCommitResult = await handleCommit({ isTTY, cwd, message });
        if (!handleCommitResult.success) {
          // Report error from handleCommit
          const handleCommitError = handleCommitResult.error;
          if (handleCommitError.code === "CLACK_IS_CANCELLED_ERROR") {
            cancel(handleCommitError.message);
          } else {
            log.error(handleCommitError.message);
            log.message(
              isError(handleCommitError.cause)
                ? handleCommitError.cause.message
                : DEFAULT_FAILURE_REASON,
            );
          }
          // Attempt to rollback if there's a snapshot
          if (snapshotStatus.snapshotted) {
            const restoreIndexResult = await restoreIndex({
              cwd,
              treeId: snapshotStatus.treeId,
            });
            if (!restoreIndexResult.success) {
              const restoreIndexError = restoreIndexResult.error;
              log.error(restoreIndexError.message);
              log.message(
                isError(restoreIndexError.cause)
                  ? restoreIndexError.cause.message
                  : DEFAULT_FAILURE_REASON,
              );
            }
          }
          if (handleCommitError.code === "CLACK_IS_CANCELLED_ERROR") {
            process.exit(CANCEL_EXIT_CODE);
          }
          process.exit(1);
        }
        outro("Changes committed.");
        process.exit(0);
      }
    }
}
