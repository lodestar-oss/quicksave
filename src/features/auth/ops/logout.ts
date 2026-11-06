import type { ClackIsCancelledError } from "@little-nebulae/clack";
import type { UnexpectedError } from "@little-nebulae/error";
import type { KeyringNoEntryError } from "@little-nebulae/keyring";
import type { AsyncResult } from "@little-nebulae/result";

import { clackSelect } from "@little-nebulae/clack";

import { KEYRING_ENUM } from "@/constants";
import { createAPIKeyEntry } from "@/features/auth/utils/create-api-key-entry";

export async function logout({
  isTTY,
}: {
  isTTY: true;
}): AsyncResult<
  void,
  ClackIsCancelledError | KeyringNoEntryError | UnexpectedError
> {
  const selectProviderResult = await clackSelect({
    message: "Choose a provider:",
    options: [{ value: KEYRING_ENUM.PROVIDER.GROQ, label: "Groq" }],
    isTTY,
  });
  if (!selectProviderResult.success) {
    return selectProviderResult;
  }
  const provider = selectProviderResult.data;

  const createEntryResult = createAPIKeyEntry({ provider });
  if (!createEntryResult.success) {
    return createEntryResult;
  }
  const entry = createEntryResult.data;

  return entry.deletePassword();
}
