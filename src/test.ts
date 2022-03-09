import { Float, Int } from "type-graphql";
import { args, object, query, nullable, _enum } from ".";

export class Test {
  stringField: string;
  booleanField: boolean;
  dateField: Date | null;
  intField: number;
  floatField: number;
  relatedField: RelatedClass;
  arrayRelatedField: ArrayRelatedClass[]; 
  enumField: ASDF;

  constructor(
    stringField: string,
    booleanField: boolean,
    dateField: Date | null,
    intField: number,
    floatField: number,
    relatedField: RelatedClass,
    arrayRelatedField: ArrayRelatedClass[], 
    enumField: ASDF
  ) {
    this.stringField = stringField; 
    this.booleanField = booleanField; 
    this.dateField = dateField; 
    this.intField = intField; 
    this.floatField = floatField; 
    this.relatedField = relatedField; 
    this.arrayRelatedField = arrayRelatedField; 
    this.enumField = enumField;
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
    ASDF.asdf
  );
}

enum ASDF {
  erer = "erer",
  asdf = "asdf"
}



// type X = typeof ASDF extends {prototype: infer X} ? "yes" : "no";
// type Y = ASDF extends {prototype: infer X} ? "yes" : "no";

// type Z = typeof String extends {prototype: infer X} ? "yes" : "no";
// type A = String extends {prototype: infer X} ? "yes" : "no";
// type B = typeof ASDF

// const x = "asdf";
// type T = string extends ASDF ? "yes" : "no";
// type H = ASDF extends string ? "yes" : "no";

// type Z<X> = string extends X ? "yes" : "no";
// type Y = Z<ASDF>;
// type A = Z<string>;

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
      enumField: () => _enum(ASDF),
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