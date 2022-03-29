import express, { Express } from "express";
import { graphqlHTTP } from "express-graphql";
import { schema } from "../src";
import { QueryRoot } from "../src/schema";
import { runQuery, testSchema } from "./utils";

const generatedSchema = schema(
  {
    queries: {
      asdf: {
        type: 'string',
        resolve: (): string => {
          return 'asdf'
        }
      }
    },
    mutations: {
      mutateScalar: {
        type: 'string',
        argsFields: { field: 'string' },
        resolve: (args: { field: string }): string => {
          return "done"
        }
      }
    },
  }
);

testSchema(
  generatedSchema,
  [
    {
      name: 'mutateScalar',
      query: `mutation TestMutation {
          mutateScalar(field: "asdf")
        }`,
      result: { mutateScalar: "done" }
    }
  ]
);