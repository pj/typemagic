import { ArgsObject } from "./args";
import { OutputObject } from "./output"
import { ArrayTrilean, BooleanOrUndefined, GenerateReturnType} from "./types";

export type Resolver<R, C, A, O, N extends BooleanOrUndefined, Arr extends ArrayTrilean> = {
  args?: ArgsObject<A>
  type: OutputObject<C, O, N, Arr>,
  nullable?: N,
  array?: Arr,
  name?: string,
  description?: string,
  deprecationReason?: string,
  resolve: (args: A, root: R, context: C) => Promise<GenerateReturnType<O, N, Arr>>
}

// export type RegisteredResolver<R, C, A, O, N extends BooleanOrUndefined, Arr extends ArrayTrilean> = 
//   RegisteredObject<Resolver<R, C, A, O, N, Arr>>;

// // FIXME: resolver is separate from query because I couldn't find a way to make args dependant on the type of the 
// // resolve function
// export function query<R, A, O, N extends BooleanOrUndefined, Arr extends ArrayTrilean, C = any>(
//   query: Resolver<R, C, A, O, N, Arr>
// ): RegisteredResolver<R, C, A, O, N, Arr> {
//   return {...query, registered: true};
// }