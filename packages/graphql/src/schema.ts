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
  GraphQLOutputType, GraphQLScalarType, GraphQLSchema,
  GraphQLSchemaConfig,
  GraphQLString, GraphQLUnionType
} from "graphql";
import { CustomScalar } from "./custom_scalar";
import { ValidateFields } from "./helpers";
import { ValidateResolver } from "./resolvers";
import { ArrayTrilean, ScalarStrings, ScalarTypes } from "./types";

export class QueryRoot {

}

export class MutationRoot {

}

export type ValidateSchema<Schema, Context> =
  [Schema] extends [
    {
      queries: infer Queries,
      mutations?: infer Mutations
    }
  ]
  ?
    (
      { queries: ValidateFields<Queries, QueryRoot, Context> }
    )
    &
    (
      [undefined] extends [Mutations]
      ? { mutations?: undefined }
      : { mutations: ValidateFields<Mutations, MutationRoot, Context> }
    )
  : never

type InputType =
  ScalarTypes
  | {
    enum: any,
    description?: string,
    name: string
  } | {
    name: string, 
    description?: string,
    scalar: CustomScalar<any>
  } | {
    fields: {[key: string]: InputObject},
    name: string 
  };

type InputObject = ScalarTypes | {
  alias?: string,
  description?: string,
  deprecationReason?: string,
  type: InputType,
  nullable?: boolean,
  array?: ArrayTrilean,
  defaultValue?: any
}

type ArgsFields = {
  [key: string]: InputObject
}

type ObjectType = {
  fields: {[key: string]: OutputObject}
  interfaces?: ObjectType[],
  name: string 
  description?: string,
}

export type OutputType = 
  ScalarTypes |
  CustomScalar<any> |
  {
    enum: any,
    description?: string,
    name: string
  } | {
    scalar: CustomScalar<any>,
    description?: string,
  } | {
    name: string,
    description?: string,
    union: ObjectType[],
    resolveType?: any
  } | ObjectType;

export type OutputObject = CustomScalar<any> | ScalarTypes | {
  alias?: string,
  description?: string,
  deprecationReason?: string,
  type: OutputType,
  nullable?: boolean,
  array?: ArrayTrilean,
  argsFields?: ArgsFields,
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

export function build<Context, Schema extends ValidateSchema<Schema, Context>>(
  schema: Schema
) {
  const config: GraphQLSchemaConfig = {};
  const schemaObjects = new SchemaObjects();

  if (schema.queries) {
    const fields: GraphQLFieldConfigMap<any, any> = {};
    for (let [fieldName, field] of Object.entries<OutputObject>(schema.queries)) {
      if (isScalar(field)) {
        fields[fieldName] = mapToGraphQLOutputField(field, schemaObjects);
      } else {
        const name = 'alias' in field && field.alias ? field.alias : fieldName;
        fields[name] = mapToGraphQLOutputField(field, schemaObjects);
      }
    }
    config.query =
      new GraphQLObjectType({
        name: "Query",
        fields
      });
  }

  if (schema.mutations) {
    const fields: GraphQLFieldConfigMap<any, any> = {};
    for (let [fieldName, field] of Object.entries<OutputObject>(schema.mutations)) {
      if (isScalar(field)) {
        fields[fieldName] = mapToGraphQLOutputField(field, schemaObjects);
      } else {
        const name = 'alias' in field && field.alias ? field.alias : fieldName;
        fields[name] = mapToGraphQLOutputField(field, schemaObjects);
      }
    }
    config.mutation =
      new GraphQLObjectType({
        name: "Mutation",
        fields
      });
  }

  return new GraphQLSchema(config);
}

function mapOutputToNullableAndArray(
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

function mapToGraphQLOutputField(
  field: OutputObject, 
  schemaObjects: SchemaObjects,
): GraphQLFieldConfig<any, any, any> {
  let config: GraphQLFieldConfig<any, any, any>;
  if (isScalar(field)) {
    config = {
      type: scalarToGraphQL(field)
    };
  } else if ('type' in field) {
    config = {
      description: field.description,
      deprecationReason: field.deprecationReason,
      type: mapToGraphQLOutputType(field, schemaObjects),
    };
    if (field.argsFields) {
      const args: GraphQLFieldConfigArgumentMap = {}

      for (let [argName, arg] of Object.entries(field.argsFields)) {
        if (isScalar(arg)) {
          args[field.alias || argName] = {
            type: mapToGraphQLInputType(arg, schemaObjects),
          };
        } else {
          args[field.alias || argName] = {
            type: mapToGraphQLInputType(arg, schemaObjects),
            description: arg.description,
            defaultValue: arg.defaultValue,
            deprecationReason: arg.deprecationReason
          };
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
  } else {
    config = {type: field.scalar}
  }
  return config;
}

function mapToGraphQLOutputType(
  object: OutputObject, 
  schemaObjects: SchemaObjects
): GraphQLOutputType {
  let output: GraphQLOutputType;
  if (isScalar(object)) {
    output = scalarToGraphQL(object);
  } else if (object instanceof CustomScalar) {
    output = object.scalar;
  } else if (schemaObjects.outputObjects.has(object.type)) {
    output = schemaObjects.outputObjects.get(object.type);
  } else if (schemaObjects.unions.has(object.type)) {
    output = schemaObjects.unions.get(object.type);
  } else if (isScalar(object.type)) {
    output = scalarToGraphQL(object.type);
  } else if (object.type instanceof CustomScalar) {
    output = object.type.scalar;
  } else if ('union' in object.type) {
    const types: GraphQLObjectType[] = [];

    for (let unionType of object.type.union) {
      types.push(mapToGraphQLObjectType(unionType, schemaObjects));
    }

    output = new GraphQLUnionType({
      name: object.type.name,
      description: object.type.description,
      resolveType: object.type.resolveType,
      types
    });

    schemaObjects.unions.set(object.type, output);
  } else if ('fields' in object.type) {
    output = mapToGraphQLObjectType(object.type, schemaObjects);
  } else if ('enum' in object.type) {
    const values: GraphQLEnumValueConfigMap = {};

    for (let key of Object.keys(object.type.enum)) {
      values[key] = {value: object.type.enum[key]}
    }

    output = new GraphQLEnumType({
      name: object.type.name,
      description: object.description,
      values
    });
  } else {
    throw new Error();
  }
  if (isScalar(object) || object instanceof CustomScalar) {
    return output;
  } else {
    return mapOutputToNullableAndArray(output, object);
  }
}


function mapToGraphQLObjectType(type: ObjectType, schemaObjects: SchemaObjects) {
  const fields: GraphQLFieldConfigMap<any, any> = {};
  const interfaces: GraphQLInterfaceType[] = [];
  if (type.interfaces) {
    for (let interface_ of type.interfaces) {
      const interfaceFields: GraphQLFieldConfigMap<any, any> = {};
      for (let [fieldName, field] of Object.entries<OutputObject>(interface_.fields)) {
        if (isScalar(field)) {
          interfaceFields[fieldName] = mapToGraphQLOutputField(
            field, 
            schemaObjects
          );
        } else {
          const name = 'alias' in field && field.alias ? field.alias : fieldName;
          interfaceFields[name] = mapToGraphQLOutputField(
            field, 
            schemaObjects
          );
        }
      }
      interfaces.push(
        new GraphQLInterfaceType({name: interface_.name, fields: interfaceFields})
      )
    }
  }

  for (let [fieldName, field] of Object.entries<OutputObject>(type.fields)) {
    if (isScalar(field)) {
      fields[fieldName] = mapToGraphQLOutputField(
        field, 
        schemaObjects
      );
    } else {
      const name = 'alias' in field && field.alias ? field.alias : fieldName;
      fields[name] = mapToGraphQLOutputField(
        field, 
        schemaObjects
      );
    }
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

function isScalar(scalar: InputObject | OutputObject | InputType | OutputType): scalar is ScalarTypes {
  switch(scalar) {
    case 'boolean':
      return true;
    case 'string':
      return true;
    case 'float':
      return true;
    case 'int':
      return true;
  }
  return false;
}

function scalarToGraphQL(scalar: ScalarTypes): GraphQLScalarType {
  switch(scalar) {
    case 'boolean':
      return GraphQLBoolean;
    case 'string':
      return GraphQLString;
    case 'float':
      return GraphQLFloat;
    case 'int':
      return GraphQLInt;
  }
}

function mapToGraphQLInputType(input: InputObject, schemaObjects: SchemaObjects): GraphQLInputType {
  let graphqlInput: GraphQLInputType;
  if (isScalar(input)) {
    return mapInputToNullableAndArray(scalarToGraphQL(input), {});
  } else if (isScalar(input.type)) {
    return mapInputToNullableAndArray(scalarToGraphQL(input.type), input);
  } else if (input.type instanceof CustomScalar) {
    graphqlInput = input.type.scalar;
  } else if (schemaObjects.inputObjects.has(input.type)) {
    graphqlInput = schemaObjects.inputObjects.get(input.type);
  } else if ('fields' in input.type) {
    const fields: GraphQLInputFieldConfigMap = {};
    for (let [fieldName, field] of Object.entries<InputObject>(input.type.fields)) {
      if (isScalar(field)) {
        fields[fieldName] = {
          type: mapToGraphQLInputType(field, schemaObjects)
        };
      } else {
        fields[field.alias || fieldName] = {
          description: field.description,
          type: mapToGraphQLInputType(field, schemaObjects),
          defaultValue: field.defaultValue,
          deprecationReason: field.deprecationReason,
        }
      } 
    }
    graphqlInput = new GraphQLInputObjectType({
      name: input.type.name,
      description: input.description,
      fields
    });
  } else if ('enum' in input.type) {
    const values: GraphQLEnumValueConfigMap = {};

    for (let key of Object.keys(input.type.enum)) {
      values[key] = {value: input.type.enum[key]}
    }

    graphqlInput = new GraphQLEnumType({
      name: input.type.name,
      description: input.type.description,
      values
    });
  } else {
    throw new Error();
  }
  return mapInputToNullableAndArray(graphqlInput, input);
}