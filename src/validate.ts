import { RootFieldFilter } from "@graphql-tools/utils";
import { Resolver } from "dns";
import { QueryRoot } from "./schema";
import { Constructor, GenerateArrayTrilean, GenerateNullabilityAndArrayRuntimeOptions, GetRuntimeScalarType, GetUnderlyingType, IsCompileTimeScalar, IsNonNullCompileTimeScalar, ScalarTypes } from "./types";

// export type ValidateNullability<ReturnType, Nullability> =
//   [null] extends [ReturnType]
//     ? [Nullability] extends [true]
//       ? [Nullability] extends [undefined | unknown]
//         ? "Nullability is also undefined"
//         : true
//       : "Return type is null, but nullable not set to true."
//     : [Nullability] extends [false | undefined | unknown]
//       ? true
//       : "Return type is not null, but nullable is set"

// export type ValidateArray<ReturnType, ArrayType> =
//   [ReturnType] extends [Array<infer X>]
//     ? [ArrayType] extends [true]
//       ? [ArrayType] extends [undefined | unknown]
//         ? "ArrayType is possibly undefined, even though return type is an array."
//         : [null] extends [X]
//           ? "Elements of array are nullable, even though runtime type is not set to nullable_items"
//           : true
//       : [ArrayType] extends ["nullable_items"]
//         ? [ArrayType] extends [undefined | unknown]
//           ? "ArrayType is possibly undefined, even though return type is an array."
//           : [null] extends [X]
//             ? true
//             : "Elements of array are not nullable, even though runtime type is set to nullable_items"
//         : ["Return type is array, but array is not a known value", ArrayType]
//     : [ArrayType] extends [false | undefined | unknown]
//       ? true
//       : "Return type is not an array but runtime array is set."

// export type ValidateArgs<ArgsType, FunctionArgs> =
//    [ArgsType] extends [Constructor<FunctionArgs>]
//     ? true
//     : "args parameter does not match runtime type";

// export type ValidateType<Input> =
//   [GetRuntimeScalarType<Input>] extends ["Scalar Type not found"]
//     ? 
//       [Input] extends [{
//         type: infer Type,
//         nullable?: infer Nullability,
//         array?: infer ArrayType,
//         args?: {
//           type?: infer ArgsType,
//           runtimeTypes?: infer ArgsRuntimeTypes
//         },
//         resolve?: (args: infer FunctionArgs, root: infer Root, context: infer Context) => Promise<infer ReturnType>
//         runtimeTypes?: infer RuntimeTypes
//       }]
//         ? [ValidateNullability<ReturnType, Nullability>] extends [true]
//           ? [ValidateArray<ReturnType, ArrayType>] extends [true]
//             ? [ValidateArgs<ArgsType, FunctionArgs>] extends [true]
//               ? {
//                   args: {
//                     [Key in keyof ArgsRuntimeTypes]:
//                       [Key] extends [keyof FunctionArgs]
//                         ? true
//                         : `Key ${Key & string} not in args type`
//                   }, 
//                   runtimeTypes: {
//                     [Key in keyof RuntimeTypes]: 
//                       [Key] extends [keyof ReturnType]
//                         ? true
//                         : `Key ${Key & string} not in return type`
//                   }
//                 }
//               : ValidateArgs<ArgsType, FunctionArgs>
//             : ValidateArray<ReturnType, ArrayType>
//           : ValidateNullability<ReturnType, Nullability>
//         : "Can't infer from input type"
//     : "Scalar Valid"

// export type ValidateFields<Fields> =
//     {
//       [Key in keyof Fields]:
//         ValidateType<Fields[Key]>
//     }

export type ValidateNullability<ReturnType> =
  // Nullable shouldn't be set if we don't know the return type
  [unknown] extends [ReturnType]
    ? {}
    : [null] extends [ReturnType]
      ? {nullable: true}
      : {nullable?: false}

export type ValidateArray<Type> =
  [unknown] extends [Type]
    ? {array?: unknown}
    : GenerateArrayTrilean<Type>
    // [GetArray] extends [Array<infer X>]
    //   ? [null] extends [X]
    //     ? {array: "nullable_items"}
    //     : {array: true}
    //   : {array?: Type}

export type ValidateInputRuntimeType<FunctionArg> =
  // [IsNonNullCompileTimeScalar<FunctionArg>] extends [true]
    // ? GetRuntimeScalarType<FunctionArg> | {type: GetRuntimeScalarType<FunctionArg>}
    // ? GetRuntimeScalarType<FunctionArg> | {type: GetRuntimeScalarType<FunctionArg>}
    // : 
      (
        [IsCompileTimeScalar<FunctionArg>] extends [true]
          ? {type: GetRuntimeScalarType<FunctionArg>}
          : {
              type: Constructor<GetUnderlyingType<FunctionArg>>
              runtimeTypes: ValidateInputRuntimeTypes<GetUnderlyingType<FunctionArg>>
            }
      )
      // & ValidateNullability<FunctionArg>
      // & ValidateArray<FunctionArg>
      & GenerateNullabilityAndArrayRuntimeOptions<FunctionArg>


export type ValidateInputRuntimeTypes<FunctionArgs> =
  {
    [Key in keyof FunctionArgs]:
      ValidateInputRuntimeType<FunctionArgs[Key]>
  }

export type ValidateArgs<FunctionArgs> =
  [unknown] extends [FunctionArgs]
    ? {args?: never}
    : {
        args: {
          type: Constructor<GetUnderlyingType<FunctionArgs>>,
          runtimeTypes: ValidateInputRuntimeTypes<FunctionArgs>
        }
      }

export type ExtractFunctionDetails<ResolverFunction, ArgsConstructor> =
  [unknown] extends [ResolverFunction]
      ? {root: unknown, context: unknown, returnType: unknown, functionArgs: unknown}
      : [undefined] extends [ArgsConstructor]
          ? [ResolverFunction] extends [(first: infer Root, second: infer Context) => Promise<infer ReturnType>]
            ? {root: Root, context: Context, returnType: ReturnType, functionArgs: unknown}
            : {root: unknown, context: unknown, returnType: unknown, functionArgs: unknown}
          : [ResolverFunction] extends [(first: infer FunctionArgs, second: infer Root, third: infer Context) => Promise<infer ReturnType>]
            ? {root: Root, context: Context, returnType: ReturnType, functionArgs: FunctionArgs}
            : {root: unknown, context: unknown, returnType: unknown, functionArgs: unknown}

  // [ResolverFunction] extends [(root: infer Root, context: infer Context) => Promise<infer ReturnType>]
  //   ? {root: Root, context: Context, returnType: ReturnType, functionArgs: unknown}
  //   : [ResolverFunction] extends [(args: infer FunctionArgs, root: infer Root, context: infer Context) => Promise<infer ReturnType>]
  //     ? {root: Root, context: Context, returnType: ReturnType, functionArgs: FunctionArgs}
  //     : never

export type ValidateResolverFunction<ResolverFunction, ArgsConstructor, Root, Context> =
  [unknown] extends [ArgsConstructor]
    ? [unknown] extends [ResolverFunction]
      ? {resolve?: never, args?: never}
      : {
          resolve: (root: Root, context: Context) 
            => [ResolverFunction] extends [(...args: infer X) => Promise<infer ReturnType>] 
              ? Promise<ReturnType>
              : never,
          args?: never
        }
    : {
        resolve: (
          args: [ArgsConstructor] extends [{prototype: infer T}] ? T : never, 
          root: [Root] extends [ArgsConstructor] ? never : Root, 
          context: Context
        ) => [ResolverFunction] extends [(...args: infer X) => Promise<infer ReturnType>] 
          ? Promise<ReturnType>
          : never,
        args: {
          type: ArgsConstructor,
          runtimeTypes: ValidateInputRuntimeTypes<[ArgsConstructor] extends [{prototype: infer T}] ? T : never>
        }
      }

      // : [ResolverFunction] extends [(first: infer First, second: infer Second, third: infer Third) => Promise<infer ReturnType>]
      //   ? [First] extends [Root]
      //     ? [Second] extends [Context]
      //       ? {
      //           resolve: (root: First, context: Context) => Promise<ReturnType>,
      //           args?: never
      //         }
      //       : "Second argument must be Context type"
      //     : "First argument is not Root type"
      //   : "Unable to infer function"
    
    // [ResolverFunction] extends [(first: infer First, second: infer Second, third: infer Third) => Promise<infer ReturnType>]
    //   ? [ArgsConstructor] extends [Constructor<First>]
    //     ? [Constructor<First>] extends [ArgsConstructor]
    //       ? [Second] extends [Root]
    //         ? [Third] extends [Context]
    //           ? {
    //               resolve: (args: First, root: Second, context: Third) => Promise<ReturnType>,
    //               args: {
    //                 type: Constructor<GetUnderlyingType<First>>,
    //                 runtimeTypes: ValidateInputRuntimeTypes<First>
    //               }
    //             }
    //           : "Third argument must be Context type"
    //         : "Second argument must be Root type"
    //       : "First argument must match args constructor"
    //     : "First argument must match args constructor"
    //   : "Unable to infer function"
  // [unknown] extends [ResolverFunction]
  //   ? {resolve?: never}
  //   : [unknown] extends [ExtractFunctionDetails<ResolverFunction, ArgsConstructor>['functionArgs']]
  //     ? {
  //         resolve: (
  //           root: ExtractFunctionDetails<ResolverFunction, ArgsConstructor>['root'], 
  //           context: ExtractFunctionDetails<ResolverFunction, ArgsConstructor>['context'], 
  //         ) => Promise<ExtractFunctionDetails<ResolverFunction, ArgsConstructor>['returnType']>
  //       }
  //     : {
  //         resolve: (
  //           args: ExtractFunctionDetails<ResolverFunction, ArgsConstructor>['functionArgs'], 
  //           root: ExtractFunctionDetails<ResolverFunction, ArgsConstructor>['root'], 
  //           context: ExtractFunctionDetails<ResolverFunction, ArgsConstructor>['context'], 
  //         ) => Promise<ExtractFunctionDetails<ResolverFunction, ArgsConstructor>['returnType']>
  //       }

export type ValidateResolver<Resolver, Root, Context> =
  [Resolver] extends [{
    type?: infer Type,
    nullable?: infer Nullability,
    array?: infer ArrayType,
    args?: {
      type?: infer ArgsConstructor,
      runtimeTypes?: infer ArgsRuntimeTypes
    },
    resolve?: infer ResolverFunction //(args: infer FunctionArgs, root: infer Root, context: infer Context) => Promise<infer ReturnType>
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
          [ResolverFunction] extends [(...args: infer X) => Promise<infer ReturnType>] ? ReturnType : unknown>
        // & ValidateArgs<ExtractFunctionDetails<ResolverFunction, ArgsConstructor>['functionArgs']>
    : "Can't infer type"

export type ValidateResolvers<Resolvers, Root, Context> =
  {
    [Key in keyof Resolvers]:
      ValidateResolver<Resolvers[Key], Root, Context>
  }