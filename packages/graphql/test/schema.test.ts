import express, { Express } from "express";
import { graphqlHTTP } from "express-graphql";
import request from 'supertest';
import { ScalarTypes, schema } from "../src";
import { resolver } from "../src/resolvers";
import { QueryRoot } from "../src/schema";

class OutputType {
  constructor(
    public testField: string
  ) {}
}

const outputTypeSchema = 
  {
    name: OutputType.name,
    fields: {
      testField: ScalarTypes.STRING
    }
  } as const;

class Args {
  constructor(
    public argField: string
  ) {}
}

const argSchema = 
  {
    argField: ScalarTypes.STRING
  } as const;

class RootType {
  constructor(
    public rootField: string,
    public outputType: OutputType[] | null
  ) {}
}

const rootSchema = 
  {
    name: RootType.name,
    fields: {
      rootField: ScalarTypes.STRING,
      outputType: {
        type: outputTypeSchema,
        array: true,
        nullable: true,
        resolve: (root: RootType): OutputType[] | null => {
          return root.outputType;
        }
      }
    }
  } as const;

class UnionTypeA {
  constructor(
    public typeAField: string,
    public outputType: OutputType[] | null
  ) {}
}

const unionTypeA = 
  {
    name: UnionTypeA.name,
    fields: {
      typeAField: ScalarTypes.STRING,
      outputType: {
        type: outputTypeSchema,
        array: true,
        nullable: true,
        resolve: (root: RootType): OutputType[] | null => {
          return root.outputType;
        }
      }
    }
  } as const;

class UnionTypeB {
  constructor(
    public typeBField: boolean,
    public outputType: OutputType[] | null
  ) {}
}

const unionTypeB = 
  {
    name: UnionTypeB.name,
    fields: {
      typeBField: ScalarTypes.BOOLEAN,
      outputType: {
        type: outputTypeSchema,
        array: true,
        nullable: true,
        resolve: (root: RootType): OutputType[] | null => {
          return root.outputType;
        }
      }
    }
  } as const;

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

const testWithInterfaceSchema = 
  resolver({
    type: {
      name: TestWithInterface.name,
      fields: {
        implementorField: ScalarTypes.INT,
        interfaceField: ScalarTypes.STRING,
        anotherField: ScalarTypes.BOOLEAN
      },
      interfaces: [
        {
          name: "TestInterface",
          fields: {
            interfaceField: ScalarTypes.STRING
          },
          resolveType: (args: TestWithInterface) => "TestWithInterface"
        },
        {
          name: "AnotherInterface",
          fields: {
            anotherField: ScalarTypes.BOOLEAN
          },
          resolveType: (args: TestWithInterface) => "TestWithInterface"
        }
      ]
    },
    resolve: (): TestWithInterface => {
      return new TestWithInterface("hello", 1234, true);
    }
  } as const);

type TestType = {
  firstField: string,
  secondField: number
}

const testTypeSchema = {
  name: "TestType",
  fields: {
    firstField: ScalarTypes.STRING,
    secondField: ScalarTypes.FLOAT
  }
} as const;

enum TestStringEnum {
  FIRST_FIELD = "FIRST_FIELD",
  SECOND_FIElD = "SECOND_FIELD"
}

enum TestNumberEnum {
  FIRST_FIELD,
  SECOND_FIElD
}
const scalarTypeNonNull = resolver(
  {
    type: ScalarTypes.BOOLEAN,
    resolve: () => {
      return true
    }
  } as const
);

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
    scalarTypeNonNull: scalarTypeNonNull,
    scalarTypeArray: {
      type: ScalarTypes.STRING,
      array: "nullable_items",
      resolve: (): (string | null)[] => {
        return ["Hello", null, "World!"]
      }
    },
    enumTypeArray: {
      type: {enum: TestStringEnum, name: "TestStringEnum"},
      array: true,
      resolve: (): (TestStringEnum)[] => {
        return [TestStringEnum.FIRST_FIELD, TestStringEnum.SECOND_FIElD]
      }
    },
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
      objectUnion: {
        type: { 
          name: "ObjectUnion",
          union: [unionTypeA, unionTypeB],
          resolveType: (unionType: UnionTypeA | UnionTypeB) => {
            if (unionType instanceof UnionTypeA) {
              return 'UnionTypeA'
            }

            if (unionType instanceof UnionTypeB) {
              return 'UnionTypeB'
            }

            throw new Error('unable to determine type');
          }
        } as const,
        resolve: (): UnionTypeA | UnionTypeB => {
          return new UnionTypeB(false, null);
        }
      },
      objectWithInterface: testWithInterfaceSchema
    }
  } as const;

let app: Express;
let generatedClient;
beforeAll(async () => {
  const generatedSchema = schema(schemaObject);
  const asdf = schema({
    queries: {
      test: {
        type: { 
          name: "ObjectUnion",
          union: [unionTypeA, unionTypeB],
          resolveType: (unionType: UnionTypeA | UnionTypeB) => {
            if (unionType instanceof UnionTypeA) {
              return 'UnionTypeA'
            }

            if (unionType instanceof UnionTypeB) {
              return 'UnionTypeB'
            }

            throw new Error('unable to determine type');
          }
        },
        resolve: (): UnionTypeA | UnionTypeB => {
          return new UnionTypeB(false, null);
        }
      }
    }
  });

  app = express();
  app.use('/graphql', graphqlHTTP({
    schema: generatedSchema,
    rootValue: new QueryRoot(),
  }));
});

async function runQuery(query: string, variables?: {[key: string]: any}) {
  return await request(app)
      .post('/graphql')
      // .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send(
        {
          query,
          variables
        }
      );
}

test('scalarTypeNonNull', async () => {
  const response = 
    await runQuery(
      `query TestQuery {
        scalarTypeNonNull
      }`
    );
  expect(response.status).toEqual(200);
  expect(response.body.data.scalarTypeNonNull).toBeTruthy();
});

test('scalarTypeArray', async () => {
  const response = 
    await runQuery(
      `query TestQuery {
        scalarTypeArray
      }`
    );
  expect(response.status).toEqual(200);
  expect(response.body.data.scalarTypeArray).toStrictEqual(["Hello", null, "World!"]);
});

test('objectTypeNonNull', async () => {
  const response = 
    await runQuery(
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

test('objectUnion', async () => {
  const response = 
    await runQuery(
      `query TestQuery {
        objectUnion {
          ... on UnionTypeB {
            typeBField
          }
          ... on UnionTypeA {
            typeAField
          }
        }
      }`
    );
  expect(response.status).toEqual(200);
  expect(response.body.data.objectUnion).toBeTruthy();
});

test('objectWithInterface', async () => {
  const response = 
    await runQuery(
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

type X = ({a: string} | {b:number})[]
type Y = [{a: string}, {b:number}]

type Z = X[number]
type A = Y[number]

type E = X[number] extends Y[number] ? Y[number] extends X[number] ? true : false : false