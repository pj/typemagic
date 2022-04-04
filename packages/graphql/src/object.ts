import { ValidateAdditionalResolver, ValidateResolver } from "./resolvers"
import { GetUnderlyingType, ScalarTypes } from "./types"

export type HandleOutputObject<Type, ReturnType, Context> =
  Type extends {
      name: infer Name,
      description?: string,
      fields: infer ObjectFields,
      interfaces?: infer Interfaces
    }
      ? {
          name: Name,
          description?: string,
          fields: {
            [Key in keyof ObjectFields]:
              [Key] extends [keyof GetUnderlyingType<ReturnType>]
                ? ValidateResolver<
                    ObjectFields[Key],
                    GetUnderlyingType<ReturnType>, 
                    GetUnderlyingType<ReturnType>[Key], 
                    Context
                  >
                : ValidateAdditionalResolver<
                    ObjectFields[Key],
                    GetUnderlyingType<ReturnType>, 
                    Context
                  >
          }
        } 
          & (
            unknown extends Interfaces
              ? {}
              : {
                  interfaces: {
                    [Key in keyof Interfaces]: 
                      ReturnTypeExtendsInterface<Interfaces[Key], ReturnType, Context>
                  }
                }
          )
      : "Unable to infer from object type"
      // {
      //     name: string, 
      //     fields: {
      //       [Key in keyof GetUnderlyingType<ReturnType>]: 
      //         ScalarTypes
      //     },
      //     description?: string,
      //     interfaces?: Array<{[Key in keyof GetUnderlyingType<ReturnType>]: ScalarTypes}>
      //   }

export type ReturnTypeExtendsInterface<Interface, ReturnType, Context> =
  Interface extends {name: infer Name, fields: infer Fields}
      ? {
          name: Name,
          description?: string,
          // Fixme: Can we infer all the possible names this could be?
          resolveType?: (value: ReturnType) => string,
          fields: {
            [Key in keyof Fields]:
              Key extends keyof GetUnderlyingType<ReturnType>
                ? ValidateResolver<
                    Fields[Key],
                    GetUnderlyingType<ReturnType>, 
                    GetUnderlyingType<ReturnType>[Key], 
                    Context
                  >
                : "Interface can't have fields that aren't in return type."
          }
        }
      : "Interface is incorrect"