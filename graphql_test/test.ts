import { QueryRoot, schema } from "../graphql/schema";
import { registerEnum, ScalarTypes } from "../graphql/types";

export class Test {
  constructor(
    public stringField: string,
    public booleanField: boolean,
    public dateField: Date | null,
    public intField: number,
    public floatField: number,
    public relatedField: RelatedClass,
    public arrayRelatedField: ArrayRelatedClass[],
    public stringEnumField: StringEnum,
    public numberEnumField: IntEnum,
    public arrayField: string[],
    public nullableArrayField: string[] | null,
    public queriedField: RelatedClass,
    public nullableRelatedField: RelatedClass | null
  ) {
  }
}

export class RelatedClass {
  constructor(public testField: string) {
  }
}

export class ArrayRelatedClass {
  asdfField: string;

  constructor(asdfField: string) {
    this.asdfField = asdfField;
  }
}

export class TestInputObject {
  constructor(
    public stringField: string,
    public booleanField: boolean,
    public dateField: Date,
    public numberField: number,
    public nullableField: string | null,
    public arrayField: string[],
    public nullableArrayField: string[] | null,
    public nullableItemsField: (string | null)[]
  ) { }
}

export class Args {
  constructor(
    public stringField: string,
    public booleanField: boolean,
    public dateField: Date,
    public numberField: number,
    public nullableField: string | null,
    public arrayField: string[],
    public nullableArrayField: string[] | null,
    public nullableItemsField: (string | null)[],
    public inputObjectField: TestInputObject,
    public nullableInputObjectField: TestInputObject | null,
    public inputObjectArray: TestInputObject[],
    public inputObjectNullableItems: (TestInputObject | null)[],
    public nullableInputObjectNullableItems: (TestInputObject | null)[] | null,
  ) {
  }
}

export async function test(args: Args): Promise<Test> {
  return new Test(
    "asdf",
    false,
    new Date(),
    1,
    1.0,
    new RelatedClass("qwer"),
    [new ArrayRelatedClass("test")],
    StringEnum.asdf,
    IntEnum.second,
    ["goodbye"],
    ["hello", "world"],
    new RelatedClass("hello"),
    null
  );
}

enum StringEnum {
  erer = "erer",
  asdf = "asdf"
}

enum IntEnum {
  first,
  second
}

export class ChildArgs {
  constructor(
    public field: string
  ) {

  }
}

export class NestedChildArgs {
  constructor(
    public field: string,
    public nullableField: string | null,
    public arrayField: string[] | null,
    public childArgs: ChildArgs,
    public arrayOfChildArgs: (ChildArgs | null)[] | null
  ) {

  }
}

const registeredArgs =
{
        type: Args,
        runtimeTypes: {
          stringField: { type: ScalarTypes.STRING },
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
              nullableField: { type: ScalarTypes.STRING, nullable: true },
              arrayField: { type: ScalarTypes.STRING, array: true },
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
      } as const;

schema({
  queries: {
    testQuery: {
      resolve: test,
      args: registeredArgs,
      type: Test,
      runtimeTypes: {
        stringField: {
          type: ScalarTypes.STRING,
          resolve: async (root: Test) => {
            return `${root.stringField} is being resolved`;
          }
        },
        booleanField: { type: ScalarTypes.BOOLEAN },
        dateField: { type: ScalarTypes.DATE },
        stringEnumField: { type: registerEnum(StringEnum) },
        numberEnumField: { type: registerEnum(IntEnum) },
        intField: { type: ScalarTypes.INT },
        floatField: { type: ScalarTypes.FLOAT },
        relatedField: {
          type: RelatedClass,
          runtimeTypes: {
            testField: {
              type: ScalarTypes.STRING
            }
          },
          resolve: async (root: Test) => {
            return new RelatedClass(`${root.intField} times`);
          },
        },
        arrayRelatedField: {
          type: ArrayRelatedClass,
          runtimeTypes: {
            asdfField: { type: ScalarTypes.STRING }
          },
          array: true,
          resolve: async () => {
            return [new ArrayRelatedClass("array related")];
          },
        },
        arrayField: {
          type: ScalarTypes.STRING,
          array: true,
          resolve: async (root: Test) => {
            return root.arrayField;
          }
        },
        nullableArrayField: {
          type: ScalarTypes.STRING,
          nullable: true,
          array: true,
          resolve: async (root: Test): Promise<string[] | null> => {
            return root.nullableArrayField
          }
        },
        queriedField: {
          type: RelatedClass,
          runtimeTypes: {
            testField: { type: ScalarTypes.STRING }
          },
          args: registeredArgs,
          resolve: async (args: Args, root: Test): Promise<RelatedClass> => {
            return root.queriedField;
          }
        },
        nullableRelatedField: {
          type: RelatedClass,
          runtimeTypes: {
            testField: { type: ScalarTypes.STRING }
          },
          nullable: true,
          resolve: async (root: Test) => {
            return root.nullableRelatedField;
          },
        }
      }
    }
  }
});