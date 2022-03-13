import { InputRuntimeTypes, ScalarOrInput } from "./input";
import { QueryRoot } from "./schema";
import { ArrayTrilean, BooleanOrUndefined, Constructor, GenerateArrayTrilean, GenerateReturnType, GetIfArray, GetRuntimeScalarType, GetUnderlyingArrayType, IntOrFloat, IsCompileTimeScalarType, IsNull, ScalarTypes, UnderlyingIsScalar } from "./types";

// export type GetCompileTimeScalarType<Item> =
//   [Item] extends [typeof Date] 
//     ? Date
//     : [Item] extends [typeof Boolean]
//       ? boolean
//       : [Item] extends [typeof String]
//         ? string
//         : [Item] extends [IntOrFloat]
//           ? number
//         //   : [Item] extends [RegisteredEnum<{[key: string]: string}>]
//         // : [Item] extends [number]
//         //   ? IntOrFloat | RegisteredEnum<{[key: number]: string}>
//           : never

export type RuntimeArgsType<Item, B extends BooleanOrUndefined, A extends ArrayTrilean> =
  { 
    type: Item,
    nullable?: B,
    array?: A
  } 

// export type ArgsTypeFromRuntime<Item, Nullability extends BooleanOrUndefined, IsArray extends ArrayTrilean> =
//   GenerateReturnType<GetCompileTimeScalarType<Item>, Nullability, IsArray>

export type InferArgsFromSchema<Item, Nullability extends BooleanOrUndefined, IsArray extends ArrayTrilean> = 
  { 
    type: Item,
    nullable?: Nullability,
    array?: IsArray
  } 
    // & (
    //     [Item] extends [ScalarTypes]
    //     ? {}
    //     : {
    //         name?: string,
    //         runtimeTypes: InputRuntimeTypes<Item>
    //       }
    //   )


export type ArgsRuntimeSchema<Obj> = {
  [FieldName in keyof Obj]: 
    ScalarOrInput<Obj[FieldName]>
} 

export type ArgsObject<O> = {
  type: Constructor<O>,
  runtimeTypes: ArgsRuntimeSchema<O>,
};

export type InferArgsForType<
  Type, 
  InferedArgs
> = {
  [FieldName in keyof InferedArgs]: 
    [FieldName] extends [keyof Type] 
      ? InferedArgs[FieldName]
      : never
}


// export type ResolverFunction<InferedArg, ReturnType> = 
//   [InferedArg] extends [RuntimeArgsType<infer RuntimeType, infer Nullability, infer IsArray>]
//     ? (args: GenerateReturnType<GetCompileTimeScalarType<RuntimeType>, Nullability, IsArray>) => ReturnType
//     : () => ReturnType


// export type ArgsThing<Type> = {
//   [Key in keyof Type]: any
// }

export type ArgsAndResolvers<ResolverFunction, Root, Context> =
  [ResolverFunction] extends [(args: infer ArgsRealType, root: infer X, context: Context) => infer ResponseType]
  ?
    {
      type: [IsCompileTimeScalarType<ResponseType>] extends [true]
        ? GetRuntimeScalarType<ResponseType>
        : Constructor<GetUnderlyingArrayType<ResponseType>>
    } 
    & (
        [null] extends [ResponseType]
          ? {
              nullable: true
            }
          : {
              nullable?: false
            }
      )
    & 
      (
        [undefined] extends [ArgsRealType] 
          ? {}
          : {
              args: {
                type: GetRuntimeScalarType<ArgsRealType>,
              } 
                & 
                  (
                    [null] extends [ArgsRealType] 
                      ? {
                          nullable: true
                        }
                      : {
                          nullable?: false
                      }
                  ),
            }
        )
      & {
          resolve: ResolverFunction,// (args: ArgsRealType) => ResponseType
        } 
      & 
        (
          [IsCompileTimeScalarType<ResponseType>] extends [true]
            ? {}
            : 
              {
                runtimeTypes: {
                  [Key in keyof GetUnderlyingArrayType<ResponseType>]:
                    ArgsAndResolvers<
                      (args: never, root: GetUnderlyingArrayType<ResponseType>, context: Context) => GetUnderlyingArrayType<ResponseType>[Key],
                      GetUnderlyingArrayType<ResponseType>,
                      Context
                    >
              }
            } 
        )
  : "Could not determine parameters from type"
