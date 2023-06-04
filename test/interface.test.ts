import { build, field, query } from "../src";
import { createApp, createTest, QueryContext, QueryRoot } from "./utils";

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
        implementorField: 'Int',
        interfaceField: 'String',
        anotherField: 'Boolean'
      },
      interfaces: [
        {
          name: "TestInterface",
          fields: {
            interfaceField: 'String'
          },
          resolveType: (args: TestWithInterface) => "TestWithInterface"
        },
        {
          name: "AnotherInterface",
          fields: {
            anotherField: 'Boolean'
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

let app = createApp(generatedSchema);

test(
  'objectWithInterface',
  createTest(
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
    }`,
    {
      objectWithInterface: {
        implementorField: 1234,
        interfaceField: "hello",
        anotherField: true
      }
    }
  )
);