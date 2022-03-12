import { RootFieldFilter } from "@graphql-tools/utils";
import { ArgsObject } from "./args";
import { GenerateOptions, GetIfArray, GetUnderlyingRuntimeType, UnderlyingIsScalar } from "./types";

export type ArgsNull<Args> =
  [null] extends [Args] 
    ? [unknown] extends [Args]
      ? true
      : false
    : false

export type ResolverFunction<Root, Context, Args, OutputType> =
  [null] extends [Args] 
    ? { 
        resolve?: (root: Root, context: Context) => Promise<OutputType> 
      }
    : { 
        resolve: (args: Args, root: Root, context: Context) => Promise<OutputType>,
        args: ArgsObject<Args>
      }
  // {
  //   resolve: (args: Args, root: Root, context: Context) => Promise<OutputType>,
  //   args: ArgsObject<Args>
  // }

// export type Resolver<Root, Context, Args, OutputType> = 
//   ({
//     name?: string,
//     description?: string, 
//     deprecationReason?: string,
//     type: GetUnderlyingRuntimeType<OutputType>
//   })
//     & GenerateOptions<OutputType> 
//     & ResolverFunction<Root, Context, Args, OutputType>
//     & (
//         [UnderlyingIsScalar<OutputType>] extends [false] 
//           ? {
//               runtimeTypes: {
//                 [FieldName in keyof OutputType]?: 
//                   Resolver<OutputType, Context, any, OutputType[FieldName]>
//               }
//             }
//           : {}
//       )

export type ResolverCommon<Context, OutputType> = 
  ({
    name?: string,
    description?: string, 
    deprecationReason?: string,
    type: GetUnderlyingRuntimeType<OutputType>
  })
    & GenerateOptions<OutputType> 
    & (
        [UnderlyingIsScalar<OutputType>] extends [false] 
          ? {
              runtimeTypes: {
                [FieldName in keyof OutputType]?: 
                  Resolver<OutputType, Context, OutputType[FieldName]>
              }
            }
          : {}
      )
  
export type Resolver<Root, Context, OutputType> =
  ResolverCommon<Context, OutputType>
    & 
    { 
        resolve?: (args: any, root: Root, context: Context) => Promise<OutputType>,
        args?: ArgsObject<any>
      }

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

export type ResolverInput<Root, Context, Args, OutputType> = 
  ResolverCommon<Context, OutputType> 
    & ResolverFunction<Root, Context, Args, OutputType>

export function resolver<Root, Context, Args, OutputType>(
  resolver: ResolverInput<Root, Context, Args, OutputType>
): Resolver<Root, Context, OutputType> {
  return resolver;
}