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

export type IsCompileTimeScalar<Type> = 
  [GetUnderlyingType<Type>] extends [string | number | Date | boolean]
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
  [GetUnderlyingType<Scalar>] extends [infer Item]
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

export type GetUnderlyingType<A> =
  [Exclude<A, null | undefined>] extends [Array<infer T>] ? Exclude<T, null | undefined> : Exclude<A, null | undefined>

export type GetRuntimeType<Item> =
  [GetUnderlyingType<Item>] extends [infer Type]
    ? [GetRuntimeScalarType<Type>] extends ["Scalar Type not found"]
      ? Constructor<Type>
      : GetRuntimeScalarType<Type> 
    : "Should not happen"

export type IsRuntimeScalar<Item> =
  [GetUnderlyingType<Item>] extends [infer Type]
    ? [GetRuntimeScalarType<Type>] extends ["Scalar Type not found"]
      ? false
      : true
    : "Should not happen"

export type GenerateNullabilityAndArrayRuntimeOptions<Item> = 
  (
      [null] extends [Item]
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

export type GenerateArrayTrilean<A> = 
  [Exclude<A, null | undefined>] extends [Array<infer I>] 
    ? [null] extends [I] 
      ? "nullable_items"
      : true
    : false
