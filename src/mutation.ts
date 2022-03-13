import { ArgsObject } from "./args";
import { ArrayTrilean, BooleanOrUndefined, } from "./types";

export type MutationFunction<C, A, O> = (args: A, context: C) => Promise<O>;

export type Mutation<C, A, O> = {
  args: ArgsObject<A>,
  // output: RegisteredOutputObject<C, O, N, Arr>,
  mutate: MutationFunction<C, A, O>
}