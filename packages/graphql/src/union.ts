import { Exact, GetUnderlyingType, TransformObjectSchemaToType } from "./types"

export type HandleUnion<Type, ReturnType> =
  Type extends {name: infer UnionName, union: infer UnionTypes}
    ? UnionTypes extends Readonly<unknown[]>
      ? Exact<TransformObjectSchemaToType<UnionTypes[number]>, GetUnderlyingType<ReturnType>> extends true
        ? { 
            type: {
              name: UnionName, 
              union: UnionTypes, 
              resolveType?: (value: ReturnType) => UnionTypeNames<UnionTypes[number]>
            }
          }
        : {
            type: {
              name: UnionName, 
              union: TransformObjectSchemaToType<UnionTypes[number]>
            }
          }
      : { 
          type: {
            name: UnionName,
            union: "Union must be an array"
          }
        }
  : never

export type UnionTypeNames<UnionType> = 
  UnionType extends {name: infer Name} ? Name : never