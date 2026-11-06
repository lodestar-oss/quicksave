import {
  cli,
  command,
  description,
  name,
  option,
  route,
  schema,
  version,
} from "@bomb.sh/router";
import { NonEmptyStringSchema } from "@little-nebulae/zod-schemas";
import { z } from "zod";

import { MODE_ENUM } from "@/constants";

import packageManifest from "../package.json" with { type: "json" };

const SwitchOptionSchema = z.preprocess(
  (value) => (typeof value === "undefined" ? false : value),
  z.boolean(),
);

export const app = command(
  name("quicksave"),
  description("A conventional commit generator using LLM."),
  version(packageManifest.version),
  option(
    name("cwd"),
    cli(["--cwd", "-C"]),
    schema(NonEmptyStringSchema.default(process.cwd())),
  ),
  option(
    name(MODE_ENUM.STAGED),
    cli(["--staged", "-s"], { switch: true }),
    schema(SwitchOptionSchema),
  ),
  option(
    name(MODE_ENUM.ALL),
    cli(["--all", "-a"], { switch: true }),
    schema(SwitchOptionSchema),
  ),
  route(
    name("auth"),
    command(name("login")),
    command(name("status")),
    command(name("logout")),
  ),
);
