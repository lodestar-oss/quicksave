import { commit } from "@/ops/commit";
import { generateCommitMessage } from "@/ops/generate-commit-message";
import { getStagedDiff } from "@/ops/get-staged-diff";

const cwd = process.cwd();

const diff = await getStagedDiff({ cwd });

const message = await generateCommitMessage({ diff });

await commit({ message });
