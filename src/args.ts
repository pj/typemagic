import { InputRuntimeTypes, ScalarOrInput } from "./input";
import { ArrayTrilean, BooleanOrUndefined, Constructor, GenerateArrayTrilean, GenerateReturnType, GetIfArray, IntOrFloat, IsNull, ScalarTypes, UnderlyingIsScalar } from "./types";

export type GetActualScalarType<Item> =
  [Item] extends [typeof Date] 
    ? Date
    : [Item] extends [typeof Boolean]
      ? boolean
      : [Item] extends [typeof String]
        ? string
        : [Item] extends [IntOrFloat]
          ? number
        //   : [Item] extends [RegisteredEnum<{[key: string]: string}>]
        // : [Item] extends [number]
        //   ? IntOrFloat | RegisteredEnum<{[key: number]: string}>
          : never

export type RuntimeArgsType<Item, B extends BooleanOrUndefined, A extends ArrayTrilean> =
  { 
    type: Item,
    nullable?: B,
    array?: A
  } 

export type ArgsTypeFromRuntime<Item, Nullability extends BooleanOrUndefined, IsArray extends ArrayTrilean> =
  GenerateReturnType<GetActualScalarType<Item>, Nullability, IsArray>

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


export type ResolverFunction<InferedArg, ReturnType> = 
  [InferedArg] extends [RuntimeArgsType<infer RuntimeType, infer Nullability, infer IsArray>]
    ? (args: GenerateReturnType<GetActualScalarType<RuntimeType>, Nullability, IsArray>) => ReturnType
    : () => ReturnType

export type ArgsAndResolvers<Type, InferedArgs> =
  {
    type: Constructor<Type>,
    runtimeArgs: InferArgsForType<Type, InferedArgs>,
    runtimeTypes: {
      [Key in keyof Type]?: 
        [Key] extends [keyof InferedArgs]
          ? ResolverFunction<InferedArgs[Key], Type[Key]>
          : () => Type[Key]
    }
  }
