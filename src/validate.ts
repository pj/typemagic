import { CompileTimeTypeFromConstructor, Constructor, GenerateNullabilityAndArrayRuntimeOptions, GetRuntimeScalarType, GetUnderlyingType, IsCompileTimeScalar, RegisteredEnum, ScalarTypes } from "./types";

export type ValidateInputRuntimeType<FunctionArg> =
  (
    [IsCompileTimeScalar<FunctionArg>] extends [true]
      ? { type: GetRuntimeScalarType<FunctionArg> }
      : {
        type: Constructor<GetUnderlyingType<FunctionArg>>
        runtimeTypes: ValidateInputRuntimeTypes<GetUnderlyingType<FunctionArg>>
      }
  )
  & GenerateNullabilityAndArrayRuntimeOptions<FunctionArg>


export type ValidateInputRuntimeTypes<FunctionArgs> =
  {
    [Key in keyof FunctionArgs]:
    ValidateInputRuntimeType<FunctionArgs[Key]>
  }

export type ValidateArgs<FunctionArgs> =
  [unknown] extends [FunctionArgs]
    ? { args?: never }
    : {
      args: {
        type: Constructor<GetUnderlyingType<FunctionArgs>>,
        runtimeTypes: ValidateInputRuntimeTypes<FunctionArgs>
      }
    }

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

export type ValidateRuntimeTypes<RuntimeTypes, TypeConstructor, ResolverFunction, Context> =
  [TypeConstructor] extends [ScalarTypes]
    ? {
        type: TypeConstructor,
        runtimeTypes?: never
      }
    : [TypeConstructor] extends [RegisteredEnum<any>]
      ? {
        type: TypeConstructor,
        runtimeTypes?: never
      }
      : [unknown] extends [ResolverFunction]
        ? {
            type: TypeConstructor,
            runtimeTypes: {
              [Key in keyof RuntimeTypes]:
                [Key] extends [keyof CompileTimeTypeFromConstructor<TypeConstructor>]
                  ? ValidateResolver<
                      RuntimeTypes[Key], 
                      CompileTimeTypeFromConstructor<TypeConstructor>[Key], 
                      Context
                    >
                  : never
            }
          }
          : [ResolverFunction] extends [(first: infer First, second: infer Second, third: infer Third) => Promise<infer ReturnType>]
            ? {
                type: Constructor<GetUnderlyingType<ReturnType>>,
                runtimeTypes: {
                  [Key in keyof RuntimeTypes]:
                    [Key] extends [keyof GetUnderlyingType<ReturnType>]
                      ? ValidateResolver<
                          RuntimeTypes[Key], 
                          GetUnderlyingType<ReturnType>, 
                          Context
                        >
                      : ["here", ReturnType]
                }
              }
            : {type: "Runtime types invalid"}

export type ValidateResolver<Resolver, Root, Context> =
  [Resolver] extends [{
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
    ? 
        ValidateRuntimeTypes<RuntimeTypes, Type, ResolverFunction, Context>
        & (
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
          )
        & GenerateNullabilityAndArrayRuntimeOptions<
            [ResolverFunction] extends [(...args: infer X) => Promise<infer ReturnType>] ? ReturnType : unknown
          >
    : {resolve: ["Can't infer type", Resolver, Root, Context]}

export type ValidateResolvers<Resolvers, Root, Context> =
  {
    [Key in keyof Resolvers]:
    ValidateResolver<Resolvers[Key], Root, Context>
  }