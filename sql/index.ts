
type ValidateSelect<Select, From> =
  [unknown] extends [Select]
    ? { select: never }
    : [unknown] extends [From] 
      ? {select: "No from"}
      : {
          select: {
            [Key in keyof Select]:
              [Key] extends [keyof From]
                ? true 
                  | string 
                : never
          }
        }

type ValidateQuery<Query> =
  [Query] extends [
    {
      select?: infer Select,
      from?: infer From 
    }
  ] 
   ? ValidateSelect<Select, From>
   : "Can't infer query"


export function query<Query extends ValidateQuery<Query>>(query: Query) {

}