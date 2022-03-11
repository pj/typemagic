import { RegisteredQuery, RegisteredResolver } from "./query";
import { ArrayItem, Constructor, IntOrFloat, NullOrNotNull, RegisteredEnum } from "./types";

export type ResolverTypes<R, C, O> =
  RegisteredOutputObject<C, O>
  | RegisteredQuery<R, C, any, O>
  | RegisteredResolver<R, C, O>

export type HandleItem<Item> =
  Item extends Date 
    ? typeof Date
    : Item extends boolean 
      ? typeof Boolean
      : Item extends string
        ? string extends Item 
          ? typeof String
          : RegisteredEnum<{[key: string]: string}>
        : Item extends number
          ? IntOrFloat | RegisteredEnum<{[key: number]: string}>
          : never

export type HandleArray<R, C, Arr, Orginal> =
  Arr extends Array<infer X> 
    ? HandleItem<X> extends never
      ? ResolverTypes<R, C, X>
      : Array<
          NullOrNotNull<
            X, 
            HandleItem<Exclude<X, null>>
          >
        > | ResolverTypes<R, C, X | (null extends Orginal ? null : never)>
    : HandleItem<Arr> | ResolverTypes<R, C, Arr | (null extends Orginal ? null : never)>

export type OutputRuntimeTypes<R, C, Obj> = {
  // Treat a field being undefined as meaning "Not present in output".
  [FieldName in keyof Obj]?: 
    // Detect String Enums by extend string but string doesn't extend an enum
    NullOrNotNull<
      Obj[FieldName], 
      HandleArray<R, C, Exclude<Obj[FieldName], null>, Obj[FieldName]>
    >
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

export type OutputObject<C, O> = {
  name?: string,
  source: Constructor<O>,
  fieldTypes: OutputRuntimeTypes<O, C, O>,
};

export class RegisteredOutputObject<C, O> {
  name?: string;
  source: Constructor<O>;
  fieldTypes: OutputRuntimeTypes<O, C, O>;

  constructor(
    source: Constructor<O>,
    fieldTypes: OutputRuntimeTypes<O, C, O>,
    name?: string,
  ) {
    this.name = name;
    this.source = source;
    this.fieldTypes = fieldTypes;
  }
}

export function object<C, O>(object: OutputObject<C, O>): RegisteredOutputObject<C, O> {
  return new RegisteredOutputObject(object.source, object.fieldTypes, object.name);
}