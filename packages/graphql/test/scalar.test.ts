import { print } from "graphql";
import { build, field } from "../src";
import { query, queryGQL, _ } from "../src/client";
import { QueryRoot } from "../src/schema";
import { testSchema } from "./utils";

const scalarTypeNonNull = field<QueryRoot>(
  {
    type: 'boolean',
    resolve: () => {
      return true
    }
  }
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

const generatedSchema = build(scalarSchema);

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
