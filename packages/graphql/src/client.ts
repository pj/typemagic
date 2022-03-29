import { ValidateSchema } from "./schema";
import { GetTypeScalar, IsSchemaScalar, IsTypeScalar, RemovePromise, ScalarTypes, TransformResolverToType } from "./types";
import { ArgumentNode, ASTNode, DocumentNode, FieldNode, GraphQLAbstractType, NameNode, ValueNode, VariableNode } from "graphql";

export type FieldSentinel = {};
export const _: FieldSentinel = {};

class FloatLiteral {
  constructor(public num: number) {}
}

class IntLiteral {
  constructor(public num: number) {}
}

export function floatLiteral(num: number) {
  return new FloatLiteral(num);
}

class Variable<Type> {
  constructor(public name: string) {
  }
}

export function variable<Type = never>(name: string) {
  return new Variable<Type>(name);
}

export type GenerateArgsVariables<Args> =
  {
    args: {
      [Key in keyof Args]: Args[Key] | Variable<Args[Key]>
    }
  }

export type GenerateArgsField<Type, ResolverFunction, Args> =
  [unknown] extends [Args]
    ? Type
    :[undefined] extends [Args]
      ? Type
      : (
          ResolverFunction extends (args: infer Args, root: infer Root, context: infer Context) => any
          ? GenerateArgsVariables<Args>
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
    ? TransformResolverToType<Schema>
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

function queryArgValue(schema: any, arg: any): ValueNode {
  if (arg === null) {
    return {kind: 'NullValue'}
  }

  switch (schema) {
    case 'boolean':
      return {kind: 'BooleanValue', value: arg};
    case 'string':
      return {kind: 'StringValue', value: arg};
    case 'float':
      return {kind: 'FloatValue', value: arg};
    case 'int':
      return {kind: 'IntValue', value: arg};
    default:
      switch (schema.type) {
        case 'boolean':
          return {kind: 'BooleanValue', value: arg};
        case 'string':
          return {kind: 'StringValue', value: arg};
        case 'float':
          return {kind: 'FloatValue', value: arg};
        case 'int':
          return {kind: 'IntValue', value: arg};
      }
  }

  if (arg instanceof Variable) {
    return (
      {
        kind: 'Variable',
        name: {
          kind: 'Name',
          value: arg.name
        }
      }
    )
  }

  throw new Error("Unknown arg value");
}

//   | ListValueNode
//   | ObjectValueNode;

function queryArgs(schema: any, args: any): [ArgumentNode[] | undefined, VariableNode[]] {
  const variables: VariableNode[] = [];
  if (args) {
    const argNodes = Object.entries<any>(args).map(
      ([name, arg]): ArgumentNode => 
        (
          {
            kind: 'Argument',
            name: {kind: 'Name', value: name},
            value: queryArgValue(schema.argFields[name], arg)
          }
        )
    );

    return [argNodes, variables];
  } else {
    return [undefined, []]
  }
}

function queryFields(schema: any, queryFields: any): FieldNode[] {
  return Object.entries<any>(queryFields).map(
    ([name, field]): FieldNode => {
      const [args, variables] = queryArgs(schema[name], field.args)
      const fieldNode: FieldNode = (
        {
          kind: 'Field',
          name: {kind: 'Name', value: field.alias || name},
          arguments: args
        }
      );

      return fieldNode;
    }
  );
}

export function query<Schema extends ValidateSchema<Schema, any>, Query extends GenerateQuery<Schema>>(
  schema: Schema, 
  query: Query, 
  queryName?: string
): DocumentNode {
  const queryNameNode: NameNode | undefined = queryName ? {kind: 'Name', value: queryName} : undefined;
  return ({
    kind: 'Document',
    definitions: [
      {
        kind: 'OperationDefinition',
        operation: 'query',
        name: queryNameNode,
        selectionSet: {
          kind: 'SelectionSet',
          selections: queryFields(schema['queries'], query)
        }
      }
    ]
  });
}

// export type GenerateClientType<
//   Schema extends ValidateSchema<Schema, any>, 
//   Query extends GenerateQuery<Schema>, 
//   Result extends GenerateResult<Schema, Query>
// > = {
//   request: (query: Query) => Promise<Result>,
//   rawRequest: (query: Query) => Promise<RawReturn<Result>>
// }

// export function client<
//   Query extends GenerateQuery<Schema>, 
//   Result extends GenerateResult<Schema, Query>, 
//   Schema extends ValidateSchema<Schema, any> = any
// >(
//   schema: Schema,
//   url: string,
//   options?: RequestInit
// ): GenerateClientType<Schema, Query, Result> {
//   const client = new GraphQLClient(url, options);
//   async function request(queryObject: Query, name?: string): Promise<Result>{
//     const query = createGraphQLQuery(schema, queryObject, name);
//     return await client.request(query);
//   }

//   async function rawRequest(queryObject: Query, name?: string): Promise<RawReturn<Result>>{
//     const query = createGraphQLQuery(schema, queryObject, name)
//     return await client.rawRequest(query);
//   }

//   return ({
//     request,
//     rawRequest
//   });
// }