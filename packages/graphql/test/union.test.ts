import { UniqueOperationNamesRule } from "graphql";
import { schema } from "../src";
import { GenerateQuery, queryGQL, _ } from "../src/client";
import { Exact } from "../src/types";
import { OutputType, outputTypeSchema, RootType, testSchema } from "./utils";

class UnionTypeA {
  constructor(
    public typeAField: string,
    public outputType: OutputType[] | null
  ) { }
}

const unionTypeA =
  {
    name: 'UnionTypeA',
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
  ) { }
}

const unionTypeB =
  {
    name: 'UnionTypeB',
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

const unionSchema = 
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
  } as const;

testSchema(
  schema(unionSchema), 
  [
    {
      name: 'objectUnion',
      query: queryGQL(
        unionSchema, 
        {
          objectUnion: {
            $on: {
              UnionTypeA: {
                
              },
              UnionTypeB: {
                typeBField: _
              }
            }
          }
        }
      ),
      result: {
        objectUnion: {
          typeBField: false
        }
      }
    }
  ]
);