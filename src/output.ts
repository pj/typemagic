import { ArgsObject } from "./args";
import { GenerateOptions, GetIfArray, GetUnderlyingRuntimeType, UnderlyingIsScalar } from "./types";

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
                OutputRuntimeTypes<
                  Exclude<
                    GetIfArray<OutputType>, 
                    null | undefined
                  >, 
                  Context, 
                  any, 
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

export type Resolver<Root, Context, Args, OutputType> = 
  { 
    source: OutputObject<Context, OutputType>,
    name?: string,
    description?: string, 
    deprecationReason?: string
  }
    & ResolverFunction<Root, Context, Args, OutputType>

export type OutputRuntimeTypes<Root, Context, Args, OutputType> = {
  [FieldName in keyof OutputType]?: 
    [null] extends [Args]
      ? OutputObject<Context, OutputType[FieldName]>
      : Resolver<Root, Context, Args, OutputType[FieldName]>
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