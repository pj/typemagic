import { Args } from "./test"

// export type ValidateResolverFunction<ResolverFunction, ArgsType, Root> =
//   [unknown] extends [ArgsType]
//     ? [unknown] extends [ResolverFunction]
//       ? { resolve?: never, args?: never }
//       : {
//           resolve: (root: Root)
//             => [ResolverFunction] extends [(...args: infer X) => infer ReturnType]
//             ? ReturnType
//             : never,
//           args?: never
//         }
//     : {
//         resolve: (
//           args: ArgsType,
//           root: Root
//         ) => [ResolverFunction] extends [(...args: infer X) => infer ReturnType]
//           ? ReturnType
//           : never,
//         args: ArgsType
//       }

export type ValidateResolverFunction<ResolverFunction, ArgsType, Root> =
    [unknown] extends [ResolverFunction]
      ? unknown
      : [ResolverFunction] extends [(first: infer First, second: infer Second) => infer ReturnType]
        ? [unknown] extends [ArgsType]
          ? ((first: Root) => ReturnType) | (() => ReturnType)
          : ((first: ArgsType, second: Root) => ReturnType) | ((first: ArgsType) => ReturnType) | (() => ReturnType)
        : never
    // : {resolve?: never, args?: never}
  // [unknown] extends [ArgsType]
  //   ? [unknown] extends [ResolverFunction]
  //     ? { resolve?: never, args?: never }
  //     : {
  //         resolve: (root: Root)
  //           => [ResolverFunction] extends [(...args: infer X) => infer ReturnType]
  //           ? ReturnType
  //           : never,
  //         args?: never
  //       }
  //   : {
  //       resolve: (
  //         args: ArgsType,
  //         root: Root
  //       ) => [ResolverFunction] extends [(...args: infer X) => infer ReturnType]
  //         ? ReturnType
  //         : never,
  //       args: ArgsType
  //     }

type X = [{resolve: () => string, args: string}] extends [ValidateResolverFunction<(root: RootType) => string, string, RootType>]
  ? true : false

type Z = ValidateResolverFunction<(root: RootType) => string, string, RootType>

type Y = [() => string] extends [(arg: infer X) => string] ? X : never



export type ValidateResolver<Resolver, Root> =
  [Resolver] extends [{
    args?: infer ArgsType,
    resolve?: infer ResolverFunction
  }]
    ? [unknown] extends [ResolverFunction] 
      ? {resolve?: never, args?: never}
        : [ResolverFunction] extends [ValidateResolverFunction<ResolverFunction, ArgsType, Root>]
          ? [unknown] extends [ArgsType]
            ? {resolve: ResolverFunction, args?: never}
            : {resolve: ResolverFunction, args: ArgsType}
        : ["Invalid resolver function", ValidateResolverFunction<ResolverFunction, ArgsType, Root>]
    : "Can't infer type"


class RootType {}

function testValidate<X extends ValidateResolver<X, RootType>>(x: X) {
  return x;
}

testValidate({
});

testValidate({
  args: "test",
  resolve: (args: string) => {
    return `things`;
  }
});

testValidate({
  resolve: () => {
    return `things`;
  }
});

testValidate({
  // Errors out correctly
  resolve: (args: string, root: RootType) => {
    return `things`;
  }
});

testValidate({
  args: "test",
  // This should error out, since first parameter is not args: string.
  resolve: (root: RootType) => {
    return `things`;
  }
});
