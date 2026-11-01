import type { Result } from "@little-nebulae/result";

import { fail, succeed } from "@little-nebulae/result";

import type { Mode } from "@/types";

import { MODE_ENUM } from "@/constants";
import { ConflictingOptionsError } from "@/errors/conflicting-options";
import { MissingOptionsError } from "@/errors/missing-options";

export function resolveMode({
  staged,
  all,
  isTTY,
}: {
  staged: boolean;
  all: boolean;
  isTTY: boolean;
}): Result<
  Mode,
  | ConflictingOptionsError<{
      staged: true;
      all: true;
    }>
  | MissingOptionsError<{
      staged: false;
      all: false;
    }>
> {
  if (staged && all) {
    return fail(
      new ConflictingOptionsError({
        message: `Conflicting options: ${MODE_ENUM.STAGED}, ${MODE_ENUM.ALL}`,
        options: { staged, all },
      }),
    );
  }

  if (!isTTY && !staged && !all) {
    return fail(
      new MissingOptionsError({
        message:
          "The staged or all option is required in a non-interactive terminal context.",
        options: { staged, all },
      }),
    );
  }

  return succeed(staged ? MODE_ENUM.STAGED : MODE_ENUM.ALL);
}
