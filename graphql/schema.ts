import { 
  GraphQLBoolean, 
  GraphQLFieldConfig, 
  GraphQLFieldConfigMap, 
  GraphQLFloat, 
  GraphQLInt, 
  GraphQLList, 
  GraphQLNonNull, 
  GraphQLObjectType, 
  GraphQLScalarType, 
  GraphQLSchema, 
  GraphQLSchemaConfig, 
  GraphQLString, 
  GraphQLType 
} from "graphql";
import { GraphQLISODateTime } from "type-graphql";
import { ValidateMutations } from "./mutation";
import { ArrayTrilean, ScalarTypes } from "./types";
import { ValidateResolvers } from "./resolvers"

export class QueryRoot {

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
          ? {queries?: undefined}
          : {queries: ValidateResolvers<Queries, QueryRoot, Context>}
      ) 
    & 
      (
        [undefined] extends [Mutations]
          ? {mutations?: undefined}
          : {mutations: ValidateMutations<Mutations, Context>}
      )
  : never

type SchemaResolver = {
  name?: string,
  description?: string,
  deprecationReason?: string,
  type?: ScalarTypes | object,
  nullable?: boolean,
  array?: ArrayTrilean,
  argsFields?: object,
  resolve?: Function
  objectFields?: object
}

export function schema<Schema extends ValidateSchema<Schema, Context>, Context = any>(
  schema: Schema
) {
  const queries: GraphQLFieldConfigMap<any, any> = {};
  if (schema.queries) {
    for (let [name, query] of Object.entries<SchemaResolver>(schema.queries)) {
      name = query.name || name;
      const graphqlQuery: GraphQLFieldConfig<any, any> = {
        type: mapToGraphQLType(query),
        description: query.description,
        deprecationReason: query.deprecationReason
      };
      if (query.resolve !== undefined) {
        const resolver = query.resolve;
        graphqlQuery.resolve = (
          source: any,
          args: any,
          context: any,
        ) => {
          return resolver(args, source, context);
        }
      }

      queries[name] = graphqlQuery;
    }
  }

  const config: GraphQLSchemaConfig = {};

  // if (schema.queries) {
  //   config.query = mapToGraphQLType(schema.queries)
  // }

  new GraphQLSchema(config);
}

// export interface GraphQLField<
//   name: string;
//   description: Maybe<string>;
//   type: GraphQLOutputType;
//   args: Array<GraphQLArgument>;
//   resolve?: GraphQLFieldResolver<TSource, TContext, TArgs>;
//   deprecationReason: Maybe<string>;
// }

// export interface GraphQLFieldConfig<
//   description?: Maybe<string>;
//   type: GraphQLOutputType;
//   args?: GraphQLFieldConfigArgumentMap;
//   resolve?: GraphQLFieldResolver<TSource, TContext, TArgs>;
//   deprecationReason?: Maybe<string>;

// export class GraphQLObjectType<TSource = any, TContext = any> {
//   name: string;
//   description: Maybe<string>;
//   isTypeOf: Maybe<GraphQLIsTypeOfFn<TSource, TContext>>;
//   constructor(config: Readonly<GraphQLObjectTypeConfig<TSource, TContext>>);
// }

function mapNullableAndArray(type: GraphQLType, options: any): GraphQLType {
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

function mapToGraphQLType(type: any): GraphQLScalarType | GraphQLObjectType {
  const name = type.name || type.type.name;
  const runtimeTypes: GraphQLFieldConfigMap<any, any> = {};
  // for (let [name, query] of Object.entries<SchemaResolver>(type.runtimeTypes)) {
  //   if (field === undefined) {
  //     continue;
  //   }
  //   name = field.name || name;
  //   const runtimeType: GraphQLFieldConfig<any, any> = {
  //     type: mapToGraphQLType(query),
  //     description: query.description,
  //     deprecationReason: query.deprecationReason
  //   };

  //   runtimeTypes[name] = {
  //     type: mapToGraphQLType(field.type),
  //     description: field.description,
  //     deprecationReason: field.deprecationReason,
  //     // args: [],
  //     resolve: field.resolve ? (
  //       source: any,
  //       args: any,
  //       context: any,
  //     ) => {
  //       return field.resolve(args, source, context);
  //     } : undefined
  //   }
  // }

  return new GraphQLObjectType({
    name,
    description: type.description,
    fields: runtimeTypes
  });
}
