import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLEnumValueConfigMap, GraphQLFieldConfig,
  GraphQLFieldConfigArgumentMap,
  GraphQLFieldConfigMap,
  GraphQLFloat, GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLInterfaceTypeConfig,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType, GraphQLSchema,
  GraphQLSchemaConfig,
  GraphQLString, GraphQLUnionType
} from "graphql";
import { GraphQLISODateTime } from "type-graphql";
import { ValidateResolver } from "./resolvers";
import { ArrayTrilean, ScalarTypes } from "./types";

export class QueryRoot {

}

export class MutationRoot {

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
      : { mutations: ValidateQueries<Mutations, MutationRoot, Context> }
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
  resolveType?: (type: any) => any,
}

class SchemaObjects {
  constructor(
    public outputObjects: Map<any, any> = new Map(),
    public inputObjects: Map<any, any> = new Map(),
    public unions: Map<any, any> = new Map(),
  ) {}
}

export function schema<Context, Schema extends ValidateSchema<Schema, Context>>(
  schema: Schema
) {
  const config: GraphQLSchemaConfig = {};
  const schemaObjects = new SchemaObjects();

  if (schema.queries) {
    const fields: GraphQLFieldConfigMap<any, any> = {};
    for (let [fieldName, field] of Object.entries<SchemaResolver>(schema.queries)) {
      fields[field.alias || fieldName] = mapToGraphQLOutputField(field, schemaObjects);
    }
    config.query =
      new GraphQLObjectType({
        name: "Query",
        fields
      });
  }

  if (schema.mutations) {
    const fields: GraphQLFieldConfigMap<any, any> = {};
    for (let [fieldName, field] of Object.entries<SchemaResolver>(schema.mutations)) {
      fields[field.alias || fieldName] = mapToGraphQLOutputField(field, schemaObjects);
    }
    config.query =
      new GraphQLObjectType({
        name: "Mutation",
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

function mapToGraphQLObjectType(type: any, schemaObjects: SchemaObjects) {
  const fields: GraphQLFieldConfigMap<any, any> = {};
  const interfaces: GraphQLInterfaceType[] = [];
  if (type.interfaces) {
    for (let interface_ of type.interfaces) {
      const interfaceFields: GraphQLFieldConfigMap<any, any> = {};
      for (let [fieldName, field] of Object.entries<SchemaResolver>(interface_.fields)) {
        interfaceFields[field.alias || fieldName] = mapToGraphQLOutputField(
          field, 
          schemaObjects
        );
      }
      interfaces.push(
        new GraphQLInterfaceType({name: interface_.name, fields: interfaceFields})
      )
    }
  }

  for (let [fieldName, field] of Object.entries<SchemaResolver>(type.fields)) {
    fields[field.alias || fieldName] = mapToGraphQLOutputField(
      field, 
      schemaObjects
    );
  }

  const output = new GraphQLObjectType({
    name: type.name,
    description: type.description,
    fields,
    interfaces
  });

  schemaObjects.outputObjects.set(type, output);
  return output;
}

function mapToGraphQLOutputType(
  resolver: SchemaResolver, 
  schemaObjects: SchemaObjects
): GraphQLOutputType {
  let scalar: GraphQLOutputType | null = getScalarFromResolver(resolver);

  if (scalar !== null) {
    return mapOutputNullableAndArray(scalar, resolver);
  } else {
    let output: GraphQLOutputType;
    if (schemaObjects.outputObjects.has(resolver.type)) {
      output = schemaObjects.outputObjects.get(resolver.type);
    } else if (schemaObjects.unions.has(resolver.type)) {
      output = schemaObjects.unions.get(resolver.type);
    } else if (resolver.type.union) {
      const types: GraphQLObjectType[] = [];

      for (let type of resolver.type.union) {
        types.push(mapToGraphQLObjectType(type, schemaObjects));
      }

      output = new GraphQLUnionType({
        name: resolver.type.name,
        description: resolver.description,
        resolveType: resolver.type.resolveType,
        types
      });

      schemaObjects.unions.set(resolver.type, output);
    } else if (resolver.type.fields) {
      output = mapToGraphQLObjectType(resolver.type, schemaObjects);
    } else if (resolver.type.enum) {
      const values: GraphQLEnumValueConfigMap = {};

      for (let key of Object.keys(resolver.type.enum)) {
        values[key] = {value: resolver.type.enum[key]}
      }

      output = new GraphQLEnumType({
        name: resolver.type.name,
        description: resolver.type.description,
        values
      });
    } else {
      throw new Error(`Unknown resolver type ${resolver}`)
    }
    return mapOutputNullableAndArray(output, resolver);
  }
}

function mapToGraphQLOutputField(
  field: SchemaResolver, 
  schemaObjects: SchemaObjects,
): GraphQLFieldConfig<any, any, any> {
  const config: GraphQLFieldConfig<any, any, any> = {
    description: field.description,
    deprecationReason: field.deprecationReason,
    type: mapToGraphQLOutputType(field, schemaObjects),
  };
  if (field.argsFields) {
    const args: GraphQLFieldConfigArgumentMap = {}

    for (let [argName, arg] of Object.entries<InputResolver>(field.argsFields)) {
      args[field.alias || argName] = {
        description: arg.description,
        type: mapToGraphQLInputType(arg, schemaObjects),
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

function mapToGraphQLInputType(input: InputResolver, schemaObjects: SchemaObjects): GraphQLInputType {
  let scalar: GraphQLOutputType | null = getScalarFromResolver(input);

  if (scalar !== null) {
    return mapInputToNullableAndArray(scalar, input);
  } else {
    let graphqlInput: GraphQLInputType;
    if (schemaObjects.inputObjects.has(input.type)) {
      graphqlInput = schemaObjects.inputObjects.get(input.type);
    } else {
      const fields: GraphQLInputFieldConfigMap = {};
      if (input.inputFields) {
        for (let [fieldName, field] of Object.entries<InputResolver>(input.inputFields)) {
          fields[field.alias || fieldName] = {
            description: field.description,
            type: mapToGraphQLInputType(field, schemaObjects),
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