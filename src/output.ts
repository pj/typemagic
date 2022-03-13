import { RootFieldFilter } from "@graphql-tools/utils";
import { ArgsObject } from "./args";
import { GenerateOptions, GetIfArray, GetUnderlyingRuntimeType, UnderlyingIsScalar } from "./types";

export type ResolverFunction<Root, Context, Args, OutputType> =
  [unknown] extends [Args] 
    ? (root: Root, context: Context) => Promise<OutputType> 
    : { 
        resolve: (args: Args, root: Root, context: Context) => Promise<OutputType>,
        args: ArgsObject<Args>
      }

// export type ChildArgsThing<ChildArgs> =
//   {
//     [Key in keyof ChildArgs]: ArgsObject<
//   }

// export type GenerateChildArgs<OutputType>
//   = {
//       [FieldName in keyof OutputType]?:  
//     }

export type Resolver<Root, Context, OutputType> = 
  ({
    name?: string,
    description?: string, 
    deprecationReason?: string,
    type: GetUnderlyingRuntimeType<OutputType>
  })
    & GenerateOptions<OutputType> 
    & 
      {
        // resolve: ((args: any, root: Root, context: Context) => Promise<OutputType>),
        // args: Args
        // childArgs: {
        //   [FieldName in keyof OutputType]?:  
        // }
      }
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

// export type ResolverInput<Root, Context, Args, OutputType> = 
//   ResolverCommon<Context, OutputType> 
//     & ResolverFunction<Root, Context, Args, OutputType>

export function resolver<Root, Context, Args, OutputType>(
  resolver: ResolverFunction<Root, Context, Args, OutputType>
): any
 {
  return resolver;
}