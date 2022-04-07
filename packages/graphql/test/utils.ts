import express, { Express } from "express";
import { graphqlHTTP } from "express-graphql";
import { VariableUsage } from "graphql/validation/ValidationContext";
import request from 'supertest';
import { client } from "../src";
import { GenerateSchema, GenerateVariable, queryGQL } from "../src/client";
import { ValidateSchema } from "../src/schema";
import { Constructor } from "../src/types";

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

export class QueryRoot {
  
}

export class QueryContext {
  
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


type TestQuery = {
  name: string,
  query: string,
  result: any,
  args?: any
}

export function testSchema(schema: any, testQueries: TestQuery[]) {
  const app = express();
  app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: new QueryRoot(),
  }));

  for (let {name, query, result, args} of testQueries) {
    test(name, async () => {
      const response = await runQuery(app, query, args);
      expect(response.status).toEqual(200);
      expect(response.body.data).toStrictEqual(result);
    });
  }
}

export function createApp(schema: any) {
  const app = express();
  app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: new QueryRoot(),
  }));
  return app;
}

export function createTest(app: Express, query: string, result: any, variables?: any) {
  return async function () {
    const response = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .send(
        {
          query,
          variables
        }
      );

    expect(response.status).toEqual(200);
    expect(response.body.data).toStrictEqual(result);
  }
}

export function testQuery<
  Root, 
  Context,
  Schema extends ValidateSchema<Schema, Root, Context>,
  Query extends GenerateSchema<Query, Schema>,
  Variables extends GenerateVariable<Query>,
>(
  app: Express,
  schema: Schema,
  query: Query,
  result: any,
  options?: {
    variables?: Variables,
    context?: Context | Constructor<Context>,
    root?: Root | Constructor<Root>,
    queryname?: string,
  }

){
  return async function () {
    const response = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .send(
        {
          query: queryGQL(schema, query, options),
          variables: options?.variables
        }
      );

    expect(response.status).toEqual(200);
    expect(response.body.data).toStrictEqual(result);
  }
}