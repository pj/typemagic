import { generateTableName } from "./delete";
import { ValidateSchema } from "./schema";
import {format} from "@scaleleap/pg-format";
import {format as syntaxFormat} from "sql-formatter";
import { ComputeFrom, ComputeFromAndJoins } from "./from";
import { Expand } from "./types";
import { generateCondition, ValidateWhere } from "./condition";

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
    ? [Schema[TableName]] extends [Readonly<unknown[]>]
      ? Schema[TableName][number]
      : never
    : never

export type GenerateColumnNames<TableName, Alias, Name, DuplicateColumnNames> =
  Name extends DuplicateColumnNames
    ? [ColumnName<TableName, Alias, Name>, string]
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
      : "Joins must be an array"
    : "Joins must be an array"

export type GetValidColumnTypes<Schema, FromTable, Joins> =
  [GetTableWithAlias<FromTable>] extends [[infer From, infer Alias]]
    ? GetDuplicateColumnNames<Schema, From, Joins> extends infer DuplicateColumnNames
      ? [
          GenerateColumnNames<From, Alias, ArrayToUnion<Schema, From>, DuplicateColumnNames>
          | GetColumnNamesForJoins<Schema, Joins, DuplicateColumnNames>,
          DuplicateColumnNames
        ]
      : never
    : "Invalid table name"

export type ValidateSelect<Schema, From, Joins, Select> =
  [GetValidColumnTypes<Schema, From, Joins>] extends [[infer Names, infer DuplicateColumnNames]]
    ? {
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

export type GenerateJoinColumnNames<Joins, Schema> =
  [RemoveReadOnly<Joins>] extends [infer X]
    ? X extends unknown[]
      ? {
          [Key in keyof X]: 
            GetJoinTableName<X[Key]> extends [infer TableName, infer Alias]
              ? ColumnName<TableName, Alias, ArrayToUnion<Schema, TableName>>
              : never
        }[number]
      : "Join must be an array"
    : "Can't remove readonly"

export type GenerateTargetColumnNames<Joins, Schema, FromName, FromAlias> =
  GenerateJoinColumnNames<Joins, Schema> | 
  ColumnName<FromName, FromAlias, ArrayToUnion<Schema, FromName>>

export type JoinDetails<Join> = 
  [Join] extends [[infer TableName, infer AliasName, infer LeftColumnName, infer RightColumnName]]
    ? [TableName, AliasName, LeftColumnName, RightColumnName]
    : Join extends Readonly<[infer TableName, infer AliasName, infer LeftColumnName, infer RightColumnName]>
      ? [TableName, AliasName, LeftColumnName, RightColumnName]
      : Join extends [infer TableName, infer LeftColumnName, infer RightColumnName]
        ? [TableName, unknown, LeftColumnName, RightColumnName]
        : Join extends Readonly<[infer TableName, infer LeftColumnName, infer RightColumnName]>
          ? [TableName, unknown, LeftColumnName, RightColumnName]
          : never

export type ValidateJoins<Schema, From, Joins> =
  [GetTableWithAlias<From>] extends [[infer FromName, infer FromAlias]]
    ? {
        [Key in keyof Joins]: 
          JoinDetails<Joins[Key]> extends [infer JoinName, infer JoinAlias, infer LeftColumnName, infer RightColumnName]
            ? LeftColumnName extends ColumnName<JoinName, JoinAlias, ArrayToUnion<Schema, JoinName>>
              ? RightColumnName extends GenerateTargetColumnNames<Joins, Schema, FromName, FromAlias>
                ? Joins[Key]
                : 
                Expand<GenerateTargetColumnNames<Joins, Schema, FromName, FromAlias>>
                // "Invalid target column"
              : "Invalid source column"
            : "Invalid Join"
            
          //   [
          //         JoinName, 
          //       ]
          //   : "Should not happen"
          // GetJoinTableName<Joins[Key]> extends [infer JoinName, infer AliasName]
          //   ? [
          //       JoinName, 
          //       ColumnName<JoinName, AliasName, ArrayToUnion<Schema, JoinName>>,
          //       GenerateTargetColumnNames<Joins, Schema> 
          //         | ColumnName<FromName, FromAlias, ArrayToUnion<Schema, FromName>>
          //     ]
          //   : "here"
      }
    : "Can't get column types for joins"

export type ValidateSelectStatement<Schema, SelectStatement> =
  [SelectStatement] extends [{
    select: infer Select,
    from?: infer From,
    join?: infer Joins,
    where?: infer Where
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
            : { join: ValidateJoins<Schema, From, Joins>}
        )
      & ValidateWhere<Schema, ComputeFrom<Schema, From>, Where>
    : "Invalid select format"
    
function projection(select: any) {
  const columns: string[] = [];
  for (let column of select) {
    if (Array.isArray(column)) {
      columns.push(
        `${format("%I", column[0])} AS ${format("%I", column[1])}`
      );
    } else {
      columns.push(
        `${format("%I", column)}`
      );
    }
  }
  return columns.join(", ");
}

export function select<
  Schema,
  Select extends ValidateSelectStatement<Schema, Select>
>(schema: Schema, select: Select): string {
  const selectAny = select as any; 
  return syntaxFormat(`
    SELECT ${projection(selectAny.select)}
    FROM ${generateTableName(selectAny.from)}
    WHERE ${generateCondition(selectAny.where)}
  `);
}