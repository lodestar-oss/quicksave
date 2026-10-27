import {
  cli,
  command,
  description,
  name,
  option,
  schema,
  version,
} from "@bomb.sh/router";
import { z } from "zod";

import { VERSION } from "@/constants";

const SwitchOptionSchema = z.preprocess(
  (value) => (typeof value === "undefined" ? false : value),
  z.boolean(),
);

export const app = command(
  name("quicksave"),
  description("A conventional commit generator using LLM."),
  version(VERSION),
  option(
    name("staged"),
    cli(["--staged", "-s"], { switch: true }),
    schema(SwitchOptionSchema),
  ),
  option(
    name("all"),
    cli(["--all", "-a"], { switch: true }),
    schema(SwitchOptionSchema),
  ),
);
