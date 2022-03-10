import { ArgsObject, RegisteredArgsObject } from "./input"
import { RegisteredOutputObject } from "./output"
import { ScalarTypes } from "./types";

export type RegisteredOutputWithScalars<C, O>  = RegisteredOutputObject<C, O> | ScalarTypes;

export type Query<R, C, A, O> = {
  name?: string,
  resolve: ObjectQuery<R, C, A, O>
  output: RegisteredOutputWithScalars<C, O>
  args: RegisteredArgsObject<A>
}

export type ObjectQuery<R, C, A, O> = (args: A, root: R, context: C) => Promise<O>;

export class RegisteredQuery<R, C, A, O> {
  name?: string;
  resolve: ObjectQuery<R, C, A, O>;
  output: RegisteredOutputWithScalars<C, O>;
  args: RegisteredArgsObject<A>;

  constructor(
    resolve: ObjectQuery<R, C, A, O>, 
    output: RegisteredOutputWithScalars<C, O>, 
    args: RegisteredArgsObject<A>, 
    name?: string
  ) {
    this.resolve = resolve;
    this.output = output;
    this.args = args;
    this.name = name;
  }
}

export function query<R, A, O, C = any>(query: Query<R, C, A, O>): RegisteredQuery<R, C, A, O> {
  return new RegisteredQuery(query.resolve, query.output, query.args, query.name);
}

export type Resolve<R, C, O> = (root: R, context: C) => Promise<O>;

export type Resolver<R, C, O> = {
  name?: string,
  resolve: Resolve<R, C, O>
  output: RegisteredOutputWithScalars<C, O>
}

export class RegisteredResolver<R, C, O> {
  name?: string;
  resolve: Resolve<R, C, O>
  output: RegisteredOutputWithScalars<C, O>

  constructor(resolve: Resolve<R, C, O>, output: RegisteredOutputWithScalars<C, O>, name?: string) {
    this.resolve = resolve;
    this.output = output;
    this.name = name;
  }
}

// FIXME: resolver is separate from query because I couldn't find a way to make args dependant on the type of the 
// resolve function
export function resolver<R, O, C = any>(query: Resolver<R, C, O>): RegisteredResolver<R, C, O> {
  return new RegisteredResolver(query.resolve, query.output, query.name);
}