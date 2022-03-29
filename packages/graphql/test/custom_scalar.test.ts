import express, { Express } from "express";
import { graphqlHTTP } from "express-graphql";
import { GraphQLScalarType } from "graphql";
import { customScalar, schema } from "../src";
import { QueryRoot } from "../src/schema";
import { runQuery } from "./utils";

const CustomDateScalar = new GraphQLScalarType({
  name: 'Date',
  description: "Custom Date scalar",
  // Serializes an internal value to include in a response.
  serialize: (source: Date): string => source.toISOString(),
  // Parses an externally provided value to use as an input.
  parseValue: (source: string): Date => new Date(source),
  // Parses an externally provided literal value to use as an input.
  // parseLiteral: (source: string): Date => new Date(source)
});

type TestCustom = {
  dateField: Date
}

let app: Express;
beforeAll(async () => {
  const generatedSchema = schema(
    {
      queries: {
        basicCustomScalar: {
          type: customScalar<Date>(CustomDateScalar),
          resolve: (): Date => {
            return new Date();
          }
        },
        objectCustomScalar: {
          type: {
            name: "TestCustom",
            fields: {
              dateField: customScalar<Date>(CustomDateScalar),
            }
          },
          resolve: (): TestCustom => {
            return { dateField: new Date() };
          }
        }
      }
    }
  );

  app = express();
  app.use('/graphql', graphqlHTTP({
    schema: generatedSchema,
    rootValue: new QueryRoot(),
  }));
});

test('basicCustomScalar', async () => {
  const response =
    await runQuery(
      app,
      `query TestQuery {
        basicCustomScalar
      }`
    );
  expect(response.status).toEqual(200);
  expect(new Date(response.body.data.basicCustomScalar)).toBeInstanceOf(Date);
});

test('objectCustomScalar', async () => {
  const response =
    await runQuery(
      app,
      `query TestQuery {
        objectCustomScalar {
          dateField
        }
      }`
    );
  expect(response.status).toEqual(200);
  expect(new Date(response.body.data.objectCustomScalar.dateField)).toBeInstanceOf(Date);
});