import { HandleNonNullNonArrayTypeScalar } from "./resolvers"
import {
  CreateSchemaOptions,
  GetSchemaScalar,
  GetUnderlyingType,
  IsTypeScalar
} from "./types"

export type ValidateInputRuntimeType<FunctionArg> =
  {
    description?: string,
    defaultValue?: string,
  }
  & (
      [IsTypeScalar<FunctionArg>] extends [true]
        ? { type: GetSchemaScalar<FunctionArg> }
        : {
          inputFields: ValidateInputRuntimeTypes<GetUnderlyingType<FunctionArg>>,
          inputName: string
        }
    )
  & CreateSchemaOptions<FunctionArg>


export type ValidateInputRuntimeTypes<FunctionArgs> =
  {
    [Key in keyof FunctionArgs]:
      HandleNonNullNonArrayTypeScalar<FunctionArgs[Key], ValidateInputRuntimeType<FunctionArgs[Key]>>
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