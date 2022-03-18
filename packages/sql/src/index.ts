
type ValidateSelect<Select, DefaultTable, JoinTables> =
  [Select] extends [Array<'*' | keyof DefaultTable | [DefaultTable, keyof DefaultTable]> | {table: infer TableName, column: infer ColumnName}]
    ?  Select
    : 'Unable to figure out select'

type ValidateTableSchema<TableSchema> =
  [TableSchema] extends [{
    source: infer Source,
    nullable?: infer Nullable 
    type: infer Type
  }]
  ? "asdf"
  : "sadf"


type ExtractDefaultTable<From> =
  [From] extends [{
    table: infer Table,
  }]
    ? Table
    : [From] extends [infer Table]
      ? Table
      : unknown

export enum JoinTypes {
  FullOuterJoin,
  InnerJoin,
  LeftJoin
}


type ExtractJoinTable<Join, DefaultTable> =
  Join extends {
    table: infer Table 
    joinType?: infer JoinType
    on: infer On
  } 
    ? {
        table: Table,
        joinType: JoinType,
        on: undefined
      }
    : Join extends [infer SourceTable, infer X, infer DestTable, infer Y]
      ? [SourceTable, keyof SourceTable, DestTable, keyof DestTable]
      : "asdf"

type ExtractJoinTables<From, DefaultTable> =
  From extends {
    joins?: infer Joins
  }
    ? ExtractJoinTable<Joins, DefaultTable>
    : unknown

type ValidateFrom<From> =
  [From] extends [{
    table: infer Table,
    join?: infer Joins
  }]
    ? "here"
    : 'asdf'


type ValidateQuery<Query> =
  [Query] extends [
    {
      select?: infer Select,
      from?: infer From 
    }
  ] 
    ? ValidateSelect<
        Select, 
        ExtractDefaultTable<From>, 
        ExtractJoinTables<From, ExtractDefaultTable<From>>
      >
      & ValidateFrom<From>
   : "Can't infer query"


export function query<Query extends ValidateQuery<Query>>(query: Query) {

}