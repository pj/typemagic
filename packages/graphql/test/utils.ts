import request from 'supertest';

export async function runQuery(app: Express.Application, query: string, variables?: { [key: string]: any }) {
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

export class OutputType {
  constructor(
    public testField: string
  ) { }
}

export const outputTypeSchema =
  {
    name: OutputType.name,
    fields: {
      testField: 'string'
    }
  } as const;

export class RootType {
  constructor(
    public rootField: string,
    public outputType: OutputType[] | null
  ) { }
}

export const rootSchema =
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
