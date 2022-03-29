import express, { Express } from "express";
import { graphqlHTTP } from "express-graphql";
import { schema } from "../src";
import { QueryRoot } from "../src/schema";
import { runQuery } from "./utils";

let app: Express;
beforeAll(async () => {
  const generatedSchema = schema(
    { 
      queries: {
        asdf: {
          type: 'string',
          resolve: (): string => {
            return 'asdf'
          }
        }
      },
      mutations: {
        mutateScalar: {
          type: 'string',
          argsFields: { field: 'string' },
          resolve: (args: { field: string }): string => {
            return "done"
          }
        }
      },
    }
  );

  app = express();
  app.use('/graphql', graphqlHTTP({
    schema: generatedSchema,
    rootValue: new QueryRoot(),
  }));
});


test('mutateScalar', async () => {
  const response =
    await runQuery(
      app,
      `mutation TestMutation {
        mutateScalar(field: "asdf")
      }`
    );
  expect(response.status).toEqual(200);
  expect(response.body.data.mutateScalar).toBe("done");
});