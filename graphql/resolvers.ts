import { ValidateArgs, ValidateRuntimeTypes } from "./common";
import { 
  CompileTimeTypeFromConstructor, 
  GenerateNullabilityAndArrayRuntimeOptions, 
} from "./types";

export type ValidateResolverFunction<ResolverFunction, ArgsConstructor, Root, Context> =
  [unknown] extends [ResolverFunction]
    ? unknown
    : [ResolverFunction] extends [(first: infer First, second: infer Second, third: infer Third) => infer ReturnType]
      ? [unknown] extends [ArgsConstructor]
        ? ((root: Root, context: Context) => ReturnType) 
          | ((root: Root) => ReturnType) 
          | (() => ReturnType)
        : ((args: CompileTimeTypeFromConstructor<ArgsConstructor>, root: Root, context: Context) => ReturnType) 
          | ((args: CompileTimeTypeFromConstructor<ArgsConstructor>, root: Root) => ReturnType) 
          | ((args: CompileTimeTypeFromConstructor<ArgsConstructor>) => ReturnType) 
          | (() => ReturnType)
      : never

export type ValidateResolverFunctionAndArgs<ResolverFunction, ArgsConstructor, Root, Context> =
  [unknown] extends [ResolverFunction] 
    ? {resolve?: never, args?: never} 
    : [ResolverFunction] extends [ValidateResolverFunction<ResolverFunction, ArgsConstructor, Root, Context>]
      ? [unknown] extends [ArgsConstructor]
        ? {
          resolve: ResolverFunction, 
          args?: never
        }
        : {
            resolve: ResolverFunction, 
          } & (
            [ResolverFunction] extends [(first: infer First, second: infer Second, third: infer Third) => infer ReturnType]
              ? [unknown] extends [First] 
                ? {args?: never}
                : ValidateArgs<CompileTimeTypeFromConstructor<ArgsConstructor>>
              : {args?: never}
          )
      : {resolve: ["ResolverFunction isn't valid", ValidateResolverFunction<ResolverFunction, ArgsConstructor, Root, Context>, Root]}

export type ValidateResolver<Resolver, Root, Context> =
  [Resolver] extends [{
    name?: infer Name,
    description?: infer Description,
    deprecationReason?: infer DeprecationReason,
    type?: infer Type,
    nullable?: infer Nullability,
    array?: infer ArrayType,
    args?: {
      type?: infer ArgsConstructor,
      runtimeTypes?: infer ArgsRuntimeTypes
    },
    resolve?: infer ResolverFunction
    runtimeTypes?: infer RuntimeTypes
  }]
    ? { name?: Name, description?: Description, deprecationReason?: DeprecationReason }
      & ValidateRuntimeTypes<RuntimeTypes, Type, ResolverFunction, Context>
      & ValidateResolverFunctionAndArgs<ResolverFunction, ArgsConstructor, Root, Context>
      & GenerateNullabilityAndArrayRuntimeOptions<
          [ResolverFunction] extends [(...args: infer X) => Promise<infer ReturnType>] ? ReturnType : unknown
        >
    : {resolve: ["Can't infer type", Resolver, Root, Context]}

export type ValidateResolvers<Resolvers, Root, Context> =
  {
    [Key in keyof Resolvers]:
      ValidateResolver<Resolvers[Key], Root, Context>
  }