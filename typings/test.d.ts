export declare class Test {
    stringField: string;
    booleanField: boolean;
    dateField: Date | null;
    intField: number;
    floatField: number;
    relatedField: RelatedClass;
    arrayRelatedField: ArrayRelatedClass[];
    stringEnumField: StringEnum;
    numberEnumField: IntEnum;
    constructor(stringField: string, booleanField: boolean, dateField: Date | null, intField: number, floatField: number, relatedField: RelatedClass, arrayRelatedField: ArrayRelatedClass[], stringEnumField: StringEnum, numberEnumField: IntEnum);
}
export declare class RelatedClass {
    testField: string;
    constructor(testField: string);
}
export declare class ArrayRelatedClass {
    asdfField: string;
    constructor(asdfField: string);
}
export declare class Args {
    stringField: string;
    booleanField: boolean;
    dateField: Date;
    constructor(stringField: string, booleanField: boolean, dateField: Date);
}
declare enum StringEnum {
    erer = "erer",
    asdf = "asdf"
}
declare enum IntEnum {
    first = 0,
    second = 1
}
export {};
