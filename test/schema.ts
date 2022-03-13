import { resolver } from '../src/output';
import {QueryRoot, schema} from '../src/schema'
import { registeredArgs } from './args'
import { Args, Test, test } from './test'

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
      resolve: async (args: ChildArgs, root: QueryRoot, context: any) => {
        return `asdf`;
      }
    },
    testQuery: {
      type: Test,
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
          resolve: async (args: ChildArgs, root: Test, context: any) => {
            return `asdf`;
          }
        }
      }
    }
  }
})


