export declare class Test {
    stringField: string;
    booleanField: boolean;
    dateField: Date | null;
    intField: number;
    floatField: number;
    relatedField: RelatedClass;
    arrayRelatedField: ArrayRelatedClass[];
    enumField: ASDF;
    constructor(stringField: string, booleanField: boolean, dateField: Date | null, intField: number, floatField: number, relatedField: RelatedClass, arrayRelatedField: ArrayRelatedClass[], enumField: ASDF);
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
declare enum ASDF {
    erer = "erer",
    asdf = "asdf"
}
export {};
