
import {args} from "../src/args";
import { input, InputRuntimeTypes } from "../src/input";
import { OutputRuntimeTypes } from "../src/output";
import { boolean, date, GenerateScalarReturnType, int, string } from "../src/types";
import { Args, InputObject } from "./test";

type RT = GenerateScalarReturnType<Date, true, false>
type RT2 = GenerateScalarReturnType<Date, true, true>
type RT3 = GenerateScalarReturnType<Date, false, true>
type RT4 = GenerateScalarReturnType<Date, false, false>
type RT5 = GenerateScalarReturnType<Date, true, "nullable_items">
type RT6 = GenerateScalarReturnType<Date, false, "nullable_items">

const D = date();
type X = typeof D

type DateType = {dateField: Date | null}
type Y = InputRuntimeTypes<DateType>
type Z = OutputRuntimeTypes<any, any, DateType>

type StringType = {stringField: string};
type A = InputRuntimeTypes<DateType> extends OutputRuntimeTypes<any, any, DateType> ? "yes" : "no"
type B = OutputRuntimeTypes<any, any, DateType> extends InputRuntimeTypes<DateType> ? "yes" : "no"

const registeredArgs = args({
  type: Args,
  runtimeTypes: {
    stringField: string(),
    booleanField: boolean(),
    dateField: date(),
    numberField: int(),
    nullableField: string({nullable: true}),
    arrayField: string({array: true}),
    nullableArrayField: string({nullable: true, array: true}),
    nullableItemsField: string({array: "nullable_items"},
    inputObjectField: input({
      type: InputObject,
      runtimeTypes: {
      stringField: string(),
      booleanField: boolean(),
      dateField: date(),
      numberField: int(),
      nullableField: string({nullable: true}),
      arrayField: string({array: true}),
      nullableArrayField: string({nullable: true, array: true}),
      nullableItemsField: string({array: "nullable_items"},

      }
    }),
    nullableInputObject: input({
        nullable: true
        type: InputObject,
        runtimeTypes: {
        stringField: string(),
        booleanField: boolean(),
        dateField: date(),
        numberField: int(),
        nullableField: string({nullable: true}),
        arrayField: string({array: true}),
        nullableArrayField: string({nullable: true, array: true}),
        nullableItemsField: string({array: "nullable_items"},
      }
    })
  }
})