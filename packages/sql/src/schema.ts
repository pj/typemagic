

export type ValidateSchema<Schema> = 
  {
    [Key in keyof Schema]: string[]
  }


export type ValidateTableName<Schema, TableName> = 
  [TableName] extends [string]
    ? keyof Schema extends TableName
      ? {from: TableName}
      : {from: "Table name must be in schema"}
    : TableName extends [infer OldName, infer AliasName]
      ? OldName extends string
        ? AliasName extends string
          ? keyof Schema extends OldName
            ? {from: [OldName, AliasName]}
            : {from: ["Table name must be in schema", AliasName]}
          : {from: [any, string]}
        : {from: [keyof Schema, string]}
      :{from: [keyof Schema, string]}


// Join syntax:
// {
//   from: ["asdf", "alias"]
//   join: [
//     {
//       table: "dfdfdf",
//       as: "d",
//       on: ["id", "x"] | BooleanExpression,
//       using: ["id", "asdf"]
//     }
//   ]
// }