import { ValidateArgs } from "./common";
import {
  CreateSchemaOptions, Exact, GetSchemaScalar,
  GetUnderlyingType, IsNonNullNonArrayTypeScalar, IsTypeScalar, RemovePromise, SchemaTypeToType
} from "./types";

export type ValidateResolver<Resolver, Root, RootFieldType, Context> =
  [Resolver] extends [{
    type?: infer Type,
    // enum?: infer Enum,
    alias?: infer Alias,
    description?: infer Description,
    argsFields?: infer ArgsRuntimeTypes,
    resolve?: infer ResolverFunction
  }]
    ? { description?: Description, alias?: Alias }
      & ScalarOrObjectType<ReturnTypeForRoot<ResolverFunction, RootFieldType>, GetObjectFields<Type>, Context, Type>
      & CreateSchemaOptions<ReturnTypeForRoot<ResolverFunction, RootFieldType>>
      & ValidateResolverFunction<
          ResolverFunction, 
          Root, 
          ReturnTypeForRoot<ResolverFunction, RootFieldType>, 
          GetObjectFields<Type>, 
          Context,
          Type
        >
    : [IsNonNullNonArrayTypeScalar<RootFieldType>] extends [true]
      ? GetSchemaScalar<RootFieldType>
      : "Can't infer resolver type"

export type ValidateAdditionalResolver<Resolver, Root, Context> =
  [Resolver] extends [{
    type?: infer Type
    // enum?: infer Enum,
    alias?: infer Alias,
    description?: infer Description,
    deprecationReason?: infer DeprecationReason,
    argsFields?: infer ArgsRuntimeTypes,
    resolve?: infer ResolverFunction
  }]
    ? [ResolverFunction] extends [(...args: infer X) => infer RT]
      ? { description?: Description, deprecationReason?: DeprecationReason, alias?: Alias }
        & ScalarOrObjectType<RT, GetObjectFields<Type>, Context, Type>
        & CreateSchemaOptions<RT>
        & ValidateResolverFunction<
            ResolverFunction, 
            Root, 
            RT, 
            GetObjectFields<Type>, 
            Context,
            Type
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

export type ValidateResolverFunction<ResolverFunction, Root, RootFieldType, ObjectFields, Context, Type> =
  // ScalarOrObjectType<RootFieldType, ObjectFields, Context, Type>
  // & CreateSchemaOptions<RootFieldType>
  // & 
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


export type ScalarOrObjectType<RootFieldType, ObjectFields, Context, Type> =
  [Type] extends [{enum: infer Enum, name: infer Name, description?: infer Description}]
    ? {type: {enum: Enum, name: Name, description?: Description}}
    : [IsTypeScalar<RootFieldType>] extends [true]
      ? {
          type: GetSchemaScalar<RootFieldType>
        }
        : Type extends {unionName: infer UnionName, unionTypes: infer UnionTypes}
          ? [UnionTypes] extends [Readonly<unknown[]>]
            ? UnionItemToReturnType<UnionTypes[number]> extends infer Unionized
              ? Exact<Unionized, RootFieldType> extends true
                ? {type: {unionName: UnionName, unionTypes: UnionTypes, resolveType?: (value: RootFieldType) => UnionTypeNames<UnionTypes[number]>}}
                : {unionName: UnionName, type: "Union type does not match return type"}
              : never
            : {type: {unionName: UnionName, unionTypes: "Union types should be an array"}}
          : {
              type: {
                objectName: string,
                description?: string,
                deprecationReason?: string,
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
              }
            }

export type HandleNonNullNonArrayTypeScalar<Scalar, Resolver> =
  [IsNonNullNonArrayTypeScalar<Scalar>] extends [true]
    ? GetSchemaScalar<Scalar> | Resolver
    : Resolver

// export type NonNullEnum<RootFieldType, Enum, EnumType> =
//   [unknown] extends [Enum] 
//     ? EnumType
//     : [IsNonNullCompileTimeScalar<RootFieldType>] extends [true]
//         ? {enum: Enum} | EnumType
//         : EnumType

export type ReturnTypeForRoot<ResolverFunction, RootFieldType> =
  [unknown] extends [RootFieldType]
    ? [ResolverFunction] extends [(...args: infer Args) => infer ReturnType]
      ? RemovePromise<ReturnType>
      : "Unable to determine return type for root query"
    : RootFieldType

export type GetObjectFields<Type> = 
  [Type] extends [{ objectFields: infer ObjectFields }] 
    ? ObjectFields 
    : unknown
    // : [Type] extends [{enum: infer Enum}] 
    //   ? Type
    //   : unknown

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

export function resolver<
  Context, 
  Root, 
  RootField, 
  X extends ValidateResolver<X, Root, RootField, Context> = any
>(resolver: X) {
  return resolver;
}