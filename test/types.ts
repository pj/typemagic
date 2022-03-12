import { Int } from "type-graphql";
import { InputRuntimeTypes, ScalarOrInput } from "../src/input";
import { OutputObject, OutputRuntimeTypes, Resolver } from "../src/output";
// import { Scalar} from "../src/scalar";
import { Constructor, GenerateArrayTrilean, GenerateReturnType, GetIfArray, GetUnderlyingRuntimeType } from "../src/types";
import { registeredArgs } from "./args";
import { Args, RelatedClass, Test, TestInputObject } from "./test";

type Extends<A, B> = A extends B ? true : false;

function test<X>(x: X): void { }

type DTF = GenerateReturnType<Date, true, false>
test<DTF>(new Date());
// @ts-expect-error
test<DTF>([new Date()]);
// @ts-expect-error
test<DTF>([null]);
test<DTF>(null);

type DTT = GenerateReturnType<Date, true, true>
// @ts-expect-error
test<DTT>(new Date())
test<DTT>([new Date()])
// @ts-expect-error
test<DTT>([null]);
test<DTT>(null);

type DFT = GenerateReturnType<Date, false, true>
// @ts-expect-error
test<DFT>(new Date())
test<DFT>([new Date()]);
// @ts-expect-error
test<DFT>([null]);
// @ts-expect-error
test<DFT>(null);

type DFF = GenerateReturnType<Date, false, false>
test<DFF>(new Date())
// @ts-expect-error
test<DFF>([new Date()]);
// @ts-expect-error
test<DFF>([null]);
// @ts-expect-error
test<DFF>(null);

type DTN = GenerateReturnType<Date, true, "nullable_items">
// @ts-expect-error
test<DTN>(new Date())
test<DTN>([new Date()]);
test<DTN>([null]);
test<DTN>(null);

type DFN = GenerateReturnType<Date, false, "nullable_items">
// @ts-expect-error
test<DFN>(new Date())
test<DFN>([new Date()]);
test<DFN>([null]);
// @ts-expect-error
test<DFN>(null);

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
test<GSF>(false);
type GST = GenerateArrayTrilean<string[]>
test<GST>(true);
type GSN = GenerateArrayTrilean<(string | null)[]>
test<GSN>("nullable_items");
type GSUF = GenerateArrayTrilean<string | undefined>
test<GSUF>(false);
type GSUT = GenerateArrayTrilean<string[] | undefined>
test<GSUT>(true);
type GSUN = GenerateArrayTrilean<(string | null)[] | undefined>
test<GSUN>("nullable_items");

// Test underlying runtime type
type SANU = GetUnderlyingRuntimeType<string[] | null | undefined>
test<SANU>(String);
type SAU = GetUnderlyingRuntimeType<string[] | undefined>
test<SAU>(String);
type SAN = GetUnderlyingRuntimeType<string[] | null>
test<SAN>(String);
type SA = GetUnderlyingRuntimeType<string[]>
test<SA>(String);
type SNU = GetUnderlyingRuntimeType<string | null | undefined>
test<SNU>(String);
type SN = GetUnderlyingRuntimeType<string | null>
test<SN>(String);
type S = GetUnderlyingRuntimeType<string>
test<S>(String);
type SINU = GetUnderlyingRuntimeType<(string | null)[] | null | undefined>
test<SINU>(String);
type SIN = GetUnderlyingRuntimeType<(string | null)[] | null>
test<SIN>(String);
type SIU = GetUnderlyingRuntimeType<(string | null)[] | undefined>
test<SIU>(String);
type SI = GetUnderlyingRuntimeType<(string | null)[]>
test<SI>(String);

type IANU = GetUnderlyingRuntimeType<TestInputObject[] | null | undefined>
test<IANU>(TestInputObject);
type IAU = GetUnderlyingRuntimeType<TestInputObject[] | undefined>
test<IAU>(TestInputObject);
type IAN = GetUnderlyingRuntimeType<TestInputObject[] | null>
test<IAN>(TestInputObject);
type IA = GetUnderlyingRuntimeType<TestInputObject[]>
test<IA>(TestInputObject);
type INU = GetUnderlyingRuntimeType<TestInputObject | null | undefined>
test<INU>(TestInputObject);
type IN = GetUnderlyingRuntimeType<TestInputObject | null>
test<IN>(TestInputObject);
type I = GetUnderlyingRuntimeType<TestInputObject>
test<I>(TestInputObject);
type IINU = GetUnderlyingRuntimeType<(TestInputObject | null)[] | null | undefined>
test<IINU>(TestInputObject);
type IIU = GetUnderlyingRuntimeType<(TestInputObject | null)[] | undefined>
test<IIU>(TestInputObject);
type IIN = GetUnderlyingRuntimeType<(TestInputObject | null)[] | null>
test<IIN>(TestInputObject);
type II = GetUnderlyingRuntimeType<(TestInputObject | null)[]>
test<II>(TestInputObject);

// Test Scalar / Input Object
type InputStringNullableItemsNullUndefined = (string | null)[] | null | undefined;
type InputStringArrayNullUndefined = string[] | null | undefined;
type InputStringArrayUndefined = string[] | undefined;
type InputStringArray = string[];
type InputStringNullUndefined = string | null | undefined;
type InputString = string;

type ScalarOrInputStringNullableItemsNullUndefined = ScalarOrInput<InputStringNullableItemsNullUndefined>
type ValidStringNullableItemsNullUndefined = Extends<ScalarOrInputStringNullableItemsNullUndefined, { type: StringConstructor, nullable: true, array: "nullable_items" }>
test<ValidStringNullableItemsNullUndefined>(true);

type ScalarOrInputStringArrayNullUndefined = ScalarOrInput<InputStringArrayNullUndefined>
type ValidStringArrayNullUndefined = Extends<ScalarOrInputStringArrayNullUndefined, { type: StringConstructor, nullable: true, array: true }>
test<ValidStringArrayNullUndefined>(true);

type ScalarOrInputStringArrayUndefined = ScalarOrInput<InputStringArrayUndefined>;
type ValidStringArrayUndefined = Extends<ScalarOrInputStringArrayUndefined, { type: StringConstructor, nullable?: false, array: true }>
test<ValidStringArrayUndefined>(true);

type ScalarOrInputStringArray = ScalarOrInput<InputStringArray>;
type ValidStringArray = Extends<ScalarOrInputStringArray, { type: StringConstructor, nullable?: false, array: true }>
test<ValidStringArray>(true);

type ScalarOrInputStringNullUndefined = ScalarOrInput<InputStringNullUndefined>;
type ValidStringNullUndefined = Extends<ScalarOrInputStringNullUndefined, { type: StringConstructor, nullable: true, array?: false }>
test<ValidStringNullUndefined>(true);

type ScalarOrInputString = ScalarOrInput<InputString>;
type ValidString = Extends<ScalarOrInputString, { type: StringConstructor, nullable?: false, array?: false }>
test<ValidString>(true);

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
    { type: Constructor<TestInputObject>, 
      nullable: true, 
      array: "nullable_items", 
      runtimeTypes: {
        stringField: {type: typeof String}
        booleanField: {type: typeof String},
        dateField: {type: typeof Date},
        numberField: {type: typeof Int},
        nullableField: {type: typeof String, nullable: true},
        arrayField: {type: typeof String, array: true},
        nullableArrayField: {type: typeof String, nullable: true, array: true}
        nullableItemsField: {type: typeof String, nullable: true, array: "nullable_items"}
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
type Context = {someContext: string};
type RelatedType = RelatedClass | null
type RelatedOutputObject = OutputObject<Context, RelatedType>
type RelatedTypes = RelatedOutputObject["runtimeTypes"];

type RelatedResolver = Resolver<Test, Context, Args, RelatedType>
type ResolverFunction = RelatedResolver["resolve"]
type Return = ReturnType<ResolverFunction>
type ResolverArgs = RelatedResolver["args"]

test<RelatedResolver>({
  args: registeredArgs,
  source: {
    type: RelatedClass, 
    nullable: true,
    runtimeTypes: {
      testField: {type: String}
    }
  },
  resolve: async (args: Args, root: Test, context: Context): Promise<RelatedType> => {
    return new RelatedClass(`Hello World`);
  }
})

type Output = OutputRuntimeTypes<Test, Context, null, {field: RelatedType}>

type M = {test: string, other: number};

type Types<X> = X extends string ? X : X

type Z = Types<M>


type X = {
  [Key in keyof M]: Key
}