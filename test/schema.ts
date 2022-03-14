import { QueryRoot, schema } from '../src/schema';
import { ScalarTypes } from '../src/types';
import { registeredArgs } from './args';
import { RelatedClass, Test, test } from './test';

export class ChildArgs {
  constructor(
    public field: string
  ) {

  }
}

export class NestedChildArgs {
  constructor(
    public field: string,
    public nullableField: string | null,
    public arrayField: string[] | null,
    public childArgs: ChildArgs,
    public arrayOfChildArgs: (ChildArgs | null)[] | null
  ) {

  }
}

schema({
  queries: {
    testQuery: {
      type: ScalarTypes.STRING,
      args: {
        type: NestedChildArgs,
        runtimeTypes: {
          field: {type: ScalarTypes.STRING},
          nullableField: { type: ScalarTypes.STRING, nullable: true },
          arrayField: {type: ScalarTypes.STRING, nullable: true, array: true},
          childArgs: {
            type: ChildArgs, 
            runtimeTypes: {
              field: {type: ScalarTypes.STRING}
            }
          },
          arrayOfChildArgs: {
            type: ChildArgs,
            nullable: true,
            array: "nullable_items",
            runtimeTypes: {
              field: {type: ScalarTypes.STRING}
            }
          }
        },
      },
      nullable: true,
      resolve: async (root: QueryRoot, context: any): Promise<string | null> => {
        return `asdf`;
      }
    },
   otherQuery: {
      type: RelatedClass,
      nullable: true,
      runtimeTypes: {
        testField: {type: ScalarTypes.STRING}
      }
    }
  }
  },
}
);