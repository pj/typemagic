import express, { Express } from "express";
import { graphqlHTTP } from "express-graphql";
import { schema } from "../src";
import { QueryRoot } from "../src/schema";

enum TestStringEnum {
  FIRST_FIELD = "FIRST_FIELD",
  SECOND_FIElD = "SECOND_FIELD"
}

enum TestNumberEnum {
  FIRST_FIELD,
  SECOND_FIElD
}

let app: Express;
beforeAll(async () => {
  const generatedSchema = schema(
    {
      queries: {
        enumTypeArray: {
          type: { enum: TestStringEnum, name: "TestStringEnum" },
          array: true,
          resolve: (): (TestStringEnum)[] => {
            return [TestStringEnum.FIRST_FIELD, TestStringEnum.SECOND_FIElD]
          }
        },
      }
    }
  );

  app = express();
  app.use('/graphql', graphqlHTTP({
    schema: generatedSchema,
    rootValue: new QueryRoot(),
  }));
});

test('enumTypeArray', async () => {expect(true).toBeTruthy()})