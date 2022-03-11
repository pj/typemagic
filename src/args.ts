import { RegisteredInputObject } from "./input";
import { OtherScalars, ScalarTypes, RegisteredEnum, ConstructorFromArray, ArrayItem, RegisteredObject, makeRegistered, Constructor, GenerateArrayTrilean, IsNull, HandleScalarOr } from "./types";

export type ArgsRuntimeSchema<Obj> = {
  [FieldName in keyof Obj]: 
    RegisteredInputObject<
      // Obj[FieldName],
      HandleScalarOr<Obj[FieldName]>,
      IsNull<Obj[FieldName]>,
      GenerateArrayTrilean<Obj[FieldName]>
    >
} 

export type ArgsObject<O> = {
  name?: string,
  type: Constructor<O>,
  runtimeTypes: ArgsRuntimeSchema<O>,
};

export type RegisteredArgsObject<O> = RegisteredObject<ArgsObject<O>>;

export function args<A>(object: ArgsObject<A>): RegisteredArgsObject<A> {
  return makeRegistered(object)
}