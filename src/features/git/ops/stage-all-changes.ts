import { x } from "tinyexec";

export async function stageChanges({ cwd }: { cwd: string }) {
  await x("git", ["add", "-A"], {
    nodeOptions: { cwd },
    throwOnError: true,
  });
}
