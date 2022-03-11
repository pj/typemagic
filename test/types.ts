import { GenerateArrayTrilean, GenerateScalarReturnType } from "../src/types";

type DTF = GenerateScalarReturnType<Date, true, false>
type DTT = GenerateScalarReturnType<Date, true, true>
type DFT = GenerateScalarReturnType<Date, false, true>
type DFF = GenerateScalarReturnType<Date, false, false>
type DTN = GenerateScalarReturnType<Date, true, "nullable_items">
type DFN = GenerateScalarReturnType<Date, false, "nullable_items">

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
type GST = GenerateArrayTrilean<string[]>
type GSN = GenerateArrayTrilean<(string | null)[]>
type GSUF = GenerateArrayTrilean<string | undefined>
type GSUT = GenerateArrayTrilean<string[] | undefined>
type GSUN = GenerateArrayTrilean<(string | null)[] | undefined>