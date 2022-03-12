import { GraphQLBoolean, GraphQLFieldConfigMap, GraphQLFloat, GraphQLInt, GraphQLObjectType, GraphQLScalarType, GraphQLSchema, GraphQLString } from "graphql";
import { Float, GraphQLISODateTime, Int } from "type-graphql";
import { Mutation } from "./mutation";
import { Resolver } from "./output";

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

class QueryRoot {

}

export function schema<ResolverOutput, Context = any>(
  schema: {
    queries?: {
      [key: string]: Resolver<QueryRoot, Context, ResolverOutput>
    },
    mutations?: {
      [key: string]: Mutation<Context, any, any, any, any>
    }
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
