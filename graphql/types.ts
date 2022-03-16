export type IsEnum<T> = 
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

export enum ScalarTypes {
  STRING,
  FLOAT,
  DATE,
  INT,
  BOOLEAN
}

export type IsCompileTimeScalar<Type> = 
  [GetUnderlyingType<Type>] extends [string | number | Date | boolean]
    ? true
    : false

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
      ? ScalarTypes.DATE
      : [Item] extends [boolean]
        ? ScalarTypes.BOOLEAN
        : [Item] extends [string]
          ? [string] extends [Item] 
            ? ScalarTypes.STRING
            : RegisteredEnum<{[key: string]: string}>
          : [Item] extends [number]
            ? ScalarTypes.FLOAT | ScalarTypes.INT | RegisteredEnum<{[key: number]: string}>
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
  [Item] extends [unknown]
    ? [unknown] extends [Item]
      ? {nullable?: unknown, array?: unknown}
      : 
        (
          [null] extends [Item]
            ? { nullable: true }
            : { nullable?: false }
        )
        & 
        (
          [GenerateArrayTrilean<Item>] extends [false]
            ? { array?: false }
            : [GenerateArrayTrilean<Item>] extends ["nullable_items"]
              ? {array: "nullable_items"}
              : {array: true}
        )
    : "asdf"

export type GenerateArrayTrilean<A> = 
  [Exclude<A, null | undefined>] extends [Array<infer I>] 
    ? [null] extends [I] 
      ? "nullable_items"
      : true
    : false

export type IsNonNullCompileTimeScalar<Scalar> =
  [null] extends [Scalar]
    ? false
    : [Scalar] extends [Array<infer X>]
      ? false
      : [IsCompileTimeScalar<Scalar>] extends [true]
        ? true
        : false

export type CompileTimeTypeFromConstructor<T> = [GetUnderlyingType<T>] extends [{ prototype: infer X }] ? X : never;

export type Exact<A, B> =
  [A] extends [B]
    ? [B] extends [A]
      ? true
      : false
    : false
