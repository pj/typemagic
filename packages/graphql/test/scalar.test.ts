import { print } from "graphql";
import { build, query, client, field } from "../src";
import { createApp, createTest, QueryRoot, testQuery, testSchema } from "./utils";

const scalarSchema =
  {
    queries: {
      scalarTypeNonNull:
        field(
          {
            type: 'Boolean',
            resolve: () => {
              return true
            }
          } as const,
        ),
      scalarTypeArray: {
        type: 'String',
        array: "nullable_items",
        resolve: (): (string | null)[] => {
          return ["Hello", null, "World!"]
        }
      },
      scalarTypePromise: {
        type: 'String',
        nullable: true,
        resolve: async (): Promise<string | null> => {
          return null;
        }
      },
    }
  } as const;

const generatedSchema = build(scalarSchema, { root: QueryRoot });

let app = createApp(generatedSchema);

test(
  'scalarTypeNonNull',
  testQuery(
    {
      app,
      schema: scalarSchema,
      query: {
        scalarTypeNonNull: client._
      },
      result: {
        scalarTypeNonNull: true
      },
      root: QueryRoot
    }
  )
);

test(
  'scalarTypeArray',
  testQuery(
    {
      app,
      schema: scalarSchema,
      query: { scalarTypeArray: client._ },
      result: { scalarTypeArray: ["Hello", null, "World!"] },
      root: QueryRoot
    }
  )
);

test(
  'scalarTypePromise',
  testQuery(
    {
      app,
      schema: scalarSchema,
      query: { scalarTypePromise: client._ },
      result: { scalarTypePromise: null },
      root: QueryRoot
    }
  )
);
