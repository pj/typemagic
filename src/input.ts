import { ArrayTrilean, BooleanOrUndefined, Constructor, ScalarOrInput } from "./types";

export type InputRuntimeTypes<Obj> = {
  [FieldName in keyof Obj]:
    ScalarOrInput<Obj[FieldName]>
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
  type: Constructor<O>,
  runtimeTypes: InputRuntimeTypes<O>,
  nullable?: N,
  array?: A
};