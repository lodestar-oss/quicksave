import { x } from "tinyexec";

export async function snapshotIndex({ cwd }: { cwd: string }) {
  const result = await x("git", ["write-tree"], {
    nodeOptions: { cwd },
    throwOnError: true,
  });
  return result.stdout.trim();
}
