import { Float, Int } from "type-graphql";

class Nullable<T> {
  clazz: T
  constructor(clazz: T) {
    this.clazz = clazz;
  }
}

export function nullable<V>(clazz: V): Nullable<V> {
  return new Nullable(clazz);
}


type IsEnum<T> = 
  T extends {[key: string]: string} 
    ? T
    : T extends {[key: number]: string} 
      ? T 
      : never;

class RegisteredEnum<T> {
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


export type NullOrNotNull<X, Y> =
  () => null extends X
    ? Nullable<Y> 
    : Y;

export type IntOrFloat = typeof Int | typeof Float;

export type StringOrEnum<Scalar> =
    // This is a trick to detect whether Scalar is an enum or not, typescript enums extend string, but string doesn't 
    // extend Scalar;
    string extends Scalar 
      ? NullOrNotNull<Scalar, typeof String>
      : NullOrNotNull<Scalar, RegisteredEnum<{[key: string]: string}>>

// FIXME: The trick for string enums doesn't work for int enums, so we just have to use a union of number and enum here.
export type NumberOrEnum<Scalar> =
  NullOrNotNull<Scalar, IntOrFloat | RegisteredEnum<{[key: number]: string}>>

export type OtherScalars<Scalar> = 
  Scalar extends Date 
    ? typeof Date
    : Scalar extends boolean 
      ? typeof Boolean
      : never;

// export type ObjectRuntimeType<R, C, O> = RegisteredOutputObject<R, C, O>;

export type GetRuntimeTypes<R, C, Obj> = {
  [FieldName in keyof Obj]: 
    // Detect String Enums by extend string but string doesn't extend an enum
    Obj[FieldName] extends string
      ? StringOrEnum<Obj[FieldName]>
      : Obj[FieldName] extends number
        ? NumberOrEnum<Obj[FieldName]>
        : OtherScalars<Obj[FieldName]> extends never 
          ? NullOrNotNull<Obj[FieldName], RegisteredOutputObject<R, C, Obj[FieldName]>>
          : NullOrNotNull<Obj[FieldName], OtherScalars<Obj[FieldName]>>
} & {
  [Key in string]: 
    keyof Obj extends Key
      ? () => 
        Nullable<ScalarTypes> 
        | ScalarTypes 
        | Nullable<RegisteredOutputObject<R, C, any>> 
        | RegisteredOutputObject<R, C, any>
        | RegisteredEnum<{[key: string]: string}>
        | RegisteredEnum<{[key: number]: string}>
      : never
};

export type NoArgsQuery<R, C, O> = {
  name?: string,
  resolve: ((root?: R, context?: C) => Promise<O>) | ((root?: R, context?: C) => O)
  output: RegisteredOutputObject<R, C, O>,
  args?: never
}

export type BothQuery<R, C, A, O> = {
  name?: string,
  resolve: ((args: A, root?: R, context?: C) => Promise<O>) | ((args: A, root: R, context: C) => O)
  output: RegisteredOutputObject<R, C, O>
  args: RegisteredArgsObject<A>
}

export type Query<R, A, O, C = any> = NoArgsQuery<R, C, O> | BothQuery<R, C, A, O>
export type RootQuery<R, A, O, C = any> = (NoArgsQuery<R, C, O> & {name: string}) | (BothQuery<R, C, A, O> & {name: string})

type Constructor<T> = Function & {prototype: T};
type ConstructorOrArray<T> = T extends Array<infer C> ? [Constructor<C>] : Constructor<T>;

type ArrayItem<I> = I extends Array<infer T> ? T : I; 

export type ObjectResolver<R, C, O> = ((root: R, context?: C) => Promise<O>) | ((root: R, context?: C) => O);

export type OutputObject<R, C, O> = {
  name?: string,
  object: ConstructorOrArray<O>,
  fieldTypes: GetRuntimeTypes<O, C, ArrayItem<O>>,
  nullable?: boolean,
  resolve?: ObjectResolver<R, C, O>
};

class RegisteredOutputObject<R, C, O> {
  name?: string;
  object: ConstructorOrArray<O>;
  nullable?: boolean;
  fieldTypes: GetRuntimeTypes<O, C, ArrayItem<O>>;
  resolve?: ObjectResolver<R, C, O>

  constructor(
    object: ConstructorOrArray<O>, 
    fieldTypes: GetRuntimeTypes<O, C, ArrayItem<O>>,
    resolve?: ObjectResolver<R, C, O>,
    name?: string,
    nullable?: boolean
  ) {
    this.name = name;
    this.object = object;
    this.fieldTypes = fieldTypes;
    this.resolve = resolve;
    this.nullable = nullable;
  }
}

export type ArgsObject<O> = {
  name?: string,
  object: ConstructorOrArray<O>,
  fieldTypes: GetRuntimeTypes<unknown, unknown, ArrayItem<O>>,
};

class RegisteredArgsObject<O> {
  name?: string;
  object: ConstructorOrArray<O>;
  fieldTypes: GetRuntimeTypes<unknown, unknown, ArrayItem<O>>;

  constructor(
    object: ConstructorOrArray<O>, 
    fieldTypes: GetRuntimeTypes<unknown, unknown, ArrayItem<O>>,
    name?: string
  ) {
    this.name = name;
    this.object = object;
    this.fieldTypes = fieldTypes;
  }
}

export type InputObject<O> = {
  name?: string,
  object: ConstructorOrArray<O>,
  fieldTypes: GetRuntimeTypes<unknown, unknown, ArrayItem<O>>,
};

class RegisteredInputObject<O> {
  name?: string;
  object: ConstructorOrArray<O>;
  fieldTypes: GetRuntimeTypes<unknown, unknown, ArrayItem<O>>;

  constructor(
    object: ConstructorOrArray<O>, 
    fieldTypes: GetRuntimeTypes<unknown, unknown, ArrayItem<O>>,
    name?: string
  ) {
    this.name = name;
    this.object = object;
    this.fieldTypes = fieldTypes;
  }
}

export function object<R, C, O>(object: OutputObject<R, C, O>): RegisteredOutputObject<R, C, O> {
  const registeredObj = new RegisteredOutputObject<R, C, O>(object.object, object.fieldTypes, object.resolve, object.name);
  return registeredObj;
}

export function args<A>(object: ArgsObject<A>): RegisteredArgsObject<A> {
  const registeredObj = new RegisteredArgsObject<A>(object.object, object.fieldTypes, object.name);
  registeredObj.name = object.name;
  registeredObj.object = object.object;
  registeredObj.fieldTypes = object.fieldTypes;
  return registeredObj;
}

export function input<A>(object: InputObject<A>): RegisteredInputObject<A> {
  const registeredObj = new RegisteredInputObject<A>(object.object, object.fieldTypes, object.name);
  registeredObj.name = object.name;
  registeredObj.object = object.object;
  registeredObj.fieldTypes = object.fieldTypes;
  return registeredObj;
}

export function query<R, A, O, C = any>(query: RootQuery<R, A, O, C>): void {

}
