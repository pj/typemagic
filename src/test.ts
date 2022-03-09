import { Float, Int } from "type-graphql";
import { query } from ".";

export class Test {
  stringField: string;
  booleanField: boolean;
  dateField: Date;
  intField: number;
  floatField: number;
  relatedField: RelatedClass;
  arrayRelatedField: ArrayRelatedClass[]; 
}

export class RelatedClass {
  testField: string;
}

export class ArrayRelatedClass {
  asdfField: string;
}

export class Args {
  stringField: string;
  booleanField: boolean;
  dateField: Date;
}

async function test(args: Args): Promise<Test> {
  return new Test();
}

query({
  resolve: test,
  args: {
    stringField: () => String,
    booleanField: () => Boolean,
    dateField: () => Date
  },
  output: {
    stringField: () => String,
    booleanField: () => Boolean,
    dateField: () => Date,
    intField: () => Int,
    floatField: () => Float,
    relatedField: () => ({
      name: "relatedField",
      resolve: (): RelatedClass => {
        return new RelatedClass();
      },
      output: {
        testField: () => String
      }
    }),
    arrayRelatedField: () => ({
      resolve: (): ArrayRelatedClass[] => {
        return [new ArrayRelatedClass()];
      },
      output: {


      }
    })
  }
});

function noAsync(args: Args): Test {
  return new Test();
}
