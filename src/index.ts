import { Float, Int } from "type-graphql";

enum SortOrder {
  DESC = "DESC",
  ASC = "ASC"
}

export type ResolveFunction<A, O> = (args: A) => Promise<O> | O;

export type ScalarRuntimeType<Scalar> = 
  Scalar extends string ? typeof String 
  : Scalar extends number ? typeof Float | typeof Int
  : Scalar extends Date ? typeof Date 
  : Scalar extends boolean ? typeof Boolean 
  : never;

export type ObjectRuntimeType<R, C, O> = RegisteredOutputObject<R, C, O>;

export type GetRuntimeTypes<R, C, Obj> = {
  [Key in keyof Obj]: 
    ScalarRuntimeType<Obj[Key]> extends never 
      ? () => ObjectRuntimeType<R, C, Obj[Key]> 
      : () => ScalarRuntimeType<Obj[Key]>;
};

type Exact<A, B> = A extends B
  ? B extends A
    ? A
    : never
  : never


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

export function query<R, A, O, C = any>(query: RootQuery<R, A, O, C>): void {

}

type Constructor<T> = Function & {prototype: T};
type ConstructorOrArray<T> = T extends Array<infer C> ? [Constructor<C>] : Constructor<T>;

type ArrayItem<I> = I extends Array<infer T> ? T : I; 

export type ObjectResolver<R, C, O> = ((root: R, context?: C) => Promise<O>) | ((root: R, context?: C) => O);

export type OutputObject<R, C, O> = {
  name?: string,
  object: ConstructorOrArray<O>,
  fieldTypes: GetRuntimeTypes<O, C, ArrayItem<O>>,
  resolve?: ObjectResolver<R, C, O>
};

class RegisteredOutputObject<R, C, O> {
  name?: string;
  object: ConstructorOrArray<O>;
  fieldTypes: GetRuntimeTypes<O, C, ArrayItem<O>>;
  resolve?: ObjectResolver<R, C, O>

  constructor(
    object: ConstructorOrArray<O>, 
    fieldTypes: GetRuntimeTypes<O, C, ArrayItem<O>>,
    resolve?: ObjectResolver<R, C, O>,
    name?: string,
  ) {
    this.name = name;
    this.object = object;
    this.fieldTypes = fieldTypes;
    this.resolve = resolve;
  }
}

export function object<R, C, O>(object: OutputObject<R, C, O>): RegisteredOutputObject<R, C, O> {
  const registeredObj = new RegisteredOutputObject<R, C, O>(object.object, object.fieldTypes, object.resolve, object.name);
  return registeredObj;
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

export function args<A>(object: ArgsObject<A>): RegisteredArgsObject<A> {
  const registeredObj = new RegisteredArgsObject<A>(object.object, object.fieldTypes, object.name);
  registeredObj.name = object.name;
  registeredObj.object = object.object;
  registeredObj.fieldTypes = object.fieldTypes;
  return registeredObj;
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

export function input<A>(object: InputObject<A>): RegisteredInputObject<A> {
  const registeredObj = new RegisteredInputObject<A>(object.object, object.fieldTypes, object.name);
  registeredObj.name = object.name;
  registeredObj.object = object.object;
  registeredObj.fieldTypes = object.fieldTypes;
  return registeredObj;
}