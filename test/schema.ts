import { QueryRoot, schema } from '../src/schema';
import { ScalarTypes } from '../src/types';
import { registeredArgs } from './args';
import { Test, test } from './test';

export class ChildArgs {
  constructor(
    public field: string
  ) {

  }
}

schema({
  queries: {
    stringField: {
      type: ScalarTypes.STRING,
      args: {
        type: ChildArgs,
        runtimeTypes: {
          field: ScalarTypes.STRING
        }
      },
      // @ts-ignore
      resolve: async (args: ChildArgs, root: QueryRoot, context: any) => {
        return `asdf`;
      }
    },
    testQuery: {
      type: Test,
      // @ts-ignore
      resolve: test,
      args: registeredArgs,
      runtimeTypes: {
        stringField: {
          type: ScalarTypes.STRING,
          args: {
            type: ChildArgs,
            runtimeTypes: {
              field: {type: ScalarTypes.STRING}
            }
          },
          // @ts-ignore
          resolve: async (args: ChildArgs, root: Test, context: any) => {
            return `asdf`;
          }
        }
      }
    }
  }
})


