import { GraphQLScalarType, Kind, ValueNode } from "graphql";
import { build, customScalar } from "../src";
import { createApp, createTest } from "./utils";

const CustomDateScalar = new GraphQLScalarType({
  name: 'Date',
  description: "Custom Date scalar",
  // Serializes an internal value to include in a response.
  serialize: (source: Date): string => source.toISOString(),
  // Parses an externally provided value to use as an input.
  parseValue: (source: string): Date => 
    {
      console.log(source);
      return new Date(source)
    },
  // Parses an externally provided literal value to use as an input.
  parseLiteral: (source: ValueNode): Date | null=> {
    if (source.kind === Kind.STRING) {
      return new Date(source.value);
    }
    return null;
  }
});

type TestCustom = {
  dateField: Date
}

const customDate = "2022-03-29T16:29:51.000Z"
const generatedSchema = build(
  {
    queries: {
      basicCustomScalar: {
        type: customScalar<Date>(CustomDateScalar),
        resolve: (): Date => {
          return new Date(customDate);
        }
      },
      objectCustomScalar: {
        type: {
          name: "TestCustom",
          fields: {
            dateField: customScalar<Date>(CustomDateScalar),
          }
        },
        resolve: (): TestCustom => {
          return { dateField: new Date(customDate) };
        }
      },
      customScalarArgument: {
        type: 'string',
        argsFields: {
          customScalar: {type: customScalar<Date>(CustomDateScalar)}
        },
        resolve: (args: {customScalar: Date}): string => "test" 
      }
    },
    mutations: {
      customScalarMutation: {
        type: 'string',
        argsFields: {
          customScalar: {type: customScalar<Date>(CustomDateScalar)}
        },
        resolve: (args: {customScalar: Date}): string => "test" 
      }
    }
  }
);

let app = createApp(generatedSchema);

test(
  'basicCustomScalar', 
  createTest(
    app,
    `query TestQuery { 
      basicCustomScalar
    }`,
    { 
      basicCustomScalar: customDate 
    }
  )
);

test(
  'objectCustomScalar',
  createTest(
    app,
    `query TestQuery {
        objectCustomScalar {
          dateField
        }
      }
     `,
    { objectCustomScalar: { dateField: customDate } }
  )
);

test(
  'customScalarArgument',
  createTest(
    app,
    `query TestQuery($customScalar: Date!) {
      customScalarArgument(customScalar: $customScalar)
    }
    `,
    { customScalarArgument: "test"},
    {customScalar: new Date(customDate).toISOString()}
  )
);

test(
  'customScalarMutation',
  createTest(
    app,
    `mutation TestQuery($customScalar: Date!) {
      customScalarMutation(customScalar: $customScalar)
    }
    `,
    { customScalarMutation: "test"},
    {customScalar: new Date(customDate).toISOString()}
  )
);