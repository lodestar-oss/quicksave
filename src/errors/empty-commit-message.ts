import { BaseError } from "@little-nebulae/error";

import type { AIGenerationMetadata } from "@/features/ai/types";

export class EmptyCommitMessageError extends BaseError<
  "EMPTY_COMMIT_MESSAGE_ERROR",
  null,
  AIGenerationMetadata
> {
  readonly name = "EmptyCommitMessageError";
  readonly code = "EMPTY_COMMIT_MESSAGE_ERROR";

  constructor(meta: AIGenerationMetadata) {
    super({
      message: "The LLM provider responded with empty content",
      cause: null,
      meta,
    });
  }
}
