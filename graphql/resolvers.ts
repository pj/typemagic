import { ValidateArgs, ValidateRuntimeTypes } from "./common";
import { 
  Exact,
  GenerateNullabilityAndArrayRuntimeOptions, RegisteredEnum, ScalarTypes, 
} from "./types";

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
    objectFields?: infer RuntimeTypes
  }]
    ? { description?: Description, deprecationReason?: DeprecationReason, alias?: Alias }
      & ValidateRuntimeTypes<RuntimeTypes, ResolverFunction, Context, ScalarType>
      & ValidateResolverFunction<ResolverFunction, Root, Context>
      & GenerateNullabilityAndArrayRuntimeOptions<
          [ResolverFunction] extends [(...args: infer X) => Promise<infer ReturnType>] ? ReturnType : unknown
        >
    : {resolve: ["Can't infer type", Resolver, Root, Context]}

export type ValidateResolverFunction<ResolverFunction, Root, Context> =
  [unknown] extends [ResolverFunction]
    ? unknown
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
