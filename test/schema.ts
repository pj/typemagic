import { QueryRoot, schema } from '../src/schema';
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
      type: String,
      args: {
        type: ChildArgs,
        runtimeTypes: {
          field: {type: String}
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
          type: String,
          args: {
            type: ChildArgs,
            runtimeTypes: {
              field: {type: String}
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


