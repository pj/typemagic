import { BooleanOrUndefined, ArrayTrilean, ScalarTypes } from "./types";

export type Scalar<O, N extends boolean, A extends boolean | "nullable_items"> = {
  name?: string,
  type: ScalarTypes
  nullable: N,
  array: A
};