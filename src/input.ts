import { ArrayItem, ArrayTrilean, ArrayType, BooleanOrUndefined, Constructor, GenerateArrayTrilean, HandleItem, HandleScalarOr, IsNull, makeRegistered, RegisteredObject, ScalarTypes } from "./types";

export type InputRuntimeTypes<Obj> = {
  [FieldName in keyof Obj]:
  RegisteredInputObject<
    HandleScalarOr<Obj[FieldName]>,
    // [HandleItem<ArrayType<Obj[FieldName]>>] extends [never] ? ArrayType<Obj[FieldName]> : HandleItem<ArrayType<Obj[FieldName]>>,
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

export type InputObject<O, N extends BooleanOrUndefined, A extends ArrayTrilean> = {
  name?: string,
  type: Constructor<O> | ScalarTypes
  runtimeTypes: InputRuntimeTypes<O>,
  nullable?: N,
  array?: A
};

export type RegisteredInputObject<O, N extends BooleanOrUndefined, A extends ArrayTrilean> = RegisteredObject<InputObject<O, N, A>>

export function input<I, N extends BooleanOrUndefined, A extends ArrayTrilean>(input: InputObject<I, N, A>): RegisteredInputObject<I, N, A> {
  return makeRegistered(input);
}
