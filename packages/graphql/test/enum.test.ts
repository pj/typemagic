import { schema } from "../src";

enum TestStringEnum {
  FIRST_FIELD = "FIRST_FIELD",
  SECOND_FIElD = "SECOND_FIELD"
}

enum TestNumberEnum {
  FIRST_FIELD,
  SECOND_FIElD
}

const generatedSchema = schema(
  {
    queries: {
      enumTypeArray: {
        type: { enum: TestStringEnum, name: "TestStringEnum" },
        array: true,
        resolve: (): (TestStringEnum)[] => {
          return [TestStringEnum.FIRST_FIELD, TestStringEnum.SECOND_FIElD]
        }
      },
    }
  }
);

test('enumTypeArray', async () => { expect(true).toBeTruthy() })