import { CompileTimeTypeFromConstructor, Constructor, GenerateNullabilityAndArrayRuntimeOptions, GetRuntimeScalarType, GetUnderlyingType, IsCompileTimeScalar, ScalarTypes } from "./types";

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

export type ValidateRuntimeField<Field, Root, Context> =
  GenerateNullabilityAndArrayRuntimeOptions<Field>

export type ValidateResolverRuntimeTypes<TypeConstructor, ResolverFunction, Root, Context> =
    [TypeConstructor] extends [ScalarTypes]
      ? {
          type: TypeConstructor,
          runtimeTypes?: never
        }
      : [unknown] extends [ResolverFunction]
        ? {
            type: TypeConstructor, 
            runtimeTypes: {
              [Key in keyof CompileTimeTypeFromConstructor<TypeConstructor>]?:
                ValidateRuntimeField<
                  CompileTimeTypeFromConstructor<TypeConstructor>[Key], 
                  CompileTimeTypeFromConstructor<TypeConstructor>, 
                  Context
                >
            }
          }
        : [ResolverFunction] extends [(first: infer First, second: infer Second, third: infer Third) => infer ReturnType]
          ? {
              type: Constructor<ReturnType>, 
              runtimeTypes: {
                [Key in keyof ReturnType]?:
                  ValidateRuntimeField<ReturnType[Key], ReturnType, Context>
              }
            }
          : {
              type: "Invalid Resolver"
            }

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
        ValidateResolverRuntimeTypes<Type, ResolverFunction, Root, Context>
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
                : ["ResolverFunction isn't valid", ValidateResolverFunction<ResolverFunction, ArgsConstructor, Root, Context>]
          )
        & GenerateNullabilityAndArrayRuntimeOptions<
            [ResolverFunction] extends [(...args: infer X) => Promise<infer ReturnType>] ? ReturnType : unknown
          >
    : ["Can't infer type", Resolver, Root, Context]

export type ValidateResolvers<Resolvers, Root, Context> =
  {
    [Key in keyof Resolvers]:
    ValidateResolver<Resolvers[Key], Root, Context>
  }