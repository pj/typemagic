import { build, client, field, query } from "../src";
import { mutationGQL } from "../src/client";
import { createApp, createTest, testSchema } from "./utils";

const mutateScalar = field({
    type: 'string',
    argsFields: { field: 'string' },
    resolve: (args: { field: string }): string => {
      return "done"
    }
  } as const
);

const schemaObject = {
  queries: {
    asdf: {
      type: 'string',
      resolve: (): string => {
        return 'asdf'
      }
    }
  },
  mutations: {
    mutateScalar
  }
} as const;

const generatedSchema = build(schemaObject);

let app = createApp(build(schemaObject));

test(
  'mutateScalar',
  createTest(
    app,
    mutationGQL(
      schemaObject, 
      {
        mutateScalar: {
          $args: {
            field: {
              $name: 'test'
            }
          },
          $fields: client._
        }
      }
    ),
    { mutateScalar: "done" },
    {test: 'test'}
  )
);