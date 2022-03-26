type ValidateSchema<Schema> =
  {
    [Key in keyof Schema]?:
      "Asdf"
  }

// Get column names that are common across the various tables that are being joined
type GetDuplicateColumns<Schemas> = 
  any

// Get Valid Column names for select.
type GetColumnTypes<From, Join, GroupNames> = 
  any

// Get all schemas
type GetSchemas<From, Joins> =
  any


type ValidateSelect<ColumnTypes> = {

}

type ValidateFrom<From> =
  [From] extends [{
    schema: infer Schema,
    join?: infer Joins
  }]
    ? "here"
    : 'asdf'

type ValidateJoin<Join> =
  [Join] extends [{
    schema: infer Schema,
    join?: infer Joins
  }]
    ? "here"
    : 'asdf'

type ValidateWhere<Where> =
  [Where] extends [{
    schema: infer Schema,
    join?: infer Joins
  }]
    ? "here"
    : 'asdf'

type ValidateQuery<Query> =
  [Query] extends [{
    select: infer Select,
    from?: infer From,
    join?: infer Join,
    where?: infer Where,
    orderBy?: infer OrderBy,
    groupBy?: infer GroupBy
  }]
    ? ValidateSelect<GetColumnTypes<From, Join, GroupBy>>
      & ValidateFrom<From>
    : "Unable to validate query"

