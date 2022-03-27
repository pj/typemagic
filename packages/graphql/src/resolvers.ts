import { ValidateArgs } from "./common";
import { HandleOutputObject } from "./object";
import {
  CreateSchemaOptions, Exact, GetSchemaScalar, IsNonNullNonArrayTypeScalar, IsTypeScalar, RemovePromise
} from "./types";
import { HandleUnion } from "./union";

export type ValidateResolver<Resolver, Root, RootFieldType, Context> =
  [IsNonNullNonArrayTypeScalar<RootFieldType>] extends [true]
    ? GetSchemaScalar<RootFieldType>
    : [Resolver] extends [
        {
          type?: infer Type,
          alias?: infer Alias,
          description?: infer Description,
          argsFields?: infer ArgsRuntimeTypes,
          resolve?: infer ResolverFunction
        }
      ]
        ? { description?: Description, alias?: Alias }
          & ScalarOrObjectType<ReturnTypeForRoot<ResolverFunction, RootFieldType>, Context, Type>
          & CreateSchemaOptions<ReturnTypeForRoot<ResolverFunction, RootFieldType>>
          & ValidateResolverFunction<
              ResolverFunction, 
              Root, 
              ReturnTypeForRoot<ResolverFunction, RootFieldType>, 
              Context,
              Type
            >
        : "Can't infer resolver type"

export type ValidateAdditionalResolver<Resolver, Root, Context> =
  [Resolver] extends [{
    type?: infer Type
    alias?: infer Alias,
    description?: infer Description,
    deprecationReason?: infer DeprecationReason,
    argsFields?: infer ArgsRuntimeTypes,
    resolve?: infer ResolverFunction
  }]
    ? [ResolverFunction] extends [(...args: infer X) => infer RT]
      ? { description?: Description, deprecationReason?: DeprecationReason, alias?: Alias }
        & ScalarOrObjectType<RT, Context, Type>
        & CreateSchemaOptions<RT>
        & ValidateResolverFunction<
            ResolverFunction, 
            Root, 
            RT, 
            Context,
            Type
          >
      : "Resolve function is required on additional fields"
    : "Resolve function is required on additional fields"

export type ValidateResolverFunction<ResolverFunction, Root, RootFieldType, Context, Type> =
  (
    [unknown] extends [ResolverFunction]
      ? { resolve?: never, argsFields?: never}
      : [ResolverFunction] extends [(rootOrArgs: infer RootOrArgs, rootOrContext: infer RootOrContext, context: infer X) => infer ReturnType]
        ? [unknown] extends [RootOrArgs]
          ? { 
              argsFields?: never,
              resolve: ((root: Root, context: Context) => RootFieldType) 
                      | ((root: Root, context: Context) => Promise<RootFieldType>)
            }
          : [Exact<RootOrArgs, Root>] extends [true]
            ? { 
                argsFields?: never,
                resolve: ((root: Root, context: Context) => RootFieldType) 
                        | ((root: Root, context: Context) => Promise<RootFieldType>)
              }
            : ValidateArgs<RootOrArgs>
              & { 
                  resolve: ((args: RootOrArgs, root: Root, context: Context) => RootFieldType) 
                          | ((args: RootOrArgs, root: Root, context: Context) => Promise<RootFieldType>)
                }
        : {resolve: "Invalid resolver"} 
  )

export type ScalarOrObjectType<ReturnType, Context, Type> =
  Type extends {enum: infer Enum, name: infer Name, description?: infer Description}
    ? {
        type: {
          enum: Enum, 
          name: Name, 
          description?: Description
        }
      }
    : IsTypeScalar<ReturnType> extends true
      ? {
          type: GetSchemaScalar<ReturnType>
        }
      : Type extends {union: infer Union} 
        ? HandleUnion<Type, ReturnType>
        : HandleOutputObject<Type, ReturnType, Context>

export type ReturnTypeForRoot<ResolverFunction, RootFieldType> =
  [unknown] extends [RootFieldType]
    ? [ResolverFunction] extends [(...args: infer Args) => infer ReturnType]
      ? RemovePromise<ReturnType>
      : "Unable to determine return type for root query"
    : RootFieldType

export function resolver<
  Context, 
  Root, 
  RootField, 
  X extends ValidateResolver<X, Root, RootField, Context> = any
>(resolver: X) {
  return resolver;
}