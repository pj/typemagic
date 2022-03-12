import { Int } from "type-graphql";
import { BooleanOrUndefined, ArrayTrilean, ScalarTypes } from "./types";

// export type Scalar<RT, N extends BooleanOrUndefined, A extends ArrayTrilean> = {
//   type: RT,
//   nullable?: N,
//   array?: A
// };

// export type ScalarOptions<N extends BooleanOrUndefined, A extends ArrayTrilean> = {
//   nullable?: N, 
//   array?: A
// };

// export type GenerateScalarReturnType<RT extends ScalarTypes, O extends ScalarOptions<BooleanOrUndefined, ArrayTrilean> | undefined> =
//   [O] extends [undefined]
//     ? Scalar<RT, false, false>
//     : Scalar<
//         RT, 
//         [Exclude<O, undefined>['nullable']] extends [false | undefined]
//           ? false : true, 
//         [Exclude<O, undefined>['array']] extends [false | undefined] 
//           ? false 
//           : [Exclude<O, undefined>['array']] extends ["nullable_items"]
//             ? "nullable_items"
//             : true
//       >

// export function string<N extends BooleanOrUndefined, A extends ArrayTrilean>(
//   options?: ScalarOptions<N, A> | undefined
// ): Scalar<typeof String, N, A>{
//   return ({
//     nullable: options?.nullable,
//     array: options?.array,
//     type: String,
//   });
// }

// export function date<C, O extends ScalarOptions<BooleanOrUndefined, ArrayTrilean> | undefined>(
//   options?: O
// ): GenerateScalarReturnType<Date, O> {
//   return ({
//     nullable: options?.nullable,
//     array: options?.array,
//     type: Date,
//   }) as GenerateScalarReturnType<Date, O>;
// }

// export function int<C, O extends ScalarOptions<BooleanOrUndefined, ArrayTrilean> | undefined>(
//   options?: O
// ): GenerateScalarReturnType<> {
//   return ({
//     nullable: options?.nullable,
//     array: options?.array,
//     type: Int,
//   }) as GenerateScalarReturnType<Boolean, O>;
// }

// export function float<C, N extends boolean, A extends ArrayTrilean>(
//   options?: ScalarOptions<N, A>
// ): Scalar<number, N, A> {
//   return ({
//     nullable: options?.nullable,
//     array: options?.array,
//     type: Float,
//   });
// }

// export function boolean<C, N extends boolean, A extends ArrayTrilean>(
//   options?: ScalarOptions<N, A>
// ): Scalar<boolean, N, A> {
//   return ({
//     nullable: options?.nullable,
//     array: options?.array,
//     type: Boolean,
//   });
// }
