import { print } from "graphql";
import { build, client } from "../src";
import { createApp, createTest, OutputType, RootType } from "./utils";

const schemaObject = {
    queries: {
      inputObject: {
        type: 'string',
        argsFields: {
          inputArgument: {
            type: {
              name: RootType.name,
              fields: {
                rootField: 'string',
                outputType: {
                  type: {
                    name: OutputType.name,
                    fields: {
                      testField: 'string'
                    }
                  },
                  nullable: true,
                  array: true
                }
              }
            }
          }
        },
        resolve: (args: {inputArgument: RootType}): string => {
          return 'test'
        }
      },
    }
  } as const;

let app = createApp(build(schemaObject));

test(
 'scalarTypeNonNull',
  createTest(
    app,
    print(
      client.query(
        schemaObject, {
        inputObject: {
          $args: {inputArgument: {$name: 'inputVariable'}},
          $fields: client._
        }
      })
    ),
    {inputObject: "test"},
    {inputVariable: {rootField: "hello", outputType: [{testField: "world"}]}}
  )
);