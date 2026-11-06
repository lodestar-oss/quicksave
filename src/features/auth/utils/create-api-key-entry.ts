import type { ValueOf } from "type-fest";

import { createKeyringEntry } from "@little-nebulae/keyring";

import { KEYRING_ENUM } from "@/constants";

export function createAPIKeyEntry({
  provider,
}: {
  provider: ValueOf<typeof KEYRING_ENUM.PROVIDER>;
}) {
  return createKeyringEntry({
    service: KEYRING_ENUM.SERVICE,
    username: provider,
  });
}
