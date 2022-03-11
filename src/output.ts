import { RegisteredResolver } from "./query";
import { AddNull, Constructor, IntOrFloat, RegisteredEnum, ScalarTypes } from "./types";

export type ResolverTypes<R, C, O> =
  RegisteredOutputObject<C, O>
  // | RegisteredQuery<R, C, any, O>
  | RegisteredResolver<R, C, any, O>

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

export type HandleArray<R, C, Arr> =
  Arr extends Array<infer X> 
    // ? HandleItem<X> extends never
    //   ? ResolverTypes<R, C, Array<X> | AddNull<Original>>
    //   : (
    //       Array<
    //         HandleItem<X>
    //       > | AddNull<Original>
    //     )
    //     | ResolverTypes<R, C, Array<X> | AddNull<Original>>
    ? null extends X
      ? HandleItem<X> extends never
        ? RegisteredResolver<
            R, 
            C, 
            any, 
            Arr
          > & {nullable: true, array: "nullable_items", resolve: (args: any, root: R, context: C) => Promise<Array<X | null> | null>}
          | (RegisteredOutputObject<C, Arr | null> & {nullable: true, array: false})
        : RegisteredResolver<
            R, 
            C, 
            any, 
            Arr
          > & {nullable: true, array: "nullable_items", resolve: (args: any, root: R, context: C) => Promise<HandleItem<Arr> | null>}
          | (RegisteredOutputObject<C, HandleItem<Arr> | null> & {nullable: true, array: false})
      : HandleItem<Arr> extends never
        ? RegisteredResolver<
            R, 
            C, 
            any, 
            Arr
          > & {nullable: false, array: false, resolve: (args: any, root: R, context: C) => Promise<Arr>}
          | (RegisteredOutputObject<C, Arr | null> & {nullable: false, array: false})
        : HandleItem<Arr> 
          | RegisteredResolver<
              R, 
              C, 
              any, 
              Arr
            > & {nullable: false, array: false, resolve: (args: any, root: R, context: C) => Promise<HandleItem<Arr>>}
          | (RegisteredOutputObject<C, HandleItem<Arr> | null> & {nullable: false, array: false})
    : null extends Arr
      ? HandleItem<Arr> extends never
        ? RegisteredResolver<
            R, 
            C, 
            any, 
            Arr
          > & {nullable: true, array: false, resolve: (args: any, root: R, context: C) => Promise<Arr | null>}
          | (RegisteredOutputObject<C, Arr | null> & {nullable: true, array: false})
        : RegisteredResolver<
            R, 
            C, 
            any, 
            Arr
          > & {nullable: true, array: false, resolve: (args: any, root: R, context: C) => Promise<HandleItem<Arr> | null>}
          | (RegisteredOutputObject<C, HandleItem<Arr> | null> & {nullable: true, array: false})
      : HandleItem<Arr> extends never
        ? RegisteredResolver<
            R, 
            C, 
            any, 
            Arr
          > & {nullable: false, array: false, resolve: (args: any, root: R, context: C) => Promise<Arr>}
          | (RegisteredOutputObject<C, Arr | null> & {nullable: false, array: false})
        : HandleItem<Arr> 
          | RegisteredResolver<
              R, 
              C, 
              any, 
              Arr
            > & {nullable: false, array: false, resolve: (args: any, root: R, context: C) => Promise<HandleItem<Arr>>}
          | (RegisteredOutputObject<C, HandleItem<Arr> | null> & {nullable: false, array: false})

export type OutputRuntimeTypes<R, C, Obj> = {
  // Treat a field being undefined as meaning "Not present in output".
  [FieldName in keyof Obj]?: 
    // Detect String Enums by extend string but string doesn't extend an enum
      HandleArray<R, C, Obj[FieldName]>
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
  type: Constructor<O> | ScalarTypes,
  fieldTypes: OutputRuntimeTypes<O, C, O>,
  nullable?: boolean,
  array?: boolean | "nullable_items",
};

export type RegisteredOutputObject<C, O> = OutputObject<C, O> & {registered: true};

// export class RegisteredOutputObject<C, O> {
//   name?: string;
//   source: Constructor<O>;
//   fieldTypes: OutputRuntimeTypes<O, C, O>;

//   constructor(
//     source: Constructor<O>,
//     fieldTypes: OutputRuntimeTypes<O, C, O>,
//     name?: string,
//   ) {
//     this.name = name;
//     this.source = source;
//     this.fieldTypes = fieldTypes;
//   }
// }

export function object<C, O>(object: OutputObject<C, O>): RegisteredOutputObject<C, O> {
  return {...object, registered: true};
}

export function nullable<O, C = any>(
  type: ScalarTypes | Constructor<O>
): RegisteredOutputObject<C, Constructor<O> | ScalarTypes | null> {
  return (
    {
      registered: true,
      type: type,
      fieldTypes: {},
      nullable: true
    }
  );
}
