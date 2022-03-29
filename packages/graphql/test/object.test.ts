import express, { Express } from "express";
import { graphqlHTTP } from "express-graphql";
import { GraphQLScalarType } from "graphql";
import { customScalar, ScalarTypes, schema } from "../src";
import { resolver } from "../src/resolvers";
import { QueryRoot } from "../src/schema";
import { OutputType, outputTypeSchema, rootSchema, RootType, runQuery } from "./utils";

class Args {
  constructor(
    public argField: string
  ) {}
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

const objectTypeWithArgs = resolver<any, QueryRoot, unknown>(
  {
    type: outputTypeSchema,
    array: "nullable_items",
    argsFields: argSchema,
    resolve: (args: Args, root: QueryRoot): (OutputType | null)[] => {
      return [new OutputType(args.argField), new OutputType("Hello World!"), null];
    }
  } as const
  );

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
        resolve: ()  => {
          return new RootType("Root Type", [new OutputType("Output Type")]);
        }
      },
    }
  } as const;

let app: Express;
beforeAll(async () => {
  const generatedSchema = schema(schemaObject);

  app = express();
  app.use('/graphql', graphqlHTTP({
    schema: generatedSchema,
    rootValue: new QueryRoot(),
  }));
});

test('objectTypeNonNull', async () => {
  const response = 
    await runQuery(
      app,
      `query TestQuery {
        objectTypeNonNull {
          testField
        } 
      }`
    );
  expect(response.status).toEqual(200);
  expect(response.body.data.objectTypeNonNull.testField).toEqual("Hello World!");
});

test('objectTypeNull', async () => {
  const response = 
    await runQuery(
      app,
      `query TestQuery {
        objectTypeNull {
          testField
        } 
      }`
    );
  expect(response.status).toEqual(200);
  expect(response.body.data.objectTypeNull).toBeNull();
});

test('objectTypeArray', async () => {
  const response = 
    await runQuery(
      app,
      `query TestQuery {
        objectTypeArray {
          testField
        } 
      }`
    );
  expect(response.status).toEqual(200);
  expect(response.body.data.objectTypeArray).toStrictEqual([{"testField": "Hello World!"}]);
});

test('objectTypeWithArgs', async () => {
  const response = 
    await runQuery(
      app,
      `query TestQuery($argField: String!) {
        objectTypeWithArgs(argField: $argField) {
          testField
        } 
      }`,
      {argField: "test"}
    );
  expect(response.status).toEqual(200);
  expect(response.body.data.objectTypeWithArgs).toStrictEqual(
    [
      {"testField": "test"}, 
      {"testField": "Hello World!"}, 
      null
    ]
  );
});

test('rootType', async () => {
  const response = 
    await runQuery(
      app,
      `query TestQuery {
        rootType {
          rootField
          outputType {
            testField
          }
        } 
      }`,
      {argField: "test"}
    );
  expect(response.status).toEqual(200);
  expect(response.body.data.rootType).toStrictEqual(
    {
      "rootField": "Root Type",
      "outputType": [
        {"testField": "Output Type"}
      ]
    }
  );
});
