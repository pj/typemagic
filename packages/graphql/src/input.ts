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

export type ValidateInputRuntimeType<FunctionArg, ArgsRuntimeType> =
  {
    description?: string,
    deprecationReason?: string,
    defaultValue?: string,
  }
  & (
    ArgsRuntimeType extends {enum: infer Enum, name: infer Name, description?: infer Description}
      ? {
          type: {
            enum: Enum, 
            name: Name, 
            description?: Description,
          }
        }
      : [IsTypeScalar<FunctionArg>] extends [true]
        ? { type: GetSchemaScalar<FunctionArg> }
        : {
            type: {
              fields: ValidateInputRuntimeTypes<GetUnderlyingType<FunctionArg>, ArgsRuntimeType>,
              input: string
            }
          }
    )
  & CreateSchemaOptions<FunctionArg>

export type ValidateInputRuntimeTypes<FunctionArgs, ArgsRuntimeTypes> =
  {
    [Key in keyof FunctionArgs]:
      HandleNonNullNonArrayTypeScalar<
        FunctionArgs[Key], 
        Key extends keyof ArgsRuntimeTypes
          ? ValidateInputRuntimeType<FunctionArgs[Key], ArgsRuntimeTypes[Key]>
          : ValidateInputRuntimeType<FunctionArgs[Key], unknown>
      >
  }

export type ValidateArgs<FunctionArgs, ArgsRuntimeTypes> =
  [unknown] extends [FunctionArgs]
    ? { argsFields?: never }
    : {
        argsFields: ValidateInputRuntimeTypes<FunctionArgs, ArgsRuntimeTypes>
      }
