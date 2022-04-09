// DELETE FROM [ ONLY ] table_name [ * ] [ [ AS ] alias ]
//     [ USING from_item [, ...] ] -- not standard
//     [ WHERE condition | WHERE CURRENT OF cursor_name ]
//     [ RETURNING * | output_expression [ [ AS ] output_name ] [, ...] ]
import {format} from "@scaleleap/pg-format";
import {format as syntaxFormat} from "sql-formatter";
import { generateCondition, ValidateBoolean } from "./condition";
import { ComputeFrom } from "./from";
import { ValidateSchema, ValidateTableName } from "./schema";
import dedent from 'dedent-js'

export type ValidateWhere<Schema, Identifiers, Where> =
  [unknown] extends [Where]
    ? {}
    : {where: ValidateBoolean<Schema, Identifiers,  Where>}

export type ValidateDelete<Schema, Delete> = 
  [Delete] extends [{
    from: infer TableName,
    only?: infer Only,
    where?: infer Where,
    returning?: infer Returning
  }]
    ?  ValidateTableName<Schema, TableName> 
    //   // & unknown extends Only ? {} : {only: boolean}
      & ValidateWhere<Schema, ComputeFrom<Schema, TableName>, Where>
    : "Unable to validate delete"

export function generateTableName(from: any) {
  if (Array.isArray(from)) {
    let [tableName, aliasName] = from;
    return format("%I AS %I", tableName, aliasName);
  } else {
    return format("%I", from);
  }
}

export function remove<
  Schema extends ValidateSchema<Schema>, 
  Delete extends ValidateDelete<Schema, Delete>
>(schema: Schema, remove: Delete): string {
  const removeAny = remove as any; 
  return syntaxFormat(`
    DELETE FROM ${removeAny.only ? "ONLY" : ""} ${generateTableName(removeAny.from)}
    WHERE ${generateCondition(removeAny.where)}
  `);
}