import { 
  CompileTimeTypeFromConstructor, 
  Constructor, 
  GenerateNullabilityAndArrayRuntimeOptions, 
  GetRuntimeScalarType, 
  GetUnderlyingType, 
  IsCompileTimeScalar, 
  IsEnum, 
  RegisteredEnum, 
  ScalarTypes 
} from "./types"
import { ValidateResolver } from "./resolvers"

export type ValidateInputRuntimeType<FunctionArg> =
  (
    [IsCompileTimeScalar<FunctionArg>] extends [true]
      ? { type: GetRuntimeScalarType<FunctionArg> }
      : {
        inputFields: ValidateInputRuntimeTypes<GetUnderlyingType<FunctionArg>>
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
    ? { argsFields?: never }
    : {
        argsFields: ValidateInputRuntimeTypes<FunctionArgs>
      }

export function argsFields<FunctionArgs extends ValidateArgs<{argsFields: FunctionArgs}>>(args: FunctionArgs) {
  return args;
}

export type ValidateRuntimeTypes<RuntimeTypes, ResolverFunction, Context, ScalarType> =
  [ResolverFunction] extends [(first: infer First, second: infer Second, third: infer Third) => Promise<infer ReturnType>]
    ? [IsCompileTimeScalar<ReturnType>] extends [true]
      ? {
          type: GetRuntimeScalarType<ReturnType>,
          objectFields?: "Runtime types not used when return type is scalar."
          objectName?: never
        }
      : {
          objectName: string
          objectFields: {
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
    : [ScalarType] extends [ScalarTypes]
      ? {
          type: ScalarType,
          objectFields?: never,
          objectName?: never
        }
      : {
          objectFields: "Unable to infer return type of function"
        }