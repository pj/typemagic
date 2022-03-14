import { GraphQLBoolean, GraphQLFieldConfigMap, GraphQLFloat, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLScalarType, GraphQLSchema, GraphQLString, GraphQLType } from "graphql";
import { GraphQLISODateTime } from "type-graphql";
import { Mutation, ValidateMutations } from "./mutation";
import { Resolver } from "./output";
import { ScalarTypes } from "./types";
import { ValidateResolvers } from "./validate";

export class QueryRoot {

}

export type RootQueries<Queries, Context> =
  {
    [Key in keyof Queries]: Resolver<QueryRoot, Context, unknown, Queries[Key]>
  }

export type RootMutations<Mutations, Context> =
  {
    [Key in keyof Mutations]: Mutation<Context, unknown, Mutations[Key]>
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
          : {mutations: ValidateMutations<Mutations>}
      )
  : never

export function schema<Schema extends ValidateSchema<Schema, Context>, Context = any>(
  schema: Schema
) {

  const queries: GraphQLFieldConfigMap<any, any> = {};
  if (schema.queries) {
    for (let [name, query] of Object.entries<any>(schema.queries)) {
      name = query.name || name;
      queries[name] = {
        type: mapToGraphQLType(query.output),
        resolve: (
          source: any,
          args: any,
          context: any,
        ) => {
          return query.resolve(args, source, context);
        }
      }
    }
  }

  new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: queries,
    }),
  });
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
  switch (type) {
    case ScalarTypes.INT: return GraphQLInt
    case ScalarTypes.FLOAT: return GraphQLFloat
    case ScalarTypes.STRING: return GraphQLString
    case ScalarTypes.BOOLEAN: return GraphQLBoolean
    case ScalarTypes.DATE: return GraphQLISODateTime
    default:
      const name = type.name || type.type.name;
      const runtimeTypes: GraphQLFieldConfigMap<any, any> = {};
      for (let [name, field] of Object.entries<any>(type.runtimeTypes)) {
        if (field === undefined) {
          continue;
        }
        name = field.name || name;
        runtimeTypes[name] = {
          type: mapToGraphQLType(field.type),
          description: field.description,
          deprecationReason: field.deprecationReason,
          // args: [],
          resolve: field.resolve ? (
            source: any,
            args: any,
            context: any,
          ) => {
            return field.resolve(args, source, context);
          } : undefined
        }
      }

      return new GraphQLObjectType({
        name,
        description: type.description,
        fields: runtimeTypes
      });
  }
}
