import { ValidateInputRuntimeTypes } from "./common";
import {
  Exact,
  GenerateNullabilityAndArrayRuntimeOptions, 
  GetRuntimeScalarType, 
  GetUnderlyingType, 
  IsCompileTimeScalar, 
  IsNonNullCompileTimeScalar
} from "./types";

// export type Name<X extends string, C> = Name<X, C> | null;

export type ValidateResolvers<Resolvers, Root, Context> =
  {
    [Key in keyof Resolvers]:
      [Key] extends [keyof Root]
        ? ValidateResolver<Resolvers[Key], Root, Root[Key], Context>
        : "Unknown key"
  }

export type ValidateResolver<Resolver, Root, RootFieldType, Context> =
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
      & ValidateResolverFunction<ResolverFunction, Root, ReturnTypeForRoot<ResolverFunction, RootFieldType>, ObjectFields, Context>
      & GenerateNullabilityAndArrayRuntimeOptions<RootFieldType> 
    : {resolve: ["Can't infer type", Resolver, Root, Context]}

// export function resolver<Root, Context, Resolver extends ValidateResolver<Resolver, Root, Context>>(
//   root: Root | Constructor<Root>,
//   context: Context | Constructor<Context>,
//   resolver: Resolver
// ) {
//   return resolver;
// }

export type ValidateResolverFunction<ResolverFunction, Root, RootFieldType, ObjectFields, Context> =
  [unknown] extends [ResolverFunction]
    ? (
        NonNullScalar<RootFieldType, ScalarOrObjectType<RootFieldType, ObjectFields, Context>>
        & { resolve?: never, argsFields?: never}
      )
    : [ResolverFunction] extends [(args: infer Args, root: infer X, context: infer Z) => infer ReturnType]
      ? (
          ScalarOrObjectType<RootFieldType, ObjectFields, Context> 
          & ValidateInputRuntimeTypes<Args>
          & { 
              resolve: ((args: Args, root: Root, context: Context) => RootFieldType) 
                      | ((args: Args, root: Root, context: Context) => Promise<RootFieldType>)
            }
        )
      : [ResolverFunction] extends [(rootOrArgs: infer RootOrArgs, rootOrContext: infer RootOrContext) => infer ReturnType]
        ? [Exact<RootOrArgs, Root>] extends [true]
          ? (
              ScalarOrObjectType<RootFieldType, ObjectFields, Context> 
              & { 
                  argsFields?: never,
                  resolve: ((root: Root, context: Context) => RootFieldType) 
                           | ((root: Root, context: Context) => Promise<RootFieldType>)
                }
            )
          : (
              ScalarOrObjectType<RootFieldType, ObjectFields, Context> 
              & ValidateInputRuntimeTypes<RootOrArgs>
              & { 
                resolve: ((args: RootOrArgs, root: Root) => RootFieldType) 
                         | ((args: RootOrArgs, root: Root) => Promise<RootFieldType>)
              }
            )
        : [ResolverFunction] extends [(rootOrArgs: infer RootOrArgs) => infer ReturnType]
          ? [Exact<RootOrArgs, Root>] extends [true]
            ? (
                ScalarOrObjectType<RootFieldType, ObjectFields, Context> 
                & { 
                    argsFields?: never,
                    resolve: ((root: Root) => RootFieldType) 
                            | ((root: Root) => Promise<RootFieldType>)
                  }
              )
            : (
                ScalarOrObjectType<RootFieldType, ObjectFields, Context> 
                & ValidateInputRuntimeTypes<RootOrArgs>
                & { 
                  resolve: ((args: RootOrArgs) => RootFieldType) 
                          | ((args: RootOrArgs) => Promise<RootFieldType>)
                }
              )
          : [ResolverFunction] extends [() => infer ReturnType]
            ? (
                ScalarOrObjectType<RootFieldType, ObjectFields, Context> 
                & { 
                    argsFields?: never,
                    resolve: (() => RootFieldType) 
                            | (() => Promise<RootFieldType>)
                  }
              )
            : {
                resolve: "Resolver function invalid"
              }

export type ScalarOrObjectType<RootFieldType, RuntimeTypes, Context> =
  [IsCompileTimeScalar<RootFieldType>] extends [true]
    ? {
        type: GetRuntimeScalarType<RootFieldType>,
        objectName?: never,
        objectFields?: never
      }
    : {
        objectName: string,
        objectFields: {
          [Key in keyof RuntimeTypes]:
            [Key] extends [keyof GetUnderlyingType<RootFieldType>]
              ? ValidateResolver<
                  RuntimeTypes[Key],
                  GetUnderlyingType<RootFieldType>, 
                  GetUnderlyingType<RootFieldType>[Key], 
                  Context
                >
              : ["here", RootFieldType]
        }
      }

export type NonNullScalar<Scalar, Resolver> =
  [IsNonNullCompileTimeScalar<Scalar>] extends [true]
    ? GetRuntimeScalarType<Scalar> | Resolver
    : Resolver

export type ReturnTypeForRoot<ResolverFunction, RootFieldType> =
  [RootFieldType] extends [unknown]
    ? [ResolverFunction] extends [(...args: infer Args) => infer ReturnType]
      ? ReturnType
      : "Unable to determine return type for root query"
    : RootFieldType
