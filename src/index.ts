import { RegisteredQuery } from "./query";

export function schema<C = any>(
  schema: {
    queries?: {
      [key: string]: RegisteredQuery<any, C, any, any>
    },
    mutations?: {
      [key: string]: string
    }
  }
) {

}
