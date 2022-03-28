


function validateSchema() {

}

type ComputeAllIdentifiers<From, Identifier> =
  Identifier extends infer X ? `${string & From}__${string & X}` : never

type ComputeAllJoins<Join> =


export type ComputeSchema<Schema, From, Joins> =
  (
    [From] extends [string]
      ? From extends keyof Schema
        ? ComputeAllIdentifiers<From, Schema[From]>
        : "Table name must be in schema"
      : From extends [infer OldName, infer AliasName]
        ? OldName extends string
          ? AliasName extends string
            ? OldName extends keyof Schema
              ? ComputeAllIdentifiers<AliasName, Schema[OldName]>
              : ["Table name must be in schema", AliasName]
            : [keyof Schema, string]
          : [keyof Schema, string]
        : "Can't determine table name"
  )
  |

export type ValidateTableName<Schema, TableName> = 
  [TableName] extends [string]
    ? TableName extends keyof Schema
      ? {from: TableName}
      : {from: "Table name must be in schema"}
    : TableName extends [infer OldName, infer AliasName]
      ? OldName extends string
        ? AliasName extends string
          ? OldName extends keyof Schema
            ? {from: [OldName, AliasName]}
            : {from: ["Table name must be in schema", AliasName]}
          : {from: [any, string]}
        : {from: [keyof Schema, string]}
      :{from: [keyof Schema, string]}

export type X = {asdf$asdf: 1}