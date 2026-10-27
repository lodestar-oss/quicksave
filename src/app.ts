import {
  cli,
  command,
  description,
  name,
  option,
  version,
} from "@bomb.sh/router";

import { VERSION } from "@/constants";

export const app = command(
  name("quicksave"),
  description("A conventional commit generator using LLM."),
  version(VERSION),
  option(name("staged"), cli(["--staged", "-s"], { switch: true })),
  option(name("all"), cli(["--all", "-a"], { switch: true })),
);
