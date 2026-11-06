#!/usr/bin/env node

import { parse, printErrors, printHelp, printVersion } from "@bomb.sh/router";
import { cancel, intro, log, outro } from "@clack/prompts";
import { DEFAULT_FAILURE_REASON, isError } from "@little-nebulae/error";

import { app } from "@/app";
import {
  CANCEL_EXIT_CODE,
  KEYRING_ENUM,
  OPERATION_FAILED_OUTRO,
} from "@/constants";
import { login } from "@/features/auth/ops/login";
import { logout } from "@/features/auth/ops/logout";
import { getAPIKey } from "@/features/auth/utils/get-api-key";
import { restoreIndex } from "@/features/git/ops/restore-index";
import { getCommitMessage } from "@/ops/get-commit-message";
import { handleCommit } from "@/ops/handle-commit";
import { handleUnstagedChanges } from "@/ops/handle-unstaged-changes";
import { resolveMode } from "@/ops/resolve-mode";

const result = parse(app, { argv: process.argv.slice(2) });

if (!result.ok) {
  console.error(printErrors(result));
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
    const isTTY = process.stdin.isTTY;
    switch (result.route) {
      case "/": {
        intro("Initiating quicksave...");
        const { cwd, staged, all, provider } = result.model;

        const resolveModeResult = resolveMode({ staged, all, isTTY });
        if (!resolveModeResult.success) {
          log.error(resolveModeResult.error.message);
          outro(OPERATION_FAILED_OUTRO);
          process.exit(1);
        }
        const mode = resolveModeResult.data;

        const getAPIKeyResult = getAPIKey({ provider });
        if (!getAPIKeyResult.success) {
          const getAPIKeyError = getAPIKeyResult.error;
          if (getAPIKeyError.code === "KEYRING_NO_ENTRY_ERROR") {
            log.error(`No API key for ${provider} provider was set.`);
            log.info("Please add one with the auth login command.");
          } else {
            log.error(getAPIKeyError.message);
            log.message(
              isError(getAPIKeyError.cause)
                ? getAPIKeyError.cause.message
                : DEFAULT_FAILURE_REASON,
            );
          }
          outro(OPERATION_FAILED_OUTRO);
          process.exit(1);
        }
        const apiKey = getAPIKeyResult.data;

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
          outro(OPERATION_FAILED_OUTRO);
          process.exit(1);
        }
        const snapshotStatus = handleUnstagedChangesResult.data;
        if (
          !snapshotStatus.snapshotted &&
          snapshotStatus.reason === "The repo has no unstaged changes"
        ) {
          log.warn(snapshotStatus.reason);
        }

        log.info("Generating commit message...");
        const getCommitMessageResult = await getCommitMessage({ cwd, apiKey });
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
          // Exist
          outro(OPERATION_FAILED_OUTRO);
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
          // Exit
          if (handleCommitError.code === "CLACK_IS_CANCELLED_ERROR") {
            process.exit(CANCEL_EXIT_CODE);
          }
          outro(OPERATION_FAILED_OUTRO);
          process.exit(1);
        }
        const { committed } = handleCommitResult.data;
        if (!committed) {
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
        }
        outro(committed ? "Changes committed." : "Nothing was commited.");
        process.exit(0);
      }
      case "/auth/login": {
        if (!isTTY) {
          log.error(
            "The auth login command can only be executed in an interactive terminal context.",
          );
          process.exit(1);
        }

        const loginResult = await login({ isTTY });

        // Success cases
        if (loginResult.success) {
          const successResult = loginResult.data;
          // Did set case
          if (successResult.didSet) {
            outro(
              successResult.overwritten
                ? "The old API key has been replaced with a new one."
                : "The API key has been set.",
            );
            // Did not set case
          } else {
            outro("Nothing was set. Your existing API key will be used.");
          }
          process.exit(0);
        }

        // Failure cases
        const loginError = loginResult.error;
        // Cancelled case
        if (loginError.code === "CLACK_IS_CANCELLED_ERROR") {
          cancel(loginError.message);
          process.exit(CANCEL_EXIT_CODE);
        }
        // Unexpected case
        log.error(loginError.message);
        log.message(
          isError(loginError.cause)
            ? loginError.cause.message
            : DEFAULT_FAILURE_REASON,
        );
        process.exit(1);
      }
      case "/auth/status": {
        let message = "";
        for (const provider of Object.values(KEYRING_ENUM.PROVIDER)) {
          const getKeyResult = getAPIKey({ provider });
          if (getKeyResult.success) {
            message += `${provider}: authenticated.\n`;
            continue;
          }
          if (getKeyResult.error.code === "KEYRING_NO_ENTRY_ERROR") {
            message += `${provider}: not authenticated.\n`;
            continue;
          }
          message += `${provider}: failed to check.\n`;
        }
        log.message(message);
        outro("Operation complete.");
        process.exit(0);
      }
      case "/auth/logout": {
        if (!isTTY) {
          log.error(
            "The auth logout command can only be executed in an interactive terminal context.",
          );
          process.exit(1);
        }

        const logoutResult = await logout({ isTTY });

        if (logoutResult.success) {
          outro("API key deleted.");
          process.exit(0);
        }

        const logoutError = logoutResult.error;
        if (logoutError.code === "CLACK_IS_CANCELLED_ERROR") {
          cancel(logoutError.message);
          process.exit(CANCEL_EXIT_CODE);
        }
        if (logoutError.code === "KEYRING_NO_ENTRY_ERROR") {
          log.warn("No API key was set for the provider.");
          outro("Nothing to delete.");
          process.exit(0);
        }
        log.error(logoutError.message);
        log.message(
          isError(logoutError.cause)
            ? logoutError.cause.message
            : DEFAULT_FAILURE_REASON,
        );
        process.exit(1);
      }
    }
}
