import { RegisteredArgsObject } from "./input";
import { RegisteredOutputObject } from "./output";

export type MutationFunction<C, A, O> = (args: A, context: C) => Promise<O>;

export type Mutation<C, A, O> = {
  args: RegisteredArgsObject<A>,
  output: RegisteredOutputObject<C, O>,
  mutate: MutationFunction<C, A, O>
}

export class RegisteredMutation<C, A, O> {
  constructor(
    public args: RegisteredArgsObject<A>,
    public output: RegisteredOutputObject<C, O>,
    public mutate: MutationFunction<C, A, O>,
  ) {
  }
}

export function mutation<C, A, O>(input: Mutation<C, A, O>): RegisteredMutation<C, A, O> {
  return new RegisteredMutation(input.args, input.output, input.mutate);
}