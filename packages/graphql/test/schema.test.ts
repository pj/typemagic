import express, { Express } from "express";
import { graphqlHTTP } from "express-graphql";
import { GraphQLScalarType } from "graphql";
import request from 'supertest';
import { customScalar, ScalarTypes, schema } from "../src";
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
      testField: 'string'
    }
  } as const;

class Args {
  constructor(
    public argField: string
  ) {}
}

const argSchema = 
  {
    argField: 'string'
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
      rootField: 'string',
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
      typeAField: 'string',
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
      typeBField: 'boolean',
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
    type: 'boolean',
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

const CustomDateScalar = new GraphQLScalarType({
  name: 'Date',
  description: "Custom Date scalar",
  // Serializes an internal value to include in a response.
  serialize: (source: Date): string => source.toISOString(),
  // Parses an externally provided value to use as an input.
  parseValue: (source: string): Date => new Date(source),
  // Parses an externally provided literal value to use as an input.
  // parseLiteral: (source: string): Date => new Date(source)
});

type TestCustom = {
  dateField: Date
}

const basicCustomScalar = {
  type: customScalar<Date>(CustomDateScalar),
  resolve: (): Date => {
    return new Date();
  }
};

const objectCustomScalar = {
  type: {
    name: "TestCustom",
    fields: {
      dateField: customScalar<Date>(CustomDateScalar),
    }
  },
  resolve: (): TestCustom => {
    return {dateField: new Date()};
  }
};

const schemaObject = {
  mutations: {
    mutateScalar: {
      type: 'string',
      argsFields: {field: 'string'},
      resolve: (args: {field: string}): string => {
        return "done"
      }
    }
  },
  queries: {
    scalarTypeNonNull: scalarTypeNonNull,
    scalarTypeArray: {
      type: 'string',
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
      objectWithInterface: testWithInterfaceSchema,
      basicCustomScalar,
      objectCustomScalar
    }
  } as const;

let app: Express;
let generatedClient;
beforeAll(async () => {
  const generatedSchema = schema(schemaObject);

  app = express();
  app.use('/graphql', graphqlHTTP({
    schema: generatedSchema,
    rootValue: new QueryRoot(),
  }));
});

async function runQuery(query: string, variables?: {[key: string]: any}) {
  return await request(app)
      .post('/graphql')
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

test('basicCustomScalar', async () => {
  const response = 
    await runQuery(
      `query TestQuery {
        basicCustomScalar
      }`
    );
  expect(response.status).toEqual(200);
  expect(new Date(response.body.data.basicCustomScalar)).toBeInstanceOf(Date);
});

test('objectCustomScalar', async () => {
  const response = 
    await runQuery(
      `query TestQuery {
        objectCustomScalar {
          dateField
        }
      }`
    );
  expect(response.status).toEqual(200);
  expect(new Date(response.body.data.objectCustomScalar.dateField)).toBeInstanceOf(Date);
});

test('mutateScalar', async () => {
  const response = 
    await runQuery(
      `mutation TestMutation {
        mutateScalar(field: "asdf")
      }`
    );
  expect(response.status).toEqual(200);
  expect(response.body.data.mutateScalar).toBe("done");
});