import { GraphQLScalarType, Kind, ValueNode } from "graphql";
import { build, client, customScalar } from "../src";
import { createApp, QueryRoot, testQuery } from "./utils";

const CustomDateScalar = new GraphQLScalarType({
  name: 'Date',
  description: "Custom Date scalar",
  // Serializes an internal value to include in a response.
  serialize: (source: Date): string => source.toISOString(),
  // Parses an externally provided value to use as an input.
  parseValue: (source: string): Date => new Date(source),
  // Parses an externally provided literal value to use as an input.
  parseLiteral: (source: ValueNode): Date | null => {
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
const schemaObject = {
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
        customScalar: { type: customScalar<Date>(CustomDateScalar) }
      },
      resolve: (args: { customScalar: Date }): string => "test"
    }
  },
  mutations: {
    customScalarMutation: {
      type: 'string',
      argsFields: {
        customScalar: { type: customScalar<Date>(CustomDateScalar) }
      },
      resolve: (args: { customScalar: Date }): string => "test"
    }
  }
} as const;

const generatedSchema = build(schemaObject, { root: QueryRoot });

let app = createApp(generatedSchema);

test(
  'basicCustomScalar',
  testQuery(
    {
      app,
      schema: schemaObject,
      query: {
        basicCustomScalar: client._
      },
      result: {
        basicCustomScalar: customDate
      }
    }
  )
);

test(
  'objectCustomScalar',
  testQuery(
    {
      app,
      schema: schemaObject,
      query: {
        objectCustomScalar: {
          dateField: client._
        }
      },
      result: { objectCustomScalar: { dateField: customDate } }
    }
  )
);

test(
  'customScalarArgument',
  testQuery(
    {
      app,
      schema: schemaObject,
      query: {
        customScalarArgument: {
          $args: { customScalar: { $name: 'customScalar' } },
          $fields: client._
        }
      } as const,
      result: { customScalarArgument: "test" },
      variables: { customScalar: new Date(customDate).toISOString() }
    }
  )
);

test(
  'customScalarMutation',
  testQuery(
    {
      app,
      schema: schemaObject,
      operationType: 'mutation',
      query: {
        customScalarMutation: {
          $args: {
            customScalar: { $name: 'customScalar' }
          },
          $fields: client._
        }
      } as const,
      result: { customScalarMutation: "test" },
      variables: { customScalar: new Date(customDate).toISOString() }
    }
  )
);