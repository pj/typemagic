import { Float, Int } from "type-graphql";

enum SortOrder {
  DESC = "DESC",
  ASC = "ASC"
}

export type Comparison<E> = {
  [X in keyof E]?: 
    E[X] extends string | number | Date | boolean ? 
    // { gt: E[X] } 
    // | { gte: E[X] } 
    // | { lt: E[X] } 
    // | { lte: E[X] } 
    // | { like: E[X] } 
    // | { ilike: E[X] } 
    // | { between: [E[X], E[X]]} 
    // | { in: Array<E[X]> } 
    E[X] 
    // | null 
    | { not: E[X] | null } : never
};

// export type Operation<E> =
//   // And<E> | 
//   // Or<E> | 
//   Not<E> | 
//   Comparison<E> |
//   Thing<E>;

// export type Thing<E> = 
//   [Operation<E>, Opz, Operation<E>] |
//   [Operation<E>, Opz, Operation<E>, Opz, Operation<E>] | 
//   [Operation<E>, Opz, Operation<E>, Opz, Operation<E>, Opz, Operation<E>] |
//   [Operation<E>, Opz, Operation<E>, Opz, Operation<E>, Opz, Operation<E>, Opz, Operation<E>];


export type ResolveFunction<A, O> = (args: A) => Promise<O> | O;
export type ResolveNoArgsFunction<O> = () => Promise<O> | O;

// interface Function {
//   name: string;
// }

export type ScalarRuntimeType<Scalar> = 
  Scalar extends string ? typeof String 
  : Scalar extends number ? typeof Float | typeof Int
  // : | number | 
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

export type NoProperties<Obj> = {
  [Key in keyof Obj]: undefined
}

type Exact<A, B> = A extends B
  ? B extends A
    ? A
    : never
  : never

export type NameAndResolve<A, O> = { name: string, resolve: Exact<Scalars<A>, {}> extends never ? ResolveFunction<A, O> : ResolveNoArgsFunction<O>}

export type Args<A> = {args: Scalars<A> };
export type ArgsUndefined = {args?: any };
export type Output<O> = {output: Scalars<O> };
export type OutputUndefined = {output?: any };

type Undefined<Type> = {
  [Property in keyof Type]+?: Type[Property];
};

export type Query<A, O> = 
  // NameAndResolve<A, O> 
  //   & (Exact<Scalars<A>, {}> extends never ? Args<A> : NameAndResolve<A, O>)
  //   & (Exact<Scalars<O>, {}> extends never ? Output<O> : NameAndResolve<A, O>);
  Exact<Scalars<A>, {}> extends never 
    ? Exact<Scalars<O>, {}> extends never 
      ? NameAndResolve<A, O> & Args<A> & Output<O>
      : NameAndResolve<A, O> & Args<A> & OutputUndefined
    : Exact<Scalars<O>, {}> extends never  
      ? NameAndResolve<A, O> & ArgsUndefined & Output<O> 
      : NameAndResolve<A, O> & ArgsUndefined & OutputUndefined;
// & {
//   [Key in keyof QueryObjects]
// }

// export type QueryUndefinedArgs<A, O> = {
//   [Key ]
// }

export function query<A, O>(query: Query<A, O>): void {

}


// export function query<A, O>(name: string, query: ResolveFunction<A, O>): void;
// export function query<A, O>(query: ResolveFunction<A, O>): void;
// export function query<A, O>(
//   nameOrQuery: string | ResolveFunction<A, O>, 
//   queryOrUndefined?: ResolveFunction<A, O>): void 
// {

// }