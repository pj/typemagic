import { CustomScalar } from "./custom_scalar"
import {
  CreateSchemaOptions,
  Exact,
  GetSchemaScalar,
  GetUnderlyingType,
  IsNonNullNonArrayTypeScalar,
  IsTypeScalar
} from "./types"

export type HandleNonNullNonArrayTypeScalar<Scalar, ArgsFields, Resolver> =
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
        : ArgsRuntimeType extends {type: CustomScalar<infer ScalarInput, infer ScalarSerialized>}
          ? Exact<ScalarInput, FunctionArg> extends true
            ? {type: CustomScalar<ScalarInput, ScalarSerialized>}
            : "Custom scalar type doesn't match arg type"
          : IsTypeScalar<FunctionArg> extends true
            ? { type: GetSchemaScalar<FunctionArg> }
            : {
                type: {
                  fields: ValidateInputRuntimeTypes<GetUnderlyingType<FunctionArg>, ArgsRuntimeType>,
                  name: string
                }
              }
    )
  & CreateSchemaOptions<FunctionArg>

export type ValidateInputRuntimeTypes<FunctionArgs, ArgsFields> =
  {
    [Key in keyof FunctionArgs]:
      HandleNonNullNonArrayTypeScalar<
        FunctionArgs[Key], 
        ArgsFields,
        Key extends keyof ArgsFields
          ? ValidateInputRuntimeType<FunctionArgs[Key], ArgsFields[Key]>
          : ValidateInputRuntimeType<FunctionArgs[Key], unknown>
      >
  }

export type ValidateArgs<FunctionArgs, ArgsFields> =
  [unknown] extends [FunctionArgs]
    ? { argsFields?: never }
    : {
        argsFields: ValidateInputRuntimeTypes<FunctionArgs, ArgsFields>
      }
