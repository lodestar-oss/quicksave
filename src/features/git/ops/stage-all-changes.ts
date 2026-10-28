import { x } from "tinyexec";

export async function stageAllChanges({ cwd }: { cwd: string }) {
  await x("git", ["add", "-A"], {
    nodeOptions: { cwd },
    throwOnError: true,
  });
}
