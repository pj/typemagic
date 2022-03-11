import { StringOrEnum, NumberOrEnum, OtherScalars, NullOrNotNull, Nullable, ScalarTypes, RegisteredEnum, ConstructorFromArray, ArrayItem } from "./types";

export type InputRuntimeTypes<Obj> = {
  // Treat a field being undefined as meaning "Not present in output".
  [FieldName in keyof Obj]?: 
    // Detect String Enums by extend string but string doesn't extend an enum
    Obj[FieldName] extends string
      ? StringOrEnum<any, any, Obj[FieldName]>
      : Obj[FieldName] extends number
        ? NumberOrEnum<any, any, Obj[FieldName]>
        : OtherScalars<Obj[FieldName]> extends never 
          ? NullOrNotNull<Obj[FieldName], RegisteredInputObject<Obj[FieldName]>>
          : NullOrNotNull<Obj[FieldName], OtherScalars<Obj[FieldName]>>
} 
& 
// Arbitrary properties are allowed.
{
  [Key in string]: 
    keyof Obj extends Key
      ?  
        Nullable<ScalarTypes> 
        | ScalarTypes 
        | Nullable<RegisteredInputObject<any>> 
        | RegisteredInputObject<any>
        | RegisteredEnum<{[key: string]: string}>
        | RegisteredEnum<{[key: number]: string}>
      : never
};

export type ArgsObject<O> = {
  name?: string,
  object: ConstructorFromArray<O>,
  fieldTypes: InputRuntimeTypes<ArrayItem<O>>,
};

export class RegisteredArgsObject<O> {
  name?: string;
  object: ConstructorFromArray<O>;
  fieldTypes: InputRuntimeTypes<ArrayItem<O>>;

  constructor(
    object: ConstructorFromArray<O>, 
    fieldTypes: InputRuntimeTypes<ArrayItem<O>>,
    name?: string
  ) {
    this.name = name;
    this.object = object;
    this.fieldTypes = fieldTypes;
  }
}

export type InputObject<O> = {
  name?: string,
  object: ConstructorFromArray<O>,
  fieldTypes: InputRuntimeTypes<ArrayItem<O>>,
};

class RegisteredInputObject<O> {
  name?: string;
  object: ConstructorFromArray<O>;
  fieldTypes: InputRuntimeTypes<ArrayItem<O>>;

  constructor(
    object: ConstructorFromArray<O>, 
    fieldTypes: InputRuntimeTypes<ArrayItem<O>>,
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

export function input<I>(object: InputObject<I>): RegisteredInputObject<I> {
  const registeredObj = new RegisteredInputObject<I>(object.object, object.fieldTypes, object.name);
  registeredObj.name = object.name;
  registeredObj.object = object.object;
  registeredObj.fieldTypes = object.fieldTypes;
  return registeredObj;
}
