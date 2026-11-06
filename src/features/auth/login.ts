import type { ClackIsCancelledError } from "@little-nebulae/clack";
import type { UnexpectedError } from "@little-nebulae/error";
import type { AsyncResult } from "@little-nebulae/result";

import {
  clackConfirm,
  clackPassword,
  clackSelect,
} from "@little-nebulae/clack";
import { succeed } from "@little-nebulae/result";

import { KEYRING_ENUM } from "@/constants";
import { createAPIKeyEntry } from "@/features/auth/utils/create-api-key-entry";
import { getAPIKey } from "@/ops/get-api-key";

export async function login({
  isTTY,
}: {
  isTTY: true;
}): AsyncResult<
  | { didSet: false; overwritten: false }
  | { didSet: true; overwritten: boolean },
  ClackIsCancelledError | UnexpectedError
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

  let overwritten = false;
  const getKeyResult = getAPIKey({ provider });
  if (getKeyResult.success) {
    const confirmOverwriteResult = await clackConfirm({
      message: `An API key already existed for ${provider}. Do you want to overwrite it?`,
      initialValue: false,
      isTTY,
    });
    if (!confirmOverwriteResult.success) {
      return confirmOverwriteResult;
    }
    overwritten = confirmOverwriteResult.data;
    if (overwritten === false) {
      return succeed({ didSet: false, overwritten });
    }
  }

  const promptPasswordResult = await clackPassword({
    message: `Please enter the API key for ${provider}:`,
    isTTY,
  });
  if (!promptPasswordResult.success) {
    return promptPasswordResult;
  }
  const password = promptPasswordResult.data;

  const createEntryResult = createAPIKeyEntry({ provider });
  if (!createEntryResult.success) {
    return createEntryResult;
  }
  const entry = createEntryResult.data;

  const setPasswordResult = entry.setPassword({ password });
  if (setPasswordResult.success) {
    return succeed({ didSet: true, overwritten });
  }
  return setPasswordResult;
}
