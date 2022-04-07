import { build } from "../src";
import { _ } from "../src/client";
import { createApp, OutputType, outputTypeSchema, QueryContext, QueryRoot, rootSchema, RootType, testQuery } from "./utils";

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

const generatedSchema = build(schemaObject, { context: QueryContext, root: QueryRoot });

let app = createApp(generatedSchema);

test(
  'objectTypeNonNull',
  testQuery(
    app,
    schemaObject,
    {
      objectTypeNonNull: {
        testField: _
      }
    },
    { objectTypeNonNull: { testField: 'Hello World!' } },
    {
      context: QueryContext,
      root: QueryRoot
    }
  )
);

test(
  'objectTypeNull',
  testQuery(
    app,
    schemaObject,
    {
      objectTypeNull: {
        testField: _
      }
    },
    { objectTypeNull: null },
    {
      context: QueryContext,
      root: QueryRoot
    }
  ),
);

test(
  'objectTypeArray',
  testQuery(
    app,
    schemaObject,
    {
      objectTypeArray: {
        testField: _
      }
    },
    { objectTypeArray: [{ testField: "Hello World!" }] },
    {
      context: QueryContext,
      root: QueryRoot
    }
  ),
);

test(
  'objectTypeWithArgs',
  testQuery(
    app,
    schemaObject,
    {
      objectTypeWithArgs: {
        $args: {
          argField: { $name: "test" }
        },
        $fields: {
          testField: _
        }
      }
    } as const,
    {
      objectTypeWithArgs:
        [
          { "testField": "test" },
          { "testField": "Hello World!" },
          null
        ]
    },
    {
      variables: { test: "test" },
      context: QueryContext,
      root: QueryRoot,
    }
  ),
);

test(
  'rootType',
  testQuery(
    app,
    schemaObject,
    {
      rootType: {
        rootField: _,
        outputType: {
          testField: _
        }
      }
    },
    {
      rootType: {
        rootField: "Root Type",
        "outputType": [
          { "testField": "Output Type" }
        ]
      }
    },
    {
      context: QueryContext,
      root: QueryRoot
    }
  )
);
