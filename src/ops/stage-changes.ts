import { x } from "tinyexec";

import { cwd } from "@/config/cwd";

export async function stageChanges() {
  await x("git", ["add", "-A"], {
    nodeOptions: { cwd },
    throwOnError: true,
  });
}
