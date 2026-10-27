import { getStagedDiff } from "@/ops/get-staged-diff";

const cwd = process.cwd();

const stagedDiff = await getStagedDiff({ cwd });
