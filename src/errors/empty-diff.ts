import { BaseError } from "@little-nebulae/error";

export class EmptyDiffError extends BaseError<"EMPTY_DIFF_ERROR", null> {
  readonly name = "EmptyDiffError";
  readonly code = "EMPTY_DIFF_ERROR";

  constructor() {
    super({ message: "No staged changes to commit.", cause: null, meta: null });
  }
}
