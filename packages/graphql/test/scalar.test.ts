import { print } from "graphql";
import { build, query, client } from "../src";
import { QueryRoot } from "../src/schema";
import { testSchema } from "./utils";

const scalarTypeNonNull = query(
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
      query: print(client.query(scalarSchema, {scalarTypeNonNull: client._})),
      result: {scalarTypeNonNull: true}
    },
    {
      name: 'scalarTypeArray',
      query: client.queryGQL(scalarSchema, {scalarTypeArray: client._}),
      result: {scalarTypeArray: ["Hello", null, "World!"]}
    }
  ]
);
