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

export type ObjectRuntimeType<A, O> = Query<A, O>;

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

export type NoArgsQuery<O> = {
  name?: string,
  resolve: (() => Promise<O>) | (() => O)
  output: Scalars<O>,
  args?: never
}

export type BothQuery<A, O> = {
  name?: string,
  resolve: ((args: A) => Promise<O>) | ((args: A) => O)
  output: Scalars<O>
  args: Scalars<A>
}

export type Query<A, O> = NoArgsQuery<O> | BothQuery<A, O>
export type RootQuery<A, O> = (NoArgsQuery<O> & {name: string}) | (BothQuery<A, O> & {name: string})

export function query<A, O>(query: RootQuery<A, O>): void {

}

export type MagicObject<O> = {
  name?: string,
  object: O,
  fieldTypes: Scalars<O>,
};

export function object<O>(object: MagicObject<O>): O {
  return object.object;
}