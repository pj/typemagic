import { Exact, GetUnderlyingType, TransformObjectSchemaToType, UnionToIntersection } from "./types.js"

export type HandleUnion<Type, ReturnType> =
  Type extends {name: infer UnionName, union: infer UnionTypes}
    ? UnionTypes extends Readonly<unknown[]>
      ? Exact<TransformObjectSchemaToType<UnionTypes[number]>, GetUnderlyingType<ReturnType>> extends true
        ? { 
            type: {
              name: UnionName, 
              description?: string,
              union: UnionTypes, 
              resolveType?: (value: ReturnType) => UnionTypeNames<UnionTypes[number]>
            }
          }
        : {
            type: {
              name: UnionName, 
              description?: string, 
              union: "Union does not match return type",
              resolveType?: (value: ReturnType) => UnionTypeNames<UnionTypes[number]>
            }
          }
      : { 
          type: {
            name: UnionName,
            description?: string,
            union: "Union must be an array"
          }
        }
  : never

export type UnionTypeNames<UnionType> = 
  UnionType extends {name: infer Name} ? Name : never