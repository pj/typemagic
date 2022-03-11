import { OtherScalars, ScalarTypes, RegisteredEnum, ConstructorFromArray, ArrayItem, RegisteredObject, Constructor, makeRegistered, ArrayTrilean, HandleItem, GenerateArrayTrilean, IsNull, BooleanWithUndefined } from "./types";

export type InputRuntimeTypes<Obj> = {
  [FieldName in keyof Obj]: 
    RegisteredInputObject<
      HandleItem<Obj[FieldName]> extends never ? Obj[FieldName] : HandleItem<Obj[FieldName]>, 
      IsNull<Obj[FieldName]>, 
      GenerateArrayTrilean<Obj[FieldName]>
    >
} 
// & 
// Arbitrary properties are allowed.
// {
//   [Key in string]: 
//     keyof Obj extends Key
//       ?  
//         Nullable<ScalarTypes> 
//         | ScalarTypes 
//         | Nullable<RegisteredInputObject<any>> 
//         | RegisteredInputObject<any>
//         | RegisteredEnum<{[key: string]: string}>
//         | RegisteredEnum<{[key: number]: string}>
//       : never
// };

export type InputObject<O, N extends BooleanWithUndefined, A extends ArrayTrilean> = {
  name?: string,
  type: Constructor<O> | ScalarTypes
  runtimeTypes: InputRuntimeTypes<ArrayItem<O>>,
  nullable?: N,
  array?: A
};

export type RegisteredInputObject<O, N extends BooleanWithUndefined, A extends ArrayTrilean> = RegisteredObject<InputObject<O, N, A>>

export function input<I, N extends BooleanWithUndefined, A extends ArrayTrilean>(input: InputObject<I, N, A>): RegisteredInputObject<I, N, A> {
  return makeRegistered(input);
}
