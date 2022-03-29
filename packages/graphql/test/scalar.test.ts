import express, { Express } from "express";
import { graphqlHTTP } from "express-graphql";
import { print, GraphQLScalarType } from "graphql";
import { customScalar, ScalarTypes, schema } from "../src";
import { FieldSentinel, GenerateQuery, query, queryGQL, _ } from "../src/client";
import { resolver } from "../src/resolvers";
import { QueryRoot } from "../src/schema";
import { OutputType, outputTypeSchema, RootType, runQuery, testSchema } from "./utils";

const scalarTypeNonNull = resolver(
  {
    type: 'boolean',
    resolve: () => {
      return true
    }
  } as const
);

const scalarSchema = 
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
  } as const;

const generatedSchema = schema(scalarSchema);

testSchema(
  generatedSchema, 
  [
    {
      name: 'scalarTypeNonNull',
      query: print(query(scalarSchema, {scalarTypeNonNull: _})),
      result: {scalarTypeNonNull: true}
    },
    {
      name: 'scalarTypeArray',
      query: queryGQL(scalarSchema, {scalarTypeArray: _}),
      result: {scalarTypeArray: ["Hello", null, "World!"]}
    }
  ]
);
