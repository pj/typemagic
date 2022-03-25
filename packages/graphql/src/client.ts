import { GraphQLClient } from "graphql-request";
import { ValidateSchema } from "./schema";

export type ValidateQuery<Schema extends ValidateSchema<Schema, any>, Query> = {
  [Key in keyof Schema['queries']]: 

}

export type GenerateResult<Result> = {

}

export type GenerateQuery<
  Schema extends ValidateSchema<Schema, any>, 
  Query extends ValidateQuery<Schema, Query>, 
  Result extends GenerateResult<Result>
> = {
  request: (query: Query) => Promise<Result>,
  rawRequest: (query: Query) => Promise<Result>
}

function createGraphQLQuery(schema: any, query: any) {
  
}

export function client<
  Query extends GenerateQuery<Query, Result>, 
  Result extends GenerateResult<Result>, 
  Schema extends ValidateSchema<Schema, any> = any
>(
  schema: Schema,
  url: string,
  options?: RequestInit
): GenerateQuery<Query, Result> {
  const client = new GraphQLClient(url, options);
  async function request(queryObject: Query): Promise<Result>{
    const query = createGraphQLQuery(schema, queryObject);
    return await client.request(query);
  }

  async function rawRequest(queryObject: Query): Promise<Result>{
    const query = createGraphQLQuery(schema, queryObject)
    return await client.rawRequest(query);
  }

  return ({
    request,
    rawRequest
  });
  
  return createGeneratedQuery(client);
}