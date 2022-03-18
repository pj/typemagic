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
import { NonNullScalar, ValidateResolver } from "./resolvers"

export type ValidateInputRuntimeType<FunctionArg> =
  {
    description?: string,
    defaultValue?: string,
  }
  & (
      [IsCompileTimeScalar<FunctionArg>] extends [true]
        ? { type: GetRuntimeScalarType<FunctionArg> }
        : {
          inputFields: ValidateInputRuntimeTypes<GetUnderlyingType<FunctionArg>>,
          inputName: string
        }
    )
  & GenerateNullabilityAndArrayRuntimeOptions<FunctionArg>


export type ValidateInputRuntimeTypes<FunctionArgs> =
  {
    [Key in keyof FunctionArgs]:
      NonNullScalar<FunctionArgs[Key], ValidateInputRuntimeType<FunctionArgs[Key]>>
  }

export type ValidateArgs<FunctionArgs> =
  [unknown] extends [FunctionArgs]
    ? { argsFields?: never }
    : {
        argsFields: ValidateInputRuntimeTypes<FunctionArgs>
      }

export function argsFields<FunctionArgs extends ValidateArgs<FunctionArgs>>(args: FunctionArgs) {
  return args;
}