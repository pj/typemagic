import {
  CreateSchemaOptions,
  GetSchemaScalar,
  GetUnderlyingType,
  IsNonNullNonArrayTypeScalar,
  IsTypeScalar
} from "./types"

export type HandleNonNullNonArrayTypeScalar<Scalar, Resolver> =
  [IsNonNullNonArrayTypeScalar<Scalar>] extends [true]
    ? GetSchemaScalar<Scalar> | Resolver
    : Resolver

export type ValidateInputRuntimeType<FunctionArg> =
  {
    description?: string,
    deprecationReason?: string,
    defaultValue?: string,
  }
  & (
      [IsTypeScalar<FunctionArg>] extends [true]
        ? { type: GetSchemaScalar<FunctionArg> }
        : {
            type: {
              fields: ValidateInputRuntimeTypes<GetUnderlyingType<FunctionArg>>,
              input: string
            }
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