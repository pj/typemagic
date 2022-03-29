import express, { Express } from "express";
import { graphqlHTTP } from "express-graphql";
import { GraphQLScalarType } from "graphql";
import { customScalar, schema } from "../src";
import { QueryRoot } from "../src/schema";
import { runQuery, testSchema } from "./utils";

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

const customDate = "2022-03-29T16:29:51.000Z"
const generatedSchema = schema(
  {
    queries: {
      basicCustomScalar: {
        type: customScalar<Date>(CustomDateScalar),
        resolve: (): Date => {
          return new Date(customDate);
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
          return { dateField: new Date(customDate) };
        }
      }
    }
  }
);

testSchema(
  generatedSchema, 
  [
    {
      name: 'basicCustomScalar',
      query: `query TestQuery {
          basicCustomScalar
        }`,
      result: { basicCustomScalar: customDate },
    },
    {
      name: 'objectCustomScalar',
      query: `query TestQuery {
          objectCustomScalar {
            dateField
          }
        }`,
      result: { objectCustomScalar: { dateField: customDate } }
    }
  ]
);