import { log, outro } from "@clack/prompts";

import { commit } from "@/ops/commit";
import { generateCommitMessage } from "@/ops/generate-commit-message";
import { getStagedDiff } from "@/ops/get-staged-diff";

const cwd = process.cwd();

const diff = await getStagedDiff({ cwd });

if (diff.length === 0) {
  log.warn("No staged changes to commit.");
  process.exit(0);
}

log.info("Generating commit message...");
const message = await generateCommitMessage({ diff });
log.success("Commit message generated:");
log.message(message);

await commit({ message });
outro("Changes committed.");
