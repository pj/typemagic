import express, { Express } from "express";
import { graphqlHTTP } from "express-graphql";
import { schema } from "../src";
import { QueryRoot } from "../src/schema";
import { OutputType, outputTypeSchema, RootType, runQuery } from "./utils";

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

let app: Express;
beforeAll(async () => {
  const generatedSchema = schema(
    {
      queries: {
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
      }
    }
);

  app = express();
  app.use('/graphql', graphqlHTTP({
    schema: generatedSchema,
    rootValue: new QueryRoot(),
  }));
});


test('objectUnion', async () => {
  const response = 
    await runQuery(
      app,
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
