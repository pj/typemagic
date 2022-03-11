import { ArgsObject, RegisteredArgsObject } from "./input"
import { RegisteredOutputObject } from "./output"
import { ScalarTypes } from "./types";

export type RegisteredOutputWithScalars<C, O>  = RegisteredOutputObject<C, O> | ScalarTypes;

// export type Query<R, C, A, O> = {
//   name?: string,
//   resolve: ObjectQuery<R, C, A, O>
//   output: RegisteredOutputWithScalars<C, O>
//   args: RegisteredArgsObject<A>
// }

// export type ObjectQuery<R, C, A, O> = (args: A, root: R, context: C) => Promise<O>;

// export class RegisteredQuery<R, C, A, O> {
//   name?: string;
//   resolve: ObjectQuery<R, C, A, O>;
//   output: RegisteredOutputWithScalars<C, O>;
//   args: RegisteredArgsObject<A>;

//   constructor(
//     resolve: ObjectQuery<R, C, A, O>, 
//     output: RegisteredOutputWithScalars<C, O>, 
//     args: RegisteredArgsObject<A>, 
//     name?: string
//   ) {
//     this.resolve = resolve;
//     this.output = output;
//     this.args = args;
//     this.name = name;
//   }
// }

// export function query<R, A, O, C = any>(query: Query<R, C, A, O>): RegisteredQuery<R, C, A, O> {
//   return new RegisteredQuery(query.resolve, query.output, query.args, query.name);
// }

// FIXME: O | null isn't really correct, but I can't think of how to handle this right now.
export type Resolve<R, C, O> = (root: R, context: C) => Promise<O | null>;

export type ResolverCommon<C, A, O> = {
  args?: RegisteredArgsObject<A>
  type: RegisteredOutputWithScalars<C, O>,
  nullable?: boolean,
  array?: boolean | "nullable_items"
  name?: string,
  description?: string,
  deprecationReason?: string,
}

export type Resolver<R, C, A, O> = 
  ResolverCommon<C, A, O> 
    & {
      nullable: true, 
      array: undefined,
      resolve: (args: A, root: R, context: C) => O | null
    } 
  | ResolverCommon<C, A, O> 
    & {
      nullable: false, 
      array: undefined,
      resolve: (args: A, root: R, context: C) => O
    } 
  | ResolverCommon<C, A, O> 
    & {
      nullable: true, 
      array: true
      resolve: (args: A, root: R, context: C) => O[] | null
    } 
  | ResolverCommon<C, A, O> 
    & {
      nullable: false, 
      array: true
      resolve: (args: A, root: R, context: C) => O[]
    } 

export type RegisteredResolver<R, C, A, O> = Resolver<R, C, A, O> & {registered: true};
// export class RegisteredResolver<R, C, O> {
//   name?: string;
//   resolve: Resolve<R, C, O> | ArrayResolveFunction<R, C, O>
//   output: RegisteredOutputWithScalars<C, O>

//   constructor(resolve: Resolve<R, C, O> | ArrayResolveFunction<R, C, O>, output: RegisteredOutputWithScalars<C, O>, name?: string) {
//     this.resolve = resolve;
//     this.output = output;
//     this.name = name;
//   }
// }

// FIXME: resolver is separate from query because I couldn't find a way to make args dependant on the type of the 
// resolve function
export function resolver<R, A, O, C = any>(query: Resolver<R, C, A, O>): RegisteredResolver<R, C, A, O> {
  return {...query, registered: true};
}

// FIXME: O[] | null isn't really correct, but I can't think of how to handle this right now.
// export type ArrayResolveFunction<R, C, O> = (root: R, context: C) => Promise<O[] | null>;

// export type ArrayResolver<R, C, O> = {
//   name?: string,
//   resolve: ArrayResolveFunction<R, C, O>
//   output: RegisteredOutputWithScalars<C, O>
// }

// export type ArrayResolver<C, O> = {
//   nullable?: boolean,
//   type: RegisteredOutputWithScalars<C, O>
// }

// export function array<R, O, C = any>(array: ScalarTypes | ArrayResolver<C, O>): RegisteredOutputObject<R, C, O> {
//   return {...array, array: true}
// }