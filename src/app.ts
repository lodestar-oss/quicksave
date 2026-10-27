import { command, description, name, version } from "@bomb.sh/router";

import { VERSION } from "@/constants";

export const app = command(
  name("quicksave"),
  description("A conventional commit generator using LLM."),
  version(VERSION),
);
