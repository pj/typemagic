
import { ArgsObject, ArgsRuntimeSchema } from "../src/args";
import { boolean, date, int, string } from "../src/types";
import { Args, TestInputObject } from "./test";


function testArgs<A>(object: ArgsObject<A>): ArgsObject<A> {
  return object
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

type ARS = ArgsRuntimeSchema<typeof Args>

type RAT = typeof registeredArgs;
type RATT = RAT["runtimeTypes"]