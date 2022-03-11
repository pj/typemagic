import { InputObject } from "../src/input";
import { GenerateArrayTrilean, GenerateScalarReturnType, GetUnderlyingRuntimeType, IsNull } from "../src/types";
import { TestInputObject } from "./test";

function test<X>(x: X): void { }

type DTF = GenerateScalarReturnType<Date, true, false>
test<DTF>(new Date());
// @ts-expect-error
test<DTF>([new Date()]);
// @ts-expect-error
test<DTF>([null]);
test<DTF>(null);

type DTT = GenerateScalarReturnType<Date, true, true>
// @ts-expect-error
test<DTT>(new Date())
test<DTT>([new Date()])
// @ts-expect-error
test<DTT>([null]);
test<DTT>(null);

type DFT = GenerateScalarReturnType<Date, false, true>
// @ts-expect-error
test<DFT>(new Date())
test<DFT>([new Date()]);
// @ts-expect-error
test<DFT>([null]);
// @ts-expect-error
test<DFT>(null);

type DFF = GenerateScalarReturnType<Date, false, false>
test<DFF>(new Date())
// @ts-expect-error
test<DFF>([new Date()]);
// @ts-expect-error
test<DFF>([null]);
// @ts-expect-error
test<DFF>(null);

type DTN = GenerateScalarReturnType<Date, true, "nullable_items">
// @ts-expect-error
test<DTN>(new Date())
test<DTN>([new Date()]);
test<DTN>([null]);
test<DTN>(null);

type DFN = GenerateScalarReturnType<Date, false, "nullable_items">
// @ts-expect-error
test<DFN>(new Date())
test<DFN>([new Date()]);
test<DFN>([null]);
// @ts-expect-error
test<DFN>(null);

type DUU = GenerateScalarReturnType<Date, undefined, undefined>
type DFU = GenerateScalarReturnType<Date, false, undefined>
type DTU = GenerateScalarReturnType<Date, true, undefined>
type DUF = GenerateScalarReturnType<Date, undefined, false>
type DUT = GenerateScalarReturnType<Date, undefined, true>
type DUN = GenerateScalarReturnType<Date, undefined, "nullable_items">

type STF = GenerateScalarReturnType<string, true, false>
type STT = GenerateScalarReturnType<string, true, true>
type SFT = GenerateScalarReturnType<string, false, true>
type SFF = GenerateScalarReturnType<string, false, false>
type STN = GenerateScalarReturnType<string, true, "nullable_items">
type SFN = GenerateScalarReturnType<string, false, "nullable_items">
type SUU = GenerateScalarReturnType<string, undefined, undefined>
type SFU = GenerateScalarReturnType<string, false, undefined>
type STU = GenerateScalarReturnType<string, true, undefined>
type SUF = GenerateScalarReturnType<string, undefined, false>
type SUT = GenerateScalarReturnType<string, undefined, true>
type SUN = GenerateScalarReturnType<string, undefined, "nullable_items">

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
type SI = GetUnderlyingRuntimeType<(string | null)[]>
test<SI>(String);

type IANU = GetUnderlyingRuntimeType<TestInputObject[] | null | undefined>
test<IANU>(TestInputObject);
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
type IIN = GetUnderlyingRuntimeType<(TestInputObject | null)[] | null>
test<IIN>(TestInputObject);
type II = GetUnderlyingRuntimeType<(TestInputObject | null)[]>
test<II>(TestInputObject);

// Test Input Object
type IOTSANU = string[] | null | undefined;
type IOSANU = 
  InputObject<
    GetUnderlyingRuntimeType<IOTSANU>,
    IsNull<IOTSANU>, 
    GenerateArrayTrilean<IOTSANU>
  >

test<IOSANU>({
  runtimeTypes
});
