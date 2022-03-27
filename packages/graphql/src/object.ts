import { ValidateAdditionalResolver, ValidateResolver } from "./resolvers"
import { GetUnderlyingType } from "./types"

export type HandleOutputObject<Type, ReturnType, Context> =
  Type extends {
      name: string,
      description?: string,
      deprecationReason?: string,
      fields: infer ObjectFields,
      interfaces?: infer Interfaces
    }
      ? {
          type: ({
            name: string,
            description?: string,
            deprecationReason?: string,
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
        }) 
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
        }
      : {type: "Not an object" }

export type ReturnTypeExtendsInterface<Interface, ReturnType, Context> =
  Interface extends {name: infer Name, fields: infer Fields}
    ? {
        name: Name,
        description?: string,
        deprecationReason?: string,
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