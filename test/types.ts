import { InputObject } from "../src/input";
import { Scalar } from "../src/scalar";
import { ArrayTrilean, BooleanOrUndefined, Constructor, GenerateArrayTrilean, GenerateReturnType, GenerateScalarReturnType, GetUnderlyingRuntimeType, IsNull, ScalarOptions, ScalarOrInput, string } from "../src/types";
import { TestInputObject } from "./test";

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

type IANU = Constructor<GetUnderlyingRuntimeType<TestInputObject[] | null | undefined>>
test<IANU>(TestInputObject);
type IAU = Constructor<GetUnderlyingRuntimeType<TestInputObject[] | undefined>>
test<IAU>(TestInputObject);
type IAN = Constructor<GetUnderlyingRuntimeType<TestInputObject[] | null>>
test<IAN>(TestInputObject);
type IA = Constructor<GetUnderlyingRuntimeType<TestInputObject[]>>
test<IA>(TestInputObject);
type INU = Constructor<GetUnderlyingRuntimeType<TestInputObject | null | undefined>>
test<INU>(TestInputObject);
type IN = Constructor<GetUnderlyingRuntimeType<TestInputObject | null>>
test<IN>(TestInputObject);
type I = Constructor<GetUnderlyingRuntimeType<TestInputObject>>
test<I>(TestInputObject);
type IINU = Constructor<GetUnderlyingRuntimeType<(TestInputObject | null)[] | null | undefined>>
test<IINU>(TestInputObject);
type IIU = Constructor<GetUnderlyingRuntimeType<(TestInputObject | null)[] | undefined>>
test<IIU>(TestInputObject);
type IIN = Constructor<GetUnderlyingRuntimeType<(TestInputObject | null)[] | null>>
test<IIN>(TestInputObject);
type II = Constructor<GetUnderlyingRuntimeType<(TestInputObject | null)[]>>
test<II>(TestInputObject);

// Test Scalar / Input Object
type StringArrayNullUndefined = string[] | null | undefined;
type ScalarOrInputStringArrayNullUndefined = ScalarOrInput<StringArrayNullUndefined> extends Scalar<String, true, true> ? true : false
test<ScalarOrInputStringArrayNullUndefined>(true);

type StringArrayUndefined = string[] | undefined;
type ScalarOrInputStringArrayUndefined = ScalarOrInput<StringArrayUndefined> extends Scalar<String, false, true> ? true : false
test<ScalarOrInputStringArrayUndefined>(true);

type TestInputObjectArrayNullUndefined = TestInputObject[] | null | undefined;
type ScalarOrInputTestInputObjectArrayNullUndefined = 
  ScalarOrInput<TestInputObjectArrayNullUndefined> extends InputObject<TestInputObject, true, true>
    ? true : false
test<ScalarOrInputTestInputObjectArrayNullUndefined>(true);

type TestInputObjectNullItemsNullUndefined = (TestInputObject | null)[] | null | undefined;
type ScalarOrInputTestInputObjectNullItemsNullUndefined = 
  ScalarOrInput<TestInputObjectNullItemsNullUndefined> extends InputObject<TestInputObject, true, "nullable_items">
    ? true : false
test<ScalarOrInputTestInputObjectNullItemsNullUndefined>(true);

// test scalar functions
type ScalarReturnTypeString = GenerateScalarReturnType<String, ScalarOptions<false, false>>
test<ScalarReturnTypeString>({type: String, nullable: false, array: false});
const scalarString = string();
test<ScalarReturnTypeString>(scalarString);

type ScalarReturnTypeStringNull = GenerateScalarReturnType<String, ScalarOptions<true, false>>
test<ScalarReturnTypeStringNull>({type: String, nullable: true, array: false});

type ScalarReturnTypeStringArray = GenerateScalarReturnType<String, ScalarOptions<false, true>>
test<ScalarReturnTypeStringArray>({type: String, nullable: false, array: true});

type ScalarReturnTypeStringUndefined = GenerateScalarReturnType<String, undefined>
test<ScalarReturnTypeStringUndefined>({type: String, nullable: false, array: false});
