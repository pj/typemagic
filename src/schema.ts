import { GraphQLBoolean, GraphQLFieldConfigMap, GraphQLFloat, GraphQLInt, GraphQLObjectType, GraphQLScalarType, GraphQLSchema, GraphQLString } from "graphql";
import { Float, GraphQLISODateTime, Int } from "type-graphql";
import { Mutation } from "./mutation";
import { Resolver } from "./output";

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

export function schema<Queries, Mutations, Context = any>(
  schema: {
    queries?: RootQueries<Queries, Context>,
    mutations?: RootMutations<Mutations, Context>
  }
) {

  // const queries: GraphQLFieldConfigMap<any, any> = {};
  // if (schema.queries) {
  //   for (let [name, query] of Object.entries(schema.queries)) {
  //     name = query.name || name;
  //     queries[name] = {
  //       type: mapToGraphQLType(query.output),
  //       resolve: (
  //         source: any,
  //         args: any,
  //         context: any,
  //       ) => {
  //         return query.resolve(args, source, context);
  //       }
  //     }
  //   }
  // }

  // new GraphQLSchema({
  //   query: new GraphQLObjectType({
  //     name: 'Query',
  //     fields:
  //     {
  //       ...queries,
  //       hello: {
  //         type: GraphQLString,
  //         resolve() {
  //           return 'world';
  //         },
  //       },
  //     },
  //   }),
  // });
}

// function mapToGraphQLType(type: RegisteredOutputWithScalars<any, any>): GraphQLScalarType | GraphQLObjectType {
//   switch (type) {
//     case Int: return GraphQLInt
//     case Float: return GraphQLFloat
//     case String: return GraphQLString
//     case Boolean: return GraphQLBoolean
//     case Date: return GraphQLISODateTime
//     default:
//       if (type instanceof RegisteredOutputObject) {
//         const name = type.name || type.source.name;
//         const fields = {};
//         for (let [name, field] of Object.entries(type.fieldTypes)) {
//           if (field === undefined) {
//             continue;
//           }
//           if (field instanceof Nullable) {

//           }
//           name = field.name || name;
//           queries[name] = {
//             type: mapToGraphQLType(query.output),
//             resolve: (
//               source: any,
//               args: any,
//               context: any,
//             ) => {
//               return query.resolve(args, source, context);
//             }
//           }
//         }

//         return new GraphQLObjectType({
//           name,
//           fields
//         });
//       } else {
//         throw new Error(`Unknown type: ${type}`)
//       }
//   }
// }
