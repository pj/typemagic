import { Int } from "type-graphql";
import { ArgsSchema } from "../src/input";
import { Args, TestInputObject } from "./test";


function testArgs<A>(object: ArgsSchema<A>): ArgsSchema<A> {
  return object
}

export const registeredArgs = testArgs({
  type: Args,
  runtimeSchema: {
    stringField: { type: String },
    booleanField: { type: Boolean },
    dateField: { type: Date },
    numberField: { type: Int },
    nullableField: { type: String, nullable: true },
    arrayField: { type: String, array: true },
    nullableArrayField: { type: String, nullable: true, array: true },
    nullableItemsField: { type: String, array: "nullable_items" },
    inputObjectField: {
      type: TestInputObject,
      runtimeTypes: {
        stringField: { type: String },
        booleanField: { type: Boolean },
        dateField: { type: Date },
        numberField: { type: Int },
        nullableField: { type: String, nullable: true },
        arrayField: { type: String, array: true },
        nullableArrayField: { type: String, nullable: true, array: true },
        nullableItemsField: { type: String, array: "nullable_items" },
      }
    },
    inputObjectArray: {
      array: true,
      type: TestInputObject,
      runtimeTypes: {
        stringField: { type: String },
        booleanField: { type: Boolean },
        dateField: { type: Date },
        numberField: { type: Int },
        nullableField: { type: String, nullable: true },
        arrayField: { type: String, array: true },
        nullableArrayField: { type: String, nullable: true, array: true },
        nullableItemsField: { type: String, array: "nullable_items" },
      }
    },
    inputObjectNullableItems: {
      array: "nullable_items",
      type: TestInputObject,
      runtimeTypes: {
        stringField: { type: String },
        booleanField: { type: Boolean },
        dateField: { type: Date },
        // @ts-expect-error
        numberField: { type: Float },
        nullableField: { type: String, nullable: true },
        arrayField: { type: String, array: true },
        nullableArrayField: { type: String, nullable: true, array: true },
        nullableItemsField: { type: String, array: "nullable_items" },
      }
    },
    nullableInputObjectField: {
      nullable: true,
      type: TestInputObject,
      runtimeTypes: {
        stringField: { type: String },
        booleanField: { type: Boolean },
        dateField: { type: Date },
        numberField: { type: Int },
        nullableField: { type: String, nullable: true },
        arrayField: { type: String, array: true },
        nullableArrayField: { type: String, nullable: true, array: true },
        nullableItemsField: { type: String, array: "nullable_items" }
      }
    },
    nullableInputObjectNullableItems: {
      nullable: true,
      array: "nullable_items",
      type: TestInputObject,
      runtimeTypes: {
        stringField: { type: String },
        booleanField: { type: Boolean },
        dateField: { type: Date },
        numberField: { type: Int },
        nullableField: { type: String, nullable: true },
        arrayField: { type: String, array: true },
        nullableArrayField: { type: String, nullable: true, array: true },
        nullableItemsField: { type: String, array: "nullable_items" }
      }
    }
  }
});