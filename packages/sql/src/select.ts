import { generateTableName } from "./delete";
import { ValidateSchema } from "./schema";
import {format} from "@scaleleap/pg-format";
import {format as syntaxFormat} from "sql-formatter";
import { ComputeFromAndJoins } from "./from";

export type GetSourceTable<From> =
  [From] extends [[infer Name, infer Alias]]
    ? Name
    : [From] extends [Readonly<[infer Name, infer Alias]>]
      ? Name
      : From extends infer Name
        ? Name
        : never

export type GetTableWithAlias<From> =
  [From] extends [[infer Name, infer Alias]]
    ? [Name, Alias]
    : [From] extends [Readonly<[infer Name, infer Alias]>]
      ? [Name, Alias]
      : From extends infer Name
        ? [Name, unknown]
        : never

export type GetJoinTableName<Join> =
  [Join] extends [[infer TableName, infer LeftColumnName, infer RightColumnName]]
    ? [TableName, unknown]
    : [Join] extends [Readonly<[infer TableName, infer LeftColumnName, infer RightColumnName]>]
      ? [TableName, unknown]
      : never

export type GetTableNamesOfJoin<Item> =
  GetJoinTableName<Item> extends [infer TableName, infer Alias] 
    ? TableName
    : never

export type IsColumnDuplicate<FromColumn, JoinColumns> =
  FromColumn extends JoinColumns
    ? FromColumn
    : never

export type GetDuplicatesForColumns<OtherTableName, Schema, TableColumns, TableName> =
    OtherTableName extends TableName
      ? never
      : OtherTableName extends keyof Schema
        ? Schema[OtherTableName] extends Readonly<unknown[]>
          ? IsColumnDuplicate<TableColumns, Schema[OtherTableName][number]>
          : never
        : never
  
export type GetDuplicateColumnsForTable<TableName, Schema, Tables> =
  TableName extends keyof Schema
    ? Schema[TableName] extends Readonly<unknown[]>
      ? GetDuplicatesForColumns<Tables, Schema, Schema[TableName][number], TableName>
      : never
    : never

export type GetDuplicateColumnNames<Schema, From, Joins> =
  [Joins] extends [Readonly<unknown[]>]
    ? GetSourceTable<From> extends infer TableName
      ? TableName extends keyof Schema
        ? Schema[TableName] extends Readonly<unknown[]>
          ? GetDuplicateColumnsForTable<
              GetTableNamesOfJoin<Joins[number]> | TableName, 
              Schema, 
              GetTableNamesOfJoin<Joins[number]> | TableName
            >
          : never
        : never
      : never
    : never

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
    Name extends DuplicateColumnNames
      ?  [ColumnName<TableName, Alias, Name>, string]
      : [Name, string] | Name

export type RemoveReadOnly<Value> =
  {-readonly [K in keyof Value]: Value[K]}

export type GetColumnNamesForJoins<Schema, Joins, DuplicateColumnNames> =
  [RemoveReadOnly<Joins>] extends [infer X]
    ? X extends unknown[]
      ? {
          [Key in keyof X]: 
            GetJoinTableName<X[Key]> extends [infer TableName, infer Alias]
              ? GenerateColumnNames<TableName, Alias, ArrayToUnion<Schema, TableName>, DuplicateColumnNames>
              : never
        }[number]
      : "Joins must be an array" // [RemoveReadOnly<Joins>, X, "Joins must be an array"]
    : "Joins must be an array"

export type GetValidColumnTypes<Schema, FromTable, Joins> =
  [GetTableWithAlias<FromTable>] extends [[infer From, infer Alias]]
    ? GetDuplicateColumnNames<Schema, From, Joins> extends infer DuplicateColumnNames
      ? GenerateColumnNames<From, Alias, ArrayToUnion<Schema, From>, DuplicateColumnNames>
        | GetColumnNamesForJoins<Schema, Joins, DuplicateColumnNames>
      : never
    : "Invalid table name"

export type ValidateSelect<Schema, From, Joins, Select> =
  [GetValidColumnTypes<Schema, From, Joins>] extends [infer Names]
    ? // Names
    {
        [Key in keyof Select]: 
          RemoveReadOnly<Select[Key]> extends Names
            ? Select[Key]
            : `Invalid column name`
      }
    : never

export type ValidateFrom<Schema, From> =
  [GetSourceTable<From>] extends [infer TableName]
    ? TableName extends keyof Schema
      ? From
      : "Uknown table name"
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