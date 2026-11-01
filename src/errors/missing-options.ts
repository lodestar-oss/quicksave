import type { UnknownRecord } from "type-fest";

import { BaseError } from "@little-nebulae/error";

export class MissingOptionsError<
  TOptions extends UnknownRecord,
> extends BaseError<"MISSING_OPTIONS_ERROR", TOptions> {
  readonly name = "MissingOptionsError";
  readonly code = "MISSING_OPTIONS_ERROR";

  constructor({ message, options }: { message: string; options: TOptions }) {
    super({ message, cause: options, meta: null });
  }
}
