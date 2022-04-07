import { print } from "graphql";
import { build, query, client, field } from "../src";
import { createApp, createTest, QueryRoot, testQuery, testSchema } from "./utils";

const scalarSchema = 
  {
    queries: {
      scalarTypeNonNull: 
        field(
          {
            type: 'boolean',
            resolve: () => {
              return true
            }
          } as const, 
        ),
      scalarTypeArray: {
        type: 'string',
        array: "nullable_items",
        resolve: (): (string | null)[] => {
          return ["Hello", null, "World!"]
        }
      },
    }
  } as const;

const generatedSchema = build(scalarSchema, {root: QueryRoot});

let app = createApp(generatedSchema);

test(
 'scalarTypeNonNull',
  testQuery(
    app, 
    scalarSchema, 
    {
      scalarTypeNonNull: client._
    }, 
    {
      scalarTypeNonNull: true
    }
  )
);

test(
  'scalarTypeArray',
  testQuery(
    app, 
    scalarSchema, 
    {scalarTypeArray: client._}, 
    {scalarTypeArray: ["Hello", null, "World!"]}
  )
);
