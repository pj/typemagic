import { print } from "graphql";
import { query, _ } from "../src/client";

class QueryObject1 {
  constructor(
    public queryField: number
  ) {}
}

class QueryObject2 {
  constructor(
    public anotherField: boolean,
    public queryObject: QueryObject1
  ) {}
}

const clientSchema =
  {
    queries: {
      testQuery: {
        type: 'string',
        resolve: () => {
          return 'asdf';
        }
      }, 
      testQueryWithList: {
        type: 'string',
        array: true,
        resolve: () => {
          return ['asdf', 'qwer'];
        }
      },
      testQueryObject: {
        type: {
          name: QueryObject2.name,
          fields: {
            anotherField: 'boolean',
            queryObject: {
              type: {
                name: QueryObject1.name,
                fields: {
                  queryField: 'int'
                }
              }
            }
          }
        },
        nullable: true,
        resolve: (): QueryObject2 | null => {
          return new QueryObject2(true, new QueryObject1(1234))
        }
      }
    }
  } as const;

test('testQuery', async () => {
  const testQuery = query(
      clientSchema,
      {
        testQuery: _
      }, "TestQuery"
    );
  expect(
    print(testQuery)
  ).toMatchSnapshot();
});

test('testQueryWithList', async () => {
  const testQuery = query(
      clientSchema,
      {
        testQueryWithList: _
      }, 
      "TestQuery"
    );
  expect(
    print(testQuery)
  ).toMatchSnapshot();
});

test('testQueryObject', async () => {
  const testQuery = query(
      clientSchema,
      {
        testQueryObject: {
          anotherField: _,
          queryObject: {
            queryField: _
          }
        }
      }, 
      "TestQuery"
    );
  expect(
    print(testQuery)
  ).toMatchSnapshot();
});