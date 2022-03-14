import { Int } from "type-graphql";
import { ScalarOrInput } from "../src/input";
import { QueryRoot } from "../src/schema";
import { ValidateArgs, ValidateResolvers, ValidateNullability, ValidateResolver, ValidateArray, ValidateInputRuntimeType, ValidateInputRuntimeTypes, ExtractFunctionDetails } from "../src/validate";
import { Constructor, GenerateArrayTrilean, GenerateNullabilityAndArrayRuntimeOptions, GenerateReturnType, GetRuntimeType, ScalarTypes } from "../src/types";
import { registeredArgs } from "./args";
import { ChildArgs, NestedChildArgs } from "./schema";
import { RelatedClass, test, Test, TestInputObject } from "./test";

type Extends<A, B> = A extends B ? true : false;

function testType<X>(x: X): void { }

type DTF = GenerateReturnType<Date, true, false>
testType<DTF>(new Date());
// @ts-expect-error
testType<DTF>([new Date()]);
// @ts-expect-error
testType<DTF>([null]);
testType<DTF>(null);

type DTT = GenerateReturnType<Date, true, true>
// @ts-expect-error
testType<DTT>(new Date())
testType<DTT>([new Date()])
// @ts-expect-error
testType<DTT>([null]);
testType<DTT>(null);

type DFT = GenerateReturnType<Date, false, true>
// @ts-expect-error
testType<DFT>(new Date())
testType<DFT>([new Date()]);
// @ts-expect-error
testType<DFT>([null]);
// @ts-expect-error
testType<DFT>(null);

type DFF = GenerateReturnType<Date, false, false>
testType<DFF>(new Date())
// @ts-expect-error
testType<DFF>([new Date()]);
// @ts-expect-error
testType<DFF>([null]);
// @ts-expect-error
testType<DFF>(null);

type DTN = GenerateReturnType<Date, true, "nullable_items">
// @ts-expect-error
testType<DTN>(new Date())
testType<DTN>([new Date()]);
testType<DTN>([null]);
testType<DTN>(null);

type DFN = GenerateReturnType<Date, false, "nullable_items">
// @ts-expect-error
testType<DFN>(new Date())
testType<DFN>([new Date()]);
testType<DFN>([null]);
// @ts-expect-error
testType<DFN>(null);

type DUU = GenerateReturnType<Date, undefined, undefined>
type DFU = GenerateReturnType<Date, false, undefined>
type DTU = GenerateReturnType<Date, true, undefined>
type DUF = GenerateReturnType<Date, undefined, false>
type DUT = GenerateReturnType<Date, undefined, true>
type DUN = GenerateReturnType<Date, undefined, "nullable_items">

type STF = GenerateReturnType<string, true, false>
type STT = GenerateReturnType<string, true, true>
type SFT = GenerateReturnType<string, false, true>
type SFF = GenerateReturnType<string, false, false>
type STN = GenerateReturnType<string, true, "nullable_items">
type SFN = GenerateReturnType<string, false, "nullable_items">
type SUU = GenerateReturnType<string, undefined, undefined>
type SFU = GenerateReturnType<string, false, undefined>
type STU = GenerateReturnType<string, true, undefined>
type SUF = GenerateReturnType<string, undefined, false>
type SUT = GenerateReturnType<string, undefined, true>
type SUN = GenerateReturnType<string, undefined, "nullable_items">

type GSF = GenerateArrayTrilean<string>
testType<GSF>(false);
type GST = GenerateArrayTrilean<string[]>
testType<GST>(true);
type GSN = GenerateArrayTrilean<(string | null)[]>
testType<GSN>("nullable_items");
type GSUF = GenerateArrayTrilean<string | undefined>
testType<GSUF>(false);
type GSUT = GenerateArrayTrilean<string[] | undefined>
testType<GSUT>(true);
type GSUN = GenerateArrayTrilean<(string | null)[] | undefined>
testType<GSUN>("nullable_items");

// Test underlying runtime type
type SANU = GetRuntimeType<string[] | null | undefined>
testType<SANU>(ScalarTypes.STRING);
type SAU = GetRuntimeType<string[] | undefined>
testType<SAU>(ScalarTypes.STRING);
type SAN = GetRuntimeType<string[] | null>
testType<SAN>(ScalarTypes.STRING);
type SA = GetRuntimeType<string[]>
testType<SA>(ScalarTypes.STRING);
type SNU = GetRuntimeType<string | null | undefined>
testType<SNU>(ScalarTypes.STRING);
type SN = GetRuntimeType<string | null>
testType<SN>(ScalarTypes.STRING);
type S = GetRuntimeType<string>
testType<S>(ScalarTypes.STRING);
type SINU = GetRuntimeType<(string | null)[] | null | undefined>
testType<SINU>(ScalarTypes.STRING);
type SIN = GetRuntimeType<(string | null)[] | null>
testType<SIN>(ScalarTypes.STRING);
type SIU = GetRuntimeType<(string | null)[] | undefined>
testType<SIU>(ScalarTypes.STRING);
type SI = GetRuntimeType<(string | null)[]>
testType<SI>(ScalarTypes.STRING);

type IANU = GetRuntimeType<TestInputObject[] | null | undefined>
testType<IANU>(TestInputObject);
type IAU = GetRuntimeType<TestInputObject[] | undefined>
testType<IAU>(TestInputObject);
type IAN = GetRuntimeType<TestInputObject[] | null>
testType<IAN>(TestInputObject);
type IA = GetRuntimeType<TestInputObject[]>
testType<IA>(TestInputObject);
type INU = GetRuntimeType<TestInputObject | null | undefined>
testType<INU>(TestInputObject);
type IN = GetRuntimeType<TestInputObject | null>
testType<IN>(TestInputObject);
type I = GetRuntimeType<TestInputObject>
testType<I>(TestInputObject);
type IINU = GetRuntimeType<(TestInputObject | null)[] | null | undefined>
testType<IINU>(TestInputObject);
type IIU = GetRuntimeType<(TestInputObject | null)[] | undefined>
testType<IIU>(TestInputObject);
type IIN = GetRuntimeType<(TestInputObject | null)[] | null>
testType<IIN>(TestInputObject);
type II = GetRuntimeType<(TestInputObject | null)[]>
testType<II>(TestInputObject);

// Test Scalar / Input Object
type InputStringNullableItemsNullUndefined = (string | null)[] | null | undefined;
type InputStringArrayNullUndefined = string[] | null | undefined;
type InputStringArrayUndefined = string[] | undefined;
type InputStringArray = string[];
type InputStringNullUndefined = string | null | undefined;
type InputString = string;

type ScalarOrInputStringNullableItemsNullUndefined = ScalarOrInput<InputStringNullableItemsNullUndefined>
type ValidStringNullableItemsNullUndefined = Extends<ScalarOrInputStringNullableItemsNullUndefined, { type: StringConstructor, nullable: true, array: "nullable_items" }>
testType<ValidStringNullableItemsNullUndefined>(true);

type ScalarOrInputStringArrayNullUndefined = ScalarOrInput<InputStringArrayNullUndefined>
type ValidStringArrayNullUndefined = Extends<ScalarOrInputStringArrayNullUndefined, { type: StringConstructor, nullable: true, array: true }>
testType<ValidStringArrayNullUndefined>(true);

type ScalarOrInputStringArrayUndefined = ScalarOrInput<InputStringArrayUndefined>;
type ValidStringArrayUndefined = Extends<ScalarOrInputStringArrayUndefined, { type: StringConstructor, nullable?: false, array: true }>
testType<ValidStringArrayUndefined>(true);

type ScalarOrInputStringArray = ScalarOrInput<InputStringArray>;
type ValidStringArray = Extends<ScalarOrInputStringArray, { type: StringConstructor, nullable?: false, array: true }>
testType<ValidStringArray>(true);

type ScalarOrInputStringNullUndefined = ScalarOrInput<InputStringNullUndefined>;
type ValidStringNullUndefined = Extends<ScalarOrInputStringNullUndefined, { type: StringConstructor, nullable: true, array?: false }>
testType<ValidStringNullUndefined>(true);

type ScalarOrInputString = ScalarOrInput<InputString>;
type ValidString = Extends<ScalarOrInputString, { type: StringConstructor, nullable?: false, array?: false }>
testType<ValidString>(true);

type InputTestInputObjectNullableItemsNullUndefined = (TestInputObject | null)[] | null | undefined;
// type InputTestInputObjectArrayNullUndefined = TestInputObject[] | null | undefined;
// type InputTestInputObjectArrayUndefined = TestInputObject[] | undefined;
// type InputTestInputObjectArray = TestInputObject[];
// type InputTestInputObjectNullUndefined = TestInputObject | null | undefined;
// type InputTestInputObject = TestInputObject;

// type X = InputRuntimeTypes<GetIfArray<Exclude<InputTestInputObjectNullableItemsNullUndefined, null | undefined>>>

type ScalarOrInputTestInputObjectNullableItemsNullUndefined = ScalarOrInput<InputTestInputObjectNullableItemsNullUndefined>
type ValidTestInputObjectNullableItemsNullUndefined =
  Extends<
    ScalarOrInputTestInputObjectNullableItemsNullUndefined,
    {
      type: Constructor<TestInputObject>,
      nullable: true,
      array: "nullable_items",
      runtimeTypes: {
        stringField: { type: typeof String }
        booleanField: { type: typeof String },
        dateField: { type: typeof Date },
        numberField: { type: typeof Int },
        nullableField: { type: typeof String, nullable: true },
        arrayField: { type: typeof String, array: true },
        nullableArrayField: { type: typeof String, nullable: true, array: true }
        nullableItemsField: { type: typeof String, nullable: true, array: "nullable_items" }
      }
    }
  >
// test<ValidTestInputObjectNullableItemsNullUndefined>(true);

// type ScalarOrInputTestInputObjectArrayNullUndefined = ScalarOrInput<InputTestInputObjectArrayNullUndefined>
// type ValidTestInputObjectArrayNullUndefined = Extends<ScalarOrInputTestInputObjectArrayNullUndefined, { type: TestInputObject, nullable: true, array: true }>
// test<ValidTestInputObjectArrayNullUndefined>(true);

// type ScalarOrInputTestInputObjectArrayUndefined = ScalarOrInput<InputTestInputObjectArrayUndefined>;
// type ValidTestInputObjectArrayUndefined = Extends<ScalarOrInputTestInputObjectArrayUndefined, { type: TestInputObject, nullable?: false, array: true }>
// test<ValidTestInputObjectArrayUndefined>(true);

// type ScalarOrInputTestInputObjectArray = ScalarOrInput<InputTestInputObjectArray>;
// type ValidTestInputObjectArray = Extends<ScalarOrInputTestInputObjectArray, { type: TestInputObject, nullable?: false, array: true }>
// test<ValidTestInputObjectArray>(true);

// type ScalarOrInputTestInputObjectNullUndefined = ScalarOrInput<InputTestInputObjectNullUndefined>;
// type ValidTestInputObjectNullUndefined = Extends<ScalarOrInputTestInputObjectNullUndefined, { type: TestInputObject, nullable: true, array?: false }>
// test<ValidTestInputObjectNullUndefined>(true);

// type ScalarOrInputTestInputObject = ScalarOrInput<InputTestInputObject>;
// type ValidTestInputObject = Extends<ScalarOrInputTestInputObject, { type: TestInputObject, nullable?: false, array?: false }>
// test<ValidTestInputObject>(true);


// Resolver

const asdf = {
  stringField: {
    type: ScalarTypes.STRING,
    args: {
      type: ChildArgs,
      runtimeTypes: {
        field: ScalarTypes.STRING
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
    nullable: true,
    // runtimeTypes: {
    //   stringField: {
    //     type: ScalarTypes.STRING,
    //     args: {
    //       type: ChildArgs,
    //       runtimeTypes: {
    //         field: {type: ScalarTypes.STRING}
    //       }
    //     },
    //     resolve: async (args: ChildArgs, root: Test, context: any) => {
    //       return `asdf`;
    //     }
    // }
    // }
  }
} as const;

testType<GenerateNullabilityAndArrayRuntimeOptions<string>>({ nullable: false })
testType<GenerateNullabilityAndArrayRuntimeOptions<string>>({})
testType<GenerateNullabilityAndArrayRuntimeOptions<string | null>>({ nullable: true })
testType<GenerateNullabilityAndArrayRuntimeOptions<string>>({})
testType<GenerateNullabilityAndArrayRuntimeOptions<string[]>>({array: true})
testType<GenerateNullabilityAndArrayRuntimeOptions<string[] | null>>({ array: true, nullable: true });

testType<GenerateNullabilityAndArrayRuntimeOptions<string>>({ array: false })
testType<GenerateNullabilityAndArrayRuntimeOptions<string>>({})
// @ts-expect-error
testType<GenerateNullabilityAndArrayRuntimeOptions<string[]>>({ array: false })
// @ts-expect-error
testType<GenerateNullabilityAndArrayRuntimeOptions<string[]>>({})
testType<GenerateNullabilityAndArrayRuntimeOptions<string[]>>({ array: true })
testType<GenerateNullabilityAndArrayRuntimeOptions<string[] | null>>({ array: true, nullable: true})
testType<GenerateNullabilityAndArrayRuntimeOptions<(string | null)[]>>({ array: "nullable_items" })
// @ts-expect-error
testType<GenerateNullabilityAndArrayRuntimeOptions<(string | null)[]>>({ array: true })

testType<GenerateNullabilityAndArrayRuntimeOptions<(string | null)[] | null>>({ array: "nullable_items", nullable: true })

function testResolver<Z extends ValidateResolver<Z>>(resolver: Z) {
  return resolver;
}

const tttt = testResolver(
  {
    type: ScalarTypes.STRING
  }
);

testType<ValidateArgs<NestedChildArgs>>(
  {
    args: {
      type: NestedChildArgs,
      runtimeTypes: {
        field: { type: ScalarTypes.STRING },
        nullableField: { type: ScalarTypes.STRING, nullable: true },
        arrayField: { type: ScalarTypes.STRING, nullable: true, array: true },
        childArgs: {
          type: ChildArgs,
          runtimeTypes: {
            field: { type: ScalarTypes.STRING }
          }
        },
        arrayOfChildArgs: {
          type: ChildArgs,
          nullable: true,
          array: "nullable_items",
          runtimeTypes: {
            field: { type: ScalarTypes.STRING }
          }
        }
      },
    }
  }
);

testType<ValidateInputRuntimeType<(ChildArgs | null)[] | null>>({
  type: ChildArgs,
  nullable: true,
  array: "nullable_items",
  runtimeTypes: {
    field: { type: ScalarTypes.STRING }
  }
});

testResolver(
    {
      type: ScalarTypes.STRING,
      args: {
        type: ChildArgs,
        runtimeTypes: {
          field: {type: ScalarTypes.STRING},
        },
      },
      nullable: true,
      resolve: async (args: ChildArgs, root: QueryRoot, context: any): Promise<string | null> => {
        return `asdf`;
      }
    }
);

testResolver(
    {
      type: ScalarTypes.STRING,
      resolve: async (root: QueryRoot, context: any): Promise<string> => {
        return `asdf`;
      }
    }
);

type X = ExtractFunctionDetails<(root: QueryRoot) => Promise<string>, unknown>
type Y = ExtractFunctionDetails<(root: QueryRoot, context: any) => Promise<string>, unknown>