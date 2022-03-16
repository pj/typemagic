import { GenerateArrayTrilean, GenerateReturnType, GetRuntimeType, IsEnum, ScalarTypes } from "../src/types";
import { TestInputObject } from "./schema.test";

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

// Resolver

type X<Y> = [Y] extends [{thing?: (t: infer T) => infer R}]
              ? Y
              : [Y] extends [{thing?: unknown}]
                ? {thing?: unknown}
                : {thing: never}

testType<X<{thing?: unknown}>>({});
testType<X<{thing?: (t: string) => string}>>({});

enum Blah {
  asdf,
  quer
}
type  Z = IsEnum<typeof Blah>