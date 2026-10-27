import { x } from "tinyexec";

import { cwd } from "@/config/cwd";

export async function commit({ message }: { message: string }) {
  await x("git", ["commit", "-m", message], {
    throwOnError: true,
    nodeOptions: { cwd },
  });
}
