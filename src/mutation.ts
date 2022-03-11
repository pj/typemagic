import { RegisteredArgsObject } from "./args";
import { RegisteredOutputObject } from "./output";
import { ArrayTrilean, BooleanWithUndefined, makeRegistered, RegisteredObject } from "./types";

export type MutationFunction<C, A, O> = (args: A, context: C) => Promise<O>;

export type Mutation<C, A, O, N extends BooleanWithUndefined, Arr extends ArrayTrilean> = {
  args: RegisteredArgsObject<A>,
  output: RegisteredOutputObject<C, O, N, Arr>,
  mutate: MutationFunction<C, A, O>
}

export type RegisteredMutation<C, A, O, N extends BooleanWithUndefined, Arr extends ArrayTrilean>
  = RegisteredObject<Mutation<C, A, O, N, Arr>>

export function mutation<C, A, O, N extends BooleanWithUndefined, Arr extends ArrayTrilean>(
  input: Mutation<C, A, O, N, Arr>
): RegisteredMutation<C, A, O, N, Arr> {
  return makeRegistered(input);
}