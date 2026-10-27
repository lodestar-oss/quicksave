import { x } from "tinyexec";

export async function commit({ message }: { message: string }) {
  await x("git", ["commit", "-m", message], {
    throwOnError: true,
    nodeOptions: { stdio: "inherit" },
  });
}
