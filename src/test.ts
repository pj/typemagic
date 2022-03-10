import { Float, Int } from "type-graphql";
import { schema } from ".";
import { args } from "./input";
import { object, OutputRuntimeTypes } from "./output";
import { array, query, resolver } from "./query";
import { ConstructorFromArray, nullable, registerEnum } from "./types";

export class Test {
  stringField: string;
  booleanField: boolean;
  dateField: Date | null;
  intField: number;
  floatField: number;
  relatedField: RelatedClass;
  arrayRelatedField: ArrayRelatedClass[]; 
  stringEnumField: StringEnum;
  numberEnumField: IntEnum;
  arrayField: string[] | null;

  constructor(
    stringField: string,
    booleanField: boolean,
    dateField: Date | null,
    intField: number,
    floatField: number,
    relatedField: RelatedClass,
    arrayRelatedField: ArrayRelatedClass[], 
    stringEnumField: StringEnum,
    numberEnumField: IntEnum,
    arrayField: string[] | null
  ) {
    this.stringField = stringField; 
    this.booleanField = booleanField; 
    this.dateField = dateField; 
    this.intField = intField; 
    this.floatField = floatField; 
    this.relatedField = relatedField; 
    this.arrayRelatedField = arrayRelatedField; 
    this.stringEnumField = stringEnumField;
    this.numberEnumField = numberEnumField;
    this.arrayField = arrayField;
  }
}

export class RelatedClass {
  testField: string;

  constructor(testField: string) {
    this.testField = testField;
  }
}

export class ArrayRelatedClass {
  asdfField: string;

  constructor(asdfField: string) {
    this.asdfField = asdfField;
  }
}

export class Args {
  stringField: string;
  booleanField: boolean;
  dateField: Date;

  constructor(
    stringField: string,
    booleanField: boolean,
    dateField: Date,
  ) {
    this.stringField = stringField; 
    this.booleanField = booleanField; 
    this.dateField = dateField; 
  }
}

async function test(args: Args): Promise<Test> {
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
    ["hello", "world"]
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

const testQuery = query({
  resolve: test,
  args: args({
    object: Args,
    fieldTypes: {
      stringField: () => String,
      booleanField: () => Boolean,
      dateField: () => Date,
    }
  }),
  output: object({
    source: Test,
    fieldTypes: {
      stringField: () => resolver({
        output: String,
        resolve: async (root: Test) => {
          return `${root.stringField} is being resolved`;
        }
      }),
      booleanField: () => Boolean,
      dateField: () => nullable(Date),
      stringEnumField: () => registerEnum(StringEnum),
      numberEnumField: () => registerEnum(IntEnum),
      intField: () => Int,
      floatField: () => Float,
      // extra: () => object({
      //   object: ASDF,
      //   resolve: (root: Test): ASDF => {
      //     return ASDF.asdf;
      //   },
      // }),
      relatedField: () => resolver({
        output: object({
          source: RelatedClass,
          fieldTypes: {
            testField: () => String
          },
        }),
        resolve: async (root: Test) => {
          return new RelatedClass(`${root.intField} times`);
        },
      }),
      arrayRelatedField: () => array({
        output: object({
          source: ArrayRelatedClass,
          fieldTypes: {
            asdfField: () => String
          }
        }),
        resolve: async () => {
          return [new ArrayRelatedClass("array related")];
        },
      }),
      arrayField: () => nullable(array({
        output: String,
        resolve: async (root: Test) => {
          return root.arrayField
        }
      }))
    }
  })
});

type X = OutputRuntimeTypes<any, any, string[]>

array({
  output: object({
    source: ArrayRelatedClass,
    fieldTypes: {
      asdfField: () => String
    }
  }),
  resolve: async () => {
    return [new ArrayRelatedClass("array related")];
  },
})


schema({
  queries: {
    testQuery
  }
});