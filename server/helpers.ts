import { HandleOutputObject } from "./object.js";
import { ValidateAdditionalResolver, ValidateResolver } from "./resolvers.js";
import { Constructor } from "./types.js";

export type ValidateFields<Fields, Root, Context> =
  {
    [Key in keyof Fields]:
      Key extends keyof Root 
        ? ValidateResolver<Fields[Key], Root, Root[Key], Context>
        : ValidateAdditionalResolver<Fields[Key], Root, Context>
  }

export type Decircularize<I> = {
  [Key in keyof I]: I[Key]
}

export type ValidateField<Field, Root, RootKey, Context> = 
  [unknown] extends [Root]
    ? ValidateAdditionalResolver<Field, unknown, Context>
    : [RootKey] extends [keyof Root] 
      ? ValidateResolver<Field, Root, RootKey, Context>
      : ValidateAdditionalResolver<Field, Root, Context>

export function field<
  Root,
  Context,
  RootKey extends keyof Root,
  Field extends ValidateField<Decircularize<Field>, Root, RootKey, Context>
>(
  field: Field, 
  options?: {
    root?: Root | Constructor<Root>, 
    rootKey?: RootKey,
    context?: Context | Constructor<Context>
  }
) {
  return field;
}

export function fields<
  Root,
  Context,
  Fields extends ValidateFields<Fields, Root, Context>
>(
  fields: Fields, 
  root: Root | Constructor<Root>, 
  context?: Context | Constructor<Context>
) {
  return fields;
}

export const query = fields;

export function object<
  ReturnType, 
  Context, 
  Obj extends HandleOutputObject<
    Decircularize<Obj>, 
    ReturnType, 
    Context
  >
>(
  obj: Obj,
  returnType: ReturnType | Constructor<ReturnType>, 
  context?: Context | Constructor<Context>
) {
  return obj
}
