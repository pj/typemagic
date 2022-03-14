import { Int } from "type-graphql";
import { ArgsSchema } from "../src/input";
import { ScalarTypes } from "../src/types";
import { Args, TestInputObject } from "./test";


function testArgs<A>(object: ArgsSchema<A>): ArgsSchema<A> {
  return object
}

export const registeredArgs = {
  type: Args,
  runtimeTypes: {
    stringField: ScalarTypes.STRING,
    booleanField: { type: ScalarTypes.BOOLEAN },
    dateField: { type: ScalarTypes.DATE },
    numberField: { type: ScalarTypes.INT },
    nullableField: { type: ScalarTypes.STRING, nullable: true },
    arrayField: { type: ScalarTypes.STRING, array: true },
    nullableArrayField: { type: ScalarTypes.STRING, nullable: true, array: true },
    nullableItemsField: { type: ScalarTypes.STRING, array: "nullable_items" },
    inputObjectField: {
      type: TestInputObject,
      runtimeTypes: {
        stringField: { type: ScalarTypes.STRING },
        booleanField: { type: ScalarTypes.BOOLEAN },
        dateField: { type: ScalarTypes.DATE },
        numberField: { type: ScalarTypes.INT },
        nullableField: { type: ScalarTypes.STRING, nullable: true },
        arrayField: { type: ScalarTypes.STRING, array: true },
        nullableArrayField: { type: ScalarTypes.STRING, nullable: true, array: true },
        nullableItemsField: { type: ScalarTypes.STRING, array: "nullable_items" },
      }
    },
    inputObjectArray: {
      array: true,
      type: TestInputObject,
      runtimeTypes: {
        stringField: { type: ScalarTypes.STRING },
        booleanField: { type: ScalarTypes.BOOLEAN },
        dateField: { type: ScalarTypes.DATE },
        numberField: { type: ScalarTypes.INT },
        nullableField: ScalarTypes.STRING,
        arrayField: ScalarTypes.STRING,
        nullableArrayField: { type: ScalarTypes.STRING, nullable: true, array: true },
        nullableItemsField: { type: ScalarTypes.STRING, array: "nullable_items" },
      }
    },
    inputObjectNullableItems: {
      array: "nullable_items",
      type: TestInputObject,
      runtimeTypes: {
        stringField: { type: ScalarTypes.STRING },
        booleanField: { type: ScalarTypes.BOOLEAN },
        dateField: { type: ScalarTypes.DATE },
        numberField: { type: ScalarTypes.FLOAT },
        nullableField: { type: ScalarTypes.STRING, nullable: true },
        arrayField: { type: ScalarTypes.STRING, array: true },
        nullableArrayField: { type: ScalarTypes.STRING, nullable: true, array: true },
        nullableItemsField: { type: ScalarTypes.STRING, array: "nullable_items" },
      }
    },
    nullableInputObjectField: {
      nullable: true,
      type: TestInputObject,
      runtimeTypes: {
        stringField: { type: ScalarTypes.STRING },
        booleanField: { type: ScalarTypes.BOOLEAN },
        dateField: { type: ScalarTypes.DATE },
        numberField: { type: ScalarTypes.INT },
        nullableField: { type: ScalarTypes.STRING, nullable: true },
        arrayField: { type: ScalarTypes.STRING, array: true },
        nullableArrayField: { type: ScalarTypes.STRING, nullable: true, array: true },
        nullableItemsField: { type: ScalarTypes.STRING, array: "nullable_items" }
      }
    },
    nullableInputObjectNullableItems: {
      nullable: true,
      array: "nullable_items",
      type: TestInputObject,
      runtimeTypes: {
        stringField: { type: ScalarTypes.STRING },
        booleanField: { type: ScalarTypes.BOOLEAN },
        dateField: { type: ScalarTypes.DATE },
        numberField: { type: ScalarTypes.INT },
        nullableField: { type: ScalarTypes.STRING, nullable: true },
        arrayField: { type: ScalarTypes.STRING, array: true },
        nullableArrayField: { type: ScalarTypes.STRING, nullable: true, array: true },
        nullableItemsField: { type: ScalarTypes.STRING, array: "nullable_items" }
      }
    }
  }
};