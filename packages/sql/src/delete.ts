// DELETE FROM [ ONLY ] table_name [ * ] [ [ AS ] alias ]
//     [ USING from_item [, ...] ] -- not standard
//     [ WHERE condition | WHERE CURRENT OF cursor_name ]
//     [ RETURNING * | output_expression [ [ AS ] output_name ] [, ...] ]

// [{},{},{not: {or:[{},{}]}}]
import {format} from "@scaleleap/pg-format";
import { ValidateBoolean } from "./condition";
import { ValidateTableName } from "./schema";


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
    ? {where: ValidateBoolean<Schema, Where>}
    : {}

type ValidateDelete<Schema, Delete> = 
  [Delete] extends [{
    from: infer TableName,
    only?: infer Only,
    where?: infer Where,
    returning?: infer Returning
  }]
    ? ValidateTableName<Schema, TableName> 
      & unknown extends Only ? {} : {only: boolean}
      & ValidateWhere<Schema, Where>
    : "Unable to validate delete"

export function generateTableName(from: any) {
  if (Array.isArray(from)) {
    let [tableName, aliasName] = from;
    return format("%I AS %I", tableName, aliasName);
  } else {
    return format("%I", from);
  }
}

export function generateRemoveSQL<
  Schema, 
  Delete extends ValidateDelete<Schema, Delete> = any
>(schema: any, remove: any) {
  return `
DELETE FROM ${remove.only ? "ONLY" : ""} ${generateTableName(remove.from)}
WHERE ${generateCondition(remove.where)}
`;
}

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