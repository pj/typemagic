import { CustomScalar } from "./custom_scalar"
import {
  CreateSchemaOptions,
  Exact,
  GetSchemaScalar,
  GetUnderlyingType,
  IsNonNullNonArrayTypeScalar,
  IsTypeScalar
} from "./types"

export type HandleNonNullNonArrayTypeScalar<Scalar, ArgsRuntimeTypes, Resolver> =
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
      : ArgsRuntimeType extends {type: CustomScalar<infer CustomScalarType>}
        ? Exact<CustomScalarType, FunctionArg> extends true
          ? {type: CustomScalar<CustomScalarType>}
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

export type ValidateInputRuntimeTypes<FunctionArgs, ArgsRuntimeTypes> =
  {
    [Key in keyof FunctionArgs]:
      HandleNonNullNonArrayTypeScalar<
        FunctionArgs[Key], 
        ArgsRuntimeTypes,
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
