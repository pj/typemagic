import {
  GraphQLBoolean,
  GraphQLField,
  GraphQLFieldConfig,
  GraphQLFieldConfigArgumentMap,
  GraphQLFieldConfigMap,
  GraphQLFloat,
  GraphQLInputFieldConfig,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLSchemaConfig,
  GraphQLString,
  GraphQLType
} from "graphql";
import { GraphQLISODateTime } from "type-graphql";
import { ValidateMutations } from "./mutation";
import { ArrayTrilean, Constructor, ScalarTypes } from "./types";
import { ValidateResolver } from "./resolvers"

export class QueryRoot {

}

export type ValidateQueries<Queries, QueryRoot, Context> =
  {
    [Key in keyof Queries]:
      ValidateResolver<Queries[Key], QueryRoot, unknown, Context>
  }

export type ValidateSchema<Schema, Context> =
  [Schema] extends [
    {
      queries?: infer Queries,
      mutations?: infer Mutations
    }
  ]
  ?
    (
      [undefined] extends [Queries]
      ? { queries?: undefined }
      : { queries: ValidateQueries<Queries, QueryRoot, Context> }
    )
    &
    (
      [undefined] extends [Mutations]
      ? { mutations?: undefined }
      : { mutations: ValidateMutations<Mutations, Context> }
    )
  : never

type InputResolver = {
  alias?: string,
  description?: string,
  deprecationReason?: string,
  type?: ScalarTypes,
  nullable?: boolean,
  array?: ArrayTrilean,
  inputFields?: { [key: string]: InputResolver },
  inputName: string,
  defaultValue: any
}

type SchemaResolver = {
  alias?: string,
  description?: string,
  deprecationReason?: string,
  type?: any,
  nullable?: boolean,
  array?: ArrayTrilean,
  argsFields?: { [key: string]: InputResolver },
  resolve?: (args: any, root: any, context?: any) => any,
}

export function schema<Schema extends ValidateSchema<Schema, Context>, Context>(
  context: Context | Constructor<Context>,
  schema: Schema
) {
  const config: GraphQLSchemaConfig = {};
  const seenObjectsByName = new Map<string, any>();
  const seenObjectsByIdentity = new Map<any, any>();

  const seenInputByName = new Map<string, any>();
  const seenInputByIdentity = new Map<any, any>();

  if (schema.queries) {
    const fields: GraphQLFieldConfigMap<any, any> = {};
    for (let [fieldName, field] of Object.entries<SchemaResolver>(schema.queries)) {
      fields[field.alias || fieldName] = mapToGraphQLOutputField(field, seenObjectsByName, seenObjectsByIdentity, seenInputByIdentity);
    }
    config.query =
      new GraphQLObjectType({
        name: "Query",
        fields
      });
  }

  return new GraphQLSchema(config);
}

function mapOutputNullableAndArray(
  type: GraphQLOutputType,
  options: {
    nullable?: boolean,
    array?: ArrayTrilean
  }
): GraphQLOutputType {
  let output = type
  if (options.array === true) {
    output = new GraphQLList(new GraphQLNonNull(output));
  }
  if (options.array === "nullable_items") {
    output = new GraphQLList(output);
  }
  if (!options.nullable) {
    output = new GraphQLNonNull(output)
  }
  return output;
}

function mapInputToNullableAndArray(
  type: GraphQLInputType,
  options: {
    nullable?: boolean,
    array?: ArrayTrilean
  }
): GraphQLInputType {
  let output = type
  if (options.array === true) {
    output = new GraphQLList(new GraphQLNonNull(output));
  }
  if (options.array === "nullable_items") {
    output = new GraphQLList(output);
  }
  if (!options.nullable) {
    output = new GraphQLNonNull(output)
  }
  return output;
}

function getScalarFromResolver(resolver: SchemaResolver) {
  switch (resolver) {
    case ScalarTypes.BOOLEAN:
      return GraphQLBoolean;
    case ScalarTypes.STRING:
      return GraphQLString;
    case ScalarTypes.FLOAT:
      return GraphQLFloat;
    case ScalarTypes.INT:
      return GraphQLInt;
    case ScalarTypes.DATE:
      return GraphQLISODateTime;
    default:
      switch (resolver.type) {
        case ScalarTypes.BOOLEAN:
          return GraphQLBoolean;
        case ScalarTypes.STRING:
          return GraphQLString;
        case ScalarTypes.FLOAT:
          return GraphQLFloat;
        case ScalarTypes.INT:
          return GraphQLInt;
        case ScalarTypes.DATE:
          return GraphQLISODateTime;
      }
  }

  return null;
}

function mapToGraphQLOutputType(
  resolver: SchemaResolver, 
  seenObjectByName: Map<string, any>, 
  seenObjectsByIdentity: Map<any, any>, 
  seenInputByIdentity: Map<any, any>
): GraphQLOutputType {
  let scalar: GraphQLOutputType | null = getScalarFromResolver(resolver);

  if (scalar !== null) {
    return mapOutputNullableAndArray(scalar, resolver);
  } else {
    let output: GraphQLObjectType;
    if (seenObjectsByIdentity.has(resolver.type)) {
      output = seenObjectsByIdentity.get(resolver.type);
    } else {
      const fields: GraphQLFieldConfigMap<any, any> = {};
      if (resolver.type.objectFields) {
        for (let [fieldName, field] of Object.entries<SchemaResolver>(resolver.type.objectFields)) {
          fields[field.alias || fieldName] = mapToGraphQLOutputField(
            field, 
            seenObjectByName, 
            seenObjectsByIdentity, 
            seenInputByIdentity
          );
        }
      }

      output = new GraphQLObjectType({
        name: resolver.type.objectName,
        description: resolver.description,
        fields
      });

      seenObjectsByIdentity.set(resolver.type, output);
    }
    return mapOutputNullableAndArray(output, resolver);
  }
}

function mapToGraphQLOutputField(
  field: SchemaResolver, 
  seenObjectsByName: Map<string, any>, 
  seenObjectByIdentity: Map<any, any>,
  seenInputByIdentity: Map<any, any>,
): GraphQLFieldConfig<any, any, any> {
  const config: GraphQLFieldConfig<any, any, any> = {
    description: field.description,
    deprecationReason: field.deprecationReason,
    type: mapToGraphQLOutputType(field, seenObjectsByName, seenObjectByIdentity, seenInputByIdentity),
  };
  if (field.argsFields) {
    const args: GraphQLFieldConfigArgumentMap = {}

    for (let [argName, arg] of Object.entries<InputResolver>(field.argsFields)) {
      args[field.alias || argName] = {
        description: arg.description,
        type: mapToGraphQLInputType(arg, seenInputByIdentity),
        defaultValue: arg.defaultValue,
        deprecationReason: arg.deprecationReason
      }
    }

    config.args = args;
  }

  if (field.resolve !== undefined) {
    const resolver = field.resolve;
    config.resolve = (root: any, args: any, context: any) => {
      if (field.argsFields) {
        return resolver(args, root, context);
      } else {
        return resolver(root, context);
      }
    }
  }

  return config;
}

function mapToGraphQLInputType(input: InputResolver, seenInputByIdentity: Map<any, any>): GraphQLInputType {
  let scalar: GraphQLOutputType | null = getScalarFromResolver(input);

  if (scalar !== null) {
    return mapInputToNullableAndArray(scalar, input);
  } else {
    let graphqlInput: GraphQLInputType;
    if (seenInputByIdentity.has(input.type)) {
      graphqlInput = seenInputByIdentity.get(input.type);
    } else {
      const fields: GraphQLInputFieldConfigMap = {};
      if (input.inputFields) {
        for (let [fieldName, field] of Object.entries<InputResolver>(input.inputFields)) {
          fields[field.alias || fieldName] = {
            description: field.description,
            type: mapToGraphQLInputType(field, seenInputByIdentity),
            defaultValue: field.defaultValue,
            deprecationReason: field.deprecationReason,
          }
        }
      }

      graphqlInput = new GraphQLInputObjectType({
        name: input.inputName,
        description: input.description,
        fields
      });
    }
    return mapInputToNullableAndArray(graphqlInput, input);
  }

}