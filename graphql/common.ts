import { 
  CompileTimeTypeFromConstructor, 
  Constructor, 
  GenerateNullabilityAndArrayRuntimeOptions, 
  GetRuntimeScalarType, 
  GetUnderlyingType, 
  IsCompileTimeScalar, 
  RegisteredEnum, 
  ScalarTypes 
} from "./types"
import { ValidateResolver } from "./resolvers"

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
