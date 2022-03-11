import { Float, Int } from "type-graphql";
import { RegisteredOutputObject } from "./output";
import { RegisteredResolver } from "./query";

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

