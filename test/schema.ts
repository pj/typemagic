import {schema} from '../src/schema'
import { Args, Test, test } from './test'

schema({
  queries: {
    testQuery: {
      source: {type: Test},
      resolve: test,
      args: {
        type: Args,
        runtimeTypes: {

        }
      }
    }
  }
})


