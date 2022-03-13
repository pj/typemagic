import { Float, Int } from "type-graphql";
import { InputRuntimeTypes } from "./input";

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

export type IsCompileTimeScalarType<Type> = 
  [GetUnderlyingArrayType<Type>] extends [string | number | Date | boolean]
    ? true
    : false

export type IntOrFloat = typeof Int | typeof Float;

export type Constructor<T> = Function & { prototype: T };
export type ConstructorFromArray<T> = T extends Array<infer C> ? Constructor<C> : Constructor<T>;

export type GetIfArray<I> = I extends Array<infer T> ? T : I; 

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

export type GetRuntimeScalarType<Scalar> =
  [GetUnderlyingArrayType<Scalar>] extends [infer Item]
    ? [Item] extends [Date] 
      ? typeof Date
      : [Item] extends [boolean]
        ? typeof Boolean
        : [Item] extends [string]
          ? [string] extends [Item] 
            ? typeof String
            : RegisteredEnum<{[key: string]: string}>
          : [Item] extends [number]
            ? IntOrFloat | RegisteredEnum<{[key: number]: string}>
            : "Scalar Type not found"
    : "Should not happen"

export type ArrayTrilean = boolean | "nullable_items" | undefined;
export type BooleanOrUndefined = boolean | undefined;

export type GenerateArrayTrilean<A> = 
  [Exclude<A, null | undefined>] extends [Array<infer I>] 
    ? [null] extends [I] 
      ? "nullable_items"
      : true
    : false

export type IsNull<O> = 
  [null] extends [O] 
    ? true : false;
export type IncludeNull<O> = [null] extends [O] ? null : never;

export type GetUnderlyingArrayType<A> =
  [Exclude<A, null | undefined>] extends [Array<infer T>] ? Exclude<T, null | undefined> : Exclude<A, null | undefined>

export type GetUnderlyingRuntimeType<Item> =
  [Exclude<Item, null | undefined>] extends [Array<infer ArrayType>] 
    ? [GetRuntimeScalarType<Exclude<ArrayType, null | undefined>>] extends ["Scalar Type not found"] 
      ? Constructor<Exclude<ArrayType, null | undefined>>
      : GetRuntimeScalarType<Exclude<ArrayType, null | undefined>>
    : [GetRuntimeScalarType<Exclude<Item, null | undefined>>] extends ["Scalar Type not found"] 
      ? Constructor<Exclude<Item, null | undefined>>
      : GetRuntimeScalarType<Exclude<Item, null | undefined>>

export type UnderlyingIsScalar<Item> =
  [Exclude<Item, null | undefined>] extends [Array<infer ArrayType>] 
    ? [GetRuntimeScalarType<Exclude<ArrayType, null | undefined>>] extends [never] 
      ? false
      : true
    : [GetRuntimeScalarType<Exclude<Item, null | undefined>>] extends [never] 
      ? false
      : true

export type typeIsScalar<Item> =
  [Exclude<Item, null | undefined>] extends [Array<infer ArrayType>] 
    ? [GetRuntimeScalarType<Exclude<ArrayType, null | undefined>>] extends [never] 
      ? false
      : true
    : [GetRuntimeScalarType<Exclude<Item, null | undefined>>] extends [never] 
      ? false
      : true

export type GenerateOptions<Item> = 
  (
      [IsNull<Item>] extends [true]
        ? { nullable: true }
        : { nullable?: false }
    )
  & (
    [GenerateArrayTrilean<Item>] extends [false]
      ? { array?: false }
      : [GenerateArrayTrilean<Item>] extends ["nullable_items"]
        ? {array: "nullable_items"}
        : {array: true}
  )
