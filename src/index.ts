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

export type ObjectRuntimeType<A, O> = RegisteredOutputObject<O>;

export type Scalars<Obj> = {
  [Key in keyof Obj]: 
    ScalarRuntimeType<Obj[Key]> extends never 
      ? <A>() => ObjectRuntimeType<A, Obj[Key]> 
      : () => ScalarRuntimeType<Obj[Key]>;
};

type Exact<A, B> = A extends B
  ? B extends A
    ? A
    : never
  : never

type Constructor<T> = Function & {prototype: T};

export type NoArgsQuery<R, O> = {
  name?: string,
  resolve: (() => Promise<O>) | (() => O)
  output: RegisteredOutputObject<R, O>,
  args?: never
}

export type BothQuery<R, A, O> = {
  name?: string,
  resolve: ((args: A) => Promise<O>) | ((args: A) => O)
  output: RegisteredOutputObject<R, O>
  args: RegisteredArgsObject<A>
}

export type Query<R, A, O> = NoArgsQuery<O> | BothQuery<A, O>
export type RootQuery<A, O> = (NoArgsQuery<O> & {name: string}) | (BothQuery<A, O> & {name: string})

export function query<A, O>(query: RootQuery<A, O>): void {

}

export type ObjectResolver<R, O> = ((root: R) => Promise<O>) | ((args: R) => O);
export type OutputObject<R, O> = {
  name?: string,
  object: Constructor<O>,
  fieldTypes: Scalars<O>,
  resolve?: ObjectResolver<R, O>
};

class RegisteredOutputObject<R, O> {
  name?: string;
  object: Constructor<O>;
  fieldTypes: Scalars<O>;
  resolve?: ObjectResolver<R, O>

  constructor(
    object: Constructor<O>, 
    fieldTypes: Scalars<O>, 
    resolve?: ObjectResolver<R, O>,
    name?: string,
  ) {
    this.name = name;
    this.object = object;
    this.fieldTypes = fieldTypes;
    this.resolve = resolve;
  }
}

export function object<R, O>(object: OutputObject<R, O>): RegisteredOutputObject<R, O> {
  const registeredObj = new RegisteredOutputObject<R, O>(object.object, object.fieldTypes, object.resolve, object.name);
  return registeredObj;
}

export type ArgsObject<O> = {
  name?: string,
  object: Constructor<O>,
  fieldTypes: Scalars<O>,
};

class RegisteredArgsObject<O> {
  name?: string;
  object: Constructor<O>;
  fieldTypes: Scalars<O>;

  constructor(object: Constructor<O>, fieldTypes: Scalars<O>, name?: string) {
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
  object: Constructor<O>,
  fieldTypes: Scalars<O>,
};

class RegisteredInputObject<O> {
  name?: string;
  object: Constructor<O>;
  fieldTypes: Scalars<O>;

  constructor(object: Constructor<O>, fieldTypes: Scalars<O>, name?: string) {
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