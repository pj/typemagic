import { ArgsSchema } from "./input";
import { GenerateNullabilityAndArrayRuntimeOptions, GetRuntimeType, IsCompileTimeScalar } from "./types";

export type Resolver<Root, Context, Args, OutputType> = 
  ({
    name?: string,
    description?: string, 
    deprecationReason?: string,
    type: GetRuntimeType<OutputType>
  })
    & GenerateNullabilityAndArrayRuntimeOptions<OutputType> 
    & (
      [unknown] extends [Args] 
        ? {
            resolve: (root: Root, context: Context) => Promise<OutputType> 
          }
        : { 
            resolve: (args: Args, root: Root, context: Context) => Promise<OutputType>,
            args: ArgsSchema<Args>
          }
    )
    & (
        [IsCompileTimeScalar<OutputType>] extends [false] 
          ? {
              runtimeTypes: {
                [FieldName in keyof OutputType]?: 
                  Resolver<OutputType, Context, unknown, OutputType[FieldName]>
              }
            }
          : {}
      )
  
// // Arbitrary properties are allowed.
// {
//   [Key in string]: 
//     keyof Obj extends Key
//       ? () => 
//         Nullable<ScalarTypes> 
//         | ScalarTypes 
//         | Nullable<RegisteredOutputObject<C, any>> 
//         | RegisteredOutputObject<C, any>
//         | RegisteredEnum<{[key: string]: string}>
//         | RegisteredEnum<{[key: number]: string}>
//         | RegisteredQuery<R, C, any, any>
//         | RegisteredResolver<R, C, any>
//       : never
// };