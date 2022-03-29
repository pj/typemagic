import express, { Express } from "express";
import { graphqlHTTP } from "express-graphql";
import { GraphQLScalarType } from "graphql";
import { customScalar, ScalarTypes, schema } from "../src";
import { resolver } from "../src/resolvers";
import { QueryRoot } from "../src/schema";
import { OutputType, outputTypeSchema, RootType, runQuery } from "./utils";

const scalarTypeNonNull = resolver(
  {
    type: 'boolean',
    resolve: () => {
      return true
    }
  } as const
);

let app: Express;
beforeAll(async () => {
  const generatedSchema = schema(
    {
      queries: {
        scalarTypeNonNull: scalarTypeNonNull,
        scalarTypeArray: {
          type: 'string',
          array: "nullable_items",
          resolve: (): (string | null)[] => {
            return ["Hello", null, "World!"]
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

test('scalarTypeNonNull', async () => {
  const response = 
    await runQuery(
      app,
      `query TestQuery {
        scalarTypeNonNull
      }`
    );
  expect(response.status).toEqual(200);
  expect(response.body.data.scalarTypeNonNull).toBeTruthy();
});

test('scalarTypeArray', async () => {
  const response = 
    await runQuery(
      app,
      `query TestQuery {
        scalarTypeArray
      }`
    );
  expect(response.status).toEqual(200);
  expect(response.body.data.scalarTypeArray).toStrictEqual(["Hello", null, "World!"]);
});
