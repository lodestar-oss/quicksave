import type { ValueOf } from "type-fest";

import { createKeyringEntry } from "@little-nebulae/keyring";

import { KEYRING_ENUM } from "@/constants";

export function getAPIKey({
  provider,
}: {
  provider: ValueOf<typeof KEYRING_ENUM.PROVIDER>;
}) {
  const createEntryResult = createKeyringEntry({
    service: KEYRING_ENUM.SERVICE,
    username: provider,
  });
  if (!createEntryResult.success) {
    return createEntryResult;
  }
  const entry = createEntryResult.data;

  return entry.getPassword();
}
