import { Float, Int } from "type-graphql";
export declare type ResolveFunction<A, O> = (args: A) => Promise<O> | O;
declare class Nullable<T> {
    clazz: T;
    constructor(clazz: T);
}
export declare function nullable<V>(clazz: V): Nullable<V>;
declare type IsEnum<T> = T extends {
    [key: string]: string;
} ? T : T extends {
    [key: number]: string;
} ? T : never;
declare class RegisteredEnum<T> {
    name?: string;
    clazz: T;
    constructor(clazz: T, name?: string);
}
export declare function registerEnum<T>(clazz: IsEnum<T>, name?: string): RegisteredEnum<T>;
export declare type ScalarTypes = typeof String | (typeof Float | typeof Int) | typeof Date | typeof Boolean;
export declare type IntOrFloat = typeof Int | typeof Float;
export declare type StringOrEnum<Scalar> = () => string extends Scalar ? null extends Scalar ? Nullable<typeof String> : typeof String : null extends Scalar ? Nullable<RegisteredEnum<{
    [key: string]: string;
}>> : RegisteredEnum<{
    [key: string]: string;
}>;
export declare type NumberOrEnum<Scalar> = () => null extends Scalar ? Nullable<IntOrFloat | RegisteredEnum<{
    [key: number]: string;
}>> : IntOrFloat | RegisteredEnum<{
    [key: number]: string;
}>;
export declare type OtherScalars<Scalar> = Scalar extends Date ? typeof Date : Scalar extends boolean ? typeof Boolean : never;
export declare type ObjectRuntimeType<R, C, O> = RegisteredOutputObject<R, C, O>;
export declare type NullOrNotNull<X, Y> = () => null extends X ? Nullable<Y> : Y;
export declare type GetRuntimeTypes<R, C, Obj> = {
    [FieldName in keyof Obj]: Obj[FieldName] extends string ? StringOrEnum<Obj[FieldName]> : Obj[FieldName] extends number ? NumberOrEnum<Obj[FieldName]> : OtherScalars<Obj[FieldName]> extends never ? () => null extends Obj[FieldName] ? Nullable<ObjectRuntimeType<R, C, Obj[FieldName]>> : ObjectRuntimeType<R, C, Obj[FieldName]> : () => null extends Obj[FieldName] ? Nullable<OtherScalars<Obj[FieldName]>> : OtherScalars<Obj[FieldName]>;
} & {
    [Key in string]: keyof Obj extends Key ? () => Nullable<ScalarTypes> | ScalarTypes | Nullable<RegisteredOutputObject<R, C, any>> | RegisteredOutputObject<R, C, any> | RegisteredEnum<{
        [key: string]: string;
    }> | RegisteredEnum<{
        [key: number]: string;
    }> : never;
};
export declare type NoArgsQuery<R, C, O> = {
    name?: string;
    resolve: ((root?: R, context?: C) => Promise<O>) | ((root?: R, context?: C) => O);
    output: RegisteredOutputObject<R, C, O>;
    args?: never;
};
export declare type BothQuery<R, C, A, O> = {
    name?: string;
    resolve: ((args: A, root?: R, context?: C) => Promise<O>) | ((args: A, root: R, context: C) => O);
    output: RegisteredOutputObject<R, C, O>;
    args: RegisteredArgsObject<A>;
};
export declare type Query<R, A, O, C = any> = NoArgsQuery<R, C, O> | BothQuery<R, C, A, O>;
export declare type RootQuery<R, A, O, C = any> = (NoArgsQuery<R, C, O> & {
    name: string;
}) | (BothQuery<R, C, A, O> & {
    name: string;
});
declare type Constructor<T> = Function & {
    prototype: T;
};
declare type ConstructorOrArray<T> = T extends Array<infer C> ? [Constructor<C>] : Constructor<T>;
declare type ArrayItem<I> = I extends Array<infer T> ? T : I;
export declare type ObjectResolver<R, C, O> = ((root: R, context?: C) => Promise<O>) | ((root: R, context?: C) => O);
export declare type OutputObject<R, C, O> = {
    name?: string;
    object: ConstructorOrArray<O>;
    fieldTypes: GetRuntimeTypes<O, C, ArrayItem<O>>;
    nullable?: boolean;
    resolve?: ObjectResolver<R, C, O>;
};
declare class RegisteredOutputObject<R, C, O> {
    name?: string;
    object: ConstructorOrArray<O>;
    nullable?: boolean;
    fieldTypes: GetRuntimeTypes<O, C, ArrayItem<O>>;
    resolve?: ObjectResolver<R, C, O>;
    constructor(object: ConstructorOrArray<O>, fieldTypes: GetRuntimeTypes<O, C, ArrayItem<O>>, resolve?: ObjectResolver<R, C, O>, name?: string, nullable?: boolean);
}
export declare type ArgsObject<O> = {
    name?: string;
    object: ConstructorOrArray<O>;
    fieldTypes: GetRuntimeTypes<unknown, unknown, ArrayItem<O>>;
};
declare class RegisteredArgsObject<O> {
    name?: string;
    object: ConstructorOrArray<O>;
    fieldTypes: GetRuntimeTypes<unknown, unknown, ArrayItem<O>>;
    constructor(object: ConstructorOrArray<O>, fieldTypes: GetRuntimeTypes<unknown, unknown, ArrayItem<O>>, name?: string);
}
export declare type InputObject<O> = {
    name?: string;
    object: ConstructorOrArray<O>;
    fieldTypes: GetRuntimeTypes<unknown, unknown, ArrayItem<O>>;
};
declare class RegisteredInputObject<O> {
    name?: string;
    object: ConstructorOrArray<O>;
    fieldTypes: GetRuntimeTypes<unknown, unknown, ArrayItem<O>>;
    constructor(object: ConstructorOrArray<O>, fieldTypes: GetRuntimeTypes<unknown, unknown, ArrayItem<O>>, name?: string);
}
export declare function object<R, C, O>(object: OutputObject<R, C, O>): RegisteredOutputObject<R, C, O>;
export declare function args<A>(object: ArgsObject<A>): RegisteredArgsObject<A>;
export declare function input<A>(object: InputObject<A>): RegisteredInputObject<A>;
export declare function query<R, A, O, C = any>(query: RootQuery<R, A, O, C>): void;
export {};
