import { build, field } from "../src";
import { testSchema } from "./utils";

const mutateScalar = field({
    type: 'string',
    argsFields: { field: 'string' },
    resolve: (args: { field: string }): string => {
      return "done"
    }
  } as const
);


const generatedSchema = build(
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
      mutateScalar
    }
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