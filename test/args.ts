
import {args} from "../src/args";
import { input, InputRuntimeTypes, RegisteredInputObject } from "../src/input";
import { OutputRuntimeTypes } from "../src/output";
import { ArrayType, boolean, date, GenerateArrayTrilean, GenerateScalarReturnType, HandleItem, int, IsNull, string } from "../src/types";
import { ExpandRecursively } from "./debug";
import { Args, InputObject } from "./test";

type RT = GenerateScalarReturnType<Date, true, false>
type RT2 = GenerateScalarReturnType<Date, true, true>
type RT3 = GenerateScalarReturnType<Date, false, true>
type RT4 = GenerateScalarReturnType<Date, false, false>
type RT5 = GenerateScalarReturnType<Date, true, "nullable_items">
type RT6 = GenerateScalarReturnType<Date, false, "nullable_items">

const D = date();
type TD = typeof D

// type DateType = {dateField: Date | null}
// type Y = InputRuntimeTypes<DateType>
// type Z = OutputRuntimeTypes<any, any, DateType>

type StringArrayOrNull = string[] | null | undefined;
type X = [Exclude<StringArrayOrNull, null | undefined>] extends [Array<infer X>] ? (null extends X ? "nullable_items" : true) : false

type GAT = GenerateArrayTrilean<StringArrayOrNull>
type GATS = GenerateArrayTrilean<(string | null)[]>

type StringType = {stringField: StringArrayOrNull};

type RIO = RegisteredInputObject<
      [HandleItem<ArrayType<StringArrayOrNull>>] extends [never] ? ArrayType<StringArrayOrNull> : HandleItem<ArrayType<StringArrayOrNull>>, 
      IsNull<StringArrayOrNull>, 
      // StringArrayOrNull extends Array<infer X> ? (null extends X ? "nullable_items" : true) : false,
      GenerateArrayTrilean<StringArrayOrNull>
    >

type ERIO = ExpandRecursively<RIO>
type IRTS = InputRuntimeTypes<StringType>
type ORTS = OutputRuntimeTypes<any, any, StringType>
type A = IRTS extends ORTS ? "yes" : "no"
// type B = OutputRuntimeTypes<any, any, DateType> extends InputRuntimeTypes<DateType> ? "yes" : "no"

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
    nullableItemsField: string({array: "nullable_items"}),
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
        nullableItemsField: string({array: "nullable_items"}),
      }
    }),
    nullableInputObject: input({
        nullable: true,
        type: InputObject,
        runtimeTypes: {
          stringField: string(),
          booleanField: boolean(),
          dateField: date(),
          numberField: int(),
          nullableField: string({nullable: true}),
          arrayField: string({array: true}),
          nullableArrayField: string({nullable: true, array: true}),
          nullableItemsField: string({array: "nullable_items"}),
        }
    })
  }
})