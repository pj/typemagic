// import { Resolver } from "./query";
// import { ArrayTrilean, BooleanOrUndefined, Constructor, GenerateArrayTrilean, GenerateReturnType, GetUnderlyingArrayType, GetUnderlyingRuntimeType, IsNull, ScalarTypes } from "./types";

import { ArgsObject } from "./args";
import { ArrayTrilean, BooleanOrUndefined, Constructor, GenerateArrayTrilean, GenerateOptions, GetIfArray, GetUnderlyingArrayType, GetUnderlyingRuntimeType, IsNull, UnderlyingIsScalar } from "./types";

export type OutputObject<Context, OutputType> =
  { type: GetUnderlyingRuntimeType<OutputType> } 
    & GenerateOptions<OutputType> 
    & ( 
        [UnderlyingIsScalar<OutputType>] extends [false] 
          ? 
            { 
              name?: string, 
              description?: string, 
              deprecationReason?: string,
              runtimeTypes: 
                // {
                //   [
                //     FieldName in keyof 
                //       Exclude<
                //         GetIfArray<OutputType>, 
                //         null | undefined
                //       > 
                //   ]?: 
                //     OutputObject<
                //       Context, 
                //       Exclude<
                //         GetIfArray<OutputType>, 
                //         null | undefined
                //       >[FieldName]
                //     > | Resolver<
                //       Exclude<
                //         GetIfArray<OutputType>, 
                //         null | undefined
                //       > 
                // , Context, any, OutputType[FieldName]>
                // }
                OutputRuntimeTypes<
                  Exclude<
                    GetIfArray<OutputType>, 
                    null | undefined
                  >, 
                  Context, 
                  any
                >
            }
          : {}
      )

export type ResolverFunction<Root, Context, Args, OutputType> =
  [null] extends [Args] 
    ? { 
        resolve: (root: Root, context: Context) => Promise<OutputType> 
      }
    : { 
        resolve: (args: Args, root: Root, context: Context) => Promise<OutputType>,
        args: ArgsObject<Args>
      }

export type Resolver<Root, Context, A, OutputType> = 
  { 
    source: OutputObject<Context, OutputType>,
    name?: string,
    description?: string, 
    deprecationReason?: string
  }
    & GenerateOptions<OutputType> 
    & ResolverFunction<Root, Context, unknown, OutputType>

export type OutputRuntimeTypes<Root, Context, OutputType> = {
  [FieldName in keyof OutputType]?: 
    // OutputObject<Context, OutputType[FieldName]> | 
    Resolver<Root, Context, any, OutputType[FieldName]>
} 
// & 
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

// export type OutputObject<C, O, N extends BooleanOrUndefined, A extends ArrayTrilean> = {
//   name?: string,
//   type: Constructor<O>,
//   runtimeTypes: OutputRuntimeTypes<O, C, O>,
//   nullable?: N,
//   array?: A,
// };