import type { ValueOf } from "type-fest";

import type { MODE_ENUM } from "@/constants";

export type Mode = ValueOf<typeof MODE_ENUM>;
