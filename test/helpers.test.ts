import { build, fields, object } from "../src";
import { OutputType, QueryContext, QueryRoot, RootType } from "./utils";

const generatedSchema = build(
  {
    queries: fields(
      {
        test: {
          type: object(
            {
              name: OutputType.name,
              fields: {
                testField: 'String'
              }
            }, 
            OutputType
          ),
          nullable: true,
          resolve: (root: QueryRoot, context: QueryContext): OutputType | null => null
        }
      }, 
      QueryRoot,
      QueryContext
    )
  }, 
  { context: QueryContext, root: QueryRoot }
 );