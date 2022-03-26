import { ValidateArgs } from "./common";
import {
  CreateSchemaOptions, Exact, GetSchemaScalar,
  GetUnderlyingType, IsNonNullNonArrayTypeScalar, IsTypeScalar, RemovePromise, SchemaTypeToType
} from "./types";

export type ValidateResolver<Resolver, Root, RootFieldType, Context> =
  [Resolver] extends [{
    type?: infer Type,
    alias?: infer Alias,
    description?: infer Description,
    argsFields?: infer ArgsRuntimeTypes,
    resolve?: infer ResolverFunction
  }]
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
    : [IsNonNullNonArrayTypeScalar<RootFieldType>] extends [true]
      ? GetSchemaScalar<RootFieldType>
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

export type UnionTypeNames<UnionType> = 
  UnionType extends {objectName: infer Name} ? Name : never


export type ScalarOrObjectType<ReturnType, Context, Type> =
  [Type] extends [{enum: infer Enum, name: infer Name, description?: infer Description}]
    ? {type: {enum: Enum, name: Name, description?: Description}}
    : IsTypeScalar<ReturnType> extends true
      ? {
          type: GetSchemaScalar<ReturnType>
        }
        : Type extends {unionName: infer UnionName, unionTypes: infer UnionTypes}
          ? UnionTypes extends Readonly<unknown[]>
            ? UnionItemToReturnType<UnionTypes[number]> extends infer Unionized
              ? Exact<Unionized, ReturnType> extends true
                ? { 
                    type: {
                      unionName: UnionName, 
                      unionTypes: UnionTypes, 
                      resolveType?: (value: ReturnType) => UnionTypeNames<UnionTypes[number]>
                    }
                  }
                : {
                    unionName: UnionName, 
                    type: "Union type does not match return type"
                  }
              : never
            : {
                type: {
                  unionName: UnionName, 
                  unionTypes: "Union types should be an array"
                }
              }
          : Type extends {
              objectName: string,
              description?: string,
              deprecationReason?: string,
              objectFields: infer ObjectFields,
              interfaces?: infer Interfaces
            }
              ? {
                  type: ({
                    objectName: string,
                    description?: string,
                    deprecationReason?: string,
                    objectFields: {
                      [Key in keyof ObjectFields]:
                        [Key] extends [keyof GetUnderlyingType<ReturnType>]
                          ? ValidateResolver<
                              ObjectFields[Key],
                              GetUnderlyingType<ReturnType>, 
                              GetUnderlyingType<ReturnType>[Key], 
                              Context
                            >
                            // Additional properties on object fields are possible.
                          : ValidateAdditionalResolver<
                              ObjectFields[Key],
                              GetUnderlyingType<ReturnType>, 
                              Context
                            >
                  }
                }) 
                & (
                      unknown extends Interfaces
                        ? {}
                        : {
                            interfaces: {
                              [Key in keyof Interfaces]: 
                                ReturnTypeExtendsInterface<Interfaces[Key], ReturnType, Context>
                            }
                          }
                    )
                }
              : {type: "Not an object" }

export type HandleNonNullNonArrayTypeScalar<Scalar, Resolver> =
  [IsNonNullNonArrayTypeScalar<Scalar>] extends [true]
    ? GetSchemaScalar<Scalar> | Resolver
    : Resolver

export type ReturnTypeForRoot<ResolverFunction, RootFieldType> =
  [unknown] extends [RootFieldType]
    ? [ResolverFunction] extends [(...args: infer Args) => infer ReturnType]
      ? RemovePromise<ReturnType>
      : "Unable to determine return type for root query"
    : RootFieldType

export type NormalEnum<RootFieldType, Enum> = 
  { 
    type: {
      enum: Enum 
    }
  } & CreateSchemaOptions<RootFieldType>

export type HandleEnum<RootFieldType, Type, Enum, NotEnum> =
  [unknown] extends [Enum]
    ? [Type] extends [{enum: infer TypeEnum}] 
      ? NormalEnum<RootFieldType, TypeEnum>
      : NotEnum
    : [IsNonNullNonArrayTypeScalar<RootFieldType>] extends [true]
        ? {enum: Enum} | NormalEnum<RootFieldType, Enum>
        : NormalEnum<RootFieldType, Enum>

export type UnionItemToReturnType<Item> =
  Item extends {objectFields: infer Fields}
    ? {
      [Key in keyof Fields]: SchemaTypeToType<Fields[Key]>
    }
    : never

export type ReturnTypeExtendsInterface<Interface, ReturnType, Context> =
  Interface extends {name: infer Name, fields: infer Fields}
    ? {
        name: Name,
        description?: string,
        deprecationReason?: string,
        // Fixme: Can we infer all the possible names this could be?
        resolveType?: (value: ReturnType) => string,
        fields: {
          [Key in keyof Fields]:
            Key extends keyof GetUnderlyingType<ReturnType>
              ? ValidateResolver<
                  Fields[Key],
                  GetUnderlyingType<ReturnType>, 
                  GetUnderlyingType<ReturnType>[Key], 
                  Context
                >
              : "Interface can't have fields that aren't in return type."
        }
      }
    : "Interface is incorrect"

export function resolver<
  Context, 
  Root, 
  RootField, 
  X extends ValidateResolver<X, Root, RootField, Context> = any
>(resolver: X) {
  return resolver;
}