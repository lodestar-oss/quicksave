import type { UnknownRecord } from "type-fest";

import { BaseError } from "@little-nebulae/error";

export class ConflictingOptionsError<
  TOptions extends UnknownRecord,
> extends BaseError<"CONFLICTING_OPTIONS_ERROR", TOptions> {
  readonly name = "ConflictingOptionsError";
  readonly code = "CONFLICTING_OPTIONS_ERROR";

  constructor({ message, options }: { message: string; options: TOptions }) {
    super({ message, cause: options, meta: null });
  }
}
