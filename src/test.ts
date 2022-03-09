import { Float, Int } from "type-graphql";
import { args, object, query } from ".";

export class Test {
  stringField: string;
  booleanField: boolean;
  dateField: Date;
  intField: number;
  floatField: number;
  relatedField: RelatedClass;
  arrayRelatedField: ArrayRelatedClass[]; 

  constructor(
    stringField: string,
    booleanField: boolean,
    dateField: Date,
    intField: number,
    floatField: number,
    relatedField: RelatedClass,
    arrayRelatedField: ArrayRelatedClass[], 
  ) {
    this.stringField = stringField; 
    this.booleanField = booleanField; 
    this.dateField = dateField; 
    this.intField = intField; 
    this.floatField = floatField; 
    this.relatedField = relatedField; 
    this.arrayRelatedField = arrayRelatedField; 
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
    [new ArrayRelatedClass("test")]
  );
}

query({
  name: "test",
  resolve: test,
  args: args({
    object: Args,
    fieldTypes: {
      stringField: () => String,
      booleanField: () => Boolean,
      dateField: () => Date
    }
  }),
  output: object({
    object: Test,
    fieldTypes: {
      stringField: () => String,
      booleanField: () => Boolean,
      dateField: () => Date,
      intField: () => Int,
      floatField: () => Float,
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