import express, {Express} from "express";
import { graphqlHTTP } from "express-graphql";
import { printSchema } from "graphql";
import { ScalarTypes, schema } from "../src";
import { QueryRoot } from "../src/schema";
import request from 'supertest';
import { HandleUnion } from "../src/resolvers";

class OutputType {
  constructor(
    public testField: string
  ) {}
}

const outputTypeSchema = 
  {
    objectName: OutputType.name,
    objectFields: {
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
    objectName: RootType.name,
    objectFields: {
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
    objectName: UnionTypeA.name,
    objectFields: {
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
    objectName: UnionTypeB.name,
    objectFields: {
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

type TestType = {
  firstField: string,
  secondField: number
}

const testTypeSchema = {
  objectName: "TestType",
  objectFields: {
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

let app: Express;
beforeAll(async () => {

  const generatedSchema = schema(
    {} as any, 
    {
      queries: {
        scalarTypeNonNull: {
          type: ScalarTypes.BOOLEAN,
          resolve: () => {
            return true
          }
        },
        scalarTypeArray: {
          type: ScalarTypes.STRING,
          array: "nullable_items",
          resolve: (): (string | null)[] => {
            return ["Hello", null, "World!"]
          }
        },
        enumTypeArray: {
          enum: TestStringEnum,
          array: "nullable_items",
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
        objectTypeWithArgs: {
          type: outputTypeSchema,
          array: "nullable_items",
          argsFields: argSchema,
          resolve: (args: Args, root: QueryRoot): (OutputType | null)[] => {
            return [new OutputType(args.argField), new OutputType("Hello World!"), null];
          }
        },
        rootType: {
          type: rootSchema,
          resolve: ()  => {
            return new RootType("Root Type", [new OutputType("Output Type")]);
          }
        },
        objectUnion: {
          type: { 
            unionName: "ObjectUnion",
            unionTypes: [unionTypeA, unionTypeB] 
          } as const,
          resolve: (): UnionTypeA | UnionTypeB => {
            return new UnionTypeB(false, null);
          }
        }
      }
    }
  );

  // console.debug(printSchema(generatedSchema));
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