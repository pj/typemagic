import { Float, Int } from "type-graphql";
import { RegisteredResolver } from "./query";
import { AddNull, ArrayTrilean, ArrayType, BooleanWithUndefined, Constructor, GenerateArrayTrilean, GenerateScalarReturnType, HandleItem, IntOrFloat, IsNull, RegisteredEnum, ScalarTypes } from "./types";

export type OutputRuntimeTypes<R, C, Obj> = {
  [FieldName in keyof Obj]?: 
      (
        RegisteredResolver<
          R, 
          C, 
          any, 
          HandleItem<ArrayType<Obj[FieldName]>> extends never ? ArrayType<Obj[FieldName]> : HandleItem<ArrayType<Obj[FieldName]>>, 
          IsNull<Obj[FieldName]>, 
          GenerateArrayTrilean<Obj[FieldName]>
        > & {
            resolve: (args: any, root: R, context: C) => Promise<GenerateScalarReturnType<ArrayType<Obj[FieldName]>, IsNull<Obj[FieldName]>, GenerateArrayTrilean<Obj[FieldName]>>>
          }
      ) | (
        RegisteredOutputObject<
          C, 
          HandleItem<ArrayType<Obj[FieldName]>> extends never ? ArrayType<Obj[FieldName]> : HandleItem<ArrayType<Obj[FieldName]>>, 
          IsNull<Obj[FieldName]>, 
          GenerateArrayTrilean<Obj[FieldName]>
        >
      )
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

export type OutputObject<C, O, N extends BooleanWithUndefined, A extends ArrayTrilean> = {
  name?: string,
  type: Constructor<O> | ScalarTypes,
  runtimeTypes: OutputRuntimeTypes<O, C, O>,
  nullable?: N,
  array?: A,
};

export type RegisteredOutputObject<C, O, N extends BooleanWithUndefined, A extends ArrayTrilean> = 
  OutputObject<C, O, N, A> & {registered: true};

export function object<C, O, N extends BooleanWithUndefined, A extends ArrayTrilean>(
  object: OutputObject<C, O, N, A>
): RegisteredOutputObject<C, O, N, A> {
  return {...object, registered: true};
}