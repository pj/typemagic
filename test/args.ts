
import { ArgsObject } from "../src/args";
import { InputRuntimeTypes, InputObject } from "../src/input";
import { OutputRuntimeTypes } from "../src/output";
import { GetUnderlyingArrayType, boolean, date, GenerateArrayTrilean, GenerateScalarReturnType, GetUnderlyingScalarType, int, IsNull, string, GetUnderlyingRuntimeType } from "../src/types";
import { ExpandRecursively } from "./debug";
import { Args, TestInputObject } from "./test";


function testArgs<A>(object: ArgsObject<A>): void {
}

const registeredArgs = testArgs({
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
    inputObjectField: {
      type: TestInputObject,
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
    },
    nullableInputObject: {
        nullable: true,
        type: TestInputObject,
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
    }
  }
});