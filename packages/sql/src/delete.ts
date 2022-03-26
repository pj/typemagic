// DELETE FROM [ ONLY ] table_name [ * ] [ [ AS ] alias ]
//     [ USING from_item [, ...] ] -- not standard
//     [ WHERE condition | WHERE CURRENT OF cursor_name ]
//     [ RETURNING * | output_expression [ [ AS ] output_name ] [, ...] ]

// [{},{},{not: {or:[{},{}]}}]

type ValidateBooleanOperators<Schema, Condition> =
  Condition extends {not: infer Not}
    ? {not: ValidateCondition<Schema, Not>}
    : Condition extends {and: infer And}
      ? And extends Readonly<unknown[]>
        ? {and: ValidateCondition<Schema, And>}
        : {and: "Must be an array"}
      : Condition extends {or: infer Or}
        ? Or extends Readonly<unknown[]>
          ? {or: ValidateCondition<Schema, Or>}
          : {or: "Must be an array"}
        : never

type ValidateComparators = 
  'eq' | 'ne' | 'equal' | 'not_equal' 
  | 'lt' | 'lte' | 'less_than' | 'less_than_equal' 
  | 'gt' | 'gte' | 'greater_than' | 'greater_than_equal' 
  | 'in' | 'not in';

type ValidateEqualityOperators<Schema, Condition> =
  {
      [Key in keyof Condition]: 
        [Key] extends ValidateComparators
          ? Condition[Key] extends [infer Left, infer Right]
            ? [ValidateCondition<Schema, Left>, ValidateCondition<Schema, Right>]
            : ["Must be two element tuple", "Must be two element tuple"]
          : never
    } extends infer Validated
      ? Validated extends {[Key in keyof Condition]: never}
        ? never
        : Validated
      : "Should not happen"

  // Condition extends {eq: [infer Left, infer Right]}
  //   ? {eq: [ValidateCondition<Schema, Left>, ValidateCondition<Schema, Right>]}
  //   : Condition extends {lt: [infer Left, infer Right]}
  //     ? {lt: [ValidateCondition<Schema, Left>, ValidateCondition<Schema, Right>]}


type ValidateLiterals<Schema, Condition> = 
  Condition

type ValidateIdentifiers<Schema, Condition> = 
  Condition

type ValidateCondition<Schema, Condition> =
  ValidateBooleanOperators<Schema, Condition> extends infer BooleanOperators
    ? BooleanOperators extends never
      ? ValidateLiterals<Schema, Condition> extends infer ValidateLiterals
        ? ValidateLiterals extends never
          ? ValidateIdentifiers<Schema, Condition> extends infer ValidateIdentifiers
            ? ValidateIdentifiers extends never
              ? ValidateEqualityOperators<Schema, Condition>
              : ValidateIdentifiers
            : "Should not happen"
          : ValidateLiterals
        : "Should not happen"
      : BooleanOperators
    : "Should not happen"

type ValidateWhere<Schema, Where> =
  [unknown] extends [Where]
    ? {where: ValidateCondition<Schema, Where>}
    : {}

type ValidateDelete<Schema, Delete> = 
  [Delete] extends [{
    from: infer TableName,
    only?: infer Only,
    where?: infer Where,
    returning?: infer Returning
  }]
    ? (
      TableName extends string
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
      )
        & (
          unknown extends Only
            ? {}
            : {only: boolean}
        )
        & ValidateWhere<Schema, Where>
    : "Unable to validate delete"

export async function remove<Schema, Delete extends ValidateDelete<Schema, Delete> = any>(
  schema: any, 
  remove: Delete
): Promise<any> {
  return 1;
}

export async function prepareRemoe<Schema, Delete extends ValidateDelete<Schema, Delete> = any>(
    schema: any, remove: Delete): Promise<any> {
  return 1;
}