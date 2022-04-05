import { ValidateInputRuntimeType } from "./input";
import { HandleOutputObject } from "./object";
import { ValidateResolver } from "./resolvers";

export type ValidateFields<Fields, Root, Context> =
  {
    [Key in keyof Fields]:
      Key extends keyof Root 
        ? ValidateResolver<Fields[Key], Root, Root[Key], Context>
        : ValidateResolver<Fields[Key], Root, unknown, Context>
  }

export type Decircularize<I> = {
  [Key in keyof I]: I
}

export function fields<
  Fields extends ValidateFields<Fields, unknown, unknown>
>(fields: Fields) {
  return fields;
}

export function query<
  Fields extends ValidateResolver<Fields, unknown, unknown, unknown>
>(resolver: Fields) {
  return resolver;
}

export function withContext<Context>() {
  return ({
    fields<Fields extends ValidateFields<Fields, unknown, Context>>(f: Fields) {
      return f
    },
    field<Field extends ValidateResolver<Field, unknown, unknown, Context>>(f: Field) {
      return f
    },
    withType<Type>() {
      return {
        object<Obj extends HandleOutputObject<Decircularize<Obj>, Type, Context>>(obj: Obj) {
          return obj
        },
      }
    },
    withRoot<Root>() {
      return {
        fields<Fields extends ValidateFields<Fields, Root, Context>>(f: Fields) { return f},
      }
    },
    withRootKey<Root, RootKey extends keyof Root>() {
      return {
        field<Field extends ValidateResolver<Field, Root, RootKey, Context>>(f: Field) {return f}
      }
    }
  });
}

export function typeForObject<Type>() {
  return {
    object<Obj extends HandleOutputObject<Decircularize<Obj>, Type, unknown>>(obj: Obj) {
      return obj
    },
    // input<Input extends ValidateInputRuntimeType<Type>>(input: Input) {
    //   return input;
    // }
  }
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
  })
}

export function withContextRoot<Context, Root>() {
  return ({
    fields<Fields extends ValidateFields<Fields, Root, Context>>(f: Fields) {
      return f
    },
    additionalField<Field extends ValidateResolver<Field, Root, unknown, Context>>(f: Field) {
      return f
    }
  });
}

export function fieldContextAndKey<Context, Root, RootKey extends keyof Root>() {
  return ({
    field<Field extends ValidateResolver<Field, Root, RootKey, Context>>(f: Field) {
      return f
    }
  });
}