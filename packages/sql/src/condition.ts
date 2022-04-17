import { ValidateExpression } from "./expression";
import { Parameter } from "./parameter";
import {format} from "@scaleleap/pg-format";

type ValidateLogicalOperators<Schema, Identifiers, Condition> =
  Condition extends {not: infer Not}
    ? {not: ValidateBoolean<Schema, Identifiers, Not>}
    : Condition extends {and: infer And}
      ? And extends Readonly<unknown[]>
        ? {and: ValidateBoolean<Schema, Identifiers, And>}
        : {and: "Must be an array"}
      : Condition extends {or: infer Or}
        ? Or extends Readonly<unknown[]>
          ? {or: ValidateBoolean<Schema, Identifiers, Or>}
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
    : never

export type ValidateBoolean<Schema, Identifiers, Condition> =
  // Literals
  Condition extends boolean
    ? boolean
    // Parameters
    : Condition extends Parameter<infer Type>
      ? Type extends boolean
        ? Parameter<Type>
        : "Parameter must be boolean"
      // Identifiers
      : Condition extends Identifiers
        ? Condition
        // Logical Operators
        : ValidateLogicalOperators<Schema, Identifiers, Condition> extends never
          // Comparators
          ? ValidateEqualityOperators<Schema, Condition> extends never
            ? "Unable to validate - must be boolean literal/operator/parameter"
            : ValidateEqualityOperators<Schema, Condition>
          : ValidateLogicalOperators<Schema, Identifiers, Condition>
      
    // TODO: Boolean functions

export function generateCondition(where: any): string {
  if (Array.isArray(where)) {
    return where.map(w => generateCondition(w)).join(" AND ");
  } else if (where["not"]) {
    return ` NOT (${generateCondition(where["not"])})`
  } else if (where === true || where === false) {
    return where ? "TRUE" : "FALSE"
  }

  throw new Error("Unknown condition");
}
