import { ValidateArgs, ValidateRuntimeTypes } from "./common";
import { 
  Constructor,
  Exact,
  GenerateNullabilityAndArrayRuntimeOptions, GetRawReturnType, RegisteredEnum, ScalarTypes, 
} from "./types";

// export type Name<X extends string, C> = Name<X, C> | null;

export type ValidateResolvers<Resolvers, Root, Context> =
  {
    [Key in keyof Resolvers]:
      ValidateResolver<Resolvers[Key], Root, Context>
  }

export type ValidateResolver<Resolver, Root, Context> =
  [Resolver] extends [{
    type?: infer ScalarType
    alias?: infer Alias,
    objectName?: infer ObjectName,
    description?: infer Description,
    deprecationReason?: infer DeprecationReason,
    nullable?: infer Nullability,
    array?: infer ArrayType,
    argsFields?: infer ArgsRuntimeTypes,
    resolve?: infer ResolverFunction
    objectFields?: infer ObjectFields
  }]
    ? { description?: Description, deprecationReason?: DeprecationReason, alias?: Alias }
      & ValidateRuntimeTypes<ObjectFields, ResolverFunction, Context, ScalarType>
      & ValidateResolverFunction<ResolverFunction, Root, Context>
      & GenerateNullabilityAndArrayRuntimeOptions<
          [ResolverFunction] extends [(...args: infer X) => GetRawReturnType<infer ReturnType>] ? ReturnType : unknown
        >
    : {resolve: ["Can't infer type", Resolver, Root, Context]}

export function resolver<Root, Context, Resolver extends ValidateResolver<Resolver, Root, Context>>(
  root: Root | Constructor<Root>,
  context: Context | Constructor<Context>,
  resolver: Resolver
) {
  return resolver;
}

export type ValidateResolverFunction<ResolverFunction, Root, Context> =
  [unknown] extends [ResolverFunction]
    ? {resolve?: never, argsFields?: "No resolve function so no args"}
    : [ResolverFunction] extends [(first: infer First, second: infer Second, third: infer Third) => infer ReturnType]
      ? [Exact<First, Root>] extends [true]
        ? [ResolverFunction] extends [
            ((root: Root, context: Context) => ReturnType) 
            | ((root: Root) => ReturnType) 
            | (() => ReturnType)
          ]
            ? {
                resolve: ResolverFunction,
                argsFields?: never
              }
            : {resolve: {error: "Should not happen, make github issue.", function: ResolverFunction}}
        : [ResolverFunction] extends [
            ((args: First, root: Root, context: Context) => ReturnType) 
            | ((args: First, root: Root) => ReturnType) 
            | ((args: First) => ReturnType) 
          ]
            ? {
                resolve: ResolverFunction,
              }
              & ValidateArgs<First>
            : {resolve: ["Resolver function should have format like (args: Args, root: Root, context: Context) => Promise<Something>", ResolverFunction]}
      : never
