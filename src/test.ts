import { Float, Int } from "type-graphql";
import { args, object, query, nullable, registerEnum } from ".";

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

  constructor(
    stringField: string,
    booleanField: boolean,
    dateField: Date | null,
    intField: number,
    floatField: number,
    relatedField: RelatedClass,
    arrayRelatedField: ArrayRelatedClass[], 
    stringEnumField: StringEnum,
    numberEnumField: IntEnum
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
    IntEnum.second
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

query({
  name: "test",
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
    object: Test,
    fieldTypes: {
      stringField: () => String,
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
      relatedField: () => object({
        object: RelatedClass,
        resolve: (root: Test, context: any): RelatedClass => {
          return new RelatedClass(`${root.intField} times`);
        },
        fieldTypes: {
          testField: () => String
        }
      }),
      arrayRelatedField: () => object({
        object: [ArrayRelatedClass],
        resolve: (): ArrayRelatedClass[] => {
          return [new ArrayRelatedClass("array related")];
        },
        fieldTypes: {
          asdfField: () => String
        }
      })
    }
  })
});