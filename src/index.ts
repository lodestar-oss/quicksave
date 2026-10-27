import { cancel, confirm, isCancel, log, outro } from "@clack/prompts";

import { commit } from "@/ops/commit";
import { generateCommitMessage } from "@/ops/generate-commit-message";
import { getStagedDiff } from "@/ops/get-staged-diff";

const diff = await getStagedDiff();

if (diff.length === 0) {
  log.warn("No staged changes to commit.");
  process.exit(0);
}

log.info("Generating commit message...");
const message = await generateCommitMessage({ diff });
log.success("Commit message generated:");
log.message(message);

const shouldCommit = await confirm({
  message: "Do you want to commit your staged changes with the above message?",
});

if (isCancel(shouldCommit)) {
  cancel("Operation cancelled.");
  process.exit(0);
}

if (shouldCommit) {
  await commit({ message });
  outro("Staged changes committed.");
} else {
  outro("Nothing was committed.");
}
