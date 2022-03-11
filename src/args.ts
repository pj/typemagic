import { Constructor, ScalarOrInput } from "./types";

export type ArgsRuntimeSchema<Obj> = {
  [FieldName in keyof Obj]: 
    ScalarOrInput<Obj[FieldName]>
} 

export type ArgsObject<O> = {
  name?: string,
  type: Constructor<O>,
  runtimeTypes: ArgsRuntimeSchema<O>,
};

// export type RegisteredArgsObject<O> = RegisteredObject<ArgsObject<O>>;

// export function args<A>(object: ArgsObject<A>): RegisteredArgsObject<A> {
//   return makeRegistered(object)
// }