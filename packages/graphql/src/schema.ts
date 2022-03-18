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
  type?: ScalarTypes,
  nullable?: boolean,
  array?: ArrayTrilean,
  argsFields?: { [key: string]: InputResolver },
  resolve?: (args: any, root: any, context?: any) => any,
  objectName: string,
  objectFields?: { [key: string]: SchemaResolver }
}

export function schema<Schema extends ValidateSchema<Schema, Context>, Context>(
  context: Context | Constructor<Context>,
  schema: Schema
) {
  const config: GraphQLSchemaConfig = {};

  if (schema.queries) {
    const fields: GraphQLFieldConfigMap<any, any> = {};
    for (let [fieldName, field] of Object.entries<SchemaResolver>(schema.queries)) {
      fields[field.alias || fieldName] = mapToGraphQLOutputField(field)
    }
    config.query =
      new GraphQLObjectType({
        name: "Query",
        fields
      });
  }

  new GraphQLSchema(config);
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

function mapToGraphQLOutputType(type: SchemaResolver): GraphQLOutputType {
  let output;
  switch (type.type) {
    case ScalarTypes.BOOLEAN:
      output = GraphQLBoolean;
      break;
    case ScalarTypes.STRING:
      output = GraphQLString;
      break;
    case ScalarTypes.FLOAT:
      output = GraphQLFloat;
      break;
    case ScalarTypes.INT:
      output = GraphQLInt;
      break;
    case ScalarTypes.DATE:
      output = GraphQLISODateTime;
      break;
    default:
      const fields: GraphQLFieldConfigMap<any, any> = {};
      if (type.objectFields) {
        for (let [fieldName, field] of Object.entries<SchemaResolver>(type.objectFields)) {
          fields[field.alias || fieldName] = mapToGraphQLOutputField(field)
        }
      }

      output = new GraphQLObjectType({
        name: type.objectName,
        description: type.description,
        fields
      });
  }

  return mapOutputNullableAndArray(output, type);
}

function mapToGraphQLOutputField(field: SchemaResolver): GraphQLFieldConfig<any, any, any> {
  const config: GraphQLFieldConfig<any, any, any> = {
    description: field.description,
    deprecationReason: field.deprecationReason,
    type: mapToGraphQLOutputType(field),
  };
  if (field.argsFields) {
    const args: GraphQLFieldConfigArgumentMap = {}

    for (let [argName, arg] of Object.entries<InputResolver>(field.argsFields)) {
      args[field.alias || argName] = {
        description: arg.description,
        type: mapToGraphQLInputType(arg),
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

function mapToGraphQLInputType(type: InputResolver): GraphQLInputType {
  let output;
  switch (type.type) {
    case ScalarTypes.BOOLEAN:
      output = GraphQLBoolean;
      break;
    case ScalarTypes.STRING:
      output = GraphQLString;
      break;
    case ScalarTypes.FLOAT:
      output = GraphQLFloat;
      break;
    case ScalarTypes.INT:
      output = GraphQLInt;
      break;
    case ScalarTypes.DATE:
      output = GraphQLISODateTime;
      break;
    default:
      const fields: GraphQLInputFieldConfigMap = {};
      if (type.inputFields) {
        for (let [fieldName, field] of Object.entries<InputResolver>(type.inputFields)) {
          fields[field.alias || fieldName] = {
            description: field.description,
            type: mapToGraphQLInputType(field),
            defaultValue: field.defaultValue,
            deprecationReason: field.deprecationReason,
          }

        }
      }

      output = new GraphQLInputObjectType({
        name: type.inputName,
        description: type.description,
        fields
      });
  }

  return mapInputToNullableAndArray(output, type);
}