import { ArrayTrilean, BooleanOrUndefined, Constructor, GenerateOptions, GetIfArray, GetUnderlyingRuntimeType, UnderlyingIsScalar } from "./types";

export type ScalarOrInput<Item> = 
  { type: GetUnderlyingRuntimeType<Item> } 
    & GenerateOptions<Item> 
    & (
        [UnderlyingIsScalar<Item>] extends [false]
        ? {
            name?: string,
            runtimeTypes: InputRuntimeTypes<Exclude<GetIfArray<Item>, null | undefined>>
          }
        : {}
      )

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

// export type InputObject<O, N extends BooleanOrUndefined, A extends ArrayTrilean> = {
//   name?: string,
//   type: Constructor<O>,
//   runtimeTypes: InputRuntimeTypes<O>,
//   nullable?: N,
//   array?: A
// };