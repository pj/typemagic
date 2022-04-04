import { FieldSentinel } from "./client";
import { ValidateArgs, ValidateInputRuntimeType } from "./input";
import { HandleOutputObject } from "./object";
import { ValidateResolver } from "./resolvers";
import { Constructor } from "./types";

export type ValidateFields<Fields, Root, Context> =
  {
    [Key in keyof Fields]:
      Key extends keyof Root 
        ? ValidateResolver<Fields[Key], Root, Root[Key], Context>
        : ValidateResolver<Fields[Key], Root, unknown, Context>
  }

export function argsFields<FunctionArgs extends ValidateArgs<FunctionArgs>>(args: FunctionArgs) {
  return args;
}

export type Decircularize<I> = {
  [Key in keyof I]: I
}

export function object<
  For, 
  Context = never, 
  Obj extends HandleOutputObject<Decircularize<Obj>, For, Context> = any
>(obj: Obj) {
  return obj;
}

export function input<For, Input extends ValidateInputRuntimeType<For>>(input: Input) {
  return input;
}

// export function union<>(obj: Obj) {

// }

export function fields<
  Fields extends ValidateFields<Fields, never, never>
>(fields: Fields) {
  return fields;
}

export function field<
  Fields extends ValidateResolver<Fields, unknown, unknown, unknown>
>(resolver: Fields) {
  return resolver;
}

export function withContext<Context>() {
  return ({
    fields: <Fields extends ValidateFields<Fields, unknown, Context>>(f: Fields) => f,
    field: <Field extends ValidateResolver<Field, unknown, unknown, Context>>(f: Field) => f,
    withRoot: <Root>() => ({
      fields:<Fields extends ValidateFields<Fields, Root, Context>>(f: Fields) => f,
    }),
    withRootKey: <Root, RootKey extends keyof Root>() => ({
      field: <Field extends ValidateResolver<Field, Root, RootKey, Context>>(f: Field) => f,
    }),
  })
}

export function withRoot<Root>() {
  return ({
    fields: <Fields extends ValidateFields<Fields, Root, unknown>>(f: Fields) => f,
    field: <Field extends ValidateResolver<Field, Root, unknown, unknown>>(f: Field) => f,
    withContext: <Context>() => ({
      fields:<Fields extends ValidateFields<Fields, Root, Context>>(f: Fields) => f,
      field: <Field extends ValidateResolver<Field, Root, unknown, Context>>(f: Field) => f
    }),
  })
}

export function withRootKey<Root, RootKey extends keyof Root>() {
  return ({
    field: <Field extends ValidateResolver<Field, Root, RootKey, unknown>>(f: Field) => f,
    withContext: <Context>() => ({
      field: <Field extends ValidateResolver<Field, Root, RootKey, Context>>(f: Field) => f
    }),
  })
}