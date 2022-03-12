// import { Resolver } from "./query";
// import { ArrayTrilean, BooleanOrUndefined, Constructor, GenerateArrayTrilean, GenerateReturnType, GetUnderlyingArrayType, GetUnderlyingRuntimeType, IsNull, ScalarTypes } from "./types";

import { ArgsObject } from "./args";
import { ArrayTrilean, BooleanOrUndefined, Constructor, GenerateArrayTrilean, GenerateOptions, GetIfArray, GetUnderlyingArrayType, GetUnderlyingRuntimeType, IsNull, UnderlyingIsScalar } from "./types";

export type OutputObject<C, Item> =
  { type: GetUnderlyingRuntimeType<Item> } 
    & GenerateOptions<Item> 
    & ( 
        [UnderlyingIsScalar<Item>] extends [false] 
          ? 
            { 
              name?: string, 
              description?: string, 
              deprecationReason?: string,
              runtimeTypes: 
                OutputRuntimeTypes<
                  Exclude<
                    GetIfArray<Item>, 
                    null | undefined
                  >, 
                  C, 
                  any
                >
            }
          : {}
      )

export type Resolver<R, C, A, Item> = 
  { 
    source: OutputObject<C, Item>,
    name?: string,
    description?: string, 
    deprecationReason?: string
  }
    & GenerateOptions<Item> 
    & ( 
        [null] extends [A] 
          ? { 
              resolve: (root: R, context: C) => Promise<Item> 
            }
          : { 
              resolve: (args: A, root: R, context: C) => Promise<Item>,
              args: ArgsObject<A>
            }
      )

export type OutputRuntimeTypes<Root, Context, OutputType> = {
  [FieldName in keyof OutputType]?: 
    OutputObject<Context, OutputType[FieldName]> | Resolver<Root, Context, any, OutputType[FieldName]>
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