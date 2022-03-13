import { Constructor, GenerateNullabilityAndArrayRuntimeOptions, GetIfArray, GetRuntimeType, IsCompileTimeScalar, IsNonNullCompileTimeScalar } from "./types";

export type ScalarOrInput<Item> = 
  (
    [IsNonNullCompileTimeScalar<Item>] extends [true]
      ? GetRuntimeType<Item> 
      : never
  )
    |  
      { type: GetRuntimeType<Item> } 
          & GenerateNullabilityAndArrayRuntimeOptions<Item> 
          & (
              [IsCompileTimeScalar<Item>] extends [false]
              ? {
                  name?: string,
                  runtimeTypes: InputRuntimeTypes<Exclude<GetIfArray<Item>, null | undefined>>
                }
              : {}
            );

export type InputRuntimeTypes<ArgsObject> = {
  [FieldName in keyof ArgsObject]:
    ScalarOrInput<ArgsObject[FieldName]>
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

export type ArgsSchema<ArgsObject> = {
  type: Constructor<ArgsObject>,
  runtimeSchema: InputRuntimeTypes<ArgsObject>
};