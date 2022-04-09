import { generateTableName } from "./delete";
import { ValidateSchema } from "./schema";
import {format} from "@scaleleap/pg-format";
import {format as syntaxFormat} from "sql-formatter";
import { ComputeFromAndJoins } from "./from";

export type GetSourceTable<From> =
  [From] extends [infer Name, infer Alias]
    ? Name
    : From extends infer Name
      ? Name
      : never

export type GetTableWithAlias<From> =
  [From] extends [infer Name, infer Alias]
    ? [Name, Alias]
    : From extends infer Name
      ? [Name, unknown]
      : never

export type GetJoinTableName<Join> =
  [Join] extends [infer TableName, infer LeftColumnName, infer RightColumnName]
    ? [TableName, unknown]
    : never


export type GetDuplicates<Schema, TableName, From, Joins> = 
  [TableName] extends [keyof Schema]
    ? Schema[TableName] extends Readonly<unknown[]>
      ? Joins extends Readonly<unknown[]>
        ? {
            [JKey in keyof Joins]:
              GetJoinTableName<Joins[JKey]> extends [infer JoinName, infer Alias]
                ? JoinName extends TableName
                  ? never
                  : JoinName extends keyof Schema
                    ? Schema[JoinName] extends Readonly<unknown[]>
                      ? {
                          [JColumn in keyof Schema[JoinName]]:
                            JColumn extends keyof Schema[TableName]
                              ? JColumn
                              : never
                        }[number]
                      : never
                    : never
                  : never
          }[number]
          | (
            From extends TableName
              ? never
              : From extends keyof Schema
                ? Schema[From] extends Readonly<unknown[]>
                  ? {
                      [JColumn in keyof Schema[From]]:
                        JColumn extends keyof Schema[TableName]
                          ? JColumn
                          : never
                    }[number]
                  : never
                : never
          )
        : "Joins must be an array"
      : "Table columns must be array"
    : `Unknown table name ${string & TableName}`

export type DuplicatedColumns<Schema, From, Joins> =
  [Joins] extends [Readonly<unknown[]>]
  ? {
      [Key in keyof Joins]: 
        GetJoinTableName<Joins[Key]> extends keyof Schema
          ? GetDuplicates<
              Schema,
              GetJoinTableName<Joins[Key]>, 
              From,
              Joins
            >
          : `Unknown table name ${GetJoinTableName<Joins[Key]>}`
    }[number]
    | (
      GetSourceTable<From> extends infer TableName
        ? GetDuplicates<Schema, TableName, From, Joins>
        : never
    )
  : "Joins must be an array"

type ColumnName<TableName, Alias, ColumnName> =
  [unknown] extends [Alias]
    ? `${string & TableName}.${string & ColumnName}`
    : `${string & Alias}.${string & ColumnName}`

export type ArrayToUnion<Schema, TableName> =
  [TableName] extends [keyof Schema]
    ?  [Schema[TableName]] extends [Readonly<unknown[]>]
      ? Schema[TableName][number]
      : never
    : never

export type GenerateColumnNames<TableName, Alias, Name, DuplicateColumnNames> =
  ColumnName<TableName, Alias, Name>
  | (
      Name extends DuplicateColumnNames
        ? never
        : Name
    )

export type ColumnNamesForJoins<Schema, Joins, DuplicateColumnNames> =
  [Joins] extends [unknown[]]
  ? {
      [Key in keyof Joins]: 
        GetJoinTableName<Joins[Key]> extends [infer TableName, infer Alias]
          ? GenerateColumnNames<TableName, Alias, ArrayToUnion<Schema, TableName>, DuplicateColumnNames>
          : never
    }[number]
  : "Joins must be an array"

export type ColumnNames<Schema, FromTable, Joins> =
  [GetTableWithAlias<FromTable>] extends [[infer From, infer Alias]]
    ? [DuplicatedColumns<Schema, From, Joins>] extends [infer DuplicateColumnNames]
      ? GenerateColumnNames<From, Alias, ArrayToUnion<Schema, From>, DuplicateColumnNames>
        | ColumnNamesForJoins<Schema, Joins, DuplicateColumnNames>
      : never
    : "Invalid table name"

export type ValidateSelect<Schema, From, Joins, Select> =
  [ColumnNames<Schema, From, Joins>] extends [infer Names]
    ? {
        [Key in keyof Select]: 
          Select[Key] extends Names
            ? Select[Key]
            : `Invalid column name ${string & Select[Key]}`
      }
    : never

export type ValidateFrom<Schema, From> =
  GetSourceTable<From> extends infer TableName
    ? TableName extends keyof Schema
      ? From
      : `Unknown table ${string & TableName}`
    : never

export type ValidateJoins<Schema, Joins> =
  Joins

export type ValidateSelectStatement<Schema, SelectStatement> =
  [SelectStatement] extends [{
    select: infer Select,
    from?: infer From,
    join?: infer Joins
  }] 
    ? {
        select: ValidateSelect<Schema, From, Joins, Select>
      }
      & (
        unknown extends From
          ? {}
          : { from: ValidateFrom<Schema, From>}
      )
      & (
        unknown extends Joins
          ? {}
          : { join: ValidateJoins<Schema, Joins>}
      )
    : "Invalid select format"


export function select<
  Schema, //extends ValidateSchema<Schema>, 
  Select extends ValidateSelectStatement<Schema, Select>
>(schema: Schema, select: Select): string {
  const removeAny = select as any; 
  return syntaxFormat(`
    SELECT FROM ${generateTableName(removeAny.from)}
  `);
}