import { RegisteredQuery, RegisteredResolver } from "./query";
import { StringOrEnum, NumberOrEnum, OtherScalars, NullOrNotNull, Nullable, ScalarTypes, RegisteredEnum, ConstructorFromArray, ArrayItem } from "./types";

export type OutputRuntimeTypes<R, C, Obj> = {
  // Treat a field being undefined as meaning "Not present in output".
  [FieldName in keyof Obj]?: 
    // Detect String Enums by extend string but string doesn't extend an enum
    Obj[FieldName] extends string
      ? StringOrEnum<R, C, Obj[FieldName]>
      : Obj[FieldName] extends number
        ? NumberOrEnum<R, C, Obj[FieldName]>
        : OtherScalars<Obj[FieldName]> extends never 
          ? NullOrNotNull<Obj[FieldName], RegisteredOutputObject<C, Obj[FieldName]>> 
            | NullOrNotNull<Obj[FieldName], RegisteredQuery<R, C, any, Obj[FieldName]>> 
            | NullOrNotNull<Obj[FieldName], RegisteredResolver<R, C, Obj[FieldName]>>
          : NullOrNotNull<
              Obj[FieldName], 
              OtherScalars<Obj[FieldName]> 
            > 
            | NullOrNotNull<Obj[FieldName], RegisteredResolver<R, C, Obj[FieldName]>>
} 
// & 
// // Arbitrary properties are allowed.
// {
//   [Key in string]: 
//     keyof Obj extends Key
//       ? () => 
//         Nullable<ScalarTypes> 
//         | ScalarTypes 
//         | Nullable<RegisteredOutputObject<C, any>> 
//         | RegisteredOutputObject<C, any>
//         | RegisteredEnum<{[key: string]: string}>
//         | RegisteredEnum<{[key: number]: string}>
//         | RegisteredQuery<R, C, any, any>
//         | RegisteredResolver<R, C, any>
//       : never
// };



export function array() {

}


export type OutputObject<C, O> = {
  name?: string,
  source: ConstructorFromArray<O>,
  fieldTypes: OutputRuntimeTypes<O, C, ArrayItem<O>>,
};

export class RegisteredOutputObject<C, O> {
  name?: string;
  source: ConstructorFromArray<O>;
  fieldTypes: OutputRuntimeTypes<O, C, ArrayItem<O>>;

  constructor(
    source: ConstructorFromArray<O>, 
    fieldTypes: OutputRuntimeTypes<O, C, ArrayItem<O>>,
    name?: string,
  ) {
    this.name = name;
    this.source = source;
    this.fieldTypes = fieldTypes;
  }
}

export function object<C, O>(object: OutputObject<C, O>): RegisteredOutputObject<C, O> {
  const registeredObj = new RegisteredOutputObject(object.source, object.fieldTypes, object.name);
  return registeredObj;
}
