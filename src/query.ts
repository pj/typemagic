import { ArgsObject } from "./args";
import { OutputObject } from "./output"
import { ArrayTrilean, BooleanOrUndefined, GenerateReturnType} from "./types";

// export type Resolver<R, C, A, O, N extends BooleanOrUndefined, Arr extends ArrayTrilean> = {
//   args?: ArgsObject<A>
//   type: OutputObject<C, O, N, Arr>,
//   nullable?: N,
//   array?: Arr,
//   name?: string,
//   description?: string,
//   deprecationReason?: string,
//   resolve: (args: A, root: R, context: C) => Promise<GenerateReturnType<O, N, Arr>>
// }