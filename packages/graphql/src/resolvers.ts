import { ValidateArgs } from "./common";
import {
  Exact,
  GenerateNullabilityAndArrayRuntimeOptions,
  GetRawReturnType,
  GetRuntimeScalarType,
  GetUnderlyingType,
  IsCompileTimeScalar,
  IsNonNullCompileTimeScalar
} from "./types";

export type ValidateResolver<Resolver, Root, RootFieldType, Context> =
  [Resolver] extends [{
    type?: infer Type
    alias?: infer Alias,
    description?: infer Description,
    deprecationReason?: infer DeprecationReason,
    nullable?: infer Nullability,
    array?: infer ArrayType,
    argsFields?: infer ArgsRuntimeTypes,
    resolve?: infer ResolverFunction
  }]
    ? { description?: Description, deprecationReason?: DeprecationReason, alias?: Alias }
        & ValidateResolverFunction<
            ResolverFunction, 
            Root, 
            ReturnTypeForRoot<ResolverFunction, RootFieldType>, 
            GetObjectFieldsFromType<Type>, 
            Context
          >
         
    : [Resolver] extends [infer OnlyScalar]
      ? [IsNonNullCompileTimeScalar<RootFieldType>] extends [true]
        ? GetRuntimeScalarType<RootFieldType>
        : "Can't infer resolver type"
      : "Can't infer resolver type"

export type ValidateAdditionalResolver<Resolver, Root, Context> =
  [Resolver] extends [{
    type?: infer Type
    alias?: infer Alias,
    description?: infer Description,
    deprecationReason?: infer DeprecationReason,
    nullable?: infer Nullability,
    array?: infer ArrayType,
    argsFields?: infer ArgsRuntimeTypes,
    resolve?: infer ResolverFunction
  }]
    ? [ResolverFunction] extends [(...args: infer X) => infer RT]
      ? { description?: Description, deprecationReason?: DeprecationReason, alias?: Alias }
          & ValidateResolverFunction<
              ResolverFunction, 
              Root, 
              ReturnTypeForResolver<ResolverFunction>, 
              GetObjectFieldsFromType<Type>, 
              Context
            >
      : "Resolve function is required on additional fields"
    : "Resolve function is required on additional fields"

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
        ScalarOrObjectType<RootFieldType, ObjectFields, Context>
          & { resolve?: never, argsFields?: never}
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
              & ValidateArgs<RootOrArgs>
              & { 
                resolve: ((args: RootOrArgs) => RootFieldType) 
                        | ((args: RootOrArgs) => Promise<RootFieldType>)
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
                & ValidateArgs<RootOrArgs>
                & { 
                  resolve: ((args: RootOrArgs, root: Root) => RootFieldType) 
                          | ((args: RootOrArgs, root: Root) => Promise<RootFieldType>)
                }
              )
          : [ResolverFunction] extends [(args: infer Args, root: infer X, context: infer Z) => infer ReturnType]
            ? (
                ScalarOrObjectType<RootFieldType, ObjectFields, Context> 
                & ValidateArgs<Args>
                & { 
                    resolve: ((args: Args, root: Root, context: Context) => RootFieldType) 
                            | ((args: Args, root: Root, context: Context) => Promise<RootFieldType>)
                  }
              )
            : {
                resolve: "Resolver function invalid"
              }

export type ScalarOrObjectType<RootFieldType, ObjectFields, Context> =
  [IsCompileTimeScalar<RootFieldType>] extends [true]
    ? {
        type: 
          NonNullScalar<
            RootFieldType, 
            {
              scalar: GetRuntimeScalarType<RootFieldType>,
              objectName?: never,
              objectFields?: never
            } & GenerateNullabilityAndArrayRuntimeOptions<RootFieldType>
        >
      }
    : {
        type: {
          objectName: string,
          objectFields: {
            [Key in keyof ObjectFields]:
              [Key] extends [keyof GetUnderlyingType<RootFieldType>]
                ? ValidateResolver<
                    ObjectFields[Key],
                    GetUnderlyingType<RootFieldType>, 
                    GetUnderlyingType<RootFieldType>[Key], 
                    Context
                  >
                  // Additional properties on object fields are possible.
                : ValidateAdditionalResolver<
                    ObjectFields[Key],
                    GetUnderlyingType<RootFieldType>, 
                    Context
                  >
          }
        } & GenerateNullabilityAndArrayRuntimeOptions<RootFieldType>
      }

export type NonNullScalar<Scalar, Resolver> =
  [IsNonNullCompileTimeScalar<Scalar>] extends [true]
    ? GetRuntimeScalarType<Scalar> | Resolver
    : Resolver

export type ReturnTypeForRoot<ResolverFunction, RootFieldType> =
  [unknown] extends [RootFieldType]
    ? [ResolverFunction] extends [(...args: infer Args) => infer ReturnType]
      ? GetRawReturnType<ReturnType>
      : "Unable to determine return type for root query"
    : RootFieldType

export type ReturnTypeForResolver<ResolverFunction> =
  [ResolverFunction] extends [(...args: infer Args) => infer ReturnType]
    ? GetRawReturnType<ReturnType>
    : "Unable to determine return type for root query"

export type GetObjectFieldsFromType<Type> = 
  [Type] extends [{
    objectFields: infer ObjectFields
  }] ? ObjectFields : unknown
