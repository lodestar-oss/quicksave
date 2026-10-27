import { x } from "tinyexec";

export async function commitStagedChanges({
  cwd,
  message,
}: {
  cwd: string;
  message: string;
}) {
  await x("git", ["commit", "-m", message], {
    throwOnError: true,
    nodeOptions: { cwd },
  });
}
