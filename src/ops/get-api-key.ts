import type { ValueOf } from "type-fest";

import type { KEYRING_ENUM } from "@/constants";

import { createAPIKeyEntry } from "@/features/auth/utils/create-api-key-entry";

export function getAPIKey({
  provider,
}: {
  provider: ValueOf<typeof KEYRING_ENUM.PROVIDER>;
}) {
  const createEntryResult = createAPIKeyEntry({ provider });
  if (!createEntryResult.success) {
    return createEntryResult;
  }
  const entry = createEntryResult.data;

  return entry.getPassword();
}
