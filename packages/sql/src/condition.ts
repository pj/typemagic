type ValidateBooleanOperators<Schema, Condition> =
  Condition extends {not: infer Not}
    ? {not: Validate<Schema, Not>}
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
            ? [ValidateExpression<Schema, Left>, ValidateExpression<Schema, Right>]
            : ["Must be two element tuple", "Must be two element tuple"]
          : never
    } extends infer Validated
      ? Validated extends {[Key in keyof Condition]: never}
        ? never
        : Validated
      : "Should not happen"


export type ValidateBoolean<Schema, Condition> =
    // Literals
    // Identifiers
    // Parameters
    // Logical Operators
    // Comparators
    // Boolean functions
  [Condition] extends [unknown[]]
    ?
    : ValidateBooleanOperators<Schema, Condition extends never
      ? ValidateEqualityOperators<Schema, 

export function generateCondition(where: any): string {
  if (Array.isArray(where)) {
    return where.map(w => generateCondition(w)).join(" AND ");
  } else if (where["not"]) {
    return ` NOT (${generateCondition(where["not"])})`
  }

  throw new Error("Unknown condition");
}
