import { ArgsObject } from "./args";
import { GenerateOptions, GetIfArray, GetUnderlyingRuntimeType, UnderlyingIsScalar } from "./types";

export type ArgsNull<Args> =
  [null] extends [Args] 
    ? [unknown] extends [Args]
      ? true
      : false
    : false

export type ResolverFunction<Root, Context, Args, OutputType> =
  // [null] extends [Args] 
  //   ? [unknown] extends [Args]
    [ArgsNull<Args>] extends [true]
      ? { 
          resolve?: (root: Root, context: Context) => Promise<OutputType> 
        }
      : { 
          resolve: (args: Args, root: Root, context: Context) => Promise<OutputType>,
          args: ArgsObject<Args>
        }

export type Resolver<Root, Context, Args, OutputType, ChildArgs> = 
  ({
    name?: string,
    description?: string, 
    deprecationReason?: string,
    type: GetUnderlyingRuntimeType<OutputType>
  })
    & GenerateOptions<OutputType> 
    & ResolverFunction<Root, Context, Args, OutputType>
    & (
        [UnderlyingIsScalar<OutputType>] extends [false] 
          ? {
              runtimeTypes: {
                [FieldName in keyof OutputType]?: 
                  Resolver<OutputType, Context, ChildArgs, OutputType[FieldName], unknown>
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