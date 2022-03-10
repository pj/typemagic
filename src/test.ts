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

// type X = typeof ASDF extends {prototype: infer Y} ? "yes" : Y;
// type Y = ASDF extends {prototype: infer X} ? "yes" : "no";

// type X = string extends object ? "yes" : "no";

// type X = string extends typeof ASDF ? "yes" : "no"
// type Y = typeof String extends object ? "yes" : "no"

// type X = typeof String extends typeof ASDF ? "yes" : "no"
// type Y = typeof ASDF extends typeof String ? "yes" : "no"
// type Z = typeof ASDF extends string ? "yes" : "no"

// type X = {[Key in keyof typeof ASDF as `hello${string & Key}`]: never}
// type Z = typeof ASDF extends {} ? "yes" : "no"
// type X = Omit<typeof ASDF, 'asdf'> extends {} ? "yes" : "no"
// type Z = typeof ASDF extends {prototype: any} ? "yes" : "no"

// type X = Pick<{asdf: string}, keyof {asdf: string}> 

// function ssss() {}

// type Z = Pick<typeof ssss, keyof typeof ssss>

// type Z = typeof String extends {prototype: infer X} ? "yes" : "no";
// type A = String extends {prototype: infer X} ? "yes" : "no";
// type B = typeof ASDF

// const x = "asdf";
// type T = string extends ASDF ? "yes" : "no";
// type H = ASDF extends string ? "yes" : "no";

// type Z<X> = string extends X ? "yes" : "no";
// type Y = Z<ASDF>;
// type A = Z<string>;

// type X = typeof ASDF extends {[Key in keyof ASDF]: ASDF[Key]} ? "yes" : "no"

type TypeOf = typeof ASDF
type Keys = keyof TypeOf
// type Picked = Pick<TypeOf, Keys>
// type PickedKeys = keyof Picked
// type Excluded = Exclude<Picked, PickedKeys>

// type Z = Exclude<Keys, Keys>;
// type X = Keys extends string ? "yes" : "no"

// type ExtractedTypes = Extract<TypeOf, >

type X = typeof ASDF extends {[key: string]: string} ? "yes" : "no"



// type X = Exclude<Pick<typeof ASDF, keyof typeof ASDF>, keyof typeof ASDF>
// type T = {} extends Exclude<Pick<typeof ASDF, keyof typeof ASDF>, keyof typeof ASDF> ? "yes" : "no";


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
      enumField: () => registerEnum(ASDF),
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