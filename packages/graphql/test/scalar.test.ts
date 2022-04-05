import { print } from "graphql";
import { build, query, client } from "../src";
import { QueryRoot } from "../src/schema";
import { createApp, createTest, testSchema } from "./utils";

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

let app = createApp(generatedSchema);

test(
 'scalarTypeNonNull',
  createTest(
    app,
    print(client.query(scalarSchema, {scalarTypeNonNull: client._})),
    {scalarTypeNonNull: true}
  )
);

test(
  'scalarTypeArray',
  createTest(
    app,
    client.queryGQL(scalarSchema, {scalarTypeArray: client._}),
    {scalarTypeArray: ["Hello", null, "World!"]}
  )
);
