import { build, field } from "../src";
import { testSchema } from "./utils";

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
  field({
    type: {
      name: 'TestWithInterface',
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

const generatedSchema = build(
  {
    queries: {
      objectWithInterface
    }
  }
);

testSchema(
  generatedSchema, [
    {
      name: 'objectWithInterface',
      query: `query TestQuery {
            objectWithInterface {
              implementorField

              ... on AnotherInterface {
                anotherField
              }
              ... on TestInterface {
                interfaceField
              }
            }
          }`,
      result: {
        objectWithInterface: {
          implementorField: 1234,
          interfaceField: "hello",
          anotherField: true
        }
      }
    }
  ]
);