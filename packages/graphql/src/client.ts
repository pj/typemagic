import { GraphQLClient } from "graphql-request";
import { ValidateSchema } from "./schema";
import { GetTypeScalar, IsSchemaScalar, IsTypeScalar, RemovePromise, SchemaTypeToType } from "./types";

export type FieldSentinel = {};

const _: FieldSentinel = {};

export type GenerateArgsField<Type, ResolverFunction, Args> =
  [unknown] extends [Args]
    ? Type
    : (
        ResolverFunction extends (args: infer Args, root: infer Root, context: infer Context) => any
        ? {
            args: Args
          }
        : "Should not happen"
      ) & Type

export type GenerateQueryField<Resolver> = 
  [Resolver] extends [
    {
      type: infer Type,
      argsFields?: infer Args,
      resolve?: infer ResolverFunction
    }
  ] 
    ? (
        Type extends {enum: infer Enum, name: infer Name, description?: infer Description}
          ? GenerateArgsField<FieldSentinel, ResolverFunction, Args>
          : IsSchemaScalar<Type> extends true
            ? GenerateArgsField<FieldSentinel, ResolverFunction, Args>
            : Type extends {unionName: infer UnionName, unionTypes: infer UnionTypes}
              ? UnionTypes extends Readonly<unknown[]>
                ?  GenerateArgsField<
                    {
                      __typename: FieldSentinel,
                      on: {
                        [Index in keyof UnionTypes]: "asdf"
                      }
                    }, 
                    ResolverFunction, 
                    Args
                  >
                : "Union types must be an array"
              : Type extends {objectFields: infer ObjectFields}
                ? GenerateArgsField<
                    {
                      [Key in keyof ObjectFields]?:
                        GenerateQueryField<ObjectFields[Key]>
                    }, 
                    ResolverFunction, 
                    Args
                  >
                : "Unable to determine type for client"
      )
    : "Invalid Resolver"

export type GenerateQuery<Schema extends ValidateSchema<Schema, any>> = {
  [Key in keyof Schema['queries']]?: GenerateQueryField<Schema['queries'][Key]>
}

export type GenerateResultField<Schema, Field> =
  [Field] extends [FieldSentinel]
    ? SchemaTypeToType<Schema>
    : GenerateResultFields<Schema, Field>

export type GenerateResultFields<Schema, Query> =
{
  [Key in keyof Query]:
    [Key] extends [keyof Schema]
      ? GenerateResultField<Schema[Key], Query[Key]>
      : "Should not happen"
}

export type GenerateResult<Schema extends ValidateSchema<Schema, any>, Query> =
  GenerateResultFields<Schema["queries"], Query>

export type RawReturn<Result> = 
  {
    data: Result;
    extensions?: any;
    headers: Headers;
    status: number;
  }

export type GenerateClientType<
  Schema extends ValidateSchema<Schema, any>, 
  Query extends GenerateQuery<Schema>, 
  Result extends GenerateResult<Schema, Query>
> = {
  request: (query: Query) => Promise<Result>,
  rawRequest: (query: Query) => Promise<RawReturn<Result>>
}

function createGraphQLQuery(schema: any, query: any, queryName?: string): string {
  for (let [name, fields] of Object.entries(query)) {
    const actualName = queryName || name[0].toUpperCase() + name.substring(1);
    
    return `
      query ${actualName} () {
        ${name} {

        }
      }
      `
  }

  throw new Error("At least 1 query must be specified");
}

export function client<
  Query extends GenerateQuery<Schema>, 
  Result extends GenerateResult<Schema, Query>, 
  Schema extends ValidateSchema<Schema, any> = any
>(
  schema: Schema,
  url: string,
  options?: RequestInit
): GenerateClientType<Schema, Query, Result> {
  const client = new GraphQLClient(url, options);
  async function request(queryObject: Query, name?: string): Promise<Result>{
    const query = createGraphQLQuery(schema, queryObject, name);
    return await client.request(query);
  }

  async function rawRequest(queryObject: Query, name?: string): Promise<RawReturn<Result>>{
    const query = createGraphQLQuery(schema, queryObject, name)
    return await client.rawRequest(query);
  }

  return ({
    request,
    rawRequest
  });
}