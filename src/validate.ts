import { Constructor, GenerateNullabilityAndArrayRuntimeOptions, GetRuntimeScalarType, GetUnderlyingType, IsCompileTimeScalar, ScalarTypes } from "./types";

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
  [unknown] extends [ArgsConstructor]
    ? [unknown] extends [ResolverFunction]
      ? { resolve?: never, args?: never }
      : {
          resolve: (root: Root, context: Context)
            => [ResolverFunction] extends [(...args: infer X) => Promise<infer ReturnType>]
            ? Promise<ReturnType>
            : never,
          args?: never
        }
    : {
        resolve: (
          args: [ArgsConstructor] extends [{ prototype: infer T }] ? T : never,
          root: [Root] extends [ArgsConstructor] ? never : Root,
          context: Context
        ) => [ResolverFunction] extends [(...args: infer X) => Promise<infer ReturnType>]
          ? Promise<ReturnType>
          : never,
        args: {
          type: ArgsConstructor,
          runtimeTypes: ValidateInputRuntimeTypes<[ArgsConstructor] extends [{ prototype: infer T }] ? T : never>
      }
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
    ? {
        type: Type
      }
        & (
          [Type] extends [ScalarTypes]
            ? {}
            : {
              runtimeTypes: RuntimeTypes
            }
        )
        & ValidateResolverFunction<ResolverFunction, ArgsConstructor, Root, Context>
        & GenerateNullabilityAndArrayRuntimeOptions<
            [ResolverFunction] extends [(...args: infer X) => Promise<infer ReturnType>] ? ReturnType : unknown
          >
    : "Can't infer type"

export type ValidateResolvers<Resolvers, Root, Context> =
  {
    [Key in keyof Resolvers]:
    ValidateResolver<Resolvers[Key], Root, Context>
  }