import { ValidateArgs, ValidateRuntimeTypes } from "./common"
import { CompileTimeTypeFromConstructor, GenerateNullabilityAndArrayRuntimeOptions } from "./types"

export type ValidateMutationFunction<ResolverFunction, ArgsConstructor, Context> =
  [unknown] extends [ResolverFunction]
    ? unknown
    : [ResolverFunction] extends [(first: infer First, second: infer Second, third: infer Third) => infer ReturnType]
      ? [unknown] extends [ArgsConstructor]
        ? ((context: Context) => ReturnType) 
          | (() => ReturnType)
        : ((args: CompileTimeTypeFromConstructor<ArgsConstructor>, context: Context) => ReturnType) 
          | ((args: CompileTimeTypeFromConstructor<ArgsConstructor>) => ReturnType) 
          | (() => ReturnType)
      : never

export type ValidateMutation<Resolver, Context> =
  [Resolver] extends [{
    type?: infer Type,
    nullable?: infer Nullability,
    array?: infer ArrayType,
    args?: {
      type?: infer ArgsConstructor,
      runtimeTypes?: infer ArgsRuntimeTypes
    },
    mutate?: infer MutationFunction
    runtimeTypes?: infer RuntimeTypes
  }]
    ? 
        ValidateRuntimeTypes<RuntimeTypes, Type, MutationFunction, Context>
        & (
            [unknown] extends [MutationFunction] 
              ? {resolve?: never, args?: never} 
              : [MutationFunction] extends [ValidateMutationFunction<MutationFunction, ArgsConstructor, Context>]
                ? [unknown] extends [ArgsConstructor]
                  ? {
                    resolve: MutationFunction, 
                    args?: never
                  }
                  : {
                      resolve: MutationFunction, 
                    } & (
                      [MutationFunction] extends [(first: infer First, second: infer Second, third: infer Third) => infer ReturnType]
                        ? [unknown] extends [First] 
                          ? {args?: never}
                          : ValidateArgs<CompileTimeTypeFromConstructor<ArgsConstructor>>
                        : {args?: never}
                    )
                : {resolve: ["ResolverFunction isn't valid", ValidateMutationFunction<MutationFunction, ArgsConstructor, Context>]}
          )
        & GenerateNullabilityAndArrayRuntimeOptions<
            [MutationFunction] extends [(...args: infer X) => Promise<infer ReturnType>] ? ReturnType : unknown
          >
    : {resolve: ["Can't infer type", Resolver, Context]}

export type ValidateMutations<Mutations, Context> =
  {
    [Key in keyof Mutations]:
      ValidateMutation<Mutations[Key], Context>
  }