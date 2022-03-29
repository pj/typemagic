import express, { Express } from "express";
import { graphqlHTTP } from "express-graphql";
import { GraphQLScalarType } from "graphql";
import { customScalar, ScalarTypes, schema } from "../src";
import { FieldSentinel, GenerateQuery, queryGQL, _ } from "../src/client";
import { resolver } from "../src/resolvers";
import { QueryRoot } from "../src/schema";
import { OutputType, outputTypeSchema, rootSchema, RootType, runQuery, testSchema } from "./utils";

class Args {
  constructor(
    public argField: string
  ) { }
}

const argSchema =
  {
    argField: 'string'
  } as const;

type TestType = {
  firstField: string,
  secondField: number
}

const testTypeSchema = {
  name: "TestType",
  fields: {
    firstField: 'string',
    secondField: 'float'
  }
} as const;

const objectTypeWithArgs = 
  {
    type: outputTypeSchema,
    array: "nullable_items",
    argsFields: argSchema,
    resolve: (args: Args, root: QueryRoot): (OutputType | null)[] => {
      return [new OutputType(args.argField), new OutputType("Hello World!"), null];
    }
  } as const;

const schemaObject = {
  queries: {
    objectTypeNonNull: {
      type: outputTypeSchema,
      resolve: () => {
        return new OutputType("Hello World!");
      }
    },
    objectTypeNull: {
      type: outputTypeSchema,
      nullable: true,
      resolve: (): OutputType | null => {
        return null;
      }
    },
    objectTypeFromType: {
      type: testTypeSchema,
      nullable: true,
      resolve: (): TestType | null => {
        return null;
      }
    },
    objectTypeArray: {
      type: outputTypeSchema,
      array: true,
      resolve: (): OutputType[] => {
        return [new OutputType("Hello World!")];
      }
    },
    objectTypeWithArgs: objectTypeWithArgs,
    rootType: {
      type: rootSchema,
      resolve: () => {
        return new RootType("Root Type", [new OutputType("Output Type")]);
      }
    },
  }
} as const;

const generatedSchema = schema(schemaObject);

testSchema(
  generatedSchema,
  [
    {
      name: 'objectTypeNonNull',
      query: queryGQL(schemaObject, {objectTypeNonNull: {testField: _}}),
      result: { objectTypeNonNull: { testField: 'Hello World!' } }
    },
    {
      name: 'objectTypeNull',
      query: queryGQL(schemaObject, {objectTypeNull: {testField: _}}),
      result: { objectTypeNull: null }
    },
    {
      name: 'objectTypeArray',
      query: queryGQL(schemaObject, {objectTypeArray: {testField: _}}),
      result: { objectTypeArray: [{ testField: "Hello World!" }] }
    },
    {
      name: 'objectTypeWithArgs',
      query: queryGQL(
        schemaObject, 
        {
          objectTypeWithArgs: {
            $args: {
              argField: {$name: "test"}
            },
            $fields: {
              testField: _
            }
          }
        }
      ),
      args: { test: "test" },
      result: {
        objectTypeWithArgs:
          [
            { "testField": "test" },
            { "testField": "Hello World!" },
            null
          ]
      }
    },
    {
      name: 'rootType',
      query: queryGQL(schemaObject, {rootType: {rootField: _, outputType: {testField: _}}}),
      result: {
        rootType: {
          rootField: "Root Type",
          "outputType": [
            { "testField": "Output Type" }
          ]
        }
      }
    }
  ]
);
