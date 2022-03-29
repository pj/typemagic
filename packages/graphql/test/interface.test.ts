import express, { Express } from "express";
import { graphqlHTTP } from "express-graphql";
import { schema } from "../src";
import { resolver } from "../src/resolvers";
import { QueryRoot } from "../src/schema";
import { runQuery } from "./utils";

interface TestInterface {
  interfaceField: string
}

interface AnotherInterface {
  anotherField: boolean
}

class TestWithInterface implements TestInterface, AnotherInterface {
  constructor(public interfaceField: string, public implementorField: number, public anotherField: boolean) {

  }
}

const objectWithInterface =
  resolver({
    type: {
      name: TestWithInterface.name,
      fields: {
        implementorField: 'int',
        interfaceField: 'string',
        anotherField: 'boolean'
      },
      interfaces: [
        {
          name: "TestInterface",
          fields: {
            interfaceField: 'string'
          },
          resolveType: (args: TestWithInterface) => "TestWithInterface"
        },
        {
          name: "AnotherInterface",
          fields: {
            anotherField: 'boolean'
          },
          resolveType: (args: TestWithInterface) => "TestWithInterface"
        }
      ]
    },
    resolve: (): TestWithInterface => {
      return new TestWithInterface("hello", 1234, true);
    }
  } as const);


let app: Express;
beforeAll(async () => {
  const generatedSchema = schema(
    {
      queries: {
        objectWithInterface
      }
    }
  );

  app = express();
  app.use('/graphql', graphqlHTTP({
    schema: generatedSchema,
    rootValue: new QueryRoot(),
  }));
});

test('objectWithInterface', async () => {
  const response =
    await runQuery(
      app,
      `query TestQuery {
        objectWithInterface {
          implementorField

          ... on AnotherInterface {
            anotherField
          }
          ... on TestInterface {
            interfaceField
          }
        }
      }`
    );
  expect(response.status).toEqual(200);
  expect(response.body.data.objectWithInterface).toStrictEqual({
    implementorField: 1234,
    interfaceField: "hello",
    anotherField: true
  });
});