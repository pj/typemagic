import { ValidateArgs, ValidateRuntimeTypes } from "./common"
import { CompileTimeTypeFromConstructor, GenerateNullabilityAndArrayRuntimeOptions } from "./types"

// export type ValidateMutationFunction<ResolverFunction, ArgsConstructor, Context> =
//   [unknown] extends [ResolverFunction]
//     ? unknown
//     : [ResolverFunction] extends [(first: infer First, second: infer Second, third: infer Third) => infer ReturnType]
//       ? [unknown] extends [ArgsConstructor]
//         ? ((context: Context) => ReturnType) 
//           | (() => ReturnType)
//         : ((args: CompileTimeTypeFromConstructor<ArgsConstructor>, context: Context) => ReturnType) 
//           | ((args: CompileTimeTypeFromConstructor<ArgsConstructor>) => ReturnType) 
//           | (() => ReturnType)
//       : never

export type ValidateMutations<Mutations, Context> =
  {
    [Key in keyof Mutations]:
      ValidateMutation<Mutations[Key], Context>
  }


export type ValidateMutation<Resolver, Context> =
  [Resolver] extends [{
    type?: infer Type,
    alias?: infer Alias,
    objectName?: infer ObjectName,
    description?: infer Description,
    deprecationReason?: infer DeprecationReason,
    nullable?: infer Nullability,
    array?: infer ArrayType,
    argsFields?: infer ArgsRuntimeTypes
    mutate?: infer MutationFunction
    objectFields?: infer RuntimeTypes
  }]
    ? 
      { description?: Description, deprecationReason?: DeprecationReason, alias?: Alias }
      & ValidateRuntimeTypes<RuntimeTypes, MutationFunction, Context, Type>
      & ValidateMutationFunction<MutationFunction, Context> 
      & GenerateNullabilityAndArrayRuntimeOptions<
          [MutationFunction] extends [(...args: infer X) => Promise<infer ReturnType>] ? ReturnType : unknown
        >
    : {resolve: ["Can't infer type", Resolver, Context]}

export type ValidateMutationFunction<MutationFunction, Context> =
  [unknown] extends [MutationFunction]
    ? {mutate?: never, argsFields?: never}
    : [MutationFunction] extends [
        ((context: Context) => infer ReturnType) 
        | (() => infer ReturnType)
      ]
        ? {
            mutate: MutationFunction,
            argsFields?: never
          }
          : [MutationFunction] extends [
              ((args: infer Args, context: Context) => infer ReturnType) 
              | ((args: infer Args) => infer ReturnType) 
            ]
              ? {
                  resolve: MutationFunction,
                }
                & ValidateArgs<Args>
              : {resolve: "Mutate function exists, but doesn't not match expected type: (args: Args, context: Contest) => Promise<Outupt>"}