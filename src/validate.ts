import { Constructor, GetRuntimeScalarType } from "./types";

// export type ValidateNullability<ReturnType, Nullability> =
//   [null] extends [ReturnType]
//     ? [Nullability] extends [true]
//       ? [Nullability] extends [undefined | unknown]
//         ? "Nullability is also undefined"
//         : true
//       : "Return type is null, but nullable not set to true."
//     : [Nullability] extends [false | undefined | unknown]
//       ? true
//       : "Return type is not null, but nullable is set"

// export type ValidateArray<ReturnType, ArrayType> =
//   [ReturnType] extends [Array<infer X>]
//     ? [ArrayType] extends [true]
//       ? [ArrayType] extends [undefined | unknown]
//         ? "ArrayType is possibly undefined, even though return type is an array."
//         : [null] extends [X]
//           ? "Elements of array are nullable, even though runtime type is not set to nullable_items"
//           : true
//       : [ArrayType] extends ["nullable_items"]
//         ? [ArrayType] extends [undefined | unknown]
//           ? "ArrayType is possibly undefined, even though return type is an array."
//           : [null] extends [X]
//             ? true
//             : "Elements of array are not nullable, even though runtime type is set to nullable_items"
//         : ["Return type is array, but array is not a known value", ArrayType]
//     : [ArrayType] extends [false | undefined | unknown]
//       ? true
//       : "Return type is not an array but runtime array is set."

// export type ValidateArgs<ArgsType, FunctionArgs> =
//    [ArgsType] extends [Constructor<FunctionArgs>]
//     ? true
//     : "args parameter does not match runtime type";

// export type ValidateType<Input> =
//   [GetRuntimeScalarType<Input>] extends ["Scalar Type not found"]
//     ? 
//       [Input] extends [{
//         type: infer Type,
//         nullable?: infer Nullability,
//         array?: infer ArrayType,
//         args?: {
//           type?: infer ArgsType,
//           runtimeTypes?: infer ArgsRuntimeTypes
//         },
//         resolve?: (args: infer FunctionArgs, root: infer Root, context: infer Context) => Promise<infer ReturnType>
//         runtimeTypes?: infer RuntimeTypes
//       }]
//         ? [ValidateNullability<ReturnType, Nullability>] extends [true]
//           ? [ValidateArray<ReturnType, ArrayType>] extends [true]
//             ? [ValidateArgs<ArgsType, FunctionArgs>] extends [true]
//               ? {
//                   args: {
//                     [Key in keyof ArgsRuntimeTypes]:
//                       [Key] extends [keyof FunctionArgs]
//                         ? true
//                         : `Key ${Key & string} not in args type`
//                   }, 
//                   runtimeTypes: {
//                     [Key in keyof RuntimeTypes]: 
//                       [Key] extends [keyof ReturnType]
//                         ? true
//                         : `Key ${Key & string} not in return type`
//                   }
//                 }
//               : ValidateArgs<ArgsType, FunctionArgs>
//             : ValidateArray<ReturnType, ArrayType>
//           : ValidateNullability<ReturnType, Nullability>
//         : "Can't infer from input type"
//     : "Scalar Valid"

// export type ValidateFields<Fields> =
//     {
//       [Key in keyof Fields]:
//         ValidateType<Fields[Key]>
//     }

export type ValidateNullability<ReturnType, Nullability> =
  [null] extends [ReturnType]
    ? [Nullability] extends [true]
      ? [Nullability] extends [undefined | unknown]
        ? "Nullability is also undefined"
        : true
      : "Return type is null, but nullable not set to true."
    : [Nullability] extends [false | undefined | unknown]
      ? true
      : "Return type is not null, but nullable is set"

export type ValidateArray<ReturnType, ArrayType> =
  [ReturnType] extends [Array<infer X>]
    ? [ArrayType] extends [true]
      ? [ArrayType] extends [undefined | unknown]
        ? "ArrayType is possibly undefined, even though return type is an array."
        : [null] extends [X]
          ? "Elements of array are nullable, even though runtime type is not set to nullable_items"
          : true
      : [ArrayType] extends ["nullable_items"]
        ? [ArrayType] extends [undefined | unknown]
          ? "ArrayType is possibly undefined, even though return type is an array."
          : [null] extends [X]
            ? true
            : "Elements of array are not nullable, even though runtime type is set to nullable_items"
        : ["Return type is array, but array is not a known value", ArrayType]
    : [ArrayType] extends [false | undefined | unknown]
      ? true
      : "Return type is not an array but runtime array is set."

export type ValidateArgs<ArgsType, FunctionArgs> =
   [ArgsType] extends [Constructor<FunctionArgs>]
    ? true
    : "args parameter does not match runtime type";


export type ValidateType<Input> =
  [Input] extends [{
    type?: infer Type,
    nullable?: infer Nullability,
    array?: infer ArrayType,
    args?: {
      type?: infer ArgsType,
      runtimeTypes?: infer ArgsRuntimeTypes
    },
    resolve?: (args: infer FunctionArgs, root: infer Root, context: infer Context) => Promise<infer ReturnType>
    runtimeTypes?: infer RuntimeTypes
  }]
    ? 
    {
      type: Type,
      nullable?: Nullability,
      array?: ArrayType,
      args?: {
        type?: ArgsType,
        runtimeTypes?: ArgsRuntimeTypes
      },
      resolve?: (args: FunctionArgs, root: Root, context: Context) => Promise<ReturnType>
      runtimeTypes?: RuntimeTypes
    }
    : "Can't infer type"

export type ValidateFields<Fields> =
  [Fields] extends [{[key: string]: any}]
    ?  
    {
      [Key in keyof Fields]:
        ValidateType<Fields[Key]>
    }
    : never