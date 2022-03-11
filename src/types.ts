import { Float, Int } from "type-graphql";
import { InputObject, InputRuntimeTypes } from "./input";
import { Scalar } from "./scalar";

// export class Nullable<T> {
//   clazz: T
//   constructor(clazz: T) {
//     this.clazz = clazz;
//   }
// }

export type AddNull<X> = 
  null extends X ? null : never;

type IsEnum<T> = 
  T extends {[key: string]: string} 
    ? T
    : T extends {[key: number]: string} 
      ? T 
      : never;

export class RegisteredEnum<T> {
  name?: string;
  clazz: T;
  constructor(clazz: T, name?: string) {
    this.clazz = clazz;
    this.name = name;
  }
}

export function registerEnum<T>(clazz: IsEnum<T>, name?: string): RegisteredEnum<T> {
  return new RegisteredEnum(clazz, name);
}

export type ScalarTypes = 
  typeof String | (typeof Float | typeof Int) | typeof Date | typeof Boolean;


// export type NullOrNotNull<X, Y> =
//   null extends X
//     ? Nullable<Y> 
//     : Y;

export type IntOrFloat = typeof Int | typeof Float;

// export type StringOrEnum<R, C, Scalar> =
//     // This is a trick to detect whether Scalar is an enum or not, typescript enums extend string, but string doesn't 
//     // extend Scalar;
//     string extends Scalar 
//       ? NullOrNotNull<Scalar, typeof String | RegisteredResolver<R, C, Scalar>>
//       : NullOrNotNull<Scalar, RegisteredEnum<{[key: string]: string}>>

// // FIXME: The trick for string enums doesn't work for int enums, so we just have to use a union of number and enum here.
// export type NumberOrEnum<R, C, Scalar> =
//   NullOrNotNull<Scalar, IntOrFloat | RegisteredEnum<{[key: number]: string} | RegisteredResolver<R, C, Scalar>>>

export type OtherScalars<Scalar> = 
  Scalar extends Date 
    ? typeof Date
    : Scalar extends boolean 
      ? typeof Boolean
      : never;

export type Constructor<T> = Function & { prototype: T };
// export type ConstructorOrArray<T> = T extends Array<infer C> ? [Constructor<C>] : Constructor<T>;
export type ConstructorFromArray<T> = T extends Array<infer C> ? Constructor<C> : Constructor<T>;

    // ? C extends Constructor<C>
    //   ? [Constructor<C>]
    //   : [C]
    // : Constructor<T>;

export type ArrayItem<I> = I extends Array<infer T> ? T : I; 

// export function nullable<O, C = any>(
//   type: ScalarTypes | Constructor<O>
// ): RegisteredOutputObject<C, Constructor<O> | ScalarTypes | null> {
//   return (
//     {
//       registered: true,
//       type: type,
//       fieldTypes: {},
//       nullable: true
//     }
//   );
// }

export type GenerateReturnType<RT, N, A> =
  [A] extends [true]
    ? [N] extends [false | undefined]
      ? Array<RT>
      : Array<RT> | null
    : [A] extends ["nullable_items"] 
      ? [N] extends [false | undefined]
        ? Array<RT | null>
        : Array<RT | null> | null
      : [N] extends [false | undefined]
        ? RT
        : RT | null


export type ScalarOptions<N extends BooleanOrUndefined, A extends ArrayTrilean> = {
  nullable?: N, 
  array?: A
};

export type GetUnderlyingScalarType<Item> =
  [Item] extends [Date] 
    ? typeof Date
    : [Item] extends [boolean]
      ? typeof Boolean
      : [Item] extends [string]
        ? [string] extends [Item] 
          ? typeof String
          : RegisteredEnum<{[key: string]: string}>
        : [Item] extends [number]
          ? IntOrFloat | RegisteredEnum<{[key: number]: string}>
          : never

export type RegisteredObject<A> = A & {registered: true};

export function makeRegistered<A>(a: A): RegisteredObject<A> {
  return {...a, registered: true};
}

export type ArrayTrilean = boolean | "nullable_items" | undefined;
export type BooleanOrUndefined = boolean | undefined;

export type GenerateArrayTrilean<A> = 
  [Exclude<A, null | undefined>] extends [Array<infer I>] 
    ? [null] extends [I] 
      ? "nullable_items"
      : true
    : false

export type GenerateScalarReturnType<RT, O extends ScalarOptions<BooleanOrUndefined, ArrayTrilean> | undefined> =
  [O] extends [undefined]
    ? Scalar<RT, false, false>
    : Scalar<
        RT, 
        [Exclude<O, undefined>['nullable']] extends [false | undefined]
          ? false : true, 
        [Exclude<O, undefined>['array']] extends [false | undefined] 
          ? false 
          : [Exclude<O, undefined>['array']] extends ["nullable_items"]
            ? "nullable_items"
            : true
      >
  // [O] extends [undefined]
  //   ? Scalar<RT, false, false>
  //   : [Exclude<O, undefined>['nullable']] extends [false | undefined]
  //     ? [A] extends ["nullable_items"] 
  //       ? [N] extends [false | undefined]
  //         ? Scalar<RT, false, "nullable_items">
  //         : Scalar<RT, true, "nullable_items">
  //       : [N] extends [false | undefined]
  //         ? Scalar<RT, false, false>
  //         : Scalar<RT, true, false>
  //     : [N] extends [false | undefined]
  //       ? Scalar<RT, false, true>
  //       : Scalar<RT, true, true>

export function string<C, O extends ScalarOptions<BooleanOrUndefined, ArrayTrilean> | undefined>(
  options?: O
): GenerateScalarReturnType<String, O> {
  return ({
    nullable: options === undefined ? false : options.nullable === true ? true : false,
    array: options === undefined ? false: options.array === true ? true : options.array === "nullable_items" ? "nullable_items" : false,
    type: String,
  });
}

export function date<C, O extends ScalarOptions<BooleanOrUndefined, ArrayTrilean> | undefined>(
  options?: O
// ): RegisteredOutputObject<C, GenerateScalarReturnType<Date, N, A>, N, A> | RegisteredInputObject<Date, N, A> {
): GenerateScalarReturnType<Date, O> {
  return ({
    nullable: options?.nullable,
    array: options?.array,
    type: Date,
  });
}

export function int<C, N extends boolean, A extends ArrayTrilean>(
  options?: ScalarOptions<N, A>
// ): RegisteredOutputObject<C, GenerateScalarReturnType<number, N, A>, N, A> | RegisteredInputObject<number, N, A> {
): Scalar<number, N, A> {
  return ({
    nullable: options?.nullable,
    array: options?.array,
    type: Int,
  });
}

export function float<C, N extends boolean, A extends ArrayTrilean>(
  options?: ScalarOptions<N, A>
): Scalar<number, N, A> {
  return ({
    nullable: options?.nullable,
    array: options?.array,
    type: Float,
  });
}

export function boolean<C, N extends boolean, A extends ArrayTrilean>(
  options?: ScalarOptions<N, A>
): Scalar<boolean, N, A> {
  return ({
    nullable: options?.nullable,
    array: options?.array,
    type: Boolean,
  });
}

export type IsNull<O> = 
  [null] extends [O] 
    ? true : false;
export type IncludeNull<O> = [null] extends [O] ? null : never;

export type GetUnderlyingArrayType<A> =
  [Exclude<A, null | undefined>] extends [Array<infer T>] ? T : A

export type GetUnderlyingRuntimeType<Item> =
  [Exclude<Item, null | undefined>] extends [Array<infer ArrayType>] 
    ? [GetUnderlyingScalarType<Exclude<ArrayType, null | undefined>>] extends [never] 
      ? Exclude<ArrayType, null | undefined>
      : GetUnderlyingScalarType<Exclude<ArrayType, null | undefined>>
    : [GetUnderlyingScalarType<Exclude<Item, null | undefined>>] extends [never] 
      ? Exclude<Item, null | undefined>
      : GetUnderlyingScalarType<Exclude<Item, null | undefined>>

export type UnderlyingIsScalar<Item> =
  [Exclude<Item, null | undefined>] extends [Array<infer ArrayType>] 
    ? [GetUnderlyingScalarType<Exclude<ArrayType, null | undefined>>] extends [never] 
      ? false
      : true
    : [GetUnderlyingScalarType<Exclude<Item, null | undefined>>] extends [never] 
      ? false
      : true

export type ScalarOrInput<Item> = 
    [UnderlyingIsScalar<Item>] extends [true]
      ? Scalar<
          GetUnderlyingRuntimeType<Item>, 
          IsNull<Item>, 
          GenerateArrayTrilean<Item>
        > 
      : InputObject<
          GetUnderlyingRuntimeType<Item>,
          IsNull<Item>,
          GenerateArrayTrilean<Item>
        >
